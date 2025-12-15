import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Paintbrush, Eraser, Undo, Download, Maximize2 } from 'lucide-react';
import { ProcessingOptions, PcbLayerType } from '../types';
import { getPalette, findClosestLayer, getLayerColor, Rgb } from '../utils/colorUtils';
import { LayerPreview } from './LayerPreview';

interface PcbProcessorProps {
  imageFile: File | null;
  options: ProcessingOptions;
}

const BRUSH_SIZES = [2, 5, 10, 20, 40];

const LAYER_TOOLS = [
  { type: PcbLayerType.SILKSCREEN, name: '丝印', color: '#ffffff' },
  { type: PcbLayerType.PAD, name: '焊盘', color: '#bf9a39' },
  { type: PcbLayerType.LIGHT, name: '线路', color: '#266f36' }, // Approximate
  { type: PcbLayerType.DEEP, name: '阻焊', color: '#16612e' },
  { type: PcbLayerType.SUBSTRATE, name: '基材', color: '#a7a763' },
];

export const PcbProcessor: React.FC<PcbProcessorProps> = ({ imageFile, options }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [layerData, setLayerData] = useState<Int8Array | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Brush State
  const [brushLayer, setBrushLayer] = useState<PcbLayerType>(PcbLayerType.PAD);
  const [brushSize, setBrushSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas Refs
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const silkRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const copperRef = useRef<HTMLCanvasElement>(null);

  // 1. Analysis Effect: Runs when file or analysis options change (not brush)
  useEffect(() => {
    if (!imageFile) return;

    const analyzeImage = async () => {
      setIsProcessing(true);
      // Small delay for UI
      await new Promise(resolve => setTimeout(resolve, 50));

      const img = new Image();
      const objectUrl = URL.createObjectURL(imageFile);

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        setDimensions({ width, height });

        // Helper canvas to read pixels
        const helperCanvas = document.createElement('canvas');
        helperCanvas.width = width;
        helperCanvas.height = height;
        const ctx = helperCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const len = data.length;

        // Create Layer Map (Int8Array is sufficient for enums 0-4)
        const newLayerData = new Int8Array(width * height);
        const palette = getPalette(options.boardColorKey, options.finishKey);

        for (let i = 0, p = 0; i < len; i += 4, p++) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const currentPixel: Rgb = { r, g, b };
          
          newLayerData[p] = findClosestLayer(currentPixel, palette, options.sensitivity);
        }

        setLayerData(newLayerData);
        URL.revokeObjectURL(objectUrl);
        setIsProcessing(false);
      };

      img.src = objectUrl;
    };

    analyzeImage();
  }, [imageFile, options.boardColorKey, options.finishKey, options.sensitivity]);

  // 2. Render Effect: Runs when layerData changes (analysis finished or painted)
  useEffect(() => {
    if (!layerData || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const palette = getPalette(options.boardColorKey, options.finishKey);

    const render = () => {
      // Prepare contexts
      const ctxMain = mainCanvasRef.current?.getContext('2d');
      const ctxSilk = silkRef.current?.getContext('2d');
      const ctxMask = maskRef.current?.getContext('2d');
      const ctxCopper = copperRef.current?.getContext('2d');

      if (!ctxMain) return;

      // Ensure sizes
      [mainCanvasRef, silkRef, maskRef, copperRef].forEach(ref => {
        if (ref.current) {
          ref.current.width = width;
          ref.current.height = height;
        }
      });

      // Create buffers
      const mainImg = ctxMain.createImageData(width, height);
      const silkImg = ctxSilk?.createImageData(width, height);
      const maskImg = ctxMask?.createImageData(width, height);
      const copperImg = ctxCopper?.createImageData(width, height);

      for (let i = 0; i < layerData.length; i++) {
        const type = layerData[i] as PcbLayerType;
        const idx = i * 4;

        // Main Composite
        const color = getLayerColor(type, palette);
        mainImg.data[idx] = color.r;
        mainImg.data[idx + 1] = color.g;
        mainImg.data[idx + 2] = color.b;
        mainImg.data[idx + 3] = 255;

        // Silk
        if (silkImg) {
          const isSilk = type === PcbLayerType.SILKSCREEN;
          silkImg.data[idx] = 255;
          silkImg.data[idx+1] = 255;
          silkImg.data[idx+2] = 255;
          silkImg.data[idx+3] = isSilk ? 255 : 0;
        }

        // Mask (White = Opening)
        if (maskImg) {
          const isOpening = type === PcbLayerType.PAD || type === PcbLayerType.SUBSTRATE;
          maskImg.data[idx] = 255;
          maskImg.data[idx+1] = 255;
          maskImg.data[idx+2] = 255;
          maskImg.data[idx+3] = isOpening ? 255 : 0;
        }

        // Copper (White = Copper)
        if (copperImg) {
          const isCopper = type === PcbLayerType.PAD || type === PcbLayerType.LIGHT;
          copperImg.data[idx] = 255;
          copperImg.data[idx+1] = 255;
          copperImg.data[idx+2] = 255;
          copperImg.data[idx+3] = isCopper ? 255 : 0;
        }
      }

      ctxMain.putImageData(mainImg, 0, 0);
      if (ctxSilk && silkImg) ctxSilk.putImageData(silkImg, 0, 0);
      if (ctxMask && maskImg) ctxMask.putImageData(maskImg, 0, 0);
      if (ctxCopper && copperImg) ctxCopper.putImageData(copperImg, 0, 0);
    };

    render();
  }, [layerData, options.boardColorKey, options.finishKey, dimensions]);

  // Painting Logic
  const handlePaint = (e: React.PointerEvent) => {
    if (!layerData || !isDrawing || !mainCanvasRef.current) return;
    
    // Get mouse pos relative to canvas
    const rect = mainCanvasRef.current.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    // Simple circle brush
    const r = brushSize;
    const rSq = r * r;
    
    // Optimization: Only iterate bounding box of brush
    const minX = Math.max(0, x - r);
    const maxX = Math.min(dimensions.width - 1, x + r);
    const minY = Math.max(0, y - r);
    const maxY = Math.min(dimensions.height - 1, y + r);

    let changed = false;
    // Clone to avoid mutating state directly (though Int8Array is mutable, standard React pattern prefers copy)
    // For performance on large images, we might mutate and then force update, but let's try copy first or just mutate ref-like if we had one.
    // Given React strictness, let's copy. 
    // Optimization: For dragging, we might want to avoid full copy every frame.
    // For now, let's just mutate the existing array and trigger a re-render by creating a shallow copy or forcing update.
    // Actually, spreading a huge Int8Array is bad. 
    // Better: Mutate the array, then setLayerData(new Int8Array(layerData)) to trigger effect?
    // Or just call a render function directly?
    // The clean React way:
    const newData = new Int8Array(layerData); 

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const dx = cx - x;
        const dy = cy - y;
        if (dx*dx + dy*dy <= rSq) {
          const idx = cy * dimensions.width + cx;
          if (newData[idx] !== brushLayer) {
            newData[idx] = brushLayer;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      setLayerData(newData);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    mainCanvasRef.current?.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    handlePaint(e); // Paint initial dot
  };

  const handleDownloadMain = () => {
    if (mainCanvasRef.current) {
        const link = document.createElement('a');
        link.download = `pcb-composite.png`;
        link.href = mainCanvasRef.current.toDataURL();
        link.click();
    }
  };

  if (!imageFile) return null;

  return (
    <div className="w-full space-y-8">
      {/* Brush Toolbar */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white/70">
                <Paintbrush size={18} />
                <span className="text-sm font-bold">手动修整</span>
            </div>
            <div className="h-6 w-px bg-white/10 mx-2" />
            
            <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                {LAYER_TOOLS.map(tool => (
                    <button
                        key={tool.type}
                        onClick={() => setBrushLayer(tool.type)}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${brushLayer === tool.type 
                                ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/20' 
                                : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
                        `}
                    >
                        {tool.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
             <span className="text-xs text-white/50">大小</span>
             <input 
                type="range" 
                min="1" 
                max="50" 
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
             <div className="w-6 text-center text-xs text-white/70 bg-white/5 rounded px-1">{brushSize}</div>
        </div>
      </div>

      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Loader2 className="animate-spin mb-4 text-blue-400" size={48} />
          <p className="font-medium text-blue-200">正在进行层析与仿真计算...</p>
        </div>
      )}
      
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isProcessing ? 'opacity-0 hidden' : 'opacity-100 animate-in fade-in duration-700'}`}>
        
        {/* Main Composite View (Interactive) */}
        <div className="lg:col-span-2">
            <div className="group h-full flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-xl">
                <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white tracking-tight">最终仿真效果 (可编辑)</h3>
                        <p className="text-xs text-blue-200/60 font-medium mt-0.5">点击并拖动画面可手动修正颜色层</p>
                    </div>
                    <button 
                        onClick={handleDownloadMain}
                        className="p-2 rounded-xl bg-white/5 text-white/70 hover:bg-blue-500 hover:text-white border border-white/5 transition-all"
                    >
                        <Download size={18} />
                    </button>
                </div>
                
                <div 
                    ref={canvasWrapperRef}
                    className="relative flex-grow p-6 flex items-center justify-center bg-black/20 min-h-[400px] cursor-crosshair overflow-auto"
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ 
                        backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }} 
                    />
                    
                    <canvas 
                        ref={mainCanvasRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePaint}
                        onPointerUp={() => setIsDrawing(false)}
                        onPointerLeave={() => setIsDrawing(false)}
                        className="relative z-10 max-w-full shadow-2xl rounded-lg touch-none"
                        style={{ 
                            maxHeight: '600px',
                            imageRendering: 'pixelated'
                        }}
                    />
                </div>
            </div>
        </div>

        {/* Breakout Layers */}
        <LayerPreview 
            title="顶层丝印层 (Silkscreen)" 
            description="白色代表有丝印油墨，透明为无" 
            canvasRef={silkRef} 
        />
        
        <LayerPreview 
            title="顶层阻焊层 (Solder Mask)" 
            description="白色代表开窗(无油墨)，透明代表有阻焊油墨" 
            canvasRef={maskRef} 
        />
        
        <LayerPreview 
            title="顶层线路层 (Top Layer)" 
            description="白色代表有铜箔，透明为无" 
            canvasRef={copperRef} 
        />
      </div>
    </div>
  );
};