import React from 'react';
import { X, Sliders, Monitor, Volume2, RotateCcw } from 'lucide-react';
import { GameSettings } from '../../types/game';
import { sounds } from '../../audio/SoundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 select-none pointer-events-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                System Settings
              </h2>
              <p className="text-xs text-white/50">Graphics fidelity, sound volumes & input</p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playUiClick(); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Graphics Quality */}
          <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Graphics Preset (Scalable Performance)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    sounds.playUiClick();
                    onUpdateSettings({ graphicsQuality: q });
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-black uppercase transition-all ${
                    settings.graphicsQuality === q
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-white/70 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Volumes */}
          <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-1">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Audio Synthesizer Volumes
              </span>
            </div>

            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white/70">Master Sound</span>
                <span className="text-emerald-300 font-mono font-bold">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ musicVolume: val });
                  sounds.setVolumes(val, settings.sfxVolume, settings.engineVolume);
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Engine Roar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white/70">Vehicle Engine Roar</span>
                <span className="text-amber-300 font-mono font-bold">{Math.round(settings.engineVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.engineVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ engineVolume: val });
                  sounds.setVolumes(settings.musicVolume, settings.sfxVolume, val);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* SFX / Tires / Crashes */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white/70">Tire Drift & Collision SFX</span>
                <span className="text-cyan-300 font-mono font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ sfxVolume: val });
                  sounds.setVolumes(settings.musicVolume, val, settings.engineVolume);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Reset Save Game Data</h4>
              <p className="text-[11px] text-white/50">Restores default $125,750 cash, unlocked fleet & missions</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all game progress to default?')) {
                  onResetSave();
                  onClose();
                }
              }}
              className="px-3.5 py-2 bg-red-600/30 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
