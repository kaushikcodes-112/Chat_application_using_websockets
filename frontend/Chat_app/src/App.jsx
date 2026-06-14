import React,{useRef, useState} from "react";

function App() {
  const [username,setUsername] =useState("");
  const [connected,setConnected]=useState(false);
  const [loading,setLoading]=useState(false);
  const [messageInput,setMessageInput]=useState("");
  const [messages,setMessages]=useState([]);
  const [activeUsers,setActiveUsers]=useState([]);
  const socketRef = useRef(null);
  const fetch_users=async ()=>{
    try{
      const response = await fetch("http://127.0.0.1:8000/api/users");
      const data = await response.json();
      setActiveUsers(data.users);
    }
    catch(error){
      console.error("Could not fetch user data",error);
    }
  };

  function handleSendMessage(){
    if(!messageInput.trim()) return;
    if(socketRef.current && socketRef.current.readyState=== WebSocket.OPEN){
      setMessages((prevMessages)=>[...prevMessages,`You: ${messageInput}`]);
      socketRef.current.send(messageInput);
      setMessageInput("");
    }
  }
  const handleConnect= async()=>{
    if(!username.trim()) return;
    
    try{
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/register",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username: username})
      });
      const data = await response.json(); // response is an json string that is converted to js object using the function
      //  ALSO json() IS A FUCKING ASYNCHRONOUS FUNCTION. AWAIT IT NIGGA OTHERWISE DATA.STATUS IS A TOTALLY INVALID STATEMENT. HOW
      // THE FUCK DOES REACT EVEN ALLOW SUCH SHIT I CANT BELIEVE IT
      if(response.ok && data.status ==="authorized"){
        const wsUrl =`ws://127.0.0.1:8000/ws/${username}`;
        socketRef.current = new WebSocket(wsUrl);
        setConnected(true);
        fetch_users();
        setLoading(false);
        socketRef.current.onmessage = (event)=>{ // onmessage is the event listener that does what it says: On hearing any message
          // record it in the object called event
          //incase the event contains data: in this case, everytime the event contains data,print the data
          
          setMessages((prevMessages)=>[...prevMessages,event.data]);// take the previous message and append to it the new message that you received
          fetch_users();
        }
      }
      else{
        setLoading(false);
        alert("Username Already taken. Enter a unique username");
      }
    }
    catch (error){
      setLoading(false);
      console.error("Network Interface Connenction Failure: ",error);
    }
  };
  return (
    <div className={`min-h-screen flex flex-col items-center justify-start pt-12 transition-colors duration-500 ease-in-out ${
  loading 
    ? 'bg-gradient-to-b from-neutral-950 via-black to-neutral-950' 
    : 'bg-gradient-to-b from-emerald-900 via-emerald-950 to-neutral-950'
}`}>
      <h1 className="font-black italic text-center cursor-default text-8xl bg-[linear-gradient(to_bottom,#5EBD3E_0%_16.6%,#FFB900_16.6%_33.3%,#F78200_33.3%_50%,#E23838_50%_66.6%,#973999_66.6%_83.3%,#009CDA_83.3%_100%)] bg-clip-text text-transparent drop-shadow-lg transition-transform duration-300 ease-out hover:scale-105 hover:brightness-125">
        Back Rooms
      </h1>
      <hr className="border-pink-500 border-2 w-full"/>

      {/* here begins all the conditional job 
          all the conditional html has to be handled inside a {(connected)? show this: else show this}
      */}
      {loading?
      (<div className="mt-40 font-mono p-20 rounded-lg bg-red-500 bg-blend-color-burn text-emerald-400 animate-pulse">
        Authorizing...
      </div>):
      (!connected?(<div className="absolute inset-0 flex  items-center justify-center pointer-events-none">
        <div className="h-[200px] w-[350px] flex flex-col justify-between p-6 bg-slate-400 rounded-lg pointer-events-auto transition-transform duration-1000 ease-out hover:shadow-xl hover:translate-y-2 hover:scale-110">
          <h2 class="text-center font-black text-xl bg-[linear-gradient(to_bottom,#5EBD3E_0%_16.6%,#FFB900_16.6%_33.3%,#F78200_33.3%_50%,#E23838_50%_66.6%,#973999_66.6%_83.3%,#009CDA_83.3%_100%)] bg-clip-text text-transparent">
            Access Portal
          </h2>
          <div className="">
            <p>User_name:</p>
          </div>
          
          <input type="text"
          placeholder="Enter a unique name"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          onKeyDown={(e)=>{if (e.key==="Enter") handleConnect();}}
          className="w-full rounded-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button onClick={handleConnect}
           className="p-1 w-full bg-emerald-700 border border-gray-300 rounded-sm shadow-sm duration-0 transition-colors ease-in hover:bg-emerald-500 active:bg-blue-700">
            Connect to server
          </button>
        </div>
      </div>):(
      // master panel:
      <div className="w-[1500px] h-[735px] p-4 flex flex-col shadow-2xl bg-gradient-to-b from-black via-slate-800 to-slate-700 rounded-lg border border-emerald-500">
        {/* we do a little trollin' */}
        <div className="pb-3 border-b border-emerald-950">
          <h2 className="pl-6 font-mono text-lg text-emerald-300">
          User_name: {username}
        </h2>
          <span className="text-md pl-6 font-semibold text-blue-600">Active Users:</span> 
          <span className="text-md pl-5 font-semibold text-blue-600">{activeUsers.length>1?activeUsers.join(" | "):"Just You..."}</span>
        </div>
        {/* display chat messages */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-2 border border-emerald-950/50 bg-black/40 rounded p-3">
        {messages.map((msg,index)=>(
          <div key={index} className="p-2 my-1 bg-neutral-800 rounded font-semibold text-emerald-400 border-l-2 border-emerald-500">
            {msg}
          </div>
        ))}
        </div>
        {/* Now handle the sendmessage function */}
        <div className="flex mt-auto flex-row w-full ">
          <input type="text"
          value={messageInput}
          onChange={(e)=>{setMessageInput(e.target.value)}}
          onKeyDown={(e)=>{if(e.key==="Enter") handleSendMessage();}}
          className="w-full text-white border p-2 rounded bg-black" />
          <button onClick={handleSendMessage}
          className="shadow-lg text-white rounded-e-lg p-1 bg-green-600">Send</button>
        </div>
      </div>))}
    </div>
  );
}

export default App; 