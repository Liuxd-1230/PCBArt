import React, { useState } from 'react';
import { Upload, Cpu, Settings2, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';
import { BOARD_COLORS, SURFACE_FINISHES } from './constants';
import { ProcessingOptions } from './types';
import { PcbProcessor } from './components/PcbProcessor';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>({
    boardColorKey: 'green',
    finishKey: 'gold',
    dither: false,
    sensitivity: 50 // Default 50%
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Glass Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                PCB Art Simulator
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-300/80 font-semibold">Liquid Edition</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-xs font-medium text-slate-300">High Performance Renderer</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar - Glass Card */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Upload Section */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition-all hover:bg-white/10 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="relative text-lg font-semibold mb-4 flex items-center text-white/90">
                <Upload size={20} className="mr-3 text-blue-400" />
                上传原图
              </h2>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="relative z-10 border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center bg-black/20 group-hover:border-blue-400/50 transition-all duration-300">
                  {previewUrl ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium backdrop-blur-sm bg-black/30 px-3 py-1 rounded-full border border-white/20">点击更换</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                        <ImageIcon size={24} className="text-white/60" />
                      </div>
                      <p className="text-sm text-white/60 font-medium">点击选择图片</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-xl">
              <h2 className="text-lg font-semibold mb-6 flex items-center text-white/90">
                <Settings2 size={20} className="mr-3 text-blue-400" />
                工艺参数
              </h2>

              <div className="space-y-6">
                
                {/* Board Color Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">板子颜色 (阻焊)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {BOARD_COLORS.map((board) => (
                      <button
                        key={board.key}
                        onClick={() => setOptions({ ...options, boardColorKey: board.key })}
                        className={`
                          relative group aspect-square rounded-2xl flex items-center justify-center transition-all duration-300
                          ${options.boardColorKey === board.key 
                            ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-lg shadow-blue-500/20' 
                            : 'hover:scale-105 opacity-70 hover:opacity-100 hover:shadow-lg'}
                        `}
                        style={{ 
                          backgroundColor: board.deep,
                          boxShadow: options.boardColorKey === board.key ? `0 0 15px ${board.deep}` : 'none'
                        }}
                        title={board.name}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                        {options.boardColorKey === board.key && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md z-10" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 font-medium">
                      {BOARD_COLORS.find(b => b.key === options.boardColorKey)?.name}色阻焊
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Finish Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">表面处理 (焊盘)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SURFACE_FINISHES.map((finish) => (
                      <button
                        key={finish.key}
                        onClick={() => setOptions({ ...options, finishKey: finish.key })}
                        className={`
                          px-4 py-3 rounded-2xl text-sm font-medium border flex items-center justify-center space-x-2 transition-all duration-300 relative overflow-hidden
                          ${options.finishKey === finish.key
                            ? 'bg-blue-600/80 border-blue-500/50 text-white shadow-lg shadow-blue-900/20'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}
                        `}
                      >
                        <div 
                          className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                          style={{ backgroundColor: finish.color }} 
                        />
                        <span className="z-10">{finish.name}</span>
                        {options.finishKey === finish.key && (
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-50" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Tolerance Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                      颜色识别容差
                    </label>
                    <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">
                      {options.sensitivity}%
                    </span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={options.sensitivity}
                      onChange={(e) => setOptions({...options, sensitivity: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                      <span>严格</span>
                      <span>宽松</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    调节滑块可改变算法对颜色的敏感度。如果你发现浅蓝色被误识别为银色，请尝试降低此值。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {!selectedFile ? (
              <div className="h-[500px] flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-center p-8 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center mb-6 shadow-xl backdrop-blur-xl">
                    <Cpu size={40} className="text-white/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">准备开始</h3>
                  <p className="text-white/50 max-w-sm">
                    请在左侧上传图片，AI 将自动分析并生成工业级 PCB 生产图层
                  </p>
                </div>
              </div>
            ) : (
              <PcbProcessor 
                imageFile={selectedFile}
                options={options}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;