import * as THREE from 'three';
import { ControlState, VehicleConfig } from '../types/game';
import { VehicleMeshes } from './VehicleModel';
import { sounds } from '../audio/SoundManager';

export interface VehiclePhysicsState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  speedKmH: number;
  rpm: number;
  gear: string; // 'R', 'N', '1', '2', '3', '4', '5', '6', 'D'
  steerAngle: number;
  slipRatio: number;
  driftAngle: number;
  isBraking: boolean;
  isInReverse: boolean;
}

// Gear speed thresholds for 6-speed transmission (km/h)
const GEAR_RATIOS = [
  { gear: '1', max: 55, minRpm: 1200, maxRpm: 8200 },
  { gear: '2', max: 95, minRpm: 2500, maxRpm: 8200 },
  { gear: '3', max: 145, minRpm: 3200, maxRpm: 8400 },
  { gear: '4', max: 195, minRpm: 3800, maxRpm: 8400 },
  { gear: '5', max: 255, minRpm: 4200, maxRpm: 8500 },
  { gear: '6', max: 340, minRpm: 4600, maxRpm: 8800 },
];

export class VehiclePhysics {
  public config: VehicleConfig;
  public meshes: VehicleMeshes;

  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public heading: number = 0; // Yaw angle in radians
  public speed: number = 0; // m/s forward speed (positive = forward, negative = reverse)
  public lateralVelocity: number = 0; // m/s sideways drift

  public steerAngle: number = 0;
  public targetSteerAngle: number = 0;

  public currentGear: string = '1';
  public currentRpm: number = 900;
  public suspensionPitch: number = 0;
  public suspensionRoll: number = 0;
  public wheelSpinAngle: number = 0;

  public slipRatio: number = 0;
  private collisionCooldown: number = 0;

  // Collision bounding box
  private box: THREE.Box3 = new THREE.Box3();

  constructor(config: VehicleConfig, meshes: VehicleMeshes, initialPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    this.config = config;
    this.meshes = meshes;
    this.position.copy(initialPos);
    this.meshes.root.position.copy(this.position);
  }

  public update(dt: number, controls: ControlState, obstacles: THREE.Box3[]): VehiclePhysicsState {
    const clampedDt = Math.min(dt, 0.05);

    // Performance upgrade multipliers
    const engineUpgradeFactor = 1 + (this.config.upgrades?.engine || 0) * 0.12;
    const brakesUpgradeFactor = 1 + (this.config.upgrades?.brakes || 0) * 0.15;
    const handlingUpgradeFactor = 1 + (this.config.upgrades?.handling || 0) * 0.14;

    const maxSpeedMs = (this.config.maxSpeed * engineUpgradeFactor) / 3.6;
    const accelPower = (this.config.acceleration * 0.32 * engineUpgradeFactor);
    const brakePower = (this.config.braking * 0.42 * brakesUpgradeFactor);

    // 1. STEERING DYNAMICS
    const speedRatio = Math.min(1.0, Math.abs(this.speed) / (120 / 3.6));
    const maxSteer = (0.58 - speedRatio * 0.28) * handlingUpgradeFactor; // tighter at high speeds
    this.targetSteerAngle = -controls.steer * maxSteer;
    this.steerAngle = THREE.MathUtils.damp(this.steerAngle, this.targetSteerAngle, 12, clampedDt);

    // 2. THROTTLE, BRAKING & REVERSE
    const isBraking = controls.brake > 0.05;
    let forwardForce = 0;

    if (controls.throttle > 0.05) {
      if (this.speed >= -0.5) {
        forwardForce = controls.throttle * accelPower;
      } else {
        // Braking while going in reverse
        forwardForce = controls.throttle * brakePower;
      }
    }

    if (controls.brake > 0.05) {
      if (this.speed > 0.8) {
        // Normal braking forward
        forwardForce = -controls.brake * brakePower;
      } else {
        // Reverse gear
        forwardForce = -controls.brake * (accelPower * 0.55);
      }
    }

    // Handbrake
    if (controls.handbrake) {
      forwardForce -= Math.sign(this.speed) * (brakePower * 1.6);
    }

    // Natural drag & rolling resistance
    const drag = 0.08 * this.speed * Math.abs(this.speed);
    const rollingResistance = 1.2 * Math.sign(this.speed);

    const netAccel = forwardForce - drag - (Math.abs(this.speed) > 0.1 ? rollingResistance : 0);
    this.speed += netAccel * clampedDt;

    // Clamp max forward & reverse speeds
    this.speed = THREE.MathUtils.clamp(this.speed, -maxSpeedMs * 0.35, maxSpeedMs);
    if (Math.abs(this.speed) < 0.08 && controls.throttle < 0.05 && controls.brake < 0.05) {
      this.speed = 0;
    }

    // 3. LATERAL DRIFT & TRACTION
    const gripBase = 8.5 * handlingUpgradeFactor;
    const handbrakePenalty = controls.handbrake ? 0.35 : 1.0;
    const centripetalForce = (this.speed * this.speed * Math.tan(this.steerAngle)) / 2.8;

    if (Math.abs(centripetalForce) > gripBase * 4 || controls.handbrake) {
      this.slipRatio = THREE.MathUtils.damp(this.slipRatio, Math.min(1.0, Math.abs(centripetalForce) / 60 + (controls.handbrake ? 0.6 : 0)), 8, clampedDt);
    } else {
      this.slipRatio = THREE.MathUtils.damp(this.slipRatio, 0, 10, clampedDt);
    }

    sounds.updateScreech(this.slipRatio);

    // 4. HEADING & ROTATION
    if (Math.abs(this.speed) > 0.05) {
      const turnRate = (this.speed / 2.8) * Math.tan(this.steerAngle);
      const driftBoost = this.slipRatio * Math.sign(this.steerAngle) * 0.8;
      this.heading += (turnRate + driftBoost) * clampedDt;
    }

    // 5. POSITION DISPLACEMENT
    const forwardX = Math.sin(this.heading);
    const forwardZ = Math.cos(this.heading);
    const lateralX = Math.cos(this.heading);
    const lateralZ = -Math.sin(this.heading);

    this.position.x += (forwardX * this.speed + lateralX * this.lateralVelocity) * clampedDt;
    this.position.z += (forwardZ * this.speed + lateralZ * this.lateralVelocity) * clampedDt;

    // Lateral drift dampening
    this.lateralVelocity = THREE.MathUtils.damp(this.lateralVelocity, 0, gripBase * handbrakePenalty, clampedDt);

    // 6. COLLISION CHECK & BOUNCE
    this.collisionCooldown = Math.max(0, this.collisionCooldown - clampedDt);
    this.box.setFromObject(this.meshes.root);

    // World Boundary check (City district ~ 600m x 600m)
    const mapLimit = 290;
    if (Math.abs(this.position.x) > mapLimit || Math.abs(this.position.z) > mapLimit) {
      this.speed = -this.speed * 0.4;
      this.position.x = THREE.MathUtils.clamp(this.position.x, -mapLimit + 1, mapLimit - 1);
      this.position.z = THREE.MathUtils.clamp(this.position.z, -mapLimit + 1, mapLimit - 1);
      sounds.playCrash(Math.abs(this.speed * 3.6));
    }

    // Obstacle collisions
    if (this.collisionCooldown <= 0) {
      for (const obstacle of obstacles) {
        if (this.box.intersectsBox(obstacle)) {
          sounds.playCrash(Math.abs(this.speed * 3.6));
          this.speed = -this.speed * 0.35;
          this.position.x -= forwardX * 0.8;
          this.position.z -= forwardZ * 0.8;
          this.collisionCooldown = 0.4;
          break;
        }
      }
    }

    // 7. SUSPENSION DYNAMICS (Pitch & Roll)
    const targetPitch = THREE.MathUtils.clamp(-netAccel * 0.0035, -0.06, 0.06);
    const targetRoll = THREE.MathUtils.clamp((this.steerAngle * this.speed) * 0.004, -0.07, 0.07);
    this.suspensionPitch = THREE.MathUtils.damp(this.suspensionPitch, targetPitch, 8, clampedDt);
    this.suspensionRoll = THREE.MathUtils.damp(this.suspensionRoll, targetRoll, 8, clampedDt);

    // 8. GEARS & RPM SIMULATION
    const currentSpeedKmH = Math.abs(this.speed * 3.6);
    let matchedGear = '1';
    let targetRpm = 950;

    if (this.speed < -0.5) {
      matchedGear = 'R';
      targetRpm = 1000 + (currentSpeedKmH / 45) * 6000;
    } else {
      for (const g of GEAR_RATIOS) {
        matchedGear = g.gear;
        if (currentSpeedKmH <= g.max) {
          const ratio = currentSpeedKmH / g.max;
          targetRpm = g.minRpm + ratio * (g.maxRpm - g.minRpm);
          break;
        }
      }
    }

    if (matchedGear !== this.currentGear && matchedGear !== 'R') {
      sounds.playGearShift();
      this.currentGear = matchedGear;
    }

    targetRpm += controls.throttle * 900;
    this.currentRpm = THREE.MathUtils.damp(this.currentRpm, Math.min(8800, targetRpm), 14, clampedDt);
    const rpmRatio = (this.currentRpm - 900) / 7900;
    sounds.updateEngineSound(rpmRatio, controls.throttle, currentSpeedKmH);

    // 9. WHEEL SPIN & STEERING VISUALS
    const wheelRadius = this.config.id === 'suv' ? 0.44 : 0.38;
    this.wheelSpinAngle += (this.speed * clampedDt) / wheelRadius;

    // Front wheels steer + spin
    for (let i = 0; i < 2; i++) {
      const wheel = this.meshes.wheels[i];
      wheel.rotation.y = this.steerAngle;
      const spinNode = wheel.children[1] || wheel.children[0];
      if (spinNode) spinNode.rotation.x = this.wheelSpinAngle;
    }
    // Rear wheels only spin
    for (let i = 2; i < 4; i++) {
      const wheel = this.meshes.wheels[i];
      const spinNode = wheel.children[1] || wheel.children[0];
      if (spinNode) spinNode.rotation.x = this.wheelSpinAngle;
    }

    // 10. LIGHT VISUAL UPDATES (Taillights brighten on brake)
    if (this.meshes.taillights && this.meshes.taillights.material) {
      const mat = this.meshes.taillights.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isBraking ? 9.0 : 2.5;
    }

    // Apply transformation to Root Object
    this.meshes.root.position.copy(this.position);
    this.meshes.root.rotation.set(this.suspensionPitch, this.heading, this.suspensionRoll, 'YXZ');

    // Horn
    sounds.playHorn(controls.horn);

    return {
      position: this.position,
      rotation: this.meshes.root.rotation,
      velocity: new THREE.Vector3(forwardX * this.speed, 0, forwardZ * this.speed),
      speedKmH: Math.round(currentSpeedKmH),
      rpm: Math.round(this.currentRpm),
      gear: matchedGear,
      steerAngle: this.steerAngle,
      slipRatio: this.slipRatio,
      driftAngle: Math.abs(this.lateralVelocity),
      isBraking,
      isInReverse: this.speed < -0.5,
    };
  }

  public teleport(x: number, z: number, headingRad: number = 0) {
    this.position.set(x, 0, z);
    this.heading = headingRad;
    this.speed = 0;
    this.lateralVelocity = 0;
    this.meshes.root.position.copy(this.position);
    this.meshes.root.rotation.set(0, this.heading, 0);
  }
}
