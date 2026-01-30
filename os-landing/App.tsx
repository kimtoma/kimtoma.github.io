import React, { useState, useEffect, useRef } from 'react';
import FloatingCard from './components/FloatingCard';
import GrainOverlay from './components/GrainOverlay';
import Dock from './components/Dock';
import MusicWidget from './components/MusicWidget';
import ClockWidget from './components/ClockWidget';
import BlogListWidget from './components/BlogListWidget';
import ChatWidget from './components/ChatWidget';
import AboutWidget from './components/AboutWidget';
import WhiteboardWidget from './components/WhiteboardWidget';
import AboutView from './components/AboutView';
import BlogView from './components/BlogView';
import ProjectsView from './components/ProjectsView';
import ExperimentsView from './components/ExperimentsView';
import { CardData, ContentType, ViewType } from './types';

// HOME VIEW DATA
const initialCardsData: CardData[] = [
  {
    id: 'clock-widget',
    type: ContentType.WIDGET,
    content: <ClockWidget />,
    x: -300,
    y: -220,
    z: 80,
    rotation: 0,
    width: 'w-56',
    height: 'h-56',
    color: 'bg-transparent',
    delay: 'animate-float'
  },
  {
    id: 'welcome-note',
    type: ContentType.WIDGET,
    content: <AboutWidget />,
    x: 0,
    y: -50,
    z: 100,
    rotation: -2,
    width: 'w-80',
    color: 'bg-[#ffefe5]', 
    delay: 'animate-float'
  },
  {
    id: 'blog-list',
    type: ContentType.WIDGET,
    title: 'BLOG.LOG',
    content: <BlogListWidget />,
    x: -380,
    y: 120,
    z: 40,
    rotation: 2,
    width: 'w-80',
    height: 'h-72',
    color: 'bg-[#f4f7f6]',
    delay: 'animate-float-slow'
  },
  {
    id: 'chat-widget',
    type: ContentType.WIDGET,
    content: <ChatWidget />,
    x: 350,
    y: -180,
    z: 60,
    rotation: -3,
    width: 'w-56',
    height: 'h-56',
    color: 'bg-gradient-to-br from-[#fff8f5] to-[#ffefe5]',
    delay: 'animate-float-delayed'
  },
  {
    id: 'music-player',
    type: ContentType.WIDGET,
    content: <MusicWidget />,
    x: 250,
    y: 180,
    z: 150,
    rotation: -3,
    width: 'w-80',
    height: 'h-32', 
    color: 'bg-[#f8f8f8]',
    delay: 'animate-float'
  },
  {
    id: 'whiteboard',
    type: ContentType.WIDGET,
    content: <WhiteboardWidget />,
    x: -100,
    y: 250,
    z: 60,
    rotation: 1,
    width: 'w-[26rem]', // Increased width for better tool access
    height: 'h-72',      // Increased height for drawing space
    color: 'bg-[#fffdf9]',
    delay: 'animate-float-delayed'
  },
  {
      id: 'infinite-loop',
      type: ContentType.WIDGET,
      content: (
          <div className="flex flex-col items-center justify-center py-6 px-2 w-full h-full">
              {/* Define animation for 3D rotation */}
              <style>{`
                @keyframes spin-3d-visible {
                  0% { transform: rotateZ(0deg) rotateX(15deg) rotateY(15deg); }
                  50% { transform: rotateZ(180deg) rotateX(-15deg) rotateY(-15deg); }
                  100% { transform: rotateZ(360deg) rotateX(15deg) rotateY(15deg); }
                }
              `}</style>
              <div className="text-[#e86b58] mb-5" style={{ perspective: '800px' }}>
                   {/* Hollow Triangle SVG */}
                   <svg 
                    width="60" 
                    height="60" 
                    viewBox="0 0 100 100" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                    style={{ animation: 'spin-3d-visible 12s linear infinite', transformStyle: 'preserve-3d' }}
                   >
                      <polygon points="50,15 90,85 10,85" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                   </svg>
              </div>
              <div className="font-cutive text-[10px] uppercase tracking-[0.2em] text-[#e86b58]/80 text-center leading-relaxed">
                  KIMTOMA<br/>O/S V1
              </div>
          </div>
      ),
      x: 380,
      y: 100,
      z: -100,
      rotation: 0,
      width: 'w-48',
      color: 'bg-[#e86b58]/10',
      delay: 'animate-float'
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cards, setCards] = useState<CardData[]>(initialCardsData);
  
  // Focus State
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null); // For Home Widgets
  const [viewFocusMode, setViewFocusMode] = useState(false); // For Sub-views (Projects, Blog, etc.)

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Desktop Drag State
  const [dragState, setDragState] = useState<{
    id: string | null;
    startX: number;
    startY: number;
    initialCardX: number;
    initialCardY: number;
    hasMoved: boolean;
  }>({ id: null, startX: 0, startY: 0, initialCardX: 0, initialCardY: 0, hasMoved: false });

  // Mobile Drag (Reorder) State
  const [mobileDragId, setMobileDragId] = useState<string | null>(null);
  const [mobileDragY, setMobileDragY] = useState(0); 
  const mobileLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileTouchStartY = useRef<number>(0);

  // Combined Focus State helper
  const isAnyFocused = !!focusedCardId || viewFocusMode;

  const handleCloseFocus = () => {
    setFocusedCardId(null);
    setViewFocusMode(false);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isAnyFocused) {
            handleCloseFocus();
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAnyFocused]);

  // Desktop Global Drag Events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.id || isMobile || currentView !== ViewType.HOME) return;

      let clientX, clientY;
      if (e instanceof MouseEvent) {
          clientX = e.clientX;
          clientY = e.clientY;
      } else {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      }

      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;

      // Only consider it a drag if moved more than threshold
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          setDragState(prev => ({ ...prev, hasMoved: true }));
      }

      setCards(prev => prev.map(card => {
        if (card.id === dragState.id) {
          return {
            ...card,
            x: dragState.initialCardX + deltaX,
            y: dragState.initialCardY + deltaY
          };
        }
        return card;
      }));
    };

    const handleGlobalMouseUp = () => {
      if (dragState.id) {
         if (!isMobile) {
             setCards(prev => prev.map(card => {
                if (card.id === dragState.id) {
                   return {
                      ...card,
                      x: Math.round(card.x / 20) * 20,
                      y: Math.round(card.y / 20) * 20
                   };
                }
                return card;
             }));
         }
         
         // If we didn't move significantly, treat it as a click and focus
         if (!dragState.hasMoved) {
             setFocusedCardId(dragState.id);
         }
      }
      setDragState({ id: null, startX: 0, startY: 0, initialCardX: 0, initialCardY: 0, hasMoved: false });
    };

    if (dragState.id) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchmove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [dragState, isMobile, currentView]);

  const handleCardMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (focusedCardId) return; // Prevent dragging background cards when one is focused
    if (isMobile || currentView !== ViewType.HOME) return; 
    
    // Check if clicking interactive elements inside card
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.tagName === 'INPUT') {
        return;
    }
    if (target.tagName === 'CANVAS') return; // Whiteboard handling
    
    e.stopPropagation();

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const card = cards.find(c => c.id === id);
    if (!card) return;

    const maxZ = Math.max(...cards.map(c => c.z));
    setCards(prev => prev.map(c => c.id === id ? { ...c, z: maxZ + 10 } : c));

    setDragState({
      id,
      startX: clientX,
      startY: clientY,
      initialCardX: card.x,
      initialCardY: card.y,
      hasMoved: false
    });
  };

  const handleMobileTouchStart = (e: React.TouchEvent, id: string) => {
      if (focusedCardId) return;
      if (!isMobile || currentView !== ViewType.HOME) return;
      const touchY = e.touches[0].clientY;
      mobileTouchStartY.current = touchY;

      mobileLongPressTimer.current = setTimeout(() => {
          setMobileDragId(id);
          setMobileDragY(touchY);
          if (navigator.vibrate) navigator.vibrate(50);
      }, 500);
  };

  const handleMobileTouchMove = (e: React.TouchEvent) => {
      if (focusedCardId) return;
      if (!isMobile || currentView !== ViewType.HOME) return;
      const touchY = e.touches[0].clientY;
      if (!mobileDragId && Math.abs(touchY - mobileTouchStartY.current) > 10) {
          if (mobileLongPressTimer.current) {
              clearTimeout(mobileLongPressTimer.current);
              mobileLongPressTimer.current = null;
          }
          return;
      }
      if (mobileDragId) {
          if (e.cancelable) e.preventDefault();
          setMobileDragY(touchY);
      }
  };

  const handleMobileTouchEnd = (id: string) => {
      if (mobileLongPressTimer.current) {
          clearTimeout(mobileLongPressTimer.current);
          mobileLongPressTimer.current = null;
          if (!mobileDragId) {
              setFocusedCardId(id);
          }
      }
      setMobileDragId(null);
  };

  const renderContent = () => {
      switch (currentView) {
          case ViewType.ABOUT:
              return <AboutView />;
          case ViewType.BLOG:
              return <BlogView isFocused={viewFocusMode} onFocusChange={setViewFocusMode} />;
          case ViewType.PROJECTS:
              return <ProjectsView isFocused={viewFocusMode} onFocusChange={setViewFocusMode} />;
          case ViewType.EXPERIMENTS:
              return <ExperimentsView isFocused={viewFocusMode} onFocusChange={setViewFocusMode} />;
          case ViewType.HOME:
          default:
              return (
                  <div 
                    ref={containerRef}
                    className={`absolute inset-0 ${isMobile && !focusedCardId ? 'flex flex-col items-center pt-12 pb-40 overflow-y-auto' : 'flex items-center justify-center preserve-3d'}`}
                    style={(!isMobile && !focusedCardId) ? { perspective: '2000px' } : undefined}
                    onTouchMove={isMobile ? handleMobileTouchMove : undefined}
                  >
                    {!isMobile ? (
                        <div 
                            className="relative w-full h-full preserve-3d transition-transform duration-500 ease-out"
                            style={{
                                transform: focusedCardId 
                                    ? 'none' 
                                    : `rotateX(${-mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg) translateX(${mousePos.x * -20}px) translateY(${mousePos.y * -20}px)`
                            }}
                        >
                            {cards.map((card) => {
                                const isFocused = focusedCardId === card.id;
                                if (focusedCardId && !isFocused) return null;

                                return (
                                    <FloatingCard 
                                        key={card.id} 
                                        data={card} 
                                        active={dragState.id === card.id}
                                        onMouseDown={handleCardMouseDown}
                                        isFocused={isFocused}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        focusedCardId ? (
                            <div className="fixed inset-0 z-[9999] bg-[#d9bba9]">
                                {cards.filter(c => c.id === focusedCardId).map(card => (
                                     <FloatingCard 
                                        key={card.id}
                                        data={{...card, x: 0, y: 0, rotation: 0, z: 0, width: 'w-full'}} 
                                        active={false}
                                        onMouseDown={() => {}}
                                        isMobile={true}
                                        isFocused={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 w-full max-w-md px-4 scale-[0.85] origin-top">
                                {cards.map((card) => (
                                    <div 
                                        key={card.id} 
                                        className={`w-full transition-opacity duration-200 ${mobileDragId === card.id ? 'opacity-0' : 'opacity-100'}`}
                                        data-card-id={card.id}
                                        onTouchStart={(e) => handleMobileTouchStart(e, card.id)}
                                        onTouchEnd={() => handleMobileTouchEnd(card.id)}
                                    >
                                        <FloatingCard 
                                            data={{...card, x: 0, y: 0, rotation: 0, z: 0, width: 'w-full'}} 
                                            active={false}
                                            onMouseDown={() => {}}
                                            isMobile={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                  </div>
              );
      }
  };

  const activeMobileCard = isMobile && mobileDragId ? cards.find(c => c.id === mobileDragId) : null;

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#d9bba9] via-[#e5c6b3] to-[#d4b49e] ${isMobile && currentView === ViewType.HOME && !focusedCardId ? 'overflow-y-auto' : ''}`}>
      <GrainOverlay />
      
      <Dock 
        currentView={currentView} 
        onNavigate={(view) => {
            setCurrentView(view);
            handleCloseFocus(); // Reset focus when changing tabs
        }} 
        isFocusMode={isAnyFocused}
        onClose={handleCloseFocus}
      />

      {/* Main Container */}
      <div className="absolute inset-0 z-0">
         {renderContent()}
      </div>
      
      {/* Mobile Drag Overlay */}
      {activeMobileCard && (
          <div 
              className="fixed left-0 right-0 z-[9999] px-4 pointer-events-none w-full max-w-md mx-auto scale-[0.9]"
              style={{ top: mobileDragY - 100 }} 
          >
              <FloatingCard 
                data={{...activeMobileCard, x: 0, y: 0, rotation: 5, z: 0, width: 'w-full'}}
                active={true}
                onMouseDown={() => {}}
                isMobile={true}
              />
          </div>
      )}
        
      {/* Background Decorative Elements */}
      {currentView === ViewType.HOME && !isAnyFocused && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#e86b58] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#5fa8aa] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse delay-1000 pointer-events-none"></div>
          </>
      )}

      {/* Foreground Label */}
      <div className="fixed bottom-8 right-8 font-inter text-[#e86b58] text-xs tracking-[0.2em] opacity-80 z-50 pointer-events-none hidden md:block">
        KIMTOMA.COM // {currentView} {isAnyFocused ? '/ FOCUS' : ''}
      </div>
    </div>
  );
};

export default App;