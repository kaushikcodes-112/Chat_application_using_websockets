import websockets,asyncio,sys

class Ws_client:
    def __init__(self) -> None:
        pass
    async def send_msg(self,websocket):
        loop = asyncio.get_event_loop()
        while True:
            message = await loop.run_in_executor(None,sys.stdin.readline)
            message = message.strip()
            if message:
                await websocket.send(message)

    async def recv_msg(self,websocket):
        try:
            async for message in websocket:
                print(f"\n[Incoming]: {message}")
        except websockets.exceptions.ConnectionClosed:
            print("disconnected from server")
    async def main(self):
        #Here i need to connect to the server 
        #using websockets
        uri = "ws://localhost/login:8000" # 1234 is the port number where server is listeninging
        print(f"Connecting to uri: {uri}")
        async with websockets.connect(uri) as websocket: #use context manager
            print("Connected successfully!")
            await asyncio.gather(self.send_msg(websocket),self.recv_msg(websocket))
        pass

if __name__ =="__main__":
    client = Ws_client()
    asyncio.run(client.main())