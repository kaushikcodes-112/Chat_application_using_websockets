import asyncio
import random

import websockets


# 1. have a set of clients
# 2. await asyncio.Future() inside context manager websocket.serve()
#    in main to keep it waiting forver basically to keep listening and broadcasting forever
# 3. broadcast the message
# 4. recieve the message in handle_client. the handle_client function should automatically work
#    as soon as a client makes connection
class ws_server:
    def __init__(self) -> None:
        # have a set of connected clients
        self.connected_clients = {}
        # self.connected_clients_id=set()
        pass

    # The handle_client function should:
    # 1. connect to a client
    # 2. listen for messages
    # 3. allow graceful disconnection
    async def handle_client(self, websocket):
        # 1. connection is already established in main
        #    here you need to add the websocket object to the set of connected clients
        #    generate an id as well
        id = random.randint(10000, 99999)
        #self.connected_clients[websocket] = id
        # self.connected_clients.add(websocket)
        print(f"New user joined: Assigned id- {id}")
        await websocket.send(f"Welcome user: {id}\nSERVER_PROMPT: Set a name: ")
        # change: Assigning a name
        name = await websocket.recv()
        if not name:
            name = f"Anonymous_{id%1000}"
        self.connected_clients[websocket] = {"id":id,"name":name}
        #broadcast this name to everyone saying "{name} has joined"
        await self.broadcast(f"User {self.connected_clients.get(websocket,{}).get("name")} joined the chat!")
        # 2. listen for messages
        try:
            async for message in websocket:
                await websocket.send(f"You: {message}")
                full_msg = f"{self.connected_clients.get(websocket,{}).get("name")}: {message}"
                await self.broadcast(full_msg,websocket)
        except Exception:
            print(f"Connection closed by user: {id}")
        finally:
            if websocket in self.connected_clients:
                del self.connected_clients[websocket]
                print(f"User {id} disconnected: deleted from registry")
                await self.broadcast(f"User {name} has disconnected")

    async def broadcast(self, message,sender_websocket=""):
        try:
            async with asyncio.TaskGroup() as tg:
                for client in self.connected_clients:
                    if client == sender_websocket:
                        continue
                        #tg.create_task(client.send())
                    tg.create_task(client.send(message))
        except Exception:
            print("Failed to send message to one or more clients")

    async def main(self):
        # establish connection with websockers.serve
        async with websockets.serve(self.handle_client, "localhost", port=1234):
            print("Websocket is currently running on ws://localhost:1234")
            await asyncio.Future()


if __name__ == "__main__":
    server = ws_server()
    asyncio.run(server.main())
