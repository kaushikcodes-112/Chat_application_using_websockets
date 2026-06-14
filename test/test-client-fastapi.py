import asyncio,websockets

async def testclient():
    url= "ws://127.0.0.1:8000/login"
    async with websockets.connect(url) as ws: #to connect as client we use websocket.connect()
        print("connected to fastapi server")
        await ws.send("Hello, User here")
        response = await ws.recv()
        print(f"Received message from server: {response}")

if __name__ =="__main__":
    asyncio.run(testclient())