import { useState,useEffect,useRef } from "react";

export default function useChatWebSocket(roomID, username){
    const [lastMessage,setLastMessage] = useState(null);
    const wsRef= useRef(null);
    useEffect(()=>{
        const url = `ws://127.0.0.1:8000/ws/${roomID}/${username}`;
        const socket = new WebSocket(url);
        wsRef.current =socket;
        socket.onmessage = (event) =>{
            const rawData=event.data;
            const dataf = JSON.parse(rawData);
            setLastMessage(dataf);
        };
        socket.onclose = ()=>{
            console.log("Websocket Connection dropped");
        };
        return ()=>{
            socket.close();
        };
    },[roomID,username]);
    // the above effect will render only once when the roomid and username changes. after that it is like fire and forget. 
    // anytime someone sends a text, onmessage listens to it and sets lastmessage to the data received. 
    // does not break the websocket object
    function sendMessage(messageObject){
        if(wsRef.current && wsRef.current.readyState===WebSocket.OPEN){
            const jsonString = JSON.stringify(messageObject);
            wsRef.current.send(jsonString);
        }
    }
    return {lastMessage,sendMessage};
}