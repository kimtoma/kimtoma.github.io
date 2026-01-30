import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, ExternalLink, Radio, Volume2, VolumeX, ListMusic, Loader2 } from 'lucide-react';

// Define the YouTube Player type
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface SpotifyWidgetProps {
    isFocused?: boolean;
}

const SpotifyWidget: React.FC<SpotifyWidgetProps> = ({ isFocused = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(0); 
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  
  // Metadata state (fetched from player)
  const [trackTitle, setTrackTitle] = useState("System Offline");
  const [trackAuthor, setTrackAuthor] = useState("Waiting for signal...");

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // User Provided Playlist ID
  const PLAYLIST_ID = "PLYctRqHA8lVAKgWSg9Mie4RsHSNRgzzH8"; 
  const PROFILE_URL = `https://music.youtube.com/playlist?list=${PLAYLIST_ID}`;

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const initializePlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player('youtube-audio-player', {
      height: '1', // Non-zero height to prevent browser throttling
      width: '1',
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        autoplay: 0, 
        loop: 1,
        origin: window.location.origin
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
  };

  const updateMetadata = () => {
      if(playerRef.current && playerRef.current.getVideoData) {
          const data = playerRef.current.getVideoData();
          if(data && data.title) {
              setTrackTitle(data.title);
              setTrackAuthor(data.author || "Unknown Artist");
          }
      }
  };

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    updateMetadata();
    event.target.setVolume(100);
    // Initially the title might be empty for a playlist until loaded
    setTrackTitle("Ready to Play");
    setTrackAuthor("Playlist Loaded");
  };

  const onPlayerError = (event: any) => {
      console.warn("Player Error:", event.data);
      // Errors 100, 101, 150 mean video is restricted or not found.
      // Auto-skip to next track.
      if (playerRef.current && playerRef.current.nextVideo) {
          setTimeout(() => {
              playerRef.current.nextVideo();
          }, 1000);
      }
  };

  const onPlayerStateChange = (event: any) => {
    updateMetadata();
    
    // 1 = Playing, 2 = Paused, 0 = Ended, 3 = Buffering, 5 = Cued
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      startProgressTimer();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopProgressTimer();
    } else if (event.data === window.YT.PlayerState.ENDED) {
       // Playlist loop handled by playerVars usually, but logic can go here
    }
  };

  const startProgressTimer = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setProgress(playerRef.current.getCurrentTime());
        // Duration might update late for playlists
        const d = playerRef.current.getDuration();
        if(d > 0) setDuration(d);
      }
    }, 500);
  };

  const stopProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!playerReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSkip = (direction: 'next' | 'previous') => {
    if (!playerRef.current) return;
    if (direction === 'next') {
      playerRef.current.nextVideo();
    } else {
      playerRef.current.previousVideo();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerReady || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedRatio = x / rect.width;
    const newTime = clickedRatio * duration;
    
    playerRef.current.seekTo(newTime, true);
    setProgress(newTime);
  };

  const toggleMute = () => {
      if (!playerRef.current) return;
      if (isMuted) {
          playerRef.current.unMute();
      } else {
          playerRef.current.mute();
      }
      setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- RENDER ---

  // Focused View Layout (BRAUN SK4 "Snow White's Coffin" Style)
  if (isFocused) {
      return (
          <div className="w-full h-full flex flex-col bg-[#f4f4f0] relative overflow-hidden select-none">
              {/* Hidden YouTube Player (Must be technically visible for API to work in some browsers) */}
              <div className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none">
                  <div id="youtube-audio-player"></div>
              </div>

              {/* Main Turntable Area - Flexible Height */}
              <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-4 md:p-8">
                  
                  {/* Acrylic Cover Glare Simulation */}
                  <div className="absolute inset-4 border border-white/40 rounded-sm pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30"></div>

                  {/* Turntable Platter - Responsive sizing */}
                  <div className="relative w-[50vmin] h-[50vmin] max-w-[400px] max-h-[400px] aspect-square bg-[#e6e6e2] rounded-full flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] mb-4 md:mb-8 shrink-0">
                        {/* The Vinyl */}
                        <div 
                            className={`w-[90%] h-[90%] bg-[#1a1a1a] rounded-full shadow-lg relative flex items-center justify-center transition-transform duration-1000 ease-linear ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''}`}
                        >
                            {/* Grooves */}
                            <div className="absolute inset-1 border border-white/5 rounded-full"></div>
                            <div className="absolute inset-4 border border-white/5 rounded-full"></div>
                            <div className="absolute inset-8 border border-white/5 rounded-full"></div>
                            <div className="absolute inset-12 border border-white/5 rounded-full opacity-50"></div>
                            
                            {/* Label */}
                            <div className="w-1/3 h-1/3 bg-[#ea5b25] rounded-full flex items-center justify-center relative">
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                <span className="absolute bottom-2 text-[6px] font-bold text-black/50 tracking-widest">STEREO</span>
                            </div>
                        </div>

                        {/* Tone Arm (Stylized Braun style - simple metal tube) */}
                        <div 
                            className={`absolute top-0 right-[-10%] w-4 h-[70%] bg-[#d1d1d1] origin-top rounded-b-full shadow-xl z-30 transition-transform duration-1000 ease-in-out border border-gray-400/50 ${isPlaying ? 'rotate-[25deg]' : 'rotate-0'}`}
                            style={{ borderRadius: '4px', transformOrigin: '50% 10%' }}
                        >
                             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#c0c0c0] shadow-inner border border-gray-300"></div>
                             <div className="absolute bottom-0 w-full h-8 bg-[#333] rounded-b-sm"></div>
                        </div>
                  </div>

                  {/* Speaker Grid Pattern (Minimalist Dots) - Visible only on larger screens to save space */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-4 gap-1 opacity-20">
                      {[...Array(32)].map((_, i) => <div key={i} className="w-1 h-1 bg-gray-800 rounded-full"></div>)}
                  </div>
              </div>

              {/* Bottom Control Deck (Braun Interface) - Fixed at bottom, always visible */}
              <div className="bg-[#e8e8e6] border-t border-gray-300 px-6 py-6 pb-8 md:px-12 flex flex-col gap-4 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] shrink-0">
                  
                  {/* Track Info Display */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                      <div className="overflow-hidden w-full">
                          <h2 className="font-inter font-bold text-gray-800 text-lg md:text-xl truncate tracking-tight">{trackTitle}</h2>
                          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">{trackAuthor}</p>
                      </div>
                      <div className="font-mono text-xs text-gray-500 shrink-0 tabular-nums">
                          {formatTime(progress)} <span className="mx-1">/</span> {formatTime(duration)}
                      </div>
                  </div>

                  {/* Mechanical Progress Bar */}
                  <div 
                    className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
                    onClick={handleSeek}
                  >
                      <div 
                        className="h-full bg-[#ea5b25] transition-all duration-300 ease-linear"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                      ></div>
                  </div>

                  {/* Physical Buttons */}
                  <div className="flex items-center justify-between mt-2">
                      {/* Left: Branding & Mute */}
                      <div className="flex items-center gap-6">
                           <div className="font-inter font-bold text-gray-400 tracking-widest text-sm hidden md:block">BRAUN</div>
                           <button onClick={toggleMute} className="text-gray-500 hover:text-gray-800 transition-colors">
                              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                           </button>
                      </div>

                      {/* Center: Playback Controls (Round Buttons) */}
                      <div className="flex items-center gap-6 md:gap-8">
                          <button 
                            onClick={() => handleSkip('previous')}
                            className="w-10 h-10 rounded-full bg-[#d6d6d4] shadow-[0_2px_0_#b0b0b0] active:shadow-inner active:translate-y-[1px] flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
                          >
                              <SkipBack size={18} fill="currentColor" />
                          </button>
                          
                          <button 
                            onClick={(e) => togglePlay(e)}
                            className={`w-14 h-14 rounded-full shadow-[0_3px_0_#b0b0b0] active:shadow-inner active:translate-y-[1px] flex items-center justify-center transition-colors text-white ${isPlaying ? 'bg-[#333]' : 'bg-[#ea5b25] shadow-[0_3px_0_#c0481b]'}`}
                          >
                              {playerReady ? (
                                  isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />
                              ) : (
                                  <Loader2 size={20} className="animate-spin opacity-50" />
                              )}
                          </button>

                          <button 
                            onClick={() => handleSkip('next')}
                            className="w-10 h-10 rounded-full bg-[#d6d6d4] shadow-[0_2px_0_#b0b0b0] active:shadow-inner active:translate-y-[1px] flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
                          >
                              <SkipForward size={18} fill="currentColor" />
                          </button>
                      </div>
                      
                      {/* Right: External Link */}
                      <a 
                        href={PROFILE_URL} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#ea5b25] transition-colors"
                      >
                          <ExternalLink size={16} />
                      </a>
                  </div>
              </div>
          </div>
      );
  }

  // Small Widget View (Existing Card Style, Minimal Updates)
  return (
    <div 
        className="w-full h-full flex items-center gap-4 relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      {!isFocused && (
          <div className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none">
              <div id="youtube-audio-player"></div>
          </div>
      )}

      <div className="relative shrink-0">
          <div 
            className={`w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-inner relative overflow-hidden ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
            style={{ animationDuration: '6s' }}
          >
              <div className="w-5 h-5 bg-[#ea5b25] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
              </div>
              <div className="absolute inset-0 rounded-full border border-white/10 scale-75"></div>
          </div>
          
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
            onClick={togglePlay}
            onMouseDown={(e) => e.stopPropagation()}
          >
              {isPlaying ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white" />}
          </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
             <Radio size={10} className={`text-[#e86b58] ${isPlaying ? 'animate-pulse' : ''}`} />
             <span className="text-[9px] font-cutive text-[#e86b58] tracking-widest uppercase">
                 PLAYLIST.FM
             </span>
        </div>

        <div className="relative overflow-hidden">
            <div className="font-bold text-sm text-gray-800 truncate leading-tight">
                {trackTitle}
            </div>
            <div className="text-xs text-gray-500 truncate font-inter">
                {trackAuthor}
            </div>
        </div>

        <div className="flex items-center gap-2 w-full mt-1">
            <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#ea5b25] transition-all duration-500 ease-linear"
                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                ></div>
            </div>
        </div>
      </div>

      <div className={`flex flex-col gap-2 items-center text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="hover:text-[#e86b58] transition-colors">
              <ListMusic size={14} />
          </a>
          <div className="flex gap-1">
            <SkipBack 
                size={14} 
                className="hover:text-gray-600 cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); handleSkip('previous'); }}
                onMouseDown={(e) => e.stopPropagation()}
            />
            <SkipForward 
                size={14} 
                className="hover:text-gray-600 cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); handleSkip('next'); }}
                onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
      </div>
    </div>
  );
};

export default SpotifyWidget;