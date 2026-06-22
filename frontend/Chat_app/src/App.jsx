import React,{useState, useEffect} from "react";
import AccessPortal from "./components/AccessPortal";
import ChatArea from "./components/ChatArea";
import LoadingScreen from "./components/LoadingScreen";
import useChatWebSocket from "./hooks/useChatWebSocket";

function App(){
  const [username,setUsername]=useState("");
  const [screenState,setScreenState]=useState("portal");// three states - "loading","chat","portal"
  const [roomID,setRoomID]=useState("");

  const handleLogin = (authName,authRoom)=>{
    setUsername(authName);
    setRoomID(authRoom);
    setScreenState("chat");
  };
  const handleExitChat =()=>{
    setScreenState("portal");
    setUsername("");
    setRoomID("");
  }
  if(screenState==="chat"){
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <ChatArea username={username} roomID={roomID} onExit={handleExitChat}></ChatArea>
      </div>
    );
  }
  return <AccessPortal onLoginSuccess={handleLogin}/>;
}
export default App;