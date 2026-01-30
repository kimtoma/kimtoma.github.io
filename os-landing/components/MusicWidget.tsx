import React, { useState, useEffect } from 'react';
import { Radio, ListMusic, ExternalLink } from 'lucide-react';

interface MusicWidgetProps {
    isFocused?: boolean;
    isDark?: boolean;
}

const MusicWidget: React.FC<MusicWidgetProps> = ({ isFocused = false, isDark = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMotorOn, setIsMotorOn] = useState(false); // Controls the "Spin" and Tone Arm

  // Automatically start the turntable motor when entering focus mode
  useEffect(() => {
      if (isFocused) {
          setIsMotorOn(true);
      } else {
          setIsMotorOn(false);
      }
  }, [isFocused]);

  // Spotify Playlist ID
  const SPOTIFY_PLAYLIST_ID = "6k0eCUQANWNAQwP90MkED2"; 
  // Add autoplay=1 when focused to attempt automatic playback
  const SPOTIFY_EMBED_URL = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0${isFocused ? '&autoplay=1' : ''}`;
  const OPEN_URL = `https://open.spotify.com/playlist/${SPOTIFY_PLAYLIST_ID}`;

  // Toggle motor state (Simulates "Music Playing" for the visual mechanism)
  const toggleMotor = () => setIsMotorOn(!isMotorOn);

  // --- RENDER ---

  // Focused View Layout (Minimalist Braun SK55 Style)
  if (isFocused) {
      return (
          <div className="w-full h-full flex flex-col md:flex-row bg-[#f4f4f0] relative overflow-hidden select-none">
              
              {/* Acrylic Cover Glare Simulation (Global Overlay) */}
              <div className="absolute inset-2 md:inset-4 border-2 border-white/40 rounded-sm pointer-events-none z-50 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-40"></div>
              
              {/* Left Side: Turntable Platter Area (Click to Toggle Motor) */}
              <div 
                className="flex-1 relative flex items-center justify-center bg-[#f4f4f0] overflow-hidden min-h-[50vh] md:min-h-0 cursor-pointer group"
                onClick={toggleMotor}
                title={isMotorOn ? "Stop Turntable" : "Start Turntable"}
              >
                  {/* Subtle Hint */}
                  <div className={`absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-gray-300 transition-opacity duration-700 ${isMotorOn ? 'opacity-0' : 'opacity-100 group-hover:text-gray-500'}`}>
                      CLICK TO START
                  </div>

                  {/* Metal Platter Well */}
                  <div className="relative w-[55vmin] h-[55vmin] max-w-[500px] max-h-[500px] aspect-square bg-[#e8e8e6] rounded-full flex items-center justify-center shadow-[inset_0_2px_15px_rgba(0,0,0,0.15)] shrink-0">
                        
                        {/* The Vinyl Record (Black, Classic) */}
                        <div 
                            className={`w-[94%] h-[94%] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative flex items-center justify-center transition-transform duration-[2s] ease-linear ${isMotorOn ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                            style={{ 
                                background: 'radial-gradient(circle, #111 0%, #1a1a1a 40%, #000 100%)',
                            }}
                        >
                            {/* Grooves Texture */}
                            <div className="absolute inset-0 rounded-full opacity-40" 
                                 style={{ background: 'repeating-radial-gradient(#222 0, #222 1px, transparent 2px, transparent 4px)' }}>
                            </div>
                            
                            {/* Light Reflection on Vinyl */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent opacity-30 rotate-45 pointer-events-none"></div>

                            {/* Center Label */}
                            <div className="w-[30%] h-[30%] bg-[#d6341d] rounded-full flex items-center justify-center shadow-md z-10 relative border border-black/10">
                                <div className="absolute inset-0 border-[4px] border-white/10 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-[#e0e0e0] rounded-full shadow-inner"></div>
                            </div>
                        </div>
                  </div>

                  {/* Tone Arm Assembly */}
                  <div className="absolute top-[10%] right-[5%] md:right-[10%] w-[15%] h-[60%] pointer-events-none z-40">
                      {/* Pivot Base */}
                      <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-[#d1d1d1] rounded-full shadow-lg border border-gray-300 flex items-center justify-center">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#e0e0e0] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)]"></div>
                      </div>

                      {/* Arm Tube */}
                      <div 
                          className={`absolute top-6 right-6 w-2 md:w-3 h-[120%] bg-gradient-to-r from-[#cfcfcf] to-[#e6e6e6] origin-top rounded-b-full shadow-xl transition-all duration-[1.5s] ease-in-out border-l border-white/50 ${isMotorOn ? 'rotate-[32deg]' : 'rotate-[10deg]'}`}
                          style={{ transformOrigin: '50% 20px' }}
                      >
                           {/* Headshell (Cartridge) */}
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 md:w-8 h-10 md:h-12 bg-[#333] rounded-sm flex flex-col items-center justify-end pb-1 shadow-md">
                               <div className="w-4 h-0.5 bg-white/20 mb-1"></div>
                           </div>
                      </div>
                  </div>
              </div>

              {/* Right Side (Desktop) / Bottom (Mobile): Simplified Control Panel */}
              <div className="w-full md:w-[320px] lg:w-[380px] bg-[#f4f4f0] border-l border-gray-200/50 p-6 md:p-10 flex flex-col justify-center gap-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none">
                  
                  {/* Spotify Player Container */}
                  <div className="flex-1 max-h-[500px] w-full relative flex flex-col">
                      {/* Frame */}
                      <div className="w-full h-full bg-[#282828] rounded-[12px] shadow-lg border-2 border-[#e0e0e0] relative overflow-hidden ring-1 ring-gray-300/50">
                           {/* Spotify Embed */}
                           <iframe 
                              src={SPOTIFY_EMBED_URL} 
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              allowFullScreen 
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                              loading="lazy"
                              className="w-full h-full block"
                              style={{ 
                                  borderRadius: '12px', // Match container exactly
                                  backgroundColor: '#282828' // Prevent white flashes
                              }}
                          ></iframe>
                      </div>
                  </div>

                  {/* Minimal Footer */}
                  <div className="flex justify-between items-center px-2">
                     <div className="text-[9px] font-mono text-gray-400 tracking-[0.2em] uppercase">
                          {isMotorOn ? 'PLAYING' : 'IDLE'}
                      </div>
                     <a 
                        href={OPEN_URL} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-gray-300 hover:text-[#ea5b25] transition-colors flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"
                      >
                          OPEN APP <ExternalLink size={10} />
                      </a>
                  </div>

              </div>
          </div>
      );
  }

  // Small Widget View (Minimalist Card Style)
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const mutedColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const progressBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const badgeBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';

  return (
    <div
        className="w-full h-full flex items-center gap-4 relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-inner relative overflow-hidden"
          >
              {/* Simple Vinyl Icon */}
              <div className="absolute inset-0 rounded-full" style={{ background: 'repeating-radial-gradient(#222 0, #222 2px, #111 3px, #111 4px)' }}></div>
              <div className="w-5 h-5 bg-[#d6341d] rounded-full flex items-center justify-center z-10 shadow-md">
                  <div className="w-1 h-1 bg-white/80 rounded-full"></div>
              </div>
              <div className="absolute inset-0 rounded-full border border-white/10 scale-75 pointer-events-none"></div>
          </div>

          <div className={`absolute -bottom-1 -right-1 ${badgeBg} rounded-full p-1 shadow-sm border z-20`}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" alt="Spotify" className="w-3 h-3" />
          </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
             <Radio size={10} className="text-[#1ed760]" />
             <span className="text-[9px] font-cutive text-[#1ed760] tracking-widest uppercase">
                 SPOTIFY.FM
             </span>
        </div>

        <div className="relative overflow-hidden">
            <div className={`font-bold text-sm ${textColor} truncate leading-tight`}>
                Vibe Collection
            </div>
            <div className={`text-xs ${mutedColor} truncate font-inter`}>
                Click to open deck
            </div>
        </div>

        <div className="flex items-center gap-2 w-full mt-1 opacity-50">
            <div className={`h-1 flex-1 ${progressBg} rounded-full overflow-hidden`}>
                <div className="h-full bg-[#1ed760] w-2/3"></div>
            </div>
        </div>
      </div>

      <div className={`flex items-center justify-center ${mutedColor} transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <ListMusic size={16} />
      </div>
    </div>
  );
};

export default MusicWidget;