import React from 'react';

interface SpeedometerProps {
  speedKmH: number;
  rpm: number;
  gear: string;
  isBraking: boolean;
  isInReverse: boolean;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  speedKmH,
  rpm,
  gear,
  isBraking,
  isInReverse,
}) => {
  // RPM ratio from 0 to 1 (0 to 9000 RPM)
  const rpmRatio = Math.min(1.0, Math.max(0, rpm / 8800));

  // SVG tachometer arc calculations
  // Arc spans from -135 deg to +45 deg (180 deg span)
  const radius = 95;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - rpmRatio * circumference;

  const displayGear = isInReverse ? 'R' : gear === '1' ? 'D' : gear;

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      {/* Outer tachometer dial SVG */}
      <div className="relative w-64 h-32 flex items-end justify-center overflow-hidden">
        <svg
          className="absolute bottom-0 w-64 h-64 transform -rotate-180"
          viewBox="0 0 220 220"
        >
          {/* Background track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="10"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset="0"
          />

          {/* Redline zone background */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
            strokeDashoffset={`-${circumference * 0.75}`}
          />

          {/* Active RPM progress arc */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={rpm > 6800 ? '#ef4444' : rpm > 4500 ? '#f59e0b' : '#38bdf8'}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 60ms linear, stroke 150ms ease',
            }}
          />
        </svg>

        {/* Tachometer numbers (1 to 9) */}
        <div className="absolute top-4 inset-x-8 flex justify-between text-[11px] font-bold text-white/50 tracking-wider">
          <span>0</span>
          <span>2</span>
          <span>4</span>
          <span>6</span>
          <span className="text-amber-400">7</span>
          <span className="text-red-500">8</span>
          <span className="text-red-500">9</span>
        </div>

        {/* Center Speed Readout */}
        <div className="relative z-10 flex flex-col items-center pb-2">
          <div className="flex items-baseline space-x-1">
            <span
              className="font-black text-4xl sm:text-5xl text-white tracking-tighter tabular-nums drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {speedKmH}
            </span>
            <span className="text-xs font-extrabold text-cyan-400 tracking-wider">
              KM/H
            </span>
          </div>

          {/* Gear & Fuel indicator row */}
          <div className="flex items-center space-x-3 mt-0.5 text-xs">
            {/* Fuel gauge icon */}
            <div className="flex items-center space-x-1 text-white/60">
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6h6zm-8-7H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 15H5V7h6v11zm11-6h-1v5a2 2 0 0 1-2 2h-1v2h1a4 4 0 0 0 4-4v-5z" />
              </svg>
              <div className="w-8 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/20">
                <div className="w-3/4 h-full bg-emerald-400 rounded-full" />
              </div>
            </div>

            {/* Gear badge */}
            <div className="flex items-center space-x-1.5 font-bold">
              <span className={`px-1.5 py-0.5 rounded text-[11px] ${displayGear === 'R' ? 'bg-red-600 text-white font-black' : 'text-white/40'}`}>R</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] ${displayGear === 'N' ? 'bg-amber-500 text-white' : 'text-white/40'}`}>N</span>
              <span className={`px-2 py-0.5 rounded text-[12px] font-black ${displayGear !== 'R' && displayGear !== 'N' ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-white/40'}`}>
                {displayGear === 'R' || displayGear === 'N' ? 'D' : displayGear}
              </span>
            </div>

            {/* Brake warning */}
            {isBraking && (
              <span className="px-1.5 py-0.5 bg-red-600/90 text-white text-[10px] font-black rounded tracking-widest uppercase animate-pulse">
                BRAKE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
