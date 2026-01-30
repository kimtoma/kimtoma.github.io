import React, { useState } from 'react';
import { CardData, ContentType } from '../types';

interface FloatingCardProps {
  data: CardData;
  active: boolean;
  onMouseDown: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  isMobile?: boolean;
  isFocused?: boolean;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ 
  data, 
  active, 
  onMouseDown, 
  isMobile = false,
  isFocused = false 
}) => {
  const { 
    id, 
    type, 
    content, 
    x, 
    y, 
    z, 
    rotation, 
    width = 'w-64', 
    height = 'h-auto',
    color = 'bg-[#fdfbf7]', // Default paper color
    delay = 'animate-float',
    noPadding = false
  } = data;

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Styles based on state
  let outerStyle: React.CSSProperties;
  let outerClasses: string;

  if (isFocused) {
    // Full Screen Focus Mode
    outerStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100dvh', // Use dynamic viewport height for mobile browsers
      zIndex: 10000,
      transform: 'none',
      margin: 0,
      borderRadius: 0,
    };
    // For IMAGE type, we want a dark background (Darkroom mode)
    // For others, we might want to keep the card color or expand it
    const bgClass = type === ContentType.IMAGE ? 'bg-[#1a1a1a]' : (color || 'bg-[#fdfbf7]');
    
    outerClasses = `transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${bgClass}`;
  } else if (isMobile) {
    // Mobile List Mode
    outerStyle = {
      position: 'relative',
      transform: 'none',
      zIndex: 1
    };
    outerClasses = `relative w-full ${height} select-none transition-all duration-300`;
  } else {
    // Desktop Floating Mode
    outerStyle = {
      left: '50%',
      top: '50%',
      transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotate(${rotation}deg)`,
      zIndex: Math.floor(z + 1000),
      transformStyle: 'preserve-3d', 
    };
    outerClasses = `absolute ${width} ${height} select-none transition-transform duration-100 ` + 
      (active ? 'cursor-grabbing z-[9999]' : 'cursor-grab hover:!z-[5000]');
  }

  // Animation Layer
  const innerClasses = `w-full h-full pointer-events-none ${(!isFocused && !active && !isMobile) ? delay : ''}`;

  // Calculate dynamic transform for the visual layer
  const getTransform = () => {
    if (isFocused || isMobile) return 'none';
    if (active) return 'scale(1.05)';
    if (isHovered) {
      return `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02) translateY(-5px)`;
    }
    return 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)';
  };

  // Visual container handles shadows, backgrounds
  // In focus mode, remove rounded corners and shadows for seamless full screen
  const visualClasses = `w-full h-full transition-all duration-300 ease-out pointer-events-auto overflow-hidden ` +
    (isFocused 
      ? 'shadow-none rounded-none' 
      : (active 
          ? 'shadow-[0_40px_80px_rgba(0,0,0,0.3)] ring-1 ring-[#e86b58]/40 rounded-sm' 
          : (isMobile ? 'shadow-sm rounded-sm' : 'shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] rounded-sm')));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (active || isMobile || isFocused) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;

    const TILT_AMOUNT = 15; 
    
    setTilt({
      x: yPct * -TILT_AMOUNT, 
      y: xPct * -TILT_AMOUNT 
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const renderContent = () => {
    switch (type) {
      case ContentType.NOTE:
        return (
          <div className={`${color} p-6 font-caveat text-2xl text-gray-800 leading-relaxed border-t-4 border-[#e86b58]/30 h-full select-none ${isFocused ? 'flex items-center justify-center text-5xl p-20' : ''}`}>
            {content}
          </div>
        );
      case ContentType.IMAGE:
        const isString = typeof content === 'string';
        return (
          <div className={`${isFocused ? 'h-full flex items-center justify-center p-12 bg-[#1a1a1a]' : 'bg-white p-3 pb-8 h-full select-none flex flex-col'}`}>
            <div className={`overflow-hidden flex-1 relative ${isFocused ? 'w-full h-full' : 'bg-gray-100 mb-2 filter sepia-[0.3]'}`}>
               {isString ? (
                 <img 
                    src={content as string} 
                    alt="Memory" 
                    className={`w-full h-full ${isFocused ? 'object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'object-cover pointer-events-none'}`} 
                 />
               ) : (
                 <div className="w-full h-full pointer-events-none">{content}</div>
               )}
            </div>
            {!isFocused && data.title && (
              <div className="font-caveat text-center text-xl text-gray-600 mt-1">
                {data.title}
              </div>
            )}
             {isFocused && data.title && (
              <div className="absolute bottom-12 left-0 right-0 text-center text-white/50 font-inter text-xs tracking-[0.3em] uppercase">
                {data.title}
              </div>
            )}
          </div>
        );
      case ContentType.TEXT:
        return (
          <div className={`${color} p-8 font-inter text-sm text-gray-700 leading-relaxed border border-stone-200/50 h-full select-none overflow-y-auto custom-scrollbar ${isFocused ? 'max-w-4xl mx-auto p-12 text-lg' : ''}`}>
             {data.title && <h3 className="font-bold text-[#e86b58] uppercase tracking-widest text-xs mb-4">{data.title}</h3>}
            {content}
          </div>
        );
      case ContentType.AUDIO:
        return (
            <div className={`${color} p-4 rounded-full flex items-center gap-4 shadow-lg border border-stone-100 select-none ${isFocused ? 'scale-150 justify-center' : ''}`}>
                 {content}
            </div>
        );
      case ContentType.WIDGET:
        return (
            <div className={`${isFocused ? '' : color} ${isFocused ? 'w-full h-full' : `${noPadding ? 'p-0' : 'p-4'} shadow-sm border border-stone-200/40 h-full select-none rounded-md overflow-hidden`}`}>
                {/* Clone the element to pass isFocused prop */}
                {React.isValidElement(content) 
                    ? React.cloneElement(content as React.ReactElement<any>, { isFocused }) 
                    : content}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={outerClasses} 
      style={outerStyle}
      onMouseDown={(e) => onMouseDown(e, id)}
    >
      {/* Animation Layer */}
      <div className={innerClasses}>
        {/* Visual Layer */}
        <div 
            className={visualClasses}
            style={{ transform: getTransform() }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FloatingCard;