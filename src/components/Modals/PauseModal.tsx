import React from 'react';
import { Play, RotateCcw, Wrench, Settings, Map, Keyboard } from 'lucide-react';
import { sounds } from '../../audio/SoundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestartCar: () => void;
  onOpenGarage: () => void;
  onOpenMap: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartCar,
  onOpenGarage,
  onOpenMap,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col space-y-4">
        {/* Title */}
        <div className="text-center pb-2 border-b border-white/10">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            GAME PAUSED
          </h2>
          <span className="text-xs text-cyan-400 font-semibold tracking-wide">MetroLife City Simulator</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2.5">
          <button
            onClick={() => { sounds.playUiClick(); onResume(); }}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Driving</span>
          </button>

          <button
            onClick={() => { sounds.playUiClick(); onRestartCar(); onResume(); }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 active:scale-95 border border-white/10"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Car to Highway</span>
          </button>

          <button
            onClick={() => { sounds.playUiClick(); onOpenGarage(); }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 active:scale-95 border border-white/10"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Garage & Fleet</span>
          </button>

          <button
            onClick={() => { sounds.playUiClick(); onOpenMap(); }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 active:scale-95 border border-white/10"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>City Navigation Map</span>
          </button>

          <button
            onClick={() => { sounds.playUiClick(); onOpenSettings(); }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 active:scale-95 border border-white/10"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span>System Settings</span>
          </button>
        </div>

        {/* Controls Guide Reminder */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 text-[11px] text-white/60 space-y-1">
          <div className="flex items-center space-x-1.5 text-white/80 font-bold mb-1">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>PC Keyboard Controls:</span>
          </div>
          <p><strong className="text-white">W / Up</strong> - Accelerate · <strong className="text-white">S / Down</strong> - Brake / Reverse</p>
          <p><strong className="text-white">A / D</strong> - Steer · <strong className="text-white">Space</strong> - Handbrake Drift</p>
          <p><strong className="text-white">E</strong> - Enter / Exit Vehicle · <strong className="text-white">C</strong> - Camera View</p>
        </div>
      </div>
    </div>
  );
};
