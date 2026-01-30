import React, { useState, useEffect } from 'react';
import { Home, FileText, User, FlaskConical, FolderGit2, X, Sun, Moon } from 'lucide-react';
import { ViewType } from '../types';

interface DockProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isFocusMode?: boolean;
  onClose?: () => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

const Dock: React.FC<DockProps> = ({ currentView, onNavigate, isFocusMode = false, onClose, isDark = false, onThemeToggle }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [renderedFocusMode, setRenderedFocusMode] = useState(isFocusMode);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const baseIconClass = "transition-all duration-300 cursor-pointer";
  const size = 20;

  const getIconClass = (view: ViewType) => {
    const isActive = currentView === view;
    return `${baseIconClass} ${isActive ? 'text-[#e86b58] scale-110' : isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`;
  };

  // Responsive Positioning & Animation Logic
  // Mobile: Bottom Center. Slide Down (translate-y) to hide.
  // Desktop: Left Center. Slide Left (translate-x) to hide.
  
  const mobileClasses = `bottom-8 left-1/2 -translate-x-1/2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`;
  
  // Override for Desktop (md: breakpoint)
  // We must explicitly override the mobile transforms (translate-x/y) to ensure correct positioning.
  const desktopClasses = `md:left-8 md:top-1/2 md:bottom-auto md:right-auto ${isVisible ? 'md:translate-x-0 md:-translate-y-1/2' : 'md:-translate-x-[200%] md:-translate-y-1/2'}`;

  const containerClasses = `fixed z-[10000] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${mobileClasses} ${desktopClasses}`;

  // Liquid glass styles
  const glassStyle = {
    background: isDark
      ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: isDark
      ? '1px solid rgba(255,255,255,0.1)'
      : '1px solid rgba(255,255,255,0.6)',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
      : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
  };

  const NavItem = ({ view, icon: Icon, title }: { view: ViewType; icon: React.ElementType; title: string }) => {
    const isActive = currentView === view;
    const isHovered = hoveredItem === view;

    return (
      <div
        onClick={() => onNavigate(view)}
        onMouseEnter={() => setHoveredItem(view)}
        onMouseLeave={() => setHoveredItem(null)}
        title={title}
        className="relative p-2 rounded-xl cursor-pointer transition-all duration-300"
        style={{
          background: isActive
            ? 'rgba(232,107,88,0.15)'
            : isHovered
              ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              : 'transparent',
          transform: isHovered && !isActive ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <Icon
          size={size}
          className={`transition-all duration-300 ${
            isActive
              ? 'text-[#e86b58]'
              : isDark
                ? 'text-white/70'
                : 'text-gray-600'
          }`}
          style={{
            filter: isActive ? 'drop-shadow(0 0 8px rgba(232,107,88,0.5))' : 'none',
          }}
        />
        {isActive && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e86b58]"
            style={{ boxShadow: '0 0 6px rgba(232,107,88,0.8)' }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {renderedFocusMode ? (
        /* CLOSE BUTTON MODE */
        <div
          className="flex items-center justify-center p-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
          style={glassStyle}
          onClick={onClose}
          title="Close View (ESC)"
        >
          <X
            size={22}
            className={`transition-all duration-300 hover:rotate-90 ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          />
        </div>
      ) : (
        /* DOCK MODE */
        <div
          className="flex flex-row md:flex-col gap-1 md:gap-2 p-2 md:p-3 rounded-2xl transition-all duration-300"
          style={glassStyle}
        >
          <NavItem view={ViewType.HOME} icon={Home} title="Home" />
          <NavItem view={ViewType.ABOUT} icon={User} title="About Me" />
          <NavItem view={ViewType.BLOG} icon={FileText} title="Archive / Blog" />
          <NavItem view={ViewType.PROJECTS} icon={FolderGit2} title="Projects" />
          <NavItem view={ViewType.EXPERIMENTS} icon={FlaskConical} title="Experiments" />

          {onThemeToggle && (
            <>
              <div
                className="hidden md:block h-px w-full my-1"
                style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
              />
              <div
                onClick={onThemeToggle}
                onMouseEnter={() => setHoveredItem('theme')}
                onMouseLeave={() => setHoveredItem(null)}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl cursor-pointer transition-all duration-300"
                style={{
                  background: hoveredItem === 'theme'
                    ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    : 'transparent',
                  transform: hoveredItem === 'theme' ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {isDark ? (
                  <Sun size={size} className="text-amber-400 transition-all duration-300" />
                ) : (
                  <Moon size={size} className="text-gray-600 transition-all duration-300" />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dock;