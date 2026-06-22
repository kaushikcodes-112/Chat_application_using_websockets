import React,{useState,useRef, useEffect} from "react";
import Sidebar from "./Sidebar";
import useChatSockets from "../hooks/useChatWebSocket"

export default function ChatArea({username,roomID,onExit}){
    const [messages,setMessages]=useState([]);
    const [typedMessage,setTypedMessage]=useState("");
    const [activeUsers,setActiveUsers] =useState([]);
    const [typingUsers,setTypingUsers]=useState({});// stores usernames and their status if they are typing or not i.e. username:true

    const {lastMessage, sendMessage}= useChatSockets(roomID, username);

    const timeoutsRef = useRef({});
    const messageEndRef =useRef(null);
    
    async function loadRoomOccupants(){
        try{
            const response = await fetch(`http://127.0.0.1:8000/app/${roomID}/users`);
            const data = await response.json();
            setActiveUsers(data.users);
        }
        catch(error){
            console.error("Failed to load active user list");
        }
    }
    useEffect(()=>{
        loadRoomOccupants();
    },[]);
    useEffect(()=>{
        if(!lastMessage) return;
        const {type,sender,payload}=lastMessage;
        if (type==="chat"){
            setMessages((prev)=> [...prev,{sender:sender,text: payload}]);
        }
        else if(type==="typing"){
            if (sender===username) return;
            if(timeoutsRef.current[sender]){
                clearTimeout(timeoutsRef.current[sender]);            
            }
            setTypingUsers((prev)=>({...prev,[sender]:true})); // flags the users who are typing
            // once set, show it to the user for 1.5s using timeout
            timeoutsRef.current[sender] = setTimeout(()=>{
                setTypingUsers((prev)=>{
                    const updated ={...prev};
                    delete updated[sender];
                    return updated;
                });
                delete timeoutsRef[sender];
            },1500);
        }
        else if(type==="user_joined"||type==="user_left"){
            loadRoomOccupants();
        }
    },[lastMessage,username]); //anytime the state of lastMessage changes, we update the ui to show what messages have been shown

    useEffect(()=>{
        return ()=> {Object.values(timeoutsRef.current).forEach(clearTimeout)};
    },[]);
    useEffect(()=>{messageEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages])

    function handleMessages(e){
        if(e) 
            e.preventDefault(); 
        //why isnt it showing up on my LSP fucker and why do i need an if(e)
        // the function was triggered BECAUSE THE USER CLICKED SEND, OFCOURSE THE EVENT HAPPENED
        if(!typedMessage.trim())
            return;
        sendMessage({type:"chat", payload: typedMessage});
        setMessages((prev)=>[...prev,{sender:username,text:typedMessage}]);
        setTypedMessage("");
    }
    function handleInputChanges(e){
        setTypedMessage(e.target.value);
        sendMessage({type:"typing",payload:true});
    }
    const currentTypers=Object.keys(typingUsers); // wtf is this idk, converts the keys of typing users dict to a list probably
    // why do i need it? probably to show the list of typers in the room. I've took one arrow right up my ass when i decided to add this feature
    // why have i placed it here? gemini told me to do it, idk why i couldnt do it earlier
    return(
        
        // this division has overflow hidden so that the next division inside it can have overflow-auto
        <div className="flex h-full w-full max-w-full bg-gray-800 border  border-gray-600 rounded-lg shadow-xl text-white overflow-hidden">
            <Sidebar 
            activeUsers={activeUsers}
            currentUser={username}
            onExit={onExit}
            roomID={roomID}>
            </Sidebar>
            <div className="flex flex-col flex-1">
                <div className="items-center justify-center bg-gradient-to-b from-indigo-950 via-teal-700 to text-indigo-500 select-none">
                <h1 className="font-black italic text-center cursor-default text-6xl bg-[linear-gradient(to_bottom,#5EBD3E_0%_16.6%,#FFB900_16.6%_33.3%,#F78200_33.3%_50%,#E23838_50%_66.6%,#973999_66.6%_83.3%,#009CDA_83.3%_100%)] bg-clip-text text-transparent drop-shadow-lg transition-transform duration-300 ease-out hover:scale-105 hover:brightness-125">
                    Back Rooms
                </h1>
                </div>
                {/* chat frame only */}
                <div className="flex-1  overflow-y-auto no-scrollbar p-4 space-y-2">
                    {/* real container where chats keep sliding */}
                    {messages.map((msg,index)=>(
                        <div key={index} className={`flex flex-col ${msg.sender===username? "items-end":"items-start"}`}>
                            <span className="text-xs text-gray-400 px-1 mb-0.5">{msg.sender}</span>
                            <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md break-words whitespace-pre-wrap ${msg.sender===username?"bg-indigo-700 text-white rounded-3xl rounded-tr-none":"bg-gray-700 text-gray-100 rounded-3xl rounded-tl-none"}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messageEndRef}/>
                </div>
                <div className={`px-4 h-6 text-sm text-gray-700 bg-indigo-400 flex items-center rounded-t-lg transition-all duration-300 ease-in-out ${currentTypers.length>0?"h-8 opacity-100":"h-0 opacity-0"}`}>
                    {currentTypers.length>0 && (
                        <div className="flex items-center gap-2">
                            <span className="animate-pulse">💬🗯️💭</span>
                            <span>{currentTypers.join(", ")} {currentTypers.length===1?"is":"are"} typing...</span>
                        </div>
                    )}
                </div>
                <form onSubmit={handleMessages} className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
                    {/* input place */}
                    <input type="text"
                    value={typedMessage}
                    onChange={handleInputChanges}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-double focus:border-indigo-500 transition-colors" 
                    />
                    <button type="submit" className="px-5 py-3 bg-indigo-600 font-bold rounded-lg transition-colors">Send</button>
                </form>
            </div>
        </div>
    );
}