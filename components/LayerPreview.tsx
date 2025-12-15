import React from 'react';
import { Download } from 'lucide-react';

interface LayerPreviewProps {
  title: string;
  description: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const LayerPreview: React.FC<LayerPreviewProps> = ({ title, description, canvasRef }) => {
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pcb-${title.toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="group h-full flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-900/10">
      
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-blue-200/60 font-medium mt-0.5">{description}</p>
        </div>
        <button 
          onClick={handleDownload}
          className="p-2 rounded-xl bg-white/5 text-white/70 hover:bg-blue-500 hover:text-white border border-white/5 hover:border-blue-400/50 transition-all duration-200 shadow-sm"
          title="下载此层图片"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative flex-grow p-6 flex items-center justify-center bg-black/20 min-h-[240px]">
        {/* Checkboard pattern for transparency indication */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
               backgroundSize: '20px 20px',
               backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
             }} 
        />
        
        <canvas 
          ref={canvasRef} 
          className="relative z-10 max-w-full max-h-[300px] w-auto h-auto object-contain rounded-lg shadow-2xl"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
        />
      </div>
    </div>
  );
};