import React, { useState, useEffect, useRef, useMemo } from 'react';
import FloatingCard from './components/FloatingCard';
import Dock from './components/Dock';
import MusicWidget from './components/MusicWidget';
import ClockWidget from './components/ClockWidget';
import BlogListWidget from './components/BlogListWidget';
import AboutWidget from './components/AboutWidget';
import WhiteboardWidget from './components/WhiteboardWidget';
import AboutView from './components/AboutView';
import BlogView from './components/BlogView';
import ProjectsView from './components/ProjectsView';
import ExperimentsView from './components/ExperimentsView';
import { CardData, ContentType, ViewType } from './types';

// Random position generator
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomRotation = () => randomInRange(-3, 3);
const delays = ['animate-float', 'animate-float-delayed', 'animate-float-slow'];
const randomDelay = () => delays[Math.floor(Math.random() * delays.length)];

// Parse Tailwind width/height classes to approximate pixel values
const parseSize = (sizeClass?: string): number => {
  if (!sizeClass) return 200;
  const match = sizeClass.match(/[wh]-(\d+)/);
  if (match) return parseInt(match[1]) * 4; // Tailwind uses 4px units
  if (sizeClass.includes('[')) {
    const remMatch = sizeClass.match(/\[(\d+)rem\]/);
    if (remMatch) return parseInt(remMatch[1]) * 16;
  }
  return 200;
};

// Check if two rectangles overlap with padding
const checkOverlap = (
  card1: { x: number; y: number; w: number; h: number },
  card2: { x: number; y: number; w: number; h: number },
  padding: number = 30
): boolean => {
  return !(
    card1.x + card1.w / 2 + padding < card2.x - card2.w / 2 ||
    card1.x - card1.w / 2 - padding > card2.x + card2.w / 2 ||
    card1.y + card1.h / 2 + padding < card2.y - card2.h / 2 ||
    card1.y - card1.h / 2 - padding > card2.y + card2.h / 2
  );
};

// Mobile widget order
const mobileOrder = [
  'clock-widget',
  'welcome-note',
  'blog-list',
  'whiteboard',
  'music-player',
  'infinite-loop',
];

// Card templates factory - creates templates based on dark mode
const createCardTemplates = (isDark: boolean) => [
  {
    id: 'clock-widget',
    type: ContentType.WIDGET,
    content: <ClockWidget isDark={isDark} />,
    width: 'w-56',
    height: 'h-56',
    color: 'bg-transparent',
    baseZ: 80,
  },
  {
    id: 'welcome-note',
    type: ContentType.WIDGET,
    content: <AboutWidget isDark={isDark} />,
    width: 'w-80',
    color: isDark ? 'bg-[#2a2420]' : 'bg-[#ffefe5]',
    baseZ: 100,
  },
  {
    id: 'blog-list',
    type: ContentType.WIDGET,
    title: 'BLOG.LOG',
    content: <BlogListWidget isDark={isDark} />,
    width: 'w-80',
    height: 'h-72',
    color: isDark ? 'bg-[#1f1c1a]' : 'bg-[#f4f7f6]',
    baseZ: 40,
  },
  {
    id: 'music-player',
    type: ContentType.WIDGET,
    content: <MusicWidget isDark={isDark} />,
    width: 'w-80',
    height: 'h-32',
    color: isDark ? 'bg-[#2a2420]' : 'bg-[#f8f8f8]',
    baseZ: 150,
  },
  {
    id: 'whiteboard',
    type: ContentType.WIDGET,
    content: <WhiteboardWidget isDark={isDark} />,
    width: 'w-[26rem]',
    height: 'h-72',
    color: isDark ? 'bg-[#2a2420]' : 'bg-[#fffdf9]',
    baseZ: 60,
  },
  {
    id: 'infinite-loop',
    type: ContentType.WIDGET,
    content: (
      <div className="flex flex-col items-center justify-center py-6 px-2 w-full h-full">
        <style>{`
          @keyframes spin-3d-visible {
            0% { transform: rotateZ(0deg) rotateX(15deg) rotateY(15deg); }
            50% { transform: rotateZ(180deg) rotateX(-15deg) rotateY(-15deg); }
            100% { transform: rotateZ(360deg) rotateX(15deg) rotateY(15deg); }
          }
        `}</style>
        <div className="text-[#e86b58] mb-5" style={{ perspective: '800px' }}>
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
    width: 'w-48',
    color: isDark ? 'bg-[#e86b58]/20' : 'bg-[#e86b58]/10',
    baseZ: -100,
  },
];

// Card position data (generated once, without content)
interface CardPosition {
  id: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  delay: string;
}

// Generate randomized card positions with collision avoidance
const generateCardPositions = (templates: ReturnType<typeof createCardTemplates>): CardPosition[] => {
  const placedCards: { x: number; y: number; w: number; h: number }[] = [];
  const results: CardPosition[] = [];

  // Sort templates by size (larger first) for better placement
  const sortedTemplates = [...templates].sort((a, b) => {
    const areaA = parseSize(a.width) * parseSize(a.height);
    const areaB = parseSize(b.width) * parseSize(b.height);
    return areaB - areaA;
  });

  // Spawn boundary (centered around 0,0)
  const bounds = { minX: -500, maxX: 500, minY: -300, maxY: 320 };

  for (const template of sortedTemplates) {
    const cardW = parseSize(template.width);
    const cardH = parseSize(template.height) || cardW * 0.8;

    let bestPosition = { x: 0, y: 0 };
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const testX = randomInRange(bounds.minX + cardW / 2, bounds.maxX - cardW / 2);
      const testY = randomInRange(bounds.minY + cardH / 2, bounds.maxY - cardH / 2);

      const testCard = { x: testX, y: testY, w: cardW, h: cardH };
      const hasOverlap = placedCards.some(existing => checkOverlap(testCard, existing, 40));

      if (!hasOverlap) {
        bestPosition = { x: testX, y: testY };
        break;
      }

      if (attempt === maxAttempts - 1) {
        bestPosition = { x: testX, y: testY };
      }
    }

    placedCards.push({ x: bestPosition.x, y: bestPosition.y, w: cardW, h: cardH });

    results.push({
      id: template.id,
      x: bestPosition.x,
      y: bestPosition.y,
      z: template.baseZ + randomInRange(-20, 20),
      rotation: randomRotation(),
      delay: randomDelay(),
    });
  }

  // Restore original order by id
  return templates.map(t => results.find(r => r.id === t.id)!);
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Generate random positions once on mount
  const [cardPositions, setCardPositions] = useState<CardPosition[]>(() =>
    generateCardPositions(createCardTemplates(false))
  );

  // Merge positions with current theme templates to create cards
  const cards = useMemo(() => {
    const templates = createCardTemplates(isDark);
    return cardPositions.map(pos => {
      const template = templates.find(t => t.id === pos.id);
      if (!template) return null;
      return {
        ...template,
        ...pos,
      } as CardData;
    }).filter(Boolean) as CardData[];
  }, [cardPositions, isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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

      setCardPositions(prev => prev.map(pos => {
        if (pos.id === dragState.id) {
          return {
            ...pos,
            x: dragState.initialCardX + deltaX,
            y: dragState.initialCardY + deltaY
          };
        }
        return pos;
      }));
    };

    const handleGlobalMouseUp = () => {
      if (dragState.id) {
         if (!isMobile) {
             setCardPositions(prev => prev.map(pos => {
                if (pos.id === dragState.id) {
                   return {
                      ...pos,
                      x: Math.round(pos.x / 20) * 20,
                      y: Math.round(pos.y / 20) * 20
                   };
                }
                return pos;
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
    setCardPositions(prev => prev.map(pos => pos.id === id ? { ...pos, z: maxZ + 10 } : pos));

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
              return <AboutView isDark={isDark} />;
          case ViewType.BLOG:
              return <BlogView isDark={isDark} isFocused={viewFocusMode} onFocusChange={setViewFocusMode} />;
          case ViewType.PROJECTS:
              return <ProjectsView isDark={isDark} isFocused={viewFocusMode} onFocusChange={setViewFocusMode} />;
          case ViewType.EXPERIMENTS:
              return <ExperimentsView isDark={isDark} isFocused={viewFocusMode} onFocusChange={setViewFocusMode} />;
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
                                        data={isFocused ? {...card, rotation: 0} : card}
                                        active={dragState.id === card.id}
                                        onMouseDown={handleCardMouseDown}
                                        isFocused={isFocused}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        focusedCardId ? (
                            <div
                              className="fixed inset-0 z-[9999] transition-colors duration-300"
                              style={{ backgroundColor: bgColors.from }}
                            >
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
                                {[...cards].sort((a, b) => mobileOrder.indexOf(a.id) - mobileOrder.indexOf(b.id)).map((card) => (
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

  // Calculate background colors based on theme
  const bgColors = isDark
    ? { from: 'hsl(25, 20%, 10%)', via: 'hsl(27, 15%, 12%)', to: 'hsl(25, 18%, 10%)' }
    : { from: 'hsl(25, 35%, 85%)', via: 'hsl(27, 42%, 80%)', to: 'hsl(25, 38%, 75%)' };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden transition-all duration-300 ${isMobile && currentView === ViewType.HOME && !focusedCardId ? 'overflow-y-auto' : ''}`}
      style={{
        background: `linear-gradient(to bottom right, ${bgColors.from}, ${bgColors.via}, ${bgColors.to})`
      }}
    >
      {/* Natural Light Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute w-[80vw] h-[80vw] rounded-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(232,107,88,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%)',
            top: '-20%',
            left: '-10%',
            animation: 'naturalLight1 20s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[60vw] h-[60vw] rounded-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(95,168,170,0.06) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,248,240,0.8) 0%, transparent 60%)',
            bottom: '-10%',
            right: '-20%',
            animation: 'naturalLight2 25s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[40vw] h-[40vw] rounded-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(232,107,88,0.04) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,220,200,0.4) 0%, transparent 60%)',
            top: '30%',
            right: '10%',
            animation: 'naturalLight3 18s ease-in-out infinite',
            filter: 'blur(50px)',
          }}
        />
        <style>{`
          @keyframes naturalLight1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(5vw, 3vh) scale(1.1); }
            50% { transform: translate(2vw, 8vh) scale(0.95); }
            75% { transform: translate(-3vw, 4vh) scale(1.05); }
          }
          @keyframes naturalLight2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-4vw, -5vh) scale(1.08); }
            66% { transform: translate(3vw, -2vh) scale(0.92); }
          }
          @keyframes naturalLight3 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
            50% { transform: translate(-5vw, 5vh) scale(1.15); opacity: 1; }
          }
        `}</style>
      </div>

      <Dock
        currentView={currentView}
        onNavigate={(view) => {
            setCurrentView(view);
            handleCloseFocus(); // Reset focus when changing tabs
        }}
        isFocusMode={isAnyFocused}
        onClose={handleCloseFocus}
        isDark={isDark}
        onThemeToggle={toggleTheme}
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
        

      {/* Foreground Label */}
      <div
        className="fixed bottom-8 right-8 font-inter text-xs tracking-[0.2em] z-50 pointer-events-none hidden md:block transition-all duration-300"
        style={{
          color: isDark ? 'rgba(232, 107, 88, 0.5)' : 'rgba(232, 107, 88, 0.9)'
        }}
      >
        KIMTOMA.COM // {currentView} {isAnyFocused ? '/ FOCUS' : ''}
      </div>
    </div>
  );
};

export default App;