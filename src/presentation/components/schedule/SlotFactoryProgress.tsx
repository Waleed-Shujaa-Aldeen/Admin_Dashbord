import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Terminal, Factory } from "lucide-react";

interface SlotFactoryProgressProps {
  isGenerating: boolean;
  onClose: () => void;
  summary?: { created: number; total: number };
}

export function SlotFactoryProgress({ isGenerating, onClose, summary }: SlotFactoryProgressProps) {
  const [progress, setProgress] = useState(0);

  // Simulate progress if generating
  useState(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  });

  if (!isGenerating && !summary) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
        
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#0384c4]/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#0384c4]/30 transition-all duration-700" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="size-20 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner">
            {isGenerating ? (
              <Loader2 className="size-10 text-[#0384c4] animate-spin" />
            ) : summary ? (
              <CheckCircle className="size-10 text-emerald-400 animate-bounce" />
            ) : (
              <AlertCircle className="size-10 text-red-400" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-black text-white italic tracking-tight">
              {isGenerating ? "Med-Link Slot Factory Active" : "Deployment Complete"}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 italic">
              Synchronizing with SlotGenerationService
            </p>
          </div>

          {isGenerating && (
            <div className="w-full flex flex-col gap-3">
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-[#0384c4] to-blue-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(3,132,196,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter flex items-center gap-1.5">
                  <Terminal className="size-3" /> Processing Engine Logs...
                </span>
                <span className="text-xs font-black text-[#0384c4]">{Math.floor(progress)}%</span>
              </div>
            </div>
          )}

          {summary && !isGenerating && (
            <div className="w-full bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Successful Deployments</span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tighter">{summary.created} <span className="text-xs text-slate-600 uppercase">Slots</span></span>
                </div>
                <div className="size-px h-8 bg-slate-800" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Target Horizon</span>
                  <span className="text-2xl font-black text-white tracking-tighter">30 <span className="text-xs text-slate-600 uppercase">Days</span></span>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && (
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white text-slate-950 font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-[#0384c4] hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              System Shutdown
            </button>
          )}

          {isGenerating && (
             <div className="flex items-center gap-2 text-slate-500 animate-pulse">
               <span className="block size-1 bg-slate-500 rounded-full" />
               <span className="block size-1 bg-slate-500 rounded-full" />
               <span className="block size-1 bg-slate-500 rounded-full" />
               <span className="text-[10px] font-bold uppercase tracking-widest ml-1">Iterating Through Exceptions</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
