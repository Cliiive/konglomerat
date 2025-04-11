import asyncio
import socket
import time
import aiohttp
from supabase import acreate_client, Client

# Supabase credentials
url: str = 'https://konmiupcnchfvhamodqt.supabase.co'
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvbm1pdXBjbmNoZnZoYW1vZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzc5NzMsImV4cCI6MjA1MDkxMzk3M30.mtA7XLQOk0gga0i27gnoCD9iEOVgcHYtUeWjgI9wyHk'

# Target localhost and port
HOST = "127.0.0.1"
PORT = 9000

# Connection monitoring settings
CHECK_INTERVAL = 10  # seconds between connection checks
CONNECTIVITY_TEST_URL = "https://www.google.com"
MAX_RETRIES = 10
INITIAL_RETRY_DELAY = 1  # seconds

def send_to_localhost(payload):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((HOST, PORT))
            s.sendall(payload.encode('utf-8'))
            print(f"Sent to localhost:{PORT} -> {payload}")
    except ConnectionRefusedError:
        print(f"Connection to localhost:{PORT} refused. Make sure a listener is active.")

async def check_internet_connection():
    """
    Check if there's an active internet connection by making a simple request.
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(CONNECTIVITY_TEST_URL, timeout=5) as response:
                return response.status == 200
    except Exception as e:
        print(f"Internet connection check failed: {e}")
        return False

async def start_listener(supabase: Client):
    """
    Launch the blocking listen() call in its own task with proper monitoring.
    """
    listen_task = None
    try:
        # Start the listener in a separate task
        listen_task = asyncio.create_task(supabase.realtime.listen())
        
        # Monitor the connection while the listener is running
        while not listen_task.done():
            if not await check_internet_connection():
                print("Internet connection lost. Stopping listener...")
                # Cancel the task if internet is down
                listen_task.cancel()
                raise ConnectionError("Internet connection lost")
                
            await asyncio.sleep(CHECK_INTERVAL)
            
    except asyncio.CancelledError:
        print("Listener task was cancelled")
        if listen_task and not listen_task.done():
            listen_task.cancel()
    except Exception as e:
        print(f"Listener encountered an error: {e}")
        if listen_task and not listen_task.done():
            listen_task.cancel()
        raise
    finally:
        # Ensure we clean up properly
        if listen_task and not listen_task.done():
            listen_task.cancel()
            try:
                await listen_task
            except asyncio.CancelledError:
                pass

async def reconnect_logic(supabase: Client, callback):
    """
    Attempt to disconnect (if needed), then reconnect and re-subscribe
    with exponential backoff.
    """
    retry_count = 0
    delay = INITIAL_RETRY_DELAY
    
    while retry_count < MAX_RETRIES:
        # First, check if internet is available
        if not await check_internet_connection():
            print(f"No internet connection. Waiting {delay}s before checking again...")
            await asyncio.sleep(delay)
            delay = min(delay * 2, 60)  # Exponential backoff, max 60s
            retry_count += 1
            continue
            
        print(f"Internet connection available. Attempting reconnection (attempt {retry_count + 1})...")
        
        # Clean up previous connection
        try:
            await supabase.realtime.disconnect()
            print("Successfully disconnected from previous session")
        except Exception as e:
            print(f"Error disconnecting: {e}")
        
        await asyncio.sleep(1)  # Short pause before reconnecting
        
        # Attempt to reconnect
        try:
            await supabase.realtime.connect()
            await (supabase.realtime
                   .channel("room-one")
                   .on_broadcast(event="emojis", callback=callback)
                   .subscribe())
            print("Successfully reconnected and re-subscribed to realtime changes")
            return True  # Successful reconnection
        except Exception as e:
            print(f"Error during reconnection (attempt {retry_count + 1}): {e}")
            retry_count += 1
            delay = min(delay * 2, 60)  # Exponential backoff, max 60s
            await asyncio.sleep(delay)
    
    print(f"Failed to reconnect after {MAX_RETRIES} attempts")
    return False

async def listen_with_reconnect(supabase: Client, callback):
    """
    Listen loop that reconnects on error or unexpected termination.
    """
    while True:
        print("Starting listener task...")
        try:
            await start_listener(supabase)
        except (ConnectionError, OSError) as e:
            print(f"Connection error: {e}")
            # Handle semaphore timeout specifically
            if isinstance(e, OSError) and e.winerror == 121:
                print("Semaphore timeout error detected. Clearing resources...")
                # Allow time for system resources to be released
                await asyncio.sleep(10)
        except Exception as e:
            print(f"Listener threw exception: {e}")
        
        print("Attempting to reconnect...")
        success = await reconnect_logic(supabase, callback)
        
        if not success:
            # If reconnection completely fails after all retries, wait longer before trying again
            print("Reconnection attempts exhausted. Waiting 60s before trying again...")
            await asyncio.sleep(60)

async def main():
    try:
        supabase: Client = await acreate_client(url, key)
    except Exception as e:
        print("Failed creating Supabase client:", e)
        return

    counter = 0

    def callback(payload):
        nonlocal counter
        counter += 1
        payload['counter'] = counter
        print(f"Received payload: {payload}")
        send_to_localhost(str(payload))

    # Initial connection
    connection_established = False
    retry_count = 0
    delay = INITIAL_RETRY_DELAY
    
    while not connection_established and retry_count < MAX_RETRIES:
        if not await check_internet_connection():
            print(f"No internet connection. Waiting {delay}s before retry {retry_count + 1}...")
            await asyncio.sleep(delay)
            delay = min(delay * 2, 60)
            retry_count += 1
            continue
            
        try:
            await supabase.realtime.connect()
            await (supabase.realtime
                   .channel("room-one")
                   .on_broadcast(event="emojis", callback=callback)
                   .subscribe())
            print("Initial subscription succeeded.")
            connection_established = True
        except Exception as e:
            print(f"Error during initial connection (attempt {retry_count + 1}): {e}")
            retry_count += 1
            delay = min(delay * 2, 60)
            await asyncio.sleep(delay)
    
    if not connection_established:
        print("Failed to establish initial connection. Exiting.")
        return

    # Start the listen loop that handles errors and reconnects as needed
    await listen_with_reconnect(supabase, callback)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as final_e:
        print(f"[FATAL] Unhandled exception: {final_e}")