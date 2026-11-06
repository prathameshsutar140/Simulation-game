import React, { useState } from 'react';
import { X, Check, Zap, Disc, Gauge, Palette } from 'lucide-react';
import { PlayerStats, VehicleConfig, VehicleType } from '../../types/game';
import { sounds } from '../../audio/SoundManager';

interface GarageModalProps {
  stats: PlayerStats;
  onClose: () => void;
  onSelectVehicle: (id: VehicleType) => void;
  onUpgradeVehicle: (type: VehicleType, system: 'engine' | 'brakes' | 'handling') => void;
  onChangeColor: (type: VehicleType, color: string) => void;
}

const VEHICLE_CATALOG: VehicleConfig[] = [
  {
    id: 'supercar',
    name: 'Apex GT Supercar',
    category: 'Hypercar',
    price: 95000,
    unlocked: true,
    color: '#dc2626',
    maxSpeed: 340,
    acceleration: 96,
    braking: 92,
    handling: 95,
    weight: 1350,
    driveType: 'AWD',
    upgrades: { engine: 2, brakes: 2, handling: 2 },
  },
  {
    id: 'sportscar',
    name: 'Viper GTS Track',
    category: 'Sports',
    price: 65000,
    unlocked: true,
    color: '#2563eb',
    maxSpeed: 295,
    acceleration: 88,
    braking: 86,
    handling: 90,
    weight: 1420,
    driveType: 'RWD',
    upgrades: { engine: 1, brakes: 1, handling: 1 },
  },
  {
    id: 'sedan',
    name: 'Phantom Executive',
    category: 'Luxury',
    price: 45000,
    unlocked: true,
    color: '#0f172a',
    maxSpeed: 260,
    acceleration: 78,
    braking: 80,
    handling: 82,
    weight: 1780,
    driveType: 'AWD',
    upgrades: { engine: 0, brakes: 0, handling: 0 },
  },
  {
    id: 'suv',
    name: 'Titan 4x4 Off-Road',
    category: 'SUV',
    price: 52000,
    unlocked: true,
    color: '#475569',
    maxSpeed: 230,
    acceleration: 74,
    braking: 78,
    handling: 76,
    weight: 2150,
    driveType: 'AWD',
    upgrades: { engine: 1, brakes: 1, handling: 0 },
  },
  {
    id: 'taxi',
    name: 'Metro City Cab',
    category: 'Commercial',
    price: 28000,
    unlocked: true,
    color: '#eab308',
    maxSpeed: 210,
    acceleration: 70,
    braking: 75,
    handling: 75,
    weight: 1550,
    driveType: 'FWD',
    upgrades: { engine: 0, brakes: 1, handling: 0 },
  },
];

const PAINT_PALETTE = [
  { name: 'Apex Crimson', hex: '#dc2626' },
  { name: 'Midnight Onyx', hex: '#0f172a' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Sunset Amber', hex: '#f97316' },
  { name: 'Velocity Blue', hex: '#2563eb' },
  { name: 'Racing Yellow', hex: '#eab308' },
  { name: 'Pearl Frost', hex: '#f8fafc' },
  { name: 'Emerald Shadow', hex: '#059669' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  stats,
  onClose,
  onSelectVehicle,
  onUpgradeVehicle,
  onChangeColor,
}) => {
  const [selectedId, setSelectedId] = useState<VehicleType>(stats.currentVehicleId);
  const activeVehicle = VEHICLE_CATALOG.find((v) => v.id === selectedId)!;
  const currentUpgrades = stats.vehicleUpgrades[selectedId] || { engine: 0, brakes: 0, handling: 0, color: activeVehicle.color };

  const upgradeCost = 8500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 select-none pointer-events-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Metro Garage & Customization
              </h2>
              <p className="text-xs text-white/50">Tune vehicle performance and paint aesthetics</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-xl">
              <span className="text-xs text-emerald-400 font-bold">$</span>
              <span className="text-sm font-black text-white font-mono">{stats.cash.toLocaleString()}</span>
            </div>

            <button
              onClick={() => { sounds.playUiClick(); onClose(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Vehicle Selector Cards */}
          <div className="md:col-span-5 flex flex-col space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">
              Select Fleet Vehicle
            </span>

            {VEHICLE_CATALOG.map((veh) => {
              const isCurrent = stats.currentVehicleId === veh.id;
              const isSelected = selectedId === veh.id;

              return (
                <div
                  key={veh.id}
                  onClick={() => { sounds.playUiClick(); setSelectedId(veh.id); }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-12 rounded-lg"
                      style={{ backgroundColor: stats.vehicleUpgrades[veh.id]?.color || veh.color }}
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{veh.name}</h4>
                      <span className="text-[11px] font-semibold text-cyan-400/90">{veh.category} · {veh.driveType}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tracking-wide uppercase border border-emerald-500/30">
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-white/40">Ready</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Vehicle Specs & Tuning */}
          <div className="md:col-span-7 flex flex-col space-y-5">
            {/* Vehicle Header & Action */}
            <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  {activeVehicle.category} Class
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{activeVehicle.name}</h3>
              </div>

              {stats.currentVehicleId !== selectedId ? (
                <button
                  onClick={() => {
                    sounds.playUiClick();
                    onSelectVehicle(selectedId);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Equip Car</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase">
                  Currently Driving
                </span>
              )}
            </div>

            {/* Performance Specs Bars */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                Performance Telemetry
              </span>

              {/* Top Speed */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white/70">Top Speed</span>
                  <span className="text-cyan-300 font-mono font-bold">
                    {Math.round(activeVehicle.maxSpeed * (1 + currentUpgrades.engine * 0.12))} KM/H
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (activeVehicle.maxSpeed / 360) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Acceleration */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white/70">Acceleration (0-100)</span>
                  <span className="text-amber-300 font-mono font-bold">{activeVehicle.acceleration}%</span>
                </div>
                <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${activeVehicle.acceleration}%` }}
                  />
                </div>
              </div>

              {/* Handling */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white/70">Cornering & Grip</span>
                  <span className="text-emerald-300 font-mono font-bold">{activeVehicle.handling}%</span>
                </div>
                <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${activeVehicle.handling}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Parts Upgrades */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-3">
                Performance Tuning Upgrades (${upgradeCost.toLocaleString()} each)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Engine Stage */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold">Engine Stage</span>
                    </div>
                    <span className="text-sm font-black text-white">Lvl {currentUpgrades.engine}/3</span>
                  </div>

                  <button
                    disabled={currentUpgrades.engine >= 3 || stats.cash < upgradeCost}
                    onClick={() => onUpgradeVehicle(selectedId, 'engine')}
                    className="mt-3 py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 disabled:opacity-40 rounded-lg text-xs font-black uppercase transition-all"
                  >
                    {currentUpgrades.engine >= 3 ? 'Maxed' : `Upgrade`}
                  </button>
                </div>

                {/* Ceramic Brakes */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-red-400 mb-1">
                      <Disc className="w-4 h-4" />
                      <span className="text-xs font-bold">Carbon Brakes</span>
                    </div>
                    <span className="text-sm font-black text-white">Lvl {currentUpgrades.brakes}/3</span>
                  </div>

                  <button
                    disabled={currentUpgrades.brakes >= 3 || stats.cash < upgradeCost}
                    onClick={() => onUpgradeVehicle(selectedId, 'brakes')}
                    className="mt-3 py-1.5 px-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 disabled:opacity-40 rounded-lg text-xs font-black uppercase transition-all"
                  >
                    {currentUpgrades.brakes >= 3 ? 'Maxed' : `Upgrade`}
                  </button>
                </div>

                {/* Suspension Handling */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
                      <Gauge className="w-4 h-4" />
                      <span className="text-xs font-bold">Track Grip</span>
                    </div>
                    <span className="text-sm font-black text-white">Lvl {currentUpgrades.handling}/3</span>
                  </div>

                  <button
                    disabled={currentUpgrades.handling >= 3 || stats.cash < upgradeCost}
                    onClick={() => onUpgradeVehicle(selectedId, 'handling')}
                    className="mt-3 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 disabled:opacity-40 rounded-lg text-xs font-black uppercase transition-all"
                  >
                    {currentUpgrades.handling >= 3 ? 'Maxed' : `Upgrade`}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Paint Color Swatches */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Lacquer Body Paint
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {PAINT_PALETTE.map((color) => {
                  const isColorActive = currentUpgrades.color === color.hex;
                  return (
                    <button
                      key={color.hex}
                      onClick={() => {
                        sounds.playUiClick();
                        onChangeColor(selectedId, color.hex);
                      }}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md ${
                        isColorActive ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.7)]' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isColorActive && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
