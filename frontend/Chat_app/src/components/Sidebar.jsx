import React from "react";

export default function Sidebar({activeUsers, currentUser,onExit,roomID}){
    const otherUsers =activeUsers.filter(user=>user!==currentUser);
    return (
        <div className="w-1/4 flex flex-col justify-between h-full select-none bg-gray-950 border-r border-gray-800 p-4">
            <div className="p-4 bg-gray-950/40 border-b border-gray-800/60 font-mono text-lg tracking-wider text-zinc-500">
                Room ID: <span className="text-indigo-400 font-bold uppercase">{roomID}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
                <h3 className="text-xs font-bold upercase tracking-wide text-zinc-500">Activer Users:</h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-xs font-mono font black text-zinc-400 border border-zinc-800">
                    {activeUsers.length}
                    </span>                
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
                <div className="flex - items-center gap-2.5 px-3 py-2 bg-teal-950/50 border border-teal-500/30 rounded-2xl transition-shadow duration-200">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>

                    </span>
                    <span className="text-sm font-bold text-white truncate max-w-fit">{currentUser}</span>
                    <span className="ml-auto text-sm text-black font-mono uppercase tracking-tight px-1.5 py-0.5 rounded-3xl bg-indigo-500/80 border border-indigo-800/50">
                        You
                    </span>
                </div>
                {otherUsers.length>0 && 
                (<div className="flex items-center py-2">
                    <div className="w-full border-t border-gray-800"></div>
                </div>)}
                {otherUsers.map((user,index)=>(
                    <div key={index}
                    className="flex items-center gap-2.5 px-3 py-2 bg-gray-900 hover:bg-gray-950/50 transition-all duration-500 rounded-xl border border-gray-800/40 ">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 shadow-sm"></span>
                        <span className="text-lime-600 text-sm truncate">{user}</span>
                    </div>
                ))}
            </div>
                <button 
                    onClick={onExit}
                    className="text-md text-red-500 py-2 px-2 border border-red-800 rounded font-extrabold bg-gray-700 active:scale-[0.98] hover:bg-rose-300 shadow-md shadow-rose-950/20 transition-all duration-300">
                        Exit Room
                </button>
        </div>
    )
}