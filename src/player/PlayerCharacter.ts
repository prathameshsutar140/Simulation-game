import * as THREE from 'three';
import { ControlState } from '../types/game';

export class PlayerCharacter {
  public group: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public heading: number = 0;
  public isInVehicle: boolean = true;

  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private armL: THREE.Mesh;
  private armR: THREE.Mesh;
  private walkTime: number = 0;
  private verticalVelocity: number = 0;
  private isGrounded: boolean = true;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'player-character';

    // Stylish urban outfit: black jacket, denim jeans, white sneakers
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.32), jacketMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    this.group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), skinMat);
    head.position.y = 1.76;
    this.group.add(head);

    // Aviator sunglasses
    const shadesMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.1 });
    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.08), shadesMat);
    shades.position.set(0, 1.76, 0.18);
    this.group.add(shades);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.18, 0.75, 0.18);
    this.legL = new THREE.Mesh(legGeom, jeansMat);
    this.legL.position.set(-0.15, 0.45, 0);
    this.legL.castShadow = true;

    this.legR = new THREE.Mesh(legGeom, jeansMat);
    this.legR.position.set(0.15, 0.45, 0);
    this.legR.castShadow = true;
    this.group.add(this.legL, this.legR);

    // Shoes
    const shoeGeom = new THREE.BoxGeometry(0.2, 0.12, 0.28);
    const shoeL = new THREE.Mesh(shoeGeom, shoeMat);
    shoeL.position.set(0, -0.36, 0.04);
    this.legL.add(shoeL);
    const shoeR = shoeL.clone();
    this.legR.add(shoeR);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.14, 0.65, 0.14);
    this.armL = new THREE.Mesh(armGeom, jacketMat);
    this.armL.position.set(-0.38, 1.1, 0);

    this.armR = new THREE.Mesh(armGeom, jacketMat);
    this.armR.position.set(0.38, 1.1, 0);
    this.group.add(this.armL, this.armR);

    // Start hidden inside car
    this.group.visible = false;
  }

  public exitVehicle(carPos: THREE.Vector3, carHeading: number) {
    this.isInVehicle = false;
    this.group.visible = true;

    // Spawn 1.8m to the left of the car
    const sideX = -Math.cos(carHeading) * 1.8;
    const sideZ = Math.sin(carHeading) * 1.8;
    this.position.set(carPos.x + sideX, 0, carPos.z + sideZ);
    this.heading = carHeading;
    this.group.position.copy(this.position);
    this.group.rotation.set(0, this.heading, 0);
  }

  public enterVehicle() {
    this.isInVehicle = true;
    this.group.visible = false;
  }

  public update(dt: number, controls: ControlState, cameraYaw: number) {
    if (this.isInVehicle) return;

    const clampedDt = Math.min(dt, 0.05);

    // Movement vectors based on camera angle
    let moveX = 0;
    let moveZ = 0;

    if (controls.throttle > 0.1) {
      moveX += Math.sin(cameraYaw);
      moveZ += Math.cos(cameraYaw);
    }
    if (controls.brake > 0.1) {
      moveX -= Math.sin(cameraYaw);
      moveZ -= Math.cos(cameraYaw);
    }
    if (controls.steer < -0.1) {
      moveX -= Math.cos(cameraYaw);
      moveZ += Math.sin(cameraYaw);
    }
    if (controls.steer > 0.1) {
      moveX += Math.cos(cameraYaw);
      moveZ -= Math.sin(cameraYaw);
    }

    const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01;
    const speed = controls.run ? 7.5 : 3.5; // m/s

    if (isMoving) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const normX = (moveX / len);
      const normZ = (moveZ / len);

      this.position.x += normX * speed * clampedDt;
      this.position.z += normZ * speed * clampedDt;

      const targetHeading = Math.atan2(normX, normZ);
      this.heading = THREE.MathUtils.damp(this.heading, targetHeading, 12, clampedDt);

      this.walkTime += clampedDt * (controls.run ? 14 : 8);
      const swing = Math.sin(this.walkTime) * 0.6;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
      this.armL.rotation.x = -swing;
      this.armR.rotation.x = swing;
    } else {
      this.legL.rotation.x = THREE.MathUtils.damp(this.legL.rotation.x, 0, 10, clampedDt);
      this.legR.rotation.x = THREE.MathUtils.damp(this.legR.rotation.x, 0, 10, clampedDt);
      this.armL.rotation.x = THREE.MathUtils.damp(this.armL.rotation.x, 0, 10, clampedDt);
      this.armR.rotation.x = THREE.MathUtils.damp(this.armR.rotation.x, 0, 10, clampedDt);
    }

    // Jump physics
    if (controls.jump && this.isGrounded) {
      this.verticalVelocity = 6.5;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.verticalVelocity -= 18 * clampedDt;
      this.position.y += this.verticalVelocity * clampedDt;
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    this.group.position.copy(this.position);
    this.group.rotation.set(0, this.heading, 0);
  }
}
