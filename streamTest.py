import asyncio
import socket
from supabase import acreate_client, Client

# Supabase credentials
url: str = 'https://konmiupcnchfvhamodqt.supabase.co'
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvbm1pdXBjbmNoZnZoYW1vZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzc5NzMsImV4cCI6MjA1MDkxMzk3M30.mtA7XLQOk0gga0i27gnoCD9iEOVgcHYtUeWjgI9wyHk'

# Target localhost and port
HOST = "127.0.0.1"
PORT = 9000

# Function to send payload to localhost
def send_to_localhost(payload):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((HOST, PORT))
            s.sendall(payload.encode('utf-8'))  # Send payload as a UTF-8 string
            print(f"Sent to localhost:{PORT} -> {payload}")
    except ConnectionRefusedError:
        print(f"Connection to localhost:{PORT} refused. Make sure a listener is active.")

async def main():
    supabase: Client = await acreate_client(url, key)
    counter = 0

    def my_callback(payload):
        nonlocal counter
        counter += 1
        payload['counter'] = counter
        print(f"Received payload: {payload}")
        
        # Send payload to localhost
        send_to_localhost(str(payload))

    await supabase.realtime.connect()

    try:
        await (supabase.realtime
                  .channel("room-one")
                  .on_broadcast(event="emojis", callback=my_callback)
                  .subscribe())
        print("Subscribed to changes")
    except Exception as e:
        print(f"Error during subscription: {e}")

    await supabase.realtime.listen()

if __name__ == "__main__":
    asyncio.run(main())
