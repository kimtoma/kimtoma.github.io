import React, { useRef, useState, useEffect } from 'react';
import { Trash2, PenLine, Undo, Redo, Download, Save } from 'lucide-react';

interface WhiteboardWidgetProps {
    isFocused?: boolean;
}

const COLORS = ['#3e3e3e', '#e86b58', '#5fa8aa', '#f0c419', '#8e44ad'];
const SIZES = [2, 4, 8, 12];

const WhiteboardWidget: React.FC<WhiteboardWidgetProps> = ({ isFocused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  
  // Tool State
  const [currentColor, setCurrentColor] = useState('#3e3e3e');
  const [currentSize, setCurrentSize] = useState(2);

  // History State
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays for crisp lines
    const updateCanvasSize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Save current content if we are resizing
        let savedData: ImageData | null = null;
        if (context && historyStep >= 0 && history[historyStep]) {
            savedData = history[historyStep];
        }

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = currentSize;
          setContext(ctx);

          // Attempt to restore previous drawing (top-left aligned)
          if (savedData) {
              ctx.putImageData(savedData, 0, 0);
          } else if (history.length === 0) {
              // Save initial blank state
              const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              setHistory([initialData]);
              setHistoryStep(0);
          }
        }
    };

    updateCanvasSize();
    
    // If focused changes, we need to resize after transition
    const timeout = setTimeout(updateCanvasSize, 550);
    return () => clearTimeout(timeout);
  }, [isFocused]);

  // Update context when tools change
  useEffect(() => {
      if (context) {
          context.strokeStyle = currentColor;
          context.lineWidth = currentSize;
      }
  }, [currentColor, currentSize, context]);

  const saveToHistory = () => {
      if (!canvasRef.current || !context) return;
      
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // If we undid and then drew new stuff, cut off the future
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(imageData);
      
      // Optional: limit history size
      if (newHistory.length > 20) {
          newHistory.shift();
      }
      
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
      if (historyStep > 0 && context) {
          const newStep = historyStep - 1;
          const imageData = history[newStep];
          context.putImageData(imageData, 0, 0);
          setHistoryStep(newStep);
      }
  };

  const handleRedo = () => {
      if (historyStep < history.length - 1 && context) {
          const newStep = historyStep + 1;
          const imageData = history[newStep];
          context.putImageData(imageData, 0, 0);
          setHistoryStep(newStep);
      }
  };

  const handleSave = () => {
      if (!canvasRef.current) return;
      const link = document.createElement('a');
      link.download = `kimtoma-sketch-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
  };

  const handleClear = () => {
      if (!canvasRef.current || !context) return;
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory();
  };

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.stopPropagation();
    
    if (!context) return;
    const { x, y } = getCoordinates(e);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    if ('touches' in e) e.stopPropagation();
    
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context || !isDrawing) return;
    context.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  return (
    <div className={`w-full h-full flex flex-col bg-[#fffdf9] relative group overflow-hidden ${isFocused ? 'items-center' : ''}`}>
      {/* Toolbar - Now Visible in Widget Mode too, with responsive styling */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 z-20 flex items-center bg-white/90 backdrop-blur shadow-[0_5px_20px_rgba(0,0,0,0.1)] rounded-full border border-gray-200 transition-all hover:scale-105 max-w-[95%] overflow-x-auto
        ${isFocused 
            ? 'bottom-28 md:bottom-8 gap-4 md:gap-6 px-6 md:px-8 py-3 md:py-4' 
            : 'bottom-3 gap-2 px-3 py-1.5 scale-90 origin-bottom'
        }`}
      >
          
          {/* Colors */}
          <div className={`flex items-center border-r border-gray-200 shrink-0 ${isFocused ? 'gap-2 md:gap-3 pr-4 md:pr-6' : 'gap-1.5 pr-3'}`}>
              {COLORS.map(c => (
                  <button 
                    key={c}
                    className={`rounded-full border border-gray-100 transition-transform ${currentColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : 'hover:scale-110'} ${isFocused ? 'w-5 h-5 md:w-6 md:h-6' : 'w-4 h-4'}`}
                    style={{ backgroundColor: c }}
                    onClick={(e) => { e.stopPropagation(); setCurrentColor(c); }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
              ))}
          </div>

          {/* Sizes */}
          <div className={`flex items-center border-r border-gray-200 shrink-0 ${isFocused ? 'gap-2 md:gap-3 pr-4 md:pr-6' : 'gap-1.5 pr-3'}`}>
              {SIZES.map(s => (
                  <button 
                    key={s}
                    className={`bg-gray-800 rounded-full transition-all ${currentSize === s ? 'bg-[#e86b58]' : 'bg-gray-300 hover:bg-gray-400'}`}
                    style={{ width: isFocused ? s * 1.5 : s * 1.2, height: isFocused ? s * 1.5 : s * 1.2 }}
                    onClick={(e) => { e.stopPropagation(); setCurrentSize(s); }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
              ))}
          </div>

          {/* Actions */}
          <div className={`flex items-center shrink-0 text-gray-500 ${isFocused ? 'gap-2 md:gap-4' : 'gap-2'}`}>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUndo(); }} 
                onMouseDown={(e) => e.stopPropagation()}
                disabled={historyStep <= 0}
                className={`hover:text-[#e86b58] transition-colors p-1 ${historyStep <= 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                title="Undo"
              >
                  <Undo size={isFocused ? 18 : 14} className={isFocused ? "md:w-5 md:h-5" : ""} />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleRedo(); }} 
                onMouseDown={(e) => e.stopPropagation()}
                disabled={historyStep >= history.length - 1}
                className={`hover:text-[#e86b58] transition-colors p-1 ${historyStep >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                title="Redo"
              >
                  <Redo size={isFocused ? 18 : 14} className={isFocused ? "md:w-5 md:h-5" : ""} />
              </button>
              
              <div className="w-px h-4 bg-gray-200 mx-0.5"></div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleClear(); }} 
                onMouseDown={(e) => e.stopPropagation()}
                className="hover:text-red-500 transition-colors p-1" 
                title="Clear Canvas"
              >
                  <Trash2 size={isFocused ? 18 : 14} className={isFocused ? "md:w-5 md:h-5" : ""} />
              </button>
              
              {/* Only show Save button when focused to save space in widget mode */}
              {isFocused && (
                  <button onClick={handleSave} className="hover:text-[#e86b58] transition-colors p-1" title="Save to Disk">
                      <Download size={18} className="md:w-5 md:h-5" />
                  </button>
              )}
          </div>
      </div>

      {/* Paper Header (Small Widget Only) */}
      {!isFocused && (
        <div className="absolute top-0 left-0 w-full h-6 bg-[#f0eee9] border-b border-[#e5e0d8] flex items-center px-2 justify-between z-10">
            <div className="flex items-center gap-1.5 opacity-60">
                <PenLine size={10} className="text-gray-600" />
                <span className="font-cutive text-[9px] text-gray-500 tracking-widest">CANVAS</span>
            </div>
            {/* Clear button is now in the bottom toolbar for consistency, removed from header */}
        </div>
      )}

      {/* Drawing Area */}
      <div className={`flex-1 relative cursor-crosshair ${isFocused ? 'w-full h-full' : ''}`}>
         <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }} 
         />
      </div>

      {/* Bottom decorative lines */}
      {!isFocused && (
        <div className="absolute bottom-1 right-2 text-[8px] font-handwriting text-gray-300 pointer-events-none select-none -rotate-2 font-caveat opacity-50 z-10">
            Sketch
        </div>
      )}
    </div>
  );
};

export default WhiteboardWidget;