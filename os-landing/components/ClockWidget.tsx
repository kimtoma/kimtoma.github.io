import React, { useState, useEffect } from 'react';

interface ClockWidgetProps {
  isFocused?: boolean;
  isDark?: boolean;
}

const ClockWidget: React.FC<ClockWidgetProps> = ({ isFocused = false, isDark = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Calculate degrees
  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

  const bgColor = isDark ? 'bg-[#1a1512]' : 'bg-[#f4f4f4]';
  const faceBg = isDark ? 'bg-[#2a2420]' : 'bg-white';
  const faceBorder = isDark ? 'border-[#3a3430]' : 'border-gray-200';
  const markerColor = isDark ? 'bg-gray-300' : 'bg-gray-800';
  const handColor = isDark ? 'bg-gray-200' : 'bg-black';
  const handColorSecondary = isDark ? 'bg-gray-300' : 'bg-gray-800';
  const textColor = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`w-full h-full flex items-center justify-center ${bgColor} relative shadow-inner p-4 transition-all duration-500 ${isFocused ? (isDark ? 'bg-[#1a1512]' : 'bg-[#e8f1f2]') : 'rounded-sm'}`}>
      {/* Braun-inspired Analog Clock Face */}
      <div
        className={`relative ${faceBg} rounded-full shadow-md border ${faceBorder} transition-all duration-500 ease-in-out ${isFocused ? 'w-[80vmin] h-[80vmin] shadow-2xl border-4' : 'w-32 h-32 md:w-40 md:h-40'}`}
      >

        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full left-0 top-0 pointer-events-none"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className={`${markerColor} mx-auto ${isFocused ? 'w-1.5 h-6 mt-4' : 'w-0.5 h-2 mt-2'}`}></div>
          </div>
        ))}

        {/* Center Point */}
        <div className={`absolute top-1/2 left-1/2 ${handColor} rounded-full -translate-x-1/2 -translate-y-1/2 z-30 ${isFocused ? 'w-8 h-8' : 'w-3 h-3'}`}></div>

        {/* Hour Hand */}
        <div
          className={`absolute top-1/2 left-1/2 ${handColor} origin-bottom z-10 rounded-full ${isFocused ? 'w-4 h-[25%]' : 'w-1.5 h-10'}`}
          style={{ transform: `translate(-50%, -100%) rotate(${hourDeg}deg)` }}
        ></div>

        {/* Minute Hand */}
        <div
          className={`absolute top-1/2 left-1/2 ${handColorSecondary} origin-bottom z-20 rounded-full ${isFocused ? 'w-2.5 h-[35%]' : 'w-1 h-14'}`}
          style={{ transform: `translate(-50%, -100%) rotate(${minDeg}deg)` }}
        ></div>

        {/* Second Hand (Iconic Yellow/Orange) */}
        <div
          className={`absolute top-1/2 left-1/2 bg-[#e86b58] origin-bottom z-20 ${isFocused ? 'w-1 h-[40%]' : 'w-[1px] h-16'}`}
          style={{ transform: `translate(-50%, -100%) rotate(${secDeg}deg)` }}
        >
             <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e86b58] rounded-full ${isFocused ? 'w-6 h-6' : 'w-2 h-2'}`}></div>
        </div>

        {/* Center detailed dot (orange inside black) */}
        <div className={`absolute top-1/2 left-1/2 bg-[#e86b58] rounded-full -translate-x-1/2 -translate-y-1/2 z-40 ${isFocused ? 'w-3 h-3' : 'w-1 h-1'}`}></div>
      </div>

      {/* Date text at bottom right */}
      <div className={`absolute font-inter ${textColor} ${isFocused ? 'bottom-8 right-8 text-2xl font-bold tracking-widest' : 'bottom-3 right-4 text-[10px]'}`}>
          {time.getDate()}
      </div>
    </div>
  );
};

export default ClockWidget;