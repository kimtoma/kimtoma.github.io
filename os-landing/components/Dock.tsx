import React, { useState, useEffect } from 'react';
import { Home, FileText, User, FlaskConical, FolderGit2, X } from 'lucide-react';
import { ViewType } from '../types';

interface DockProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isFocusMode?: boolean;
  onClose?: () => void;
}

const Dock: React.FC<DockProps> = ({ currentView, onNavigate, isFocusMode = false, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [renderedFocusMode, setRenderedFocusMode] = useState(isFocusMode);

  // Handle the transition animation between modes
  useEffect(() => {
    if (isFocusMode !== renderedFocusMode) {
      // 1. Slide out
      setIsVisible(false);

      // 2. Wait for animation to finish, then swap content and slide in
      const timer = setTimeout(() => {
        setRenderedFocusMode(isFocusMode);
        setIsVisible(true);
      }, 400); // Matches the CSS duration

      return () => clearTimeout(timer);
    }
  }, [isFocusMode, renderedFocusMode]);

  const baseIconClass = "transition-all duration-300 cursor-pointer hover:scale-125";
  const size = 20;

  const getIconClass = (view: ViewType) => {
    return `${baseIconClass} ${currentView === view ? 'text-[#e86b58] scale-110 drop-shadow-[0_0_8px_rgba(232,107,88,0.5)]' : 'text-gray-500 hover:text-[#e86b58]'}`;
  };

  // Responsive Positioning & Animation Logic
  // Mobile: Bottom Center. Slide Down (translate-y) to hide.
  // Desktop: Left Center. Slide Left (translate-x) to hide.
  
  const mobileClasses = `bottom-8 left-1/2 -translate-x-1/2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`;
  
  // Override for Desktop (md: breakpoint)
  // We must explicitly override the mobile transforms (translate-x/y) to ensure correct positioning.
  const desktopClasses = `md:left-8 md:top-1/2 md:bottom-auto md:right-auto ${isVisible ? 'md:translate-x-0 md:-translate-y-1/2' : 'md:-translate-x-[200%] md:-translate-y-1/2'}`;

  const containerClasses = `fixed z-[10000] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${mobileClasses} ${desktopClasses}`;

  return (
    <div className={containerClasses}>
      {renderedFocusMode ? (
        /* CLOSE BUTTON MODE */
        <div className="flex items-center justify-center p-4 bg-[#e8f1f2]/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 transition-all duration-300 hover:scale-110">
           <div 
              onClick={onClose} 
              className="cursor-pointer text-gray-500 hover:text-[#e86b58] transition-colors hover:rotate-90 duration-300"
              title="Close View (ESC)"
           >
              <X size={24} />
           </div>
        </div>
      ) : (
        /* DOCK MODE */
        <div className="flex flex-row md:flex-col gap-6 md:gap-8 py-4 px-6 md:py-8 md:px-3 bg-[#e8f1f2]/80 backdrop-blur-md rounded-2xl md:rounded-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.05)] border border-white/50 w-max transition-all duration-300">
          <div className="hidden md:block w-1 h-12 bg-gradient-to-b from-[#e86b58] to-transparent mx-auto rounded-full opacity-50 mb-2"></div>
          
          <div onClick={() => onNavigate(ViewType.HOME)} title="Home">
            <Home size={size} className={getIconClass(ViewType.HOME)} />
          </div>

          <div onClick={() => onNavigate(ViewType.ABOUT)} title="About Me">
            <User size={size} className={getIconClass(ViewType.ABOUT)} />
          </div>

          <div onClick={() => onNavigate(ViewType.BLOG)} title="Archive / Blog">
            <FileText size={size} className={getIconClass(ViewType.BLOG)} />
          </div>

          <div onClick={() => onNavigate(ViewType.PROJECTS)} title="Projects">
            <FolderGit2 size={size} className={getIconClass(ViewType.PROJECTS)} />
          </div>
          
          <div className="hidden md:block h-px w-full bg-gray-300 my-2"></div>
          
          <div onClick={() => onNavigate(ViewType.EXPERIMENTS)} title="Experiments">
            <FlaskConical size={size} className={getIconClass(ViewType.EXPERIMENTS)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dock;