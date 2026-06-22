import React,{ useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AccessPortal({onLoginSuccess}){
    const [roomID,setRoomID] = useState("");
    const [username,setUsername] =useState("");
    const [isLoading,setIsLoading]=useState(false);
    /* async function handleJoinRoom(e)*/
    const handleJoinRoom = async(e)=> {
        e.preventDefault();
        setIsLoading(true);
        if (!roomID.trim() || !username.trim()){
            alert("Login info incomplete");
            setIsLoading(false);
            return;
        }
        try{
            const response = await fetch("http://127.0.0.1:8000/app/register",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    username:username.trim(),
                    room_id:roomID.trim()})
                });
            const data = await response.json();
            if(data.status==="authorized"){
                onLoginSuccess(username.trim(),roomID.trim());
            }else{
                alert("User Name taken!");
                setIsLoading(false);
            }
        }
        catch(error){
            alert("Server Offline");
            setIsLoading(false);
        }
    };
    async function handleRoomGeneration(){
        try{
            const response = await fetch("http://127.0.0.1:8000/app/rooms/create",{method:"POST"});
            if(!response.ok){
                throw new Error("Failed to create new room");
            }
            const data = await response.json();
            setRoomID(data.room_id);
        }
        catch(error){
            alert(error.message);
        }
    }
    if(isLoading){
        return <LoadingScreen message="Checking credentials..."/>
    }
    return(
        <div className="flex flex-col items-center bg-gradient-to-bl from-yellow-950 via-yellow-100 to-rose-800 justify-start h-screen p-4 pt-16">
            <div className="relative flex flex-col select-none mb-16 items-start">
                <h1 className="font-black italic text-center cursor-default text-7xl md:text-8xl bg-[linear-gradient(to_bottom,#5EBD3E_0%_16.6%,#FFB900_16.6%_33.3%,#F78200_33.3%_50%,#E23838_50%_66.6%,#973999_66.6%_83.3%,#009CDA_83.3%_100%)] bg-clip-text text-transparent drop-shadow-lg transition-transform duration-300 ease-out hover:scale-105 hover:brightness-125">
                    Back Rooms
                </h1>
            </div>
            <div className="w-full max-w-md p-8 mb-auto bg-gray-900 border-gray-700 rounded-xl shadow-xl text-white">
                <h2 className="text-2xl font-bold text-center mb-6 text-yellow-500 tracking-widest">
                    Access Portal
                </h2>
                <div className="mb-6 pb-6 broder-b border-gray-50 text-center">
                    <button
                    type="button"
                    onClick={handleRoomGeneration}
                    className="w-full bg-emerald-500 hover:bg-emerald-700 text-white font-medium py-2 px-4 hover:brightness-125 ease-out hover:scale-105 rounded transition duration-200">
                        Generate new BackRoom!
                    </button>
                </div>
                {/* Form to fill if user wants to join a room 
                There has to be a onsubmit button*/}
                <form onSubmit={handleJoinRoom}
                className="space-y-4">
                    <div className="text-center text-xs font-semibold uppercase tracking-normal text-red-500 mb-2">
                        OR JOIN AN ACTIVE ROOM
                    </div>
                    {/* Start another div making the actual form */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 uppercase mb-1">Alias</label>
                        <input type="text"
                        placeholder="Neo"
                        value={username}
                        onChange={(e)=>{setUsername(e.target.value)}}
                        className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-300 " />
                        {/* Above field is for name. Below field is for Room ID */}
                        <label className="block text-sm font-medium text-gray-400 uppercase mb-1">ROOM ID(4-Byte Code)</label>
                        <input 
                        type="text"
                        placeholder="e.g.-A456b3K"
                        value={roomID}
                        onChange={(e)=>{setRoomID(e.target.value)}}
                        className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-300 "/>
                    </div>
                    {/* submit button */}
                    <button
                    type="submit" 
                    // by defining it as type "submit", when the button is pressed, it submits the whole form 
                    // the submit functionality is defined by the form, i.e. the form manages what to do when the submit button is pressed
                    className="w-full bg-green-400 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-transform duration-200 ">
                        Connect to Room
                    </button>
                </form>
            </div>
        </div>
    )
}