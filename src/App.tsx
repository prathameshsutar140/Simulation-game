import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CameraMode, ControlState, PlayerStats, VehicleType, WeatherType } from './types/game';
import { SaveSystem } from './systems/SaveSystem';
import { sounds } from './audio/SoundManager';
import { GameCanvas } from './components/GameCanvas';
import { HeaderBar } from './components/HUD/HeaderBar';
import { Minimap } from './components/HUD/Minimap';
import { MissionCard } from './components/HUD/MissionCard';
import { Speedometer } from './components/HUD/Speedometer';
import { TouchControls } from './components/HUD/TouchControls';
import { TitleScreen } from './components/Modals/TitleScreen';
import { GarageModal } from './components/Modals/GarageModal';
import { MissionsModal } from './components/Modals/MissionsModal';
import { FullMapModal } from './components/Modals/FullMapModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { PauseModal } from './components/Modals/PauseModal';
import { CameraManager } from './systems/CameraManager';
import { MissionManager, INITIAL_MISSIONS } from './systems/MissionManager';
import { VehiclePhysics } from './vehicles/VehiclePhysics';
import { PlayerCharacter } from './player/PlayerCharacter';
import confetti from 'canvas-confetti';

const INITIAL_CONTROLS: ControlState = {
  throttle: 0,
  brake: 0,
  steer: 0,
  handbrake: false,
  boost: false,
  reverse: false,
  horn: false,
  lights: false,
  enterExitVehicle: false,
  run: false,
  jump: false,
  resetVehicle: false,
  cameraToggle: false,
};

export default function App() {
  // Game Save & State
  const [stats, setStats] = useState<PlayerStats>(() => SaveSystem.load());
  const [controls, setControls] = useState<ControlState>(INITIAL_CONTROLS);
  const [weather, setWeather] = useState<WeatherType>('sunset');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [garageOpen, setGarageOpen] = useState<boolean>(false);
  const [missionsOpen, setMissionsOpen] = useState<boolean>(false);
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [rewardToast, setRewardToast] = useState<{ amount: number; title: string } | null>(null);

  // Live Telemetry from Game Loop
  const [telemetry, setTelemetry] = useState({
    speedKmH: 0,
    rpm: 900,
    gear: '1',
    isBraking: false,
    isInReverse: false,
    playerPos: new THREE.Vector3(60, 0, 30),
    playerHeading: 0,
    targetPos: null as { x: number; z: number } | null,
    trafficPositions: [] as THREE.Vector3[],
    distanceMeters: 1200,
    activeMissionTitle: 'Reach the City Mall',
    targetLabel: 'City Mall Plaza',
    timeRemaining: 0,
    isPlayerInVehicle: true,
  });

  // System References
  const missionMgrRef = useRef<MissionManager | null>(null);
  const cameraMgrRef = useRef<CameraManager | null>(null);
  const vehiclePhysicsRef = useRef<VehiclePhysics | null>(null);
  const playerCharRef = useRef<PlayerCharacter | null>(null);

  // Persist save on change
  useEffect(() => {
    SaveSystem.save(stats);
  }, [stats]);

  // Audio mute sync
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      sounds.setMuted(next);
      return next;
    });
  }, []);

  // Enter/Exit Vehicle Toggle
  const handleEnterExitVehicle = useCallback(() => {
    sounds.playUiClick();
    const player = playerCharRef.current;
    const vehicle = vehiclePhysicsRef.current;
    if (!player || !vehicle) return;

    if (player.isInVehicle) {
      player.exitVehicle(vehicle.position, vehicle.heading);
    } else {
      const dist = player.position.distanceTo(vehicle.position);
      if (dist < 5.0) {
        player.enterVehicle();
      }
    }
  }, []);

  // Camera Mode Toggle
  const handleToggleCamera = useCallback(() => {
    sounds.playUiClick();
    if (cameraMgrRef.current) {
      const newMode = cameraMgrRef.current.toggleMode();
      setCameraMode(newMode);
    }
  }, []);

  // Cycle Weather
  const handleCycleWeather = useCallback(() => {
    sounds.playUiClick();
    const cycle: WeatherType[] = ['sunset', 'day', 'night', 'rain'];
    setWeather((cur) => {
      const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
      return next;
    });
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (e.code === 'KeyE') {
        handleEnterExitVehicle();
        return;
      }

      if (e.code === 'KeyC') {
        handleToggleCamera();
        return;
      }

      if (e.code === 'KeyH') {
        setControls((prev) => ({ ...prev, horn: true }));
        return;
      }

      // Movement keys
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls((prev) => ({ ...prev, throttle: 1 }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls((prev) => ({ ...prev, brake: 1 }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls((prev) => ({ ...prev, steer: -1 }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls((prev) => ({ ...prev, steer: 1 }));
          break;
        case 'Space':
          setControls((prev) => ({ ...prev, handbrake: true, jump: true }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls((prev) => ({ ...prev, run: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        setControls((prev) => ({ ...prev, horn: false }));
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls((prev) => ({ ...prev, throttle: 0 }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls((prev) => ({ ...prev, brake: 0 }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls((prev) => ({ ...prev, steer: prev.steer < 0 ? 0 : prev.steer }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls((prev) => ({ ...prev, steer: prev.steer > 0 ? 0 : prev.steer }));
          break;
        case 'Space':
          setControls((prev) => ({ ...prev, handbrake: false, jump: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls((prev) => ({ ...prev, run: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleEnterExitVehicle, handleToggleCamera]);

  // Mission Reward Payout
  const handleMissionReward = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      missionsCompleted: prev.missionsCompleted + 1,
    }));
    setRewardToast({ amount, title: 'Mission Complete!' });
    setTimeout(() => setRewardToast(null), 4500);
  };

  // Vehicle Switch in Garage
  const handleSelectVehicle = (id: VehicleType) => {
    setStats((prev) => ({
      ...prev,
      currentVehicleId: id,
    }));
  };

  // Vehicle Upgrade in Garage
  const handleUpgradeVehicle = (type: VehicleType, system: 'engine' | 'brakes' | 'handling') => {
    const cost = 8500;
    if (stats.cash < cost) return;

    sounds.playMissionComplete();
    setStats((prev) => {
      const current = prev.vehicleUpgrades[type] || { engine: 0, brakes: 0, handling: 0, color: '#dc2626' };
      return {
        ...prev,
        cash: prev.cash - cost,
        vehicleUpgrades: {
          ...prev.vehicleUpgrades,
          [type]: {
            ...current,
            [system]: Math.min(3, current[system] + 1),
          },
        },
      };
    });
  };

  // Change Paint Color in Garage
  const handleChangeColor = (type: VehicleType, color: string) => {
    setStats((prev) => {
      const current = prev.vehicleUpgrades[type] || { engine: 0, brakes: 0, handling: 0, color: '#dc2626' };
      return {
        ...prev,
        vehicleUpgrades: {
          ...prev.vehicleUpgrades,
          [type]: {
            ...current,
            color,
          },
        },
      };
    });
  };

  // Teleport Player / Car
  const handleTeleport = (x: number, z: number) => {
    if (vehiclePhysicsRef.current) {
      vehiclePhysicsRef.current.teleport(x, z, 0);
    }
  };

  // Reset Car to Highway
  const handleResetCar = () => {
    if (vehiclePhysicsRef.current) {
      vehiclePhysicsRef.current.teleport(60, 24, 0);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WEBGL ENGINE VIEWPORT */}
      <GameCanvas
        stats={stats}
        controls={controls}
        settings={stats.settings}
        weather={weather}
        isGameActive={isGameActive}
        isPaused={isPaused}
        onTelemetryUpdate={setTelemetry}
        onMissionReward={handleMissionReward}
        missionManagerRef={missionMgrRef}
        cameraManagerRef={cameraMgrRef}
        vehiclePhysicsRef={vehiclePhysicsRef}
        playerCharRef={playerCharRef}
      />

      {/* TITLE SCREEN (When not playing yet) */}
      {!isGameActive && (
        <TitleScreen
          onStartGame={() => {
            setIsGameActive(true);
            sounds.init();
            sounds.resume();
          }}
          onOpenGarage={() => setGarageOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* IN-GAME HUD OVERLAYS (When playing) */}
      {isGameActive && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden">
          {/* TOP BAR CLUSTER */}
          <HeaderBar
            cash={stats.cash}
            weather={weather}
            cameraMode={cameraMode}
            isMuted={isMuted}
            onOpenSettings={() => setSettingsOpen(true)}
            onPause={() => setIsPaused(true)}
            onCycleWeather={handleCycleWeather}
            onToggleMute={handleToggleMute}
            onToggleCamera={handleToggleCamera}
            onOpenGarage={() => setGarageOpen(true)}
          />

          {/* TOP-LEFT MINIMAP & MISSION BANNER CLUSTERS (as in screenshot) */}
          <div className="absolute top-16 left-3 sm:left-6 flex flex-col space-y-2.5 pointer-events-auto">
            <Minimap
              playerPos={telemetry.playerPos}
              playerHeading={telemetry.playerHeading}
              targetPos={telemetry.targetPos}
              trafficPositions={telemetry.trafficPositions}
              onClick={() => setMapOpen(true)}
            />

            <MissionCard
              title={telemetry.activeMissionTitle}
              targetLabel={telemetry.targetLabel}
              distanceMeters={telemetry.distanceMeters}
              timeRemaining={telemetry.timeRemaining}
              onClick={() => setMissionsOpen(true)}
            />
          </div>

          {/* REWARD POPUP TOAST */}
          {rewardToast && (
            <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-50">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 px-6 py-2.5 rounded-2xl shadow-2xl font-black text-sm flex items-center space-x-2 animate-bounce border-2 border-white">
                <span>🏆</span>
                <span>{rewardToast.title}</span>
                <span className="font-mono text-base">+${rewardToast.amount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* BOTTOM-CENTER SPEEDOMETER / TACHOMETER */}
          <div className="w-full flex justify-center pb-2 pointer-events-none">
            {telemetry.isPlayerInVehicle && (
              <Speedometer
                speedKmH={telemetry.speedKmH}
                rpm={telemetry.rpm}
                gear={telemetry.gear}
                isBraking={telemetry.isBraking}
                isInReverse={telemetry.isInReverse}
              />
            )}
          </div>

          {/* TOUCH CONTROLS & LEFT ACTION CHIPS */}
          <TouchControls
            controls={controls}
            setControls={setControls}
            isPlayerInVehicle={telemetry.isPlayerInVehicle}
            onOpenGarage={() => setGarageOpen(true)}
            onOpenMissions={() => setMissionsOpen(true)}
            onOpenMap={() => setMapOpen(true)}
            onOpenRewards={() => {
              confetti({ particleCount: 60, spread: 50 });
              setRewardToast({ amount: 5000, title: 'Daily Explorer Bonus!' });
              setStats((prev) => ({ ...prev, cash: prev.cash + 5000 }));
              setTimeout(() => setRewardToast(null), 3000);
            }}
            onEnterExitVehicle={handleEnterExitVehicle}
          />
        </div>
      )}

      {/* MODALS */}
      {garageOpen && (
        <GarageModal
          stats={stats}
          onClose={() => setGarageOpen(false)}
          onSelectVehicle={handleSelectVehicle}
          onUpgradeVehicle={handleUpgradeVehicle}
          onChangeColor={handleChangeColor}
        />
      )}

      {missionsOpen && (
        <MissionsModal
          missions={missionMgrRef.current?.missions || INITIAL_MISSIONS}
          activeMissionId={missionMgrRef.current?.activeMission?.id}
          onSelectMission={(id) => {
            if (missionMgrRef.current) {
              missionMgrRef.current.startMission(id);
            }
          }}
          onClose={() => setMissionsOpen(false)}
        />
      )}

      {mapOpen && (
        <FullMapModal
          playerPos={telemetry.playerPos}
          onTeleport={handleTeleport}
          onClose={() => setMapOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={stats.settings}
          onUpdateSettings={(newSettings) => {
            setStats((prev) => ({
              ...prev,
              settings: { ...prev.settings, ...newSettings },
            }));
          }}
          onResetSave={() => {
            const fresh = SaveSystem.reset();
            setStats(fresh);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestartCar={handleResetCar}
          onOpenGarage={() => {
            setIsPaused(false);
            setGarageOpen(true);
          }}
          onOpenMap={() => {
            setIsPaused(false);
            setMapOpen(true);
          }}
          onOpenSettings={() => {
            setIsPaused(false);
            setSettingsOpen(true);
          }}
        />
      )}
    </div>
  );
}
