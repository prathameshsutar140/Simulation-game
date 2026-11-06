import React, { useEffect } from 'react';
import { Play, Sparkles, Trophy, Wrench, Shield } from 'lucide-react';
import { sounds } from '../../audio/SoundManager';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenGarage,
  onOpenSettings,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        sounds.init();
        sounds.resume();
        sounds.playUiClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const handleStart = () => {
    sounds.init();
    sounds.resume();
    sounds.playUiClick();
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 sm:p-12 select-none pointer-events-auto bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent">
      {/* Top Brand Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white tracking-wider backdrop-blur-none">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>V1.0 NEXT-GEN 3D OPEN WORLD</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { sounds.playUiClick(); onOpenGarage(); }}
            className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>Garage</span>
          </button>
          <button
            onClick={() => { sounds.playUiClick(); onOpenSettings(); }}
            className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Hero Title Lockup with Bespoke SVG */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* City Skyline SVG Silhouette */}
        <div className="w-24 h-12 mb-3 text-cyan-400/80">
          <svg viewBox="0 0 100 50" fill="currentColor" className="w-full h-full">
            <path d="M5 45h90v5H5zm5-20h6v20h-6zm8-15h8v35h-8zm10 8h10v27h-10zm12-14h12v41h-12zm14 6h8v35h-8zm10-12h10v47h-10zm12 18h8v29h-8zm10-10h8v39h-8z" />
          </svg>
        </div>

        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-amber-300 drop-shadow-[0_4px_24px_rgba(6,182,212,0.6)]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          MetroLife
        </h1>

        <p className="mt-2 text-sm sm:text-lg font-bold text-cyan-200/90 tracking-widest uppercase">
          Ultra-Realistic Open World City Simulator
        </p>

        {/* Primary Start Game CTA */}
        <div className="mt-8 flex flex-col items-center space-y-3">
          <button
            onClick={handleStart}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg uppercase tracking-widest rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Start Game</span>
          </button>

          <span className="text-[11px] font-semibold text-white/50 tracking-wider">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">Space</kbd> to drive
          </span>
        </div>
      </div>

      {/* Flat Control-Hint Line (Game Craft Guideline) */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 font-semibold border-t border-white/10 pt-3 gap-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Coastal Highway · Downtown Skycrapers · Mall · Pier & Ferris Wheel</span>
        </div>

        <div className="font-mono text-cyan-300/80 text-[11px]">
          WASD Drive · Space Handbrake · E Exit Vehicle · C Camera · Esc Pause
        </div>
      </div>
    </div>
  );
};
