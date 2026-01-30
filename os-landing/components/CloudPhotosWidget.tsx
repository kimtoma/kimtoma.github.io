import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, Calendar, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

// You can populate this with direct links to your photos.
// For Google Photos, you can use tools to generate direct links from shared albums, 
// but they eventually expire. The best way for a static site is to host images 
// on a service like Cloudinary, Unsplash, or in your public/assets folder.
const MEMORY_STREAM = [
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Seoul, South Korea',
    date: '2023.10.24',
    caption: 'Night Drive'
  },
  {
    url: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Jeju Island',
    date: '2023.08.15',
    caption: 'Summer Breeze'
  },
  {
    url: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Workplace',
    date: '2024.01.10',
    caption: 'Late Night Coding'
  },
  {
    url: 'https://images.unsplash.com/photo-1534067783741-512d0deaf586?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Tokyo, Japan',
    date: '2022.12.05',
    caption: 'Neon Lights'
  }
];

interface CloudPhotosWidgetProps {
  isFocused?: boolean;
}

const CloudPhotosWidget: React.FC<CloudPhotosWidgetProps> = ({ isFocused = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MEMORY_STREAM.length);
    }, 6000); // Change photo every 6 seconds
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentPhoto = MEMORY_STREAM[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % MEMORY_STREAM.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + MEMORY_STREAM.length) % MEMORY_STREAM.length);
  };

  return (
    <div 
      className={`relative w-full h-full bg-white group overflow-hidden select-none ${isFocused ? 'flex items-center justify-center bg-black' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Photo Layer */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gray-100`}>
         {MEMORY_STREAM.map((photo, index) => (
             <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
             >
                 <img 
                    src={photo.url} 
                    alt={photo.caption}
                    className={`w-full h-full ${isFocused ? 'object-contain' : 'object-cover'} transition-transform duration-[10s] ease-linear ${index === currentIndex && !isPaused ? 'scale-110' : 'scale-100'}`} 
                 />
                 {/* Vignette for widget mode */}
                 {!isFocused && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>}
             </div>
         ))}
      </div>

      {/* Cloud OS UI Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between p-4 z-10 ${isFocused ? 'text-white/80 p-8' : 'text-white'}`}>
          
          {/* Header */}
          <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                  <Cloud size={10} className="text-[#e86b58]" />
                  <span className="font-cutive text-[9px] tracking-widest uppercase">G_PHOTOS</span>
              </div>
              {!isFocused && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Maximize2 size={14} />
                  </div>
              )}
          </div>

          {/* Footer Info */}
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
               <div className="flex items-center gap-2 mb-1">
                   <span className="font-inter font-bold text-sm tracking-wide shadow-black drop-shadow-md">{currentPhoto.caption}</span>
               </div>
               <div className="flex items-center gap-3 text-[10px] font-mono opacity-80">
                   <div className="flex items-center gap-1">
                       <MapPin size={10} /> {currentPhoto.location}
                   </div>
                   <div className="flex items-center gap-1">
                       <Calendar size={10} /> {currentPhoto.date}
                   </div>
               </div>
          </div>
      </div>

      {/* Controls */}
      <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
          <button 
            onClick={handlePrev}
            className="p-1 bg-black/20 backdrop-blur hover:bg-black/40 rounded-full text-white pointer-events-auto transition-colors"
          >
              <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext}
            className="p-1 bg-black/20 backdrop-blur hover:bg-black/40 rounded-full text-white pointer-events-auto transition-colors"
          >
              <ChevronRight size={16} />
          </button>
      </div>

      {/* Loading bar for timing */}
      {!isFocused && !isPaused && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-[#e86b58] z-20 animate-[loading_6s_linear_infinite] origin-left w-full"></div>
      )}
      <style>{`
        @keyframes loading {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default CloudPhotosWidget;