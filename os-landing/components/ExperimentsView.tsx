import React, { useState, useEffect } from 'react';
import { Terminal, Maximize2 } from 'lucide-react';

interface ExperimentsViewProps {
    isFocused?: boolean;
    onFocusChange?: (focused: boolean) => void;
}

const ExperimentsView: React.FC<ExperimentsViewProps> = ({ isFocused, onFocusChange }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isFocused) setActive(false);
  }, [isFocused]);

  const handleClick = () => {
      setActive(true);
      onFocusChange?.(true);
  };

  if (isFocused && active) {
      return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
            {/* Simulation of a complex visual experiment */}
            <div className="absolute inset-0 opacity-20">
                 <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,#e86b58,transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>
            
            <div className="relative z-10 w-full max-w-5xl h-[80vh] border border-gray-800 bg-black/50 backdrop-blur-md rounded-lg p-4 flex flex-col font-mono text-green-500 shadow-[0_0_50px_rgba(0,255,0,0.1)]">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-4">
                    <span className="flex items-center gap-2 text-xs"><Terminal size={14}/> VIBE_CODING_TERMINAL_V2</span>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                    {/* Simulated Code Rain / Visuals */}
                    <div className="absolute inset-0 font-xs opacity-30 whitespace-pre-wrap overflow-hidden leading-none select-none">
                        {Array.from({length: 200}).map((_, i) => (
                            <span key={i} style={{ marginLeft: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }} className="block animate-float text-[10px]">
                                {Math.random() > 0.5 ? '0' : '1'} {Math.random().toString(16).substring(2,6)}
                            </span>
                        ))}
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white mix-blend-difference">SYSTEM_OVERRIDE</h1>
                        <p className="text-sm text-gray-400 max-w-md mx-auto">
                            Experiments in generative UI and spatial computing are currently compiling. 
                            Please standby for rendering cycle completion.
                        </p>
                    </div>
                </div>
                
                <div className="mt-4 border-t border-gray-800 pt-2 text-xs text-gray-600 flex justify-between">
                    <span>CPU: 12%</span>
                    <span>MEM: 402MB</span>
                    <span>NET: CONNECTED</span>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 pb-24 md:pb-8">
      <div 
        onClick={handleClick}
        className="relative w-full max-w-2xl aspect-video bg-black/5 rounded-lg border border-gray-400/20 flex flex-col items-center justify-center overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-2xl"
      >
         {/* Abstract background animation placeholder */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,107,88,0.1),transparent_70%)] animate-pulse"></div>
         
         <div className="z-10 text-center space-y-4 transition-transform duration-500 group-hover:scale-110">
             <div className="w-16 h-16 mx-auto border-2 border-[#e86b58] rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                <div className="w-2 h-2 bg-[#e86b58] rounded-full"></div>
             </div>
             
             <h2 className="font-cutive text-2xl font-bold text-gray-700 tracking-widest">VIBE CODING</h2>
             <p className="font-inter text-gray-500 max-w-md mx-auto px-4 text-sm md:text-base">
                 Experimental interfaces and generative systems. <br/>
                 <span className="text-[#e86b58] text-xs uppercase tracking-widest mt-2 block group-hover:underline">Click to Initialize</span>
             </p>
         </div>

         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
             <Maximize2 size={20} />
         </div>

         {/* Grid overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
};

export default ExperimentsView;