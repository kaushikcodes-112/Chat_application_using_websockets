import React from "react";

function LoadingScreen({message="Connecting to chat..."}){
    return(
        <div className=" bg-black h-screen flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-6">
                {/* spinner machinery */}
                <div className="relative flex items-center justify-center">
                    {/*outer pulsing ring or some shit down here*/}
                    <div className="absolute w-20 h-20 rounded-full bg-green-500/10 animate pulse">
                        <div className="w-16 h-16 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
                    </div>
                </div>
                {/* dynamic status text */}
                <div className="text-center space-y-2">
                    <h2 className="text-white text-xl font-medium tracking-wide animate-pulse">
                        {message}
                    </h2>
                </div>
                <p className="text-zinc-500 text-sm tracking widest uppercase">Please wait...</p>
            </div>
        </div>
    );
}
export default LoadingScreen;