from fastapi import FastAPI,WebSocket,HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
REGISTERED_USERS=set() #resgistered users is of type dict and dict is of type int mapping to str
id_counter=500                     #type is already defined to avoid type mismatch

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# we need rooms. 
# 1. we need active clients as a dict whose key= room_id and value= websockets of different users

class ChatManager:
    def __init__(self):
        self.active_sockets: dict[str,WebSocket]={}
        self.lock = asyncio.Lock()
        pass
    async def connect(self,username:str,websocket:WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_sockets[username] = websocket
        await self.broadcast(sender_username=username,message=f"New user: {username} joined the chat!")
    async def disconnect(self,username:str):
        async with self.lock:
            if username in self.active_sockets:
                del self.active_sockets[username]
            REGISTERED_USERS.remove(username)
        await self.broadcast(sender_username=username,message=f"{username} left the chat")
        pass
    async def broadcast(self,sender_username,message):
        async with self.lock:
            targets = list(self.active_sockets.items())
        for username,ws in targets:
            if username == sender_username:
                continue
            try:
                await ws.send_text(f"{sender_username}: {message}")
            except Exception:        
                pass
class RegistrationRequestData(BaseModel):
    username:str
manager = ChatManager()

@app.get("/api/users") #this is to fetch all the active users in the room
def get_active_users():
    return {"users":list(REGISTERED_USERS)}

@app.post("/api/register")
def register_user_id(payload:RegistrationRequestData):
    global id_counter
    if id_counter==0:
        print("No more room left")
        raise HTTPException(status_code=400,detail="All server slots have been filled")
    name = payload.username.strip()
    if name in REGISTERED_USERS:
        raise HTTPException(status_code=400,detail="Username already taken")
    REGISTERED_USERS.add(name)

    id_counter-=1
    print(f"Total user count: {500-id_counter} | total slots left: {id_counter}")
    return {
        "status":"authorized",
        "username":name,
        "message" : f"User {name} was added",
        "action" : "Proceed to websockets"
    }

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket,username:str):
    username=username.strip()
    global id_counter
    await manager.connect(username=username, websocket=websocket)
    try:
        while True:
            raw_text =await websocket.receive_text()
            #print(f" Network Wire Frame Captured -> From {username}: {raw_text}")
            await manager.broadcast(sender_username=username,message=raw_text)
    except WebSocketDisconnect:
        await manager.disconnect(username=username)
        #id_counter+=1
    finally:
        print(id_counter)
        



if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host ="127.0.0.1", port=8000)
