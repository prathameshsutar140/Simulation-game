export type VehicleType = 'supercar' | 'sportscar' | 'sedan' | 'suv' | 'taxi';

export interface VehicleConfig {
  id: VehicleType;
  name: string;
  category: string;
  price: number;
  unlocked: boolean;
  color: string;
  maxSpeed: number; // km/h
  acceleration: number; // 0-100 scale
  braking: number;
  handling: number;
  weight: number; // kg
  driveType: 'RWD' | 'AWD' | 'FWD';
  upgrades: {
    engine: number; // 0 to 3
    brakes: number; // 0 to 3
    handling: number; // 0 to 3
  };
}

export type WeatherType = 'sunset' | 'day' | 'night' | 'rain';

export type CameraMode = 'chase' | 'hood' | 'cinematic' | 'orbit';

export interface Mission {
  id: string;
  title: string;
  category: 'delivery' | 'race' | 'parking' | 'explore' | 'drift';
  description: string;
  reward: number;
  timeLimit?: number; // seconds
  checkpoints: { x: number; z: number; radius: number; label?: string }[];
  completed: boolean;
  bestTime?: number;
}

export interface PlayerStats {
  cash: number;
  reputation: number;
  distanceDrivenKm: number;
  missionsCompleted: number;
  unlockedVehicles: VehicleType[];
  currentVehicleId: VehicleType;
  vehicleUpgrades: Record<VehicleType, { engine: number; brakes: number; handling: number; color: string }>;
  settings: GameSettings;
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  musicVolume: number;
  sfxVolume: number;
  engineVolume: number;
  touchSensitivity: number;
  steeringDeadzone: number;
  cameraFov: number;
  autoGear: boolean;
}

export interface ControlState {
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
  steer: number; // -1 to 1
  handbrake: boolean;
  boost: boolean;
  reverse: boolean;
  horn: boolean;
  lights: boolean;
  enterExitVehicle: boolean;
  run: boolean;
  jump: boolean;
  resetVehicle: boolean;
  cameraToggle: boolean;
}
