import React from 'react';
import { Settings, Pause, Sun, CloudRain, Moon, Sunset, Volume2, VolumeX, Camera, Plus } from 'lucide-react';
import { WeatherType, CameraMode } from '../../types/game';

interface HeaderBarProps {
  cash: number;
  weather: WeatherType;
  cameraMode: CameraMode;
  isMuted: boolean;
  onOpenSettings: () => void;
  onPause: () => void;
  onCycleWeather: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onOpenGarage: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  cash,
  weather,
  cameraMode,
  isMuted,
  onOpenSettings,
  onPause,
  onCycleWeather,
  onToggleMute,
  onToggleCamera,
  onOpenGarage,
}) => {
  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunset':
        return <Sunset className="w-4 h-4 text-amber-400" />;
      case 'day':
        return <Sun className="w-4 h-4 text-yellow-300" />;
      case 'night':
        return <Moon className="w-4 h-4 text-cyan-300" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
    }
  };

  const getWeatherLabel = () => {
    switch (weather) {
      case 'sunset':
        return '26°C Sunset';
      case 'day':
        return '29°C Clear';
      case 'night':
        return '19°C Night';
      case 'rain':
        return '21°C Rain';
    }
  };

  const getTimeLabel = () => {
    switch (weather) {
      case 'sunset':
        return '17:45';
      case 'day':
        return '12:30';
      case 'night':
        return '23:15';
      case 'rain':
        return '15:20';
    }
  };

  return (
    <div className="w-full flex items-center justify-between select-none pointer-events-none px-3 sm:px-6 py-2.5">
      {/* Empty Left Placeholder to balance center logo */}
      <div className="w-20 hidden md:block" />

      {/* Center MetroLife Watermark Logo (as in screenshot) */}
      <div className="flex flex-col items-center pointer-events-auto">
        <div className="flex items-center space-x-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 7v13h4v-7h8v7h4V7l-8-5zm-2 16H8v-4h2v4zm6 0h-2v-4h2v4z" />
          </svg>
          <span
            className="text-lg sm:text-2xl font-black italic tracking-wide text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            MetroLife
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] font-semibold text-white/70 uppercase tracking-widest drop-shadow">
          Open World City Simulator
        </span>
      </div>

      {/* Top Right Clusters (Cash, Weather, Time, Settings, Pause) */}
      <div className="flex items-center space-x-2 sm:space-x-3 pointer-events-auto">
        {/* Cash balance pill */}
        <div
          onClick={onOpenGarage}
          className="flex items-center space-x-1.5 bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 px-2.5 py-1 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="Virtual Cash Balance - Click to visit Garage"
        >
          <span className="text-emerald-400 font-bold text-xs sm:text-sm">$</span>
          <span
            className="text-xs sm:text-sm font-extrabold text-white tracking-tight tabular-nums"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {cash.toLocaleString()}
          </span>
          <button className="w-4 h-4 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-slate-950 font-bold ml-1">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Weather & Time Chip */}
        <button
          onClick={onCycleWeather}
          className="hidden sm:flex items-center space-x-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 px-2.5 py-1 rounded-xl text-xs font-semibold text-white/90 shadow transition-all"
          title="Click to cycle weather (Sunset, Day, Night, Rain)"
        >
          {getWeatherIcon()}
          <span>{getWeatherLabel()}</span>
          <span className="text-white/40">|</span>
          <span className="text-amber-300 font-mono">{getTimeLabel()}</span>
        </button>

        {/* Camera Mode Toggle */}
        <button
          onClick={onToggleCamera}
          className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/80 hover:bg-slate-800 border border-white/15 rounded-xl text-xs font-bold text-white flex items-center space-x-1 shadow transition-all"
          title="Switch Camera View (Chase, Hood, Cinematic, Free Orbit)"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline uppercase text-[10px] text-cyan-300">{cameraMode}</span>
        </button>

        {/* Mute button */}
        <button
          onClick={onToggleMute}
          className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/15 rounded-xl text-white shadow transition-all"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/15 rounded-xl text-white shadow transition-all"
          title="Game Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Pause */}
        <button
          onClick={onPause}
          className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/15 rounded-xl text-white shadow transition-all"
          title="Pause Game (Esc)"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
