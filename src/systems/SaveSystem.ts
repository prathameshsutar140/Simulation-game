import { PlayerStats, VehicleType } from '../types/game';

const SAVE_KEY = 'metrolife_save_v1';

export const DEFAULT_SAVE: PlayerStats = {
  cash: 125750, // Matches the exact cash counter in user's screenshot!
  reputation: 250,
  distanceDrivenKm: 42.8,
  missionsCompleted: 1,
  unlockedVehicles: ['supercar', 'sportscar', 'sedan', 'suv', 'taxi'],
  currentVehicleId: 'supercar',
  vehicleUpgrades: {
    supercar: { engine: 2, brakes: 2, handling: 2, color: '#dc2626' }, // Crimson Red like screenshot
    sportscar: { engine: 1, brakes: 1, handling: 1, color: '#2563eb' },
    sedan: { engine: 0, brakes: 0, handling: 0, color: '#0f172a' },
    suv: { engine: 1, brakes: 1, handling: 0, color: '#475569' },
    taxi: { engine: 0, brakes: 1, handling: 0, color: '#eab308' },
  },
  settings: {
    graphicsQuality: 'high',
    musicVolume: 0.8,
    sfxVolume: 0.9,
    engineVolume: 0.85,
    touchSensitivity: 1.0,
    steeringDeadzone: 0.05,
    cameraFov: 65,
    autoGear: true,
  },
};

export class SaveSystem {
  public static load(): PlayerStats {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SAVE, ...parsed };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SAVE };
  }

  public static save(stats: PlayerStats) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore quota errors
    }
  }

  public static reset(): PlayerStats {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Ignore
    }
    return { ...DEFAULT_SAVE };
  }
}
