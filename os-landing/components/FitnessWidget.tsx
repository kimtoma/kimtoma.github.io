import React, { useState, useEffect, useRef } from 'react';
import { Activity, Flame, Timer, MapPin, Heart, Footprints, Trophy, Zap, Smartphone, RefreshCw, Check, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface FitnessWidgetProps {
  isFocused?: boolean;
}

type SyncStatus = 'IDLE' | 'CONNECTING' | 'SYNCING' | 'CONNECTED' | 'ERROR';

const FitnessWidget: React.FC<FitnessWidgetProps> = ({ isFocused = false }) => {
  const [animate, setAnimate] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('IDLE');
  const [activeSource, setActiveSource] = useState<'LOCAL' | 'APPLE' | 'NIKE'>('LOCAL');
  
  // Dynamic Stats State
  const [liveStats, setLiveStats] = useState({
      distance: 5.24,
      pace: 330, // seconds
      time: "28:45",
      calories: 342,
      bpm: 156,
      steps: 6430
  });

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Simulate Live Heartbeat and Pace fluctuations when Connected
  useEffect(() => {
      if (activeSource === 'LOCAL' && syncStatus !== 'CONNECTED') return;

      const interval = setInterval(() => {
          setLiveStats(prev => ({
              ...prev,
              bpm: Math.min(185, Math.max(140, prev.bpm + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))),
              pace: Math.max(280, prev.pace + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)),
              calories: prev.calories + (Math.random() > 0.8 ? 1 : 0),
              steps: prev.steps + (Math.random() > 0.5 ? 2 : 0)
          }));
      }, 2000);

      return () => clearInterval(interval);
  }, [activeSource, syncStatus]);

  // Handle Sync Simulation
  const handleConnect = (source: 'APPLE' | 'NIKE') => {
      setSyncStatus('CONNECTING');
      
      // Sequence of fake connection steps
      setTimeout(() => {
          setSyncStatus('SYNCING');
      }, 1500);

      setTimeout(() => {
          setSyncStatus('CONNECTED');
          setActiveSource(source);
          // Update stats to "Synced" values
          setLiveStats({
            distance: source === 'NIKE' ? 8.5 : 6.2,
            pace: source === 'NIKE' ? 315 : 340,
            time: source === 'NIKE' ? "42:10" : "32:15",
            calories: source === 'NIKE' ? 520 : 410,
            bpm: 162,
            steps: source === 'NIKE' ? 9500 : 7200
          });
      }, 4500);
  };

  // Helper to format pace (seconds -> mm'ss")
  const formatPace = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}'${s < 10 ? '0' : ''}${s}"`;
  };

  // SVG Path for a random running route
  const routePath = "M 40 120 Q 60 100, 80 120 T 120 100 T 160 120 T 200 80 T 160 40 T 120 60 T 80 40 T 40 80 Z";

  // --- FULL SCREEN MODE ---
  if (isFocused) {
      return (
          <div className="w-full h-full bg-[#000] text-white flex flex-col md:flex-row overflow-hidden font-inter select-none relative">
              
              {/* Sync Overlay / Modal */}
              {syncStatus !== 'CONNECTED' && syncStatus !== 'IDLE' && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center gap-6">
                          <RefreshCw size={48} className={`text-[#ccff00] ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                          <div className="text-center space-y-2">
                              <h2 className="text-2xl font-bold font-cutive">
                                  {syncStatus === 'CONNECTING' ? 'ESTABLISHING LINK...' : 'SYNCING ACTIVITY DATA...'}
                              </h2>
                              <p className="text-gray-500 font-mono text-xs">
                                  {syncStatus === 'CONNECTING' ? 'Searching for Bluetooth devices' : 'Downloading recent workouts from cloud'}
                              </p>
                          </div>
                          {syncStatus === 'CONNECTING' && (
                              <div className="flex gap-2 mt-4">
                                  <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-bounce"></span>
                                  <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-bounce delay-100"></span>
                                  <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-bounce delay-200"></span>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* Left Panel: Map Visualization */}
              <div className="w-full md:w-1/2 h-[40vh] md:h-full relative bg-[#111] overflow-hidden border-r border-white/5">
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-20" 
                       style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                  </div>
                  
                  {/* The Route */}
                  <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 240 160" className="w-[80%] h-[80%] drop-shadow-[0_0_15px_rgba(204,255,0,0.6)]">
                          <path 
                            d={routePath} 
                            fill="none" 
                            stroke={activeSource === 'NIKE' ? "#ccff00" : (activeSource === 'APPLE' ? "#fa114f" : "#ccff00")} 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="animate-[dash_3s_ease-out_forwards]"
                            strokeDasharray="600"
                            strokeDashoffset={animate ? "0" : "600"}
                          />
                          {/* Pulsing Location Dot */}
                          <circle cx="40" cy="80" r="4" fill="white" className="animate-ping" />
                          <circle cx="40" cy="80" r="4" fill={activeSource === 'APPLE' ? "#fa114f" : "#ccff00"} />
                      </svg>
                  </div>

                  <div className="absolute bottom-8 left-8 z-10">
                      <h2 className={`font-bold text-2xl font-cutive italic ${activeSource === 'APPLE' ? 'text-[#fa114f]' : 'text-[#ccff00]'}`}>
                          {activeSource === 'NIKE' ? "JUST DO IT." : (activeSource === 'APPLE' ? "CLOSE YOUR RINGS." : "READY TO RUN.")}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-2"><MapPin size={14} /> Hangang Park, Seoul</p>
                  </div>
                  
                  {/* Connection Status Indicator */}
                  <div className="absolute top-8 left-8 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                       {activeSource === 'LOCAL' ? (
                           <>
                             <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                             <span className="text-[10px] font-mono text-gray-400">OFFLINE MODE</span>
                           </>
                       ) : (
                           <>
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="text-[10px] font-mono text-green-500">LIVE SYNC: {activeSource}</span>
                           </>
                       )}
                  </div>
              </div>

              {/* Right Panel: Stats Dashboard */}
              <div className="w-full md:w-1/2 h-full p-8 md:p-12 flex flex-col justify-center bg-[#090909]">
                   <div className="flex justify-between items-start mb-12">
                       <div className="flex items-center gap-2">
                           <Activity className={activeSource === 'APPLE' ? "text-[#fa114f]" : "text-[#ccff00]"} />
                           <span className={`font-cutive text-sm tracking-[0.3em] ${activeSource === 'APPLE' ? "text-[#fa114f]" : "text-[#ccff00]"}`}>WORKOUT_LOG</span>
                       </div>
                       
                       {/* Source Selector Buttons */}
                       <div className="flex gap-2">
                           <button 
                                onClick={() => handleConnect('NIKE')}
                                disabled={syncStatus !== 'IDLE' && syncStatus !== 'CONNECTED'}
                                className={`px-3 py-1.5 rounded text-[10px] font-mono border transition-all flex items-center gap-2 ${activeSource === 'NIKE' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                           >
                               {activeSource === 'NIKE' ? <Check size={10} /> : <LinkIcon size={10} />} NRC
                           </button>
                           <button 
                                onClick={() => handleConnect('APPLE')}
                                disabled={syncStatus !== 'IDLE' && syncStatus !== 'CONNECTED'}
                                className={`px-3 py-1.5 rounded text-[10px] font-mono border transition-all flex items-center gap-2 ${activeSource === 'APPLE' ? 'bg-[#fa114f] text-white border-[#fa114f]' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                           >
                               {activeSource === 'APPLE' ? <Check size={10} /> : <LinkIcon size={10} />} HEALTH
                           </button>
                       </div>
                   </div>

                   {/* Main Metric */}
                   <div className="mb-12 relative group cursor-default">
                       <div className="text-8xl md:text-9xl font-black tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-600 transition-all duration-500">
                           {liveStats.distance}
                       </div>
                       <div className="text-xl text-gray-400 font-bold ml-2 uppercase tracking-widest">Kilometers</div>
                   </div>

                   {/* Grid Stats */}
                   <div className="grid grid-cols-2 gap-8 md:gap-12">
                       <div>
                           <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-mono uppercase">
                               <Timer size={16} /> Avg. Pace
                           </div>
                           <div className="text-3xl md:text-4xl font-bold font-mono transition-all duration-300">
                               {formatPace(liveStats.pace)} <span className="text-sm text-gray-600">/km</span>
                           </div>
                       </div>
                       <div>
                           <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-mono uppercase">
                               <Zap size={16} /> Total Time
                           </div>
                           <div className="text-3xl md:text-4xl font-bold font-mono">{liveStats.time}</div>
                       </div>
                       <div>
                           <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-mono uppercase">
                               <Flame size={16} /> Active Cal
                           </div>
                           <div className="text-3xl md:text-4xl font-bold font-mono transition-all duration-500">
                               {liveStats.calories} <span className="text-sm text-gray-600">kcal</span>
                           </div>
                       </div>
                       <div>
                           <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-mono uppercase">
                               <Heart size={16} /> Heart Rate
                           </div>
                           <div className="flex items-baseline gap-2">
                               <div className="text-3xl md:text-4xl font-bold font-mono text-red-500 transition-all duration-500">{liveStats.bpm}</div>
                               <span className="text-sm text-gray-600">bpm</span>
                               {activeSource !== 'LOCAL' && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
                           </div>
                       </div>
                   </div>

                   {/* Progress Bar */}
                   <div className="mt-12">
                       <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                           <span>DAILY GOAL</span>
                           <span>{Math.round((liveStats.steps / 10000) * 100)}%</span>
                       </div>
                       <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div 
                                className={`h-full w-[85%] shadow-[0_0_10px] transition-all duration-1000 ${activeSource === 'APPLE' ? 'bg-[#fa114f] shadow-[#fa114f]' : 'bg-[#ccff00] shadow-[#ccff00]'}`}
                                style={{ width: `${Math.min(100, (liveStats.steps / 10000) * 100)}%` }}
                           ></div>
                       </div>
                   </div>
              </div>
          </div>
      );
  }

  // --- WIDGET MODE (Apple Health Rings Style) ---
  return (
    <div className="w-full h-full bg-[#1c1c1e] text-white p-5 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ccff00] rounded-full filter blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>

      {/* Header */}
      <div className="flex justify-between items-start z-10">
          <div>
              <div className="flex items-center gap-1.5 mb-1">
                  <Activity size={12} className="text-[#ccff00]" />
                  <span className="font-cutive text-[9px] text-[#ccff00] tracking-widest">FITNESS</span>
              </div>
              <h3 className="font-bold text-lg leading-none italic">Evening Run</h3>
          </div>
          <div className="text-[10px] text-gray-400 font-mono bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              {activeSource !== 'LOCAL' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>}
              TODAY
          </div>
      </div>

      {/* Center Visualization (Rings & Route) */}
      <div className="flex-1 relative flex items-center justify-center my-2">
          {/* Ring Container */}
          <div className="relative w-28 h-28 flex items-center justify-center">
               {/* Outer Ring (Move - Red/Pink) */}
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                   <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#331111" strokeWidth="6" />
                   <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#fa114f" strokeWidth="6" strokeDasharray="260" strokeDashoffset={animate ? "60" : "260"} strokeLinecap="round" className="transition-all duration-[1.5s] ease-out" />
               </svg>
               {/* Middle Ring (Exercise - Green/Volt) */}
               <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.82]">
                   <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#113300" strokeWidth="7" />
                   <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#ccff00" strokeWidth="7" strokeDasharray="260" strokeDashoffset={animate ? "20" : "260"} strokeLinecap="round" className="transition-all duration-[1.5s] delay-100 ease-out" />
               </svg>
               {/* Inner Ring (Stand - Blue) */}
               <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.64]">
                   <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#002233" strokeWidth="9" />
                   <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#00d1ff" strokeWidth="9" strokeDasharray="260" strokeDashoffset={animate ? "90" : "260"} strokeLinecap="round" className="transition-all duration-[1.5s] delay-200 ease-out" />
               </svg>

               {/* Center Icon */}
               <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                   <Footprints size={18} className="text-white fill-white opacity-80" />
                   <span className="text-xs font-bold font-mono mt-0.5">{liveStats.steps}</span>
               </div>
          </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 z-10">
          <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase font-mono">Dist</span>
              <span className="text-sm font-bold">{liveStats.distance}<span className="text-[9px] text-gray-400 ml-0.5">km</span></span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-2">
              <span className="text-[9px] text-gray-500 uppercase font-mono">Pace</span>
              <span className="text-sm font-bold">{formatPace(liveStats.pace)}</span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-2">
              <span className="text-[9px] text-gray-500 uppercase font-mono">Time</span>
              <span className="text-sm font-bold text-[#ccff00]">{liveStats.time}</span>
          </div>
      </div>

      {/* Hover Detail Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <Smartphone size={32} className="text-gray-400 mb-2" />
          <span className="text-[#ccff00] font-bold tracking-widest text-xs">CLICK TO SYNC</span>
          <span className="text-gray-400 text-[10px] mt-1">Apple Health / NRC</span>
      </div>
    </div>
  );
};

export default FitnessWidget;