import * as THREE from 'three';
import { CameraMode } from '../types/game';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraMode = 'chase';

  private currentPos: THREE.Vector3 = new THREE.Vector3(60, 4, 30);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(60, 1.2, 0);

  public orbitYaw: number = 0;
  public orbitPitch: number = 0.25;
  private shakeAmount: number = 0;

  constructor(fov: number = 65) {
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.camera.position.copy(this.currentPos);
  }

  public triggerShake(intensity: number = 0.4) {
    this.shakeAmount = Math.max(this.shakeAmount, intensity);
  }

  public toggleMode(): CameraMode {
    const modes: CameraMode[] = ['chase', 'hood', 'cinematic', 'orbit'];
    const nextIdx = (modes.indexOf(this.mode) + 1) % modes.length;
    this.mode = modes[nextIdx];
    return this.mode;
  }

  public update(
    dt: number,
    targetPos: THREE.Vector3,
    targetHeading: number,
    speedKmH: number,
    isPlayerOnFoot: boolean = false
  ) {
    const clampedDt = Math.min(dt, 0.05);

    // Camera shake decay
    if (this.shakeAmount > 0.001) {
      this.shakeAmount = THREE.MathUtils.damp(this.shakeAmount, 0, 8, clampedDt);
    }
    const shakeOffsetX = (Math.random() - 0.5) * this.shakeAmount;
    const shakeOffsetY = (Math.random() - 0.5) * this.shakeAmount;

    let targetCameraPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (isPlayerOnFoot) {
      // 3rd Person Character Follow
      const dist = 4.2;
      const height = 2.4;
      targetCameraPos.set(
        targetPos.x - Math.sin(this.orbitYaw) * dist,
        targetPos.y + height,
        targetPos.z - Math.cos(this.orbitYaw) * dist
      );
      targetLookAt.set(targetPos.x, targetPos.y + 1.4, targetPos.z);
    } else {
      switch (this.mode) {
        case 'chase': {
          // Dynamic vehicle chase cam - exactly matches screenshot!
          const speedFactor = Math.min(1.0, speedKmH / 220);
          const followDist = 6.2 + speedFactor * 1.8;
          const followHeight = 2.2 + speedFactor * 0.4;

          const behindX = -Math.sin(targetHeading) * followDist;
          const behindZ = -Math.cos(targetHeading) * followDist;

          targetCameraPos.set(
            targetPos.x + behindX,
            targetPos.y + followHeight,
            targetPos.z + behindZ
          );

          targetLookAt.set(
            targetPos.x + Math.sin(targetHeading) * 12,
            targetPos.y + 1.2,
            targetPos.z + Math.cos(targetHeading) * 12
          );

          // Dynamic FOV speed rush
          this.camera.fov = 65 + speedFactor * 14;
          this.camera.updateProjectionMatrix();
          break;
        }

        case 'hood': {
          // First-person bonnet / dash view
          const hoodOffsetX = Math.sin(targetHeading) * 1.2;
          const hoodOffsetZ = Math.cos(targetHeading) * 1.2;

          targetCameraPos.set(
            targetPos.x + hoodOffsetX,
            targetPos.y + 1.1,
            targetPos.z + hoodOffsetZ
          );

          targetLookAt.set(
            targetPos.x + Math.sin(targetHeading) * 35,
            targetPos.y + 1.0,
            targetPos.z + Math.cos(targetHeading) * 35
          );

          this.camera.fov = 75;
          this.camera.updateProjectionMatrix();
          break;
        }

        case 'cinematic': {
          // Low-angle dramatic side-chase
          const sideX = Math.cos(targetHeading + 0.4) * 5.5;
          const sideZ = -Math.sin(targetHeading + 0.4) * 5.5;

          targetCameraPos.set(
            targetPos.x + sideX,
            targetPos.y + 1.1,
            targetPos.z + sideZ
          );

          targetLookAt.set(targetPos.x, targetPos.y + 0.8, targetPos.z);
          this.camera.fov = 55;
          this.camera.updateProjectionMatrix();
          break;
        }

        case 'orbit': {
          // 360 degree player orbit
          const orbitDist = 7.0;
          targetCameraPos.set(
            targetPos.x + Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch) * orbitDist,
            targetPos.y + Math.sin(this.orbitPitch) * orbitDist + 1.5,
            targetPos.z + Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch) * orbitDist
          );
          targetLookAt.set(targetPos.x, targetPos.y + 1.0, targetPos.z);
          break;
        }
      }
    }

    // Smooth spring dampening (silky smooth camera glide)
    const smoothSpeed = this.mode === 'hood' ? 24 : 10;
    this.currentPos.x = THREE.MathUtils.damp(this.currentPos.x, targetCameraPos.x, smoothSpeed, clampedDt);
    this.currentPos.y = THREE.MathUtils.damp(this.currentPos.y, targetCameraPos.y, smoothSpeed, clampedDt);
    this.currentPos.z = THREE.MathUtils.damp(this.currentPos.z, targetCameraPos.z, smoothSpeed, clampedDt);

    this.currentLookAt.x = THREE.MathUtils.damp(this.currentLookAt.x, targetLookAt.x, smoothSpeed, clampedDt);
    this.currentLookAt.y = THREE.MathUtils.damp(this.currentLookAt.y, targetLookAt.y, smoothSpeed, clampedDt);
    this.currentLookAt.z = THREE.MathUtils.damp(this.currentLookAt.z, targetLookAt.z, smoothSpeed, clampedDt);

    this.camera.position.set(
      this.currentPos.x + shakeOffsetX,
      this.currentPos.y + shakeOffsetY,
      this.currentPos.z
    );
    this.camera.lookAt(this.currentLookAt);
  }
}
