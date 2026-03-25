import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface SlotFactoryProgressProps {
  isGenerating: boolean;
  onClose: () => void;
  summary?: { created: number; total: number };
}

export function SlotFactoryProgress({ isGenerating, onClose, summary }: SlotFactoryProgressProps) {
  const [progress, setProgress] = useState(0);

  // Simulate progress logic
  useEffect(() => {
    if (isGenerating) {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          return prev + Math.random() * 8;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  if (!isGenerating && !summary) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
        
        <div className="flex flex-col items-center gap-6">
          <div className={`size-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isGenerating ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
          }`}>
            {isGenerating ? (
              <Loader2 className="size-8 text-[#0384c4] animate-spin" />
            ) : (
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isGenerating ? "Deploying Slots..." : "Slots Ready"}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 px-4">
              {isGenerating ? "Building schedule instances for the selected horizon" : "Your provider schedule has been successfully updated"}
            </p>
          </div>

          {isGenerating && (
            <div className="w-full space-y-3">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0384c4] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                <span>Synchronizing...</span>
                <span className="text-slate-900 dark:text-white">{Math.floor(progress)}%</span>
              </div>
            </div>
          )}

          {summary && !isGenerating && (
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Created</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{summary.created}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Horizon</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">30d</span>
              </div>
            </div>
          )}

          {!isGenerating && (
            <button 
              onClick={onClose}
              className="w-full mt-2 py-4 bg-[#0384c4] hover:bg-[#0273ab] text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Done & View Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
