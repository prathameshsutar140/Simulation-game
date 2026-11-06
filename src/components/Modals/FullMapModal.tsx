import React from 'react';
import { X, MapPin, Navigation, Compass } from 'lucide-react';
import * as THREE from 'three';
import { sounds } from '../../audio/SoundManager';

interface FullMapModalProps {
  playerPos: THREE.Vector3;
  onTeleport: (x: number, z: number) => void;
  onClose: () => void;
}

const LANDMARKS = [
  { name: 'Metro City Mall', x: 85, z: -60, tag: 'Shopping & Dining' },
  { name: 'Coastal Amusement Pier', x: 210, z: -40, tag: 'Ferris Wheel' },
  { name: 'Downtown Financial Center', x: -30, z: -60, tag: 'Skyscrapers' },
  { name: 'Ocean Drive North', x: 60, z: -250, tag: 'Scenic Highway' },
  { name: 'Ocean Drive South', x: 60, z: 250, tag: 'Scenic Highway' },
  { name: 'Metro Gas & Repair Station', x: -100, z: 120, tag: 'Service Hub' },
];

export const FullMapModal: React.FC<FullMapModalProps> = ({
  playerPos,
  onTeleport,
  onClose,
}) => {
  // Map dimensions: -300 to +300 meters mapped to 0 to 100%
  const toPercentX = (x: number) => Math.min(95, Math.max(5, ((x + 280) / 560) * 100));
  const toPercentY = (z: number) => Math.min(95, Math.max(5, ((z + 280) / 560) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 select-none pointer-events-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Metro City GPS Navigation Map
              </h2>
              <p className="text-xs text-white/50">Click any key district landmark to fast-travel</p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playUiClick(); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas Visualizer */}
        <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 overflow-hidden border-b border-white/10">
          {/* Ocean Water on East (Right side) */}
          <div className="absolute right-0 top-0 bottom-0 w-[24%] bg-sky-900/40 border-l-2 border-sky-500/30 flex items-center justify-center">
            <span className="text-xs font-black text-sky-400/50 uppercase tracking-widest rotate-90">
              Pacific Ocean
            </span>
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40" />

          {/* Coastal Highway (North to South) */}
          <div
            className="absolute top-0 bottom-0 w-3.5 bg-slate-700/80 border-x border-amber-400/50 -translate-x-1/2"
            style={{ left: `${toPercentX(60)}%` }}
          />

          {/* Downtown Boulevard (North to South) */}
          <div
            className="absolute top-0 bottom-0 w-3 bg-slate-700/80 border-x border-slate-500/40 -translate-x-1/2"
            style={{ left: `${toPercentX(-100)}%` }}
          />

          {/* Cross Streets */}
          {[-180, -60, 60, 180].map((z) => (
            <div
              key={z}
              className="absolute left-0 right-0 h-2.5 bg-slate-700/80 border-y border-slate-500/40 -translate-y-1/2"
              style={{ top: `${toPercentY(z)}%` }}
            />
          ))}

          {/* Landmark Pins */}
          {LANDMARKS.map((lm) => (
            <div
              key={lm.name}
              onClick={() => {
                sounds.playUiClick();
                onTeleport(lm.x, lm.z);
                onClose();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
              style={{ left: `${toPercentX(lm.x)}%`, top: `${toPercentY(lm.z)}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500 group-hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="mt-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-extrabold text-white whitespace-nowrap border border-white/20 group-hover:border-cyan-400">
                {lm.name}
              </span>
            </div>
          ))}

          {/* Player Live Location Marker */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            style={{ left: `${toPercentX(playerPos.x)}%`, top: `${toPercentY(playerPos.z)}%` }}
          >
            <div className="absolute w-8 h-8 rounded-full bg-cyan-400/20 animate-ping" />
            <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_12px_rgba(6,182,212,1)] flex items-center justify-center">
              <Navigation className="w-2.5 h-2.5 text-slate-950 fill-current" />
            </div>
          </div>
        </div>

        {/* Footer District Shortcuts */}
        <div className="p-4 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-white/50">
            Player Coordinates: <span className="text-cyan-400 font-mono font-bold">X: {Math.round(playerPos.x)}m, Z: {Math.round(playerPos.z)}m</span>
          </div>
          <span className="text-xs font-semibold text-white/40">Metro City Area: 36 sq km</span>
        </div>
      </div>
    </div>
  );
};
