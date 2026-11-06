import React from 'react';
import { X, Trophy, CheckCircle, Flag, Clock, ArrowRight } from 'lucide-react';
import { Mission } from '../../types/game';
import { sounds } from '../../audio/SoundManager';

interface MissionsModalProps {
  missions: Mission[];
  activeMissionId?: string;
  onSelectMission: (id: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  activeMissionId,
  onSelectMission,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 select-none pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                City Missions & Challenges
              </h2>
              <p className="text-xs text-white/50">Complete driving objectives to earn cash and status</p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playUiClick(); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {missions.map((m) => {
            const isActive = activeMissionId === m.id;

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-800/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${isActive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700/60 text-white/70'}`}>
                    <Flag className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-white">{m.title}</h4>
                      {m.completed && (
                        <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/60 mt-1">{m.description}</p>

                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      <span className="font-extrabold text-emerald-400 font-mono">
                        +${m.reward.toLocaleString()}
                      </span>
                      {m.timeLimit && (
                        <span className="flex items-center space-x-1 text-white/50">
                          <Clock className="w-3 h-3" />
                          <span>{m.timeLimit}s limit</span>
                        </span>
                      )}
                      <span className="text-white/40">
                        {m.checkpoints.length} Checkpoints
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:justify-end shrink-0">
                  {isActive ? (
                    <span className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-black uppercase">
                      In Progress
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectMission(m.id);
                        onClose();
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <span>{m.completed ? 'Replay' : 'Start'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
