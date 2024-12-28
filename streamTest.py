import asyncio
import pandas as pd
import os
from supabase import acreate_client, Client

url: str = ''
key: str = ''


async def main():
  supabase: Client = await acreate_client(url, key)

  def my_callback(payload):
        # Extract the 'id' from the payload
        print(payload)

  await supabase.realtime.connect()

  try:
    await (supabase.realtime
              .channel("room-one")
              .on_broadcast(event="emojis", callback=my_callback)
              .subscribe())
    print("Subscribed to changes")
  except Exception as e:
    print(e)

  await supabase.realtime.listen()
  
asyncio.run(main())


