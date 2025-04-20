import asyncio
import time
import random
import sys
from datetime import datetime
from supabase import acreate_client, Client

# Configuration
url: str = "https://konmiupcnchfvhamodqt.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvbm1pdXBjbmNoZnZoYW1vZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzc5NzMsImV4cCI6MjA1MDkxMzk3M30.mtA7XLQOk0gga0i27gnoCD9iEOVgcHYtUeWjgI9wyHk"

device_count = 40
BASE_REQUEST_INTERVAL = 5  # Base seconds between requests per task
VARIATION_PERCENTAGE = 0.75  # Randomization factor (±75%)
INITIAL_STARTUP_MAX_DELAY = 10  # Maximum initial delay in seconds to stagger worker starts

# ANSI color codes for console output
class Colors:
    RESET = "\033[0m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    
    @staticmethod
    def get_color_for_worker(worker_id):
        colors = [Colors.GREEN, Colors.YELLOW, Colors.BLUE, Colors.MAGENTA, Colors.CYAN]
        return colors[worker_id % len(colors)]

def log(worker_id, message, message_type="INFO"):
    color = Colors.get_color_for_worker(worker_id)
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    
    prefix = {
        "INFO": f"{Colors.WHITE}[INFO]",
        "ERROR": f"{Colors.RED}[ERROR]",
        "SUCCESS": f"{Colors.GREEN}[SUCCESS]"
    }.get(message_type, f"{Colors.WHITE}[INFO]")
    
    print(f"{prefix} {timestamp} {color}[Worker {worker_id:02d}]{Colors.RESET} {message}")

def get_random_interval(base_interval):
    """Generate a random interval based on the base interval with variation"""
    variation = base_interval * VARIATION_PERCENTAGE
    return max(0.5, base_interval + random.uniform(-variation, variation))

async def worker(worker_id, channel):
    """
    Coroutine that runs for each simulated device.
    Sends a broadcast message with randomized timing to simulate real users.
    """
    # Stagger start times to avoid all workers starting simultaneously
    initial_delay = random.uniform(0, INITIAL_STARTUP_MAX_DELAY)
    log(worker_id, f"Starting in {initial_delay:.2f}s")
    await asyncio.sleep(initial_delay)
    
    log(worker_id, "Started and ready to send reactions")
    
    reaction_count = 0
    
    while True:
        try:
            # Random emoji ID (message value between 1-100)
            emoji_id = random.randrange(1, 130)
            
            # Send the broadcast
            start_time = time.time()
            await channel.send_broadcast(
                "emojis",
                {
                    "message": emoji_id,
                    "timestamp": time.time(),
                }
            )
            elapsed = (time.time() - start_time) * 1000  # in milliseconds
            reaction_count += 1
            
            log(worker_id, f"Sent emoji {emoji_id} (#{reaction_count}) in {elapsed:.2f}ms", "SUCCESS")
            
            # Random interval before the next reaction
            interval = get_random_interval(BASE_REQUEST_INTERVAL)
            log(worker_id, f"Waiting {interval:.2f}s before next reaction")
            await asyncio.sleep(interval)
            
        except Exception as e:
            log(worker_id, f"Error sending reaction: {str(e)}", "ERROR")
            await asyncio.sleep(2)  # Short delay before retry on error

async def main():
    print(f"{Colors.CYAN}=== Emoji Reaction Crowd Simulator ==={Colors.RESET}")
    print(f"{Colors.CYAN}Simulating {device_count} concurrent users{Colors.RESET}")
    print(f"{Colors.CYAN}Base interval: {BASE_REQUEST_INTERVAL}s with ±{VARIATION_PERCENTAGE*100:.0f}% variation{Colors.RESET}")
    print(f"{Colors.CYAN}Workers will start with random delays up to {INITIAL_STARTUP_MAX_DELAY}s{Colors.RESET}\n")
    
    try:
        # Initialize Supabase client
        print(f"{Colors.WHITE}Connecting to Supabase...{Colors.RESET}")
        supabase = await acreate_client(url, key)
        await supabase.realtime.connect()
        print(f"{Colors.GREEN}Successfully connected to Supabase{Colors.RESET}")
        
        # Create and connect the channel
        channel = supabase.channel("room-one")
    
        await channel.subscribe()
        print(f"{Colors.GREEN}Successfully subscribed to roomOne channel{Colors.RESET}\n")
        
        # Create tasks for each simulated device
        tasks = []
        for i in range(device_count):
            task = asyncio.create_task(worker(i, channel))
            tasks.append(task)
        
        print(f"{Colors.GREEN}Started {device_count} worker tasks{Colors.RESET}")
        
        try:
            # Keep the main task running indefinitely
            await asyncio.gather(*tasks)
        except asyncio.CancelledError:
            print(f"\n{Colors.YELLOW}Tasks cancelled{Colors.RESET}")
        finally:
            # Clean up
            for task in tasks:
                task.cancel()
            try:
                await supabase.channel(channel.topic).unsubscribe()
                print(f"{Colors.GREEN}Successfully unsubscribed from channel{Colors.RESET}")
            except Exception as e:
                print(f"{Colors.RED}Error unsubscribing: {e}{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}Error in main: {e}{Colors.RESET}")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Terminated by user{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}Unhandled exception: {e}{Colors.RESET}")
