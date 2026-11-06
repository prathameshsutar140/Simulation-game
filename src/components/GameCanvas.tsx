import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ControlState, GameSettings, PlayerStats, VehicleType, WeatherType } from '../types/game';
import { buildCity, CityData } from '../world/CityBuilder';
import { WeatherSystem } from '../world/WeatherSystem';
import { TrafficManager } from '../world/TrafficManager';
import { PedestrianManager } from '../world/PedestrianManager';
import { createVehicleModel, VehicleMeshes } from '../vehicles/VehicleModel';
import { VehiclePhysics } from '../vehicles/VehiclePhysics';
import { PlayerCharacter } from '../player/PlayerCharacter';
import { CameraManager } from '../systems/CameraManager';
import { MissionManager } from '../systems/MissionManager';

interface GameCanvasProps {
  stats: PlayerStats;
  controls: ControlState;
  settings: GameSettings;
  weather: WeatherType;
  isGameActive: boolean;
  isPaused: boolean;
  onTelemetryUpdate: (telemetry: {
    speedKmH: number;
    rpm: number;
    gear: string;
    isBraking: boolean;
    isInReverse: boolean;
    playerPos: THREE.Vector3;
    playerHeading: number;
    targetPos: { x: number; z: number } | null;
    trafficPositions: THREE.Vector3[];
    distanceMeters: number;
    activeMissionTitle: string;
    targetLabel: string;
    timeRemaining: number;
    isPlayerInVehicle: boolean;
  }) => void;
  onMissionReward: (reward: number) => void;
  missionManagerRef: React.MutableRefObject<MissionManager | null>;
  cameraManagerRef: React.MutableRefObject<CameraManager | null>;
  vehiclePhysicsRef: React.MutableRefObject<VehiclePhysics | null>;
  playerCharRef: React.MutableRefObject<PlayerCharacter | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stats,
  controls,
  settings,
  weather,
  isGameActive,
  isPaused,
  onTelemetryUpdate,
  onMissionReward,
  missionManagerRef,
  cameraManagerRef,
  vehiclePhysicsRef,
  playerCharRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep state across renders without rebuilding scene
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  const weatherRef = useRef(weather);
  weatherRef.current = weather;

  const statsRef = useRef(stats);
  statsRef.current = stats;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isGameActiveRef = useRef(isGameActive);
  isGameActiveRef.current = isGameActive;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera Manager
    const camMgr = new CameraManager(settings.cameraFov || 65);
    cameraManagerRef.current = camMgr;

    // Build City Environment
    const cityData: CityData = buildCity();
    scene.add(cityData.group);

    // Weather System
    const weatherSys = new WeatherSystem(scene, cityData.streetLights);
    weatherSys.setWeather(weatherRef.current);

    // Traffic System
    const trafficMgr = new TrafficManager(scene);

    // Pedestrian System
    const pedestrianMgr = new PedestrianManager(scene);

    // Initial Vehicle Setup (Starts on coastal highway at x: 60, z: 24)
    const initialCarConfig = {
      id: statsRef.current.currentVehicleId,
      name: 'Apex GT Supercar',
      category: 'Hypercar',
      price: 95000,
      unlocked: true,
      color: statsRef.current.vehicleUpgrades[statsRef.current.currentVehicleId]?.color || '#dc2626',
      maxSpeed: 340,
      acceleration: 96,
      braking: 92,
      handling: 95,
      weight: 1350,
      driveType: 'AWD' as const,
      upgrades: statsRef.current.vehicleUpgrades[statsRef.current.currentVehicleId] || { engine: 2, brakes: 2, handling: 2 },
    };

    let vehicleMeshes: VehicleMeshes = createVehicleModel(initialCarConfig.id, initialCarConfig.color);
    scene.add(vehicleMeshes.root);

    let vehiclePhysics = new VehiclePhysics(initialCarConfig, vehicleMeshes, new THREE.Vector3(60, 0, 30));
    vehiclePhysicsRef.current = vehiclePhysics;

    // Player On-Foot Character
    const playerChar = new PlayerCharacter();
    scene.add(playerChar.group);
    playerCharRef.current = playerChar;

    // Mission System
    const missionMgr = new MissionManager(scene);
    missionMgr.setOnComplete((reward) => {
      onMissionReward(reward);
    });
    missionManagerRef.current = missionMgr;

    // Clock
    const clock = new THREE.Clock();
    let frameId = 0;
    let titleCamAngle = 0;

    // Software WebGL pacing helper
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    // MAIN GAME LOOP
    const tick = () => {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      // Check for vehicle model swap (if user chose another car in garage)
      if (statsRef.current.currentVehicleId !== vehiclePhysics.config.id) {
        scene.remove(vehicleMeshes.root);
        const newId = statsRef.current.currentVehicleId;
        const newColor = statsRef.current.vehicleUpgrades[newId]?.color || '#dc2626';
        vehicleMeshes = createVehicleModel(newId, newColor);
        scene.add(vehicleMeshes.root);

        const currentPos = vehiclePhysics.position.clone();
        const currentHeading = vehiclePhysics.heading;

        const newConfig = {
          ...initialCarConfig,
          id: newId,
          color: newColor,
          upgrades: statsRef.current.vehicleUpgrades[newId] || { engine: 1, brakes: 1, handling: 1 },
        };
        vehiclePhysics = new VehiclePhysics(newConfig, vehicleMeshes, currentPos);
        vehiclePhysics.heading = currentHeading;
        vehiclePhysicsRef.current = vehiclePhysics;
      }

      // Check paint color update
      const targetColor = statsRef.current.vehicleUpgrades[vehiclePhysics.config.id]?.color;
      if (targetColor && vehicleMeshes.bodyMaterial) {
        vehicleMeshes.bodyMaterial.color.set(targetColor);
      }

      // Check weather sync
      if (weatherSys.currentWeather !== weatherRef.current) {
        weatherSys.setWeather(weatherRef.current);
      }

      // 1. ANIMATE AMBIENT PROPS (Ferris Wheel & Helicopter & Water)
      cityData.ferrisWheelGroup.rotation.x += dt * 0.25;

      // Helicopter patrol orbit around downtown
      cityData.helicopterGroup.position.x = Math.sin(clock.getElapsedTime() * 0.15) * 140 - 30;
      cityData.helicopterGroup.position.z = Math.cos(clock.getElapsedTime() * 0.15) * 140;
      cityData.helicopterGroup.rotation.y = clock.getElapsedTime() * 0.15 + Math.PI / 2;
      const heliRotor = cityData.helicopterGroup.getObjectByName('mainRotor');
      if (heliRotor) heliRotor.rotation.y += dt * 35;

      // Animated ocean wave subtle ripple
      cityData.waterMesh.position.y = -0.2 + Math.sin(clock.getElapsedTime() * 1.8) * 0.08;

      if (!isPausedRef.current) {
        if (!isGameActiveRef.current) {
          // TITLE SCREEN: Cinematic camera pan showcasing the city skyline & supercar
          titleCamAngle += dt * 0.25;
          const orbitDist = 9.5;
          const carPos = vehiclePhysics.position;
          camMgr.camera.position.set(
            carPos.x + Math.sin(titleCamAngle) * orbitDist,
            carPos.y + 2.4,
            carPos.z + Math.cos(titleCamAngle) * orbitDist
          );
          camMgr.camera.lookAt(carPos.x, carPos.y + 1.2, carPos.z);
        } else {
          // ACTIVE GAMEPLAY
          // Combine all colliders (buildings + traffic vehicles)
          const allColliders = [...cityData.colliders, ...trafficMgr.colliderBoxes];

          // Vehicle physics update (or freeze if on foot)
          const activeControls = playerChar.isInVehicle
            ? controlsRef.current
            : { ...controlsRef.current, throttle: 0, brake: 0, steer: 0, handbrake: true };

          const physicsState = vehiclePhysics.update(dt, activeControls, allColliders);

          // Player on-foot character update
          playerChar.update(dt, controlsRef.current, camMgr.orbitYaw);

          // Active subject (Car or Character)
          const activePos = playerChar.isInVehicle ? vehiclePhysics.position : playerChar.position;
          const activeHeading = playerChar.isInVehicle ? vehiclePhysics.heading : playerChar.heading;

          // Camera follow update
          camMgr.update(dt, activePos, activeHeading, physicsState.speedKmH, !playerChar.isInVehicle);

          // Traffic & Pedestrians AI
          trafficMgr.update(dt, activePos);
          pedestrianMgr.update(dt);

          // Weather particles follow player
          weatherSys.update(dt, activePos);

          // Mission System progress
          const missionStatus = missionMgr.update(dt, activePos);

          // Telemetry HUD data update
          const activeCp = missionMgr.activeMission?.checkpoints[missionMgr.currentCheckpointIndex];
          onTelemetryUpdate({
            speedKmH: physicsState.speedKmH,
            rpm: physicsState.rpm,
            gear: physicsState.gear,
            isBraking: physicsState.isBraking,
            isInReverse: physicsState.isInReverse,
            playerPos: activePos,
            playerHeading: activeHeading,
            targetPos: activeCp ? { x: activeCp.x, z: activeCp.z } : null,
            trafficPositions: trafficMgr.vehicles.map((v) => v.group.position),
            distanceMeters: missionStatus.distanceMeters,
            activeMissionTitle: missionStatus.activeTitle,
            targetLabel: missionStatus.targetLabel,
            timeRemaining: missionStatus.timeRemaining,
            isPlayerInVehicle: playerChar.isInVehicle,
          });
        }
      }

      // Render frame
      renderer.render(scene, camMgr.camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    // Window Resize Handler
    const handleResize = () => {
      camMgr.camera.aspect = window.innerWidth / window.innerHeight;
      camMgr.camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full overflow-hidden" />;
};
