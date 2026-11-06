import React from 'react';
import { ChevronLeft, ChevronRight, LogOut, Car, Wrench, Trophy, Map, Gift } from 'lucide-react';
import { ControlState } from '../../types/game';

interface TouchControlsProps {
  controls: ControlState;
  setControls: React.Dispatch<React.SetStateAction<ControlState>>;
  isPlayerInVehicle: boolean;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
  onOpenMap: () => void;
  onOpenRewards: () => void;
  onEnterExitVehicle: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  controls,
  setControls,
  isPlayerInVehicle,
  onOpenGarage,
  onOpenMissions,
  onOpenMap,
  onOpenRewards,
  onEnterExitVehicle,
}) => {
  // Prevent context menu or zoom on fast double taps
  const handleTouch = (e: React.TouchEvent | React.MouseEvent, fn: () => void) => {
    e.preventDefault();
    fn();
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
      {/* LEFT SIDE QUICK-ACCESS CHIPS (as in screenshot) */}
      <div className="flex flex-col space-y-2 mt-32 sm:mt-24 pointer-events-auto items-start max-w-fit">
        <button
          onClick={onOpenGarage}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/20 text-white shadow-xl hover:border-cyan-400 text-xs font-bold transition-all transform hover:translate-x-1"
        >
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span>Garage</span>
        </button>

        <button
          onClick={onOpenMissions}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/20 text-white shadow-xl hover:border-amber-400 text-xs font-bold transition-all transform hover:translate-x-1"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Missions</span>
        </button>

        <button
          onClick={onOpenMap}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/20 text-white shadow-xl hover:border-emerald-400 text-xs font-bold transition-all transform hover:translate-x-1"
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span>Map</span>
        </button>

        <button
          onClick={onOpenRewards}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/20 text-white shadow-xl hover:border-pink-400 text-xs font-bold transition-all transform hover:translate-x-1"
        >
          <Gift className="w-4 h-4 text-pink-400" />
          <span>Rewards</span>
        </button>
      </div>

      {/* BOTTOM CONTROLS ROW */}
      <div className="w-full flex items-end justify-between pointer-events-none pb-1 sm:pb-3">
        {/* BOTTOM-LEFT: STEERING BUTTONS */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          {/* Steer Left */}
          <button
            onTouchStart={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, steer: -1 })))}
            onTouchEnd={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, steer: 0 })))}
            onMouseDown={() => setControls(prev => ({ ...prev, steer: -1 }))}
            onMouseUp={() => setControls(prev => ({ ...prev, steer: 0 }))}
            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 flex items-center justify-center text-white shadow-2xl backdrop-blur-none transition-all active:scale-90 ${
              controls.steer < -0.2
                ? 'bg-cyan-500/80 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'bg-slate-900/75 border-white/30 hover:border-white/60'
            }`}
            title="Steer Left (A / Left Arrow)"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>

          {/* Steer Right */}
          <button
            onTouchStart={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, steer: 1 })))}
            onTouchEnd={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, steer: 0 })))}
            onMouseDown={() => setControls(prev => ({ ...prev, steer: 1 }))}
            onMouseUp={() => setControls(prev => ({ ...prev, steer: 0 }))}
            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 flex items-center justify-center text-white shadow-2xl backdrop-blur-none transition-all active:scale-90 ${
              controls.steer > 0.2
                ? 'bg-cyan-500/80 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'bg-slate-900/75 border-white/30 hover:border-white/60'
            }`}
            title="Steer Right (D / Right Arrow)"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        </div>

        {/* BOTTOM-RIGHT: PEDALS & VEHICLE ACTIONS (as in screenshot) */}
        <div className="flex items-end space-x-3 sm:space-x-4 pointer-events-auto">
          {/* Enter / Exit Vehicle Button & Handbrake Column */}
          <div className="flex flex-col items-center space-y-3 pb-1">
            {/* Enter/Exit Vehicle Round Button */}
            <button
              onClick={onEnterExitVehicle}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/85 border-2 border-white/30 hover:border-amber-400 flex flex-col items-center justify-center text-white shadow-2xl active:scale-90 transition-all"
              title="Enter/Exit Vehicle (E key)"
            >
              {isPlayerInVehicle ? (
                <>
                  <LogOut className="w-5 h-5 text-amber-400" />
                  <span className="text-[8px] font-black uppercase text-amber-300">Exit</span>
                </>
              ) : (
                <>
                  <Car className="w-5 h-5 text-emerald-400" />
                  <span className="text-[8px] font-black uppercase text-emerald-300">Enter</span>
                </>
              )}
            </button>

            {/* Handbrake Button (P) */}
            <button
              onTouchStart={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, handbrake: true })))}
              onTouchEnd={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, handbrake: false })))}
              onMouseDown={() => setControls(prev => ({ ...prev, handbrake: true }))}
              onMouseUp={() => setControls(prev => ({ ...prev, handbrake: false }))}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-white shadow-2xl font-black text-sm active:scale-90 transition-all ${
                controls.handbrake
                  ? 'bg-red-600 border-red-300 shadow-[0_0_18px_rgba(239,68,68,0.8)]'
                  : 'bg-slate-900/80 border-white/30 hover:border-red-400'
              }`}
              title="Handbrake Drift (Spacebar)"
            >
              <div className="flex items-center space-x-0.5">
                <span className="text-xs">⦅</span>
                <span className="font-extrabold text-sm sm:text-base">P</span>
                <span className="text-xs">⦆</span>
              </div>
            </button>
          </div>

          {/* Brake / Reverse Pedal */}
          <button
            onTouchStart={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, brake: 1 })))}
            onTouchEnd={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, brake: 0 })))}
            onMouseDown={() => setControls(prev => ({ ...prev, brake: 1 }))}
            onMouseUp={() => setControls(prev => ({ ...prev, brake: 0 }))}
            className={`w-14 sm:w-16 h-24 sm:h-28 rounded-xl border-2 flex flex-col items-center justify-between py-2 shadow-2xl active:scale-95 transition-all ${
              controls.brake > 0.2
                ? 'bg-red-600/90 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                : 'bg-slate-900/85 border-white/30 hover:border-red-400'
            }`}
            title="Brake / Reverse (S / Down Arrow)"
          >
            {/* Ribbed metal pedal slats */}
            <div className="w-4/5 flex flex-col space-y-1.5 mt-2">
              <div className="h-1 bg-white/40 rounded-full" />
              <div className="h-1 bg-white/40 rounded-full" />
              <div className="h-1 bg-white/40 rounded-full" />
              <div className="h-1 bg-white/40 rounded-full" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-300">
              BRAKE
            </span>
          </button>

          {/* Accelerator Gas Pedal */}
          <button
            onTouchStart={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, throttle: 1 })))}
            onTouchEnd={(e) => handleTouch(e, () => setControls(prev => ({ ...prev, throttle: 0 })))}
            onMouseDown={() => setControls(prev => ({ ...prev, throttle: 1 }))}
            onMouseUp={() => setControls(prev => ({ ...prev, throttle: 0 }))}
            className={`w-14 sm:w-18 h-32 sm:h-36 rounded-xl border-2 flex flex-col items-center justify-between py-3 shadow-2xl active:scale-95 transition-all ${
              controls.throttle > 0.2
                ? 'bg-cyan-500/90 border-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.9)]'
                : 'bg-slate-900/85 border-white/30 hover:border-cyan-400'
            }`}
            title="Throttle / Gas (W / Up Arrow)"
          >
            {/* Ribbed gas pedal slats */}
            <div className="w-4/5 flex flex-col space-y-2 mt-2">
              <div className="h-1 bg-white/50 rounded-full" />
              <div className="h-1 bg-white/50 rounded-full" />
              <div className="h-1 bg-white/50 rounded-full" />
              <div className="h-1 bg-white/50 rounded-full" />
              <div className="h-1 bg-white/50 rounded-full" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
              GAS
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
