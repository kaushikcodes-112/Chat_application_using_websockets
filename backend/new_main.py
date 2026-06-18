import json

from fastapi import FastAPI,WebSocket,HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from check_secrets import make_secret_code
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
# 1. we need active clients as a dict whose key= room_id and value= dict whose key = name and value= websockets of different users

class ChatManager:
    def __init__(self):
        self.active_clients: dict[str, dict[str, WebSocket]]={}
        self.lock =asyncio.Lock()
        
    async def connect(self,websocket:WebSocket,username:str, room_id:str):
        await websocket.accept()
        async with self.lock():
            if room_id not in self.active_clients.keys():
                self.active_clients[room_id]={}
            self.active_clients[room_id][username]=websocket
        await self.broadcast(username,room_id,f"New user: {username} joined the chat!")
        
    async def disconnect(self,username:str,room_id:str):
        async with self.lock():
            if username in self.active_clients[room_id]:
                del self.active_clients[room_id][username]
                if not self.active_clients[room_id]:
                    del self.active_clients[room_id]
                
    async def broadcast(self,room_id:str,sender_username:str,message:str):
        async with self.lock:
            targets = list(self.active_clients[room_id].items())
        for username,ws in targets:
            if username==sender_username:
                continue
            await ws.send_text(f"{sender_username} : {message}")

class RegistrationRequestData(BaseModel):
    username:str
    room_id:str

manager =ChatManager()

# now define the routes
# 3 routes:
# app/{room_id}/users - get ✔️
# app/register - post ✔️
# app/rooms/create - post 1 ✔️
# ws/{room_id}/{username} - websockets route ✔️
@app.get("/app/{room_id}/users")
def fetch_users(room_id:str):
    if room_id not in manager.active_clients:
        return {"users":[]}
    return {"users":list(manager.active_clients[room_id].keys())}
    
@app.websocket("/ws/{room_id}/{username}")
async def connect_to_rooms(room_id:str,username:str,websocket:WebSocket):
    user=username.strip()
    room_id=room_id.strip()
    await manager.connect(websocket,user,room_id=room_id)
    try:
        # this is what you keep doing once you connect to websocket
        while True:
            raw_data =await websocket.receive_text()
            data = json.loads(raw_data)
            payload=data.get("msg")
            if data.get("type")=="typing":
                payload=json.dumps({"type":"typing","payload":f" is typing"})
                await manager.broadcast(room_id=room_id,sender_username=username,message=payload)
            elif data.get("type")=="chat":
                payload=json.dumps({"type":"chat","payload":f"{data.get("msg")}"})
                await manager.broadcast(room_id=room_id,sender_username=username,message=payload)
    except WebSocketDisconnect:
        await manager.disconnect(username=username,room_id=room_id)     
    

@app.post("/app/register")
def registerUser(payload:RegistrationRequestData):
    current_room_id=payload.room_id.strip()
    if len(manager.active_clients[current_room_id])==10:
        raise HTTPException(status_code=400,detail="The room is full")
    if current_room_id not in manager.active_clients:
        raise HTTPException(status_code=400,detail="Invalid room ID")
    
    username= payload.username.strip()
    if username in manager.active_clients[current_room_id]:
        raise HTTPException(status_code=400,detail="Username Already exists")
    return {
        "status":"authorized",
        "username":{username},
        "room_id":{current_room_id}
    }

@app.post("/app/rooms/create")
async def create_room():
    new_room_id=make_secret_code()
    async with manager.lock:
        manager.active_clients[new_room_id]={}
    return {"room_id": new_room_id}

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app=app,host="127.0.0.1",port=8000)