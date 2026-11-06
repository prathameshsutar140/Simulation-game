import React from 'react';
import { Target, Clock } from 'lucide-react';

interface MissionCardProps {
  title: string;
  targetLabel: string;
  distanceMeters: number;
  timeRemaining?: number;
  onClick?: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  title,
  targetLabel,
  distanceMeters,
  timeRemaining = 0,
  onClick,
}) => {
  const distText =
    distanceMeters > 999
      ? `${(distanceMeters / 1000).toFixed(1)} km`
      : `${distanceMeters} m`;

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/85 border border-amber-500/40 rounded-xl px-3 py-2 shadow-xl backdrop-blur-none cursor-pointer pointer-events-auto hover:border-amber-400 transition-all select-none max-w-[210px] sm:max-w-[240px]"
    >
      <div className="flex items-center space-x-1.5 mb-0.5">
        <Target className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          Main Mission
        </span>
      </div>

      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
        {title}
      </h4>

      <div className="flex items-center justify-between mt-1 text-[11px] text-white/70">
        <span className="truncate pr-1 text-white/50">{targetLabel}</span>
        <span className="font-extrabold text-amber-300 font-mono tracking-tight shrink-0">
          {distText}
        </span>
      </div>

      {timeRemaining > 0 && (
        <div className="flex items-center space-x-1 mt-1 text-[10px] text-red-400 font-bold">
          <Clock className="w-3 h-3" />
          <span>{timeRemaining}s remaining</span>
        </div>
      )}
    </div>
  );
};
