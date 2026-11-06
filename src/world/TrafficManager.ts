import * as THREE from 'three';

interface TrafficVehicle {
  group: THREE.Group;
  speed: number;
  targetSpeed: number;
  laneZDirection: number; // 1 or -1
  laneX: number;
  box: THREE.Box3;
  type: 'sedan' | 'suv' | 'bus' | 'taxi';
}

export class TrafficManager {
  private scene: THREE.Scene;
  public vehicles: TrafficVehicle[] = [];
  public colliderBoxes: THREE.Box3[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnTraffic();
  }

  private createTrafficCarMesh(type: 'sedan' | 'suv' | 'bus' | 'taxi', color: number): THREE.Group {
    const car = new THREE.Group();
    const isBus = type === 'bus';
    const isSUV = type === 'suv';

    const length = isBus ? 10.5 : isSUV ? 4.8 : 4.4;
    const width = isBus ? 2.8 : 2.0;
    const height = isBus ? 3.2 : isSUV ? 1.8 : 1.35;

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: type === 'taxi' ? 0xeab308 : color,
      metalness: 0.6,
      roughness: 0.3,
    });
    const bodyGeom = new THREE.BoxGeometry(width, height * 0.55, length);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = height * 0.4;
    body.castShadow = true;
    car.add(body);

    // Cabin
    const cabinMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const cabinGeom = new THREE.BoxGeometry(width * 0.88, height * 0.5, length * (isBus ? 0.9 : 0.55));
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(0, height * 0.78, isBus ? 0 : -length * 0.05);
    car.add(cabin);

    // Headlights
    const hlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 2.5,
    });
    const hlGeom = new THREE.BoxGeometry(0.35, 0.15, 0.1);
    const hlL = new THREE.Mesh(hlGeom, hlMat);
    hlL.position.set(-width * 0.38, height * 0.4, length * 0.505);
    const hlR = hlL.clone();
    hlR.position.x = width * 0.38;
    car.add(hlL, hlR);

    // Taillights
    const tlMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xef4444,
      emissiveIntensity: 3.0,
    });
    const tlGeom = new THREE.BoxGeometry(0.4, 0.15, 0.1);
    const tlL = new THREE.Mesh(tlGeom, tlMat);
    tlL.position.set(-width * 0.38, height * 0.42, -length * 0.505);
    const tlR = tlL.clone();
    tlR.position.x = width * 0.38;
    car.add(tlL, tlR);

    // Bus sign ("22 CENTRAL STATION")
    if (isBus) {
      const busSignCanvas = document.createElement('canvas');
      busSignCanvas.width = 256;
      busSignCanvas.height = 64;
      const bCtx = busSignCanvas.getContext('2d')!;
      bCtx.fillStyle = '#0f172a';
      bCtx.fillRect(0, 0, 256, 64);
      bCtx.fillStyle = '#facc15';
      bCtx.font = 'bold 24px monospace';
      bCtx.fillText('22 CENTRAL STN', 20, 40);

      const signTex = new THREE.CanvasTexture(busSignCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.45), signMat);
      signMesh.position.set(0, height * 0.95, length * 0.505);
      car.add(signMesh);
    }

    return car;
  }

  private spawnTraffic() {
    const trafficConfigs: { x: number; z: number; dir: number; type: 'sedan' | 'suv' | 'bus' | 'taxi'; color: number }[] = [
      // Southbound lanes on Coastal Highway (x: 52, 57)
      { x: 53, z: -280, dir: 1, type: 'sedan', color: 0x3b82f6 },
      { x: 57, z: -190, dir: 1, type: 'taxi', color: 0xeab308 },
      { x: 53, z: -80, dir: 1, type: 'bus', color: 0x2563eb }, // The 22 Central Station bus in screenshot!
      { x: 57, z: 40, dir: 1, type: 'suv', color: 0x475569 },
      { x: 53, z: 160, dir: 1, type: 'sedan', color: 0xe2e8f0 },

      // Northbound lanes on Coastal Highway (x: 63, 67)
      { x: 63, z: 280, dir: -1, type: 'taxi', color: 0xeab308 },
      { x: 67, z: 180, dir: -1, type: 'sedan', color: 0x059669 },
      { x: 63, z: 70, dir: -1, type: 'suv', color: 0xd97706 },
      { x: 67, z: -60, dir: -1, type: 'sedan', color: 0x9333ea },
      { x: 63, z: -170, dir: -1, type: 'bus', color: 0x1d4ed8 },

      // Downtown boulevard traffic
      { x: -95, z: -120, dir: 1, type: 'sedan', color: 0x0284c7 },
      { x: -105, z: 120, dir: -1, type: 'taxi', color: 0xeab308 },
      { x: -95, z: 220, dir: 1, type: 'suv', color: 0x64748b },
    ];

    trafficConfigs.forEach((cfg) => {
      const mesh = this.createTrafficCarMesh(cfg.type, cfg.color);
      mesh.position.set(cfg.x, 0, cfg.z);
      mesh.rotation.y = cfg.dir === 1 ? 0 : Math.PI;
      this.scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      this.vehicles.push({
        group: mesh,
        speed: 12 + Math.random() * 4, // m/s (~45-55 km/h)
        targetSpeed: 14,
        laneZDirection: cfg.dir,
        laneX: cfg.x,
        box,
        type: cfg.type,
      });
      this.colliderBoxes.push(box);
    });
  }

  public update(dt: number, playerPos: THREE.Vector3) {
    const clampedDt = Math.min(dt, 0.05);

    this.vehicles.forEach((v) => {
      // Forward direction: Z axis moves along laneZDirection
      const forwardZ = v.laneZDirection;

      // Distance check to player vehicle to brake and yield
      const distToPlayer = v.group.position.distanceTo(playerPos);
      const isPlayerAheadInLane =
        Math.abs(v.group.position.x - playerPos.x) < 4.0 &&
        (playerPos.z - v.group.position.z) * forwardZ > 0 &&
        distToPlayer < 22;

      if (isPlayerAheadInLane) {
        v.targetSpeed = 0; // stop for player
      } else {
        v.targetSpeed = 12 + (v.type === 'bus' ? -2 : 2);
      }

      v.speed = THREE.MathUtils.damp(v.speed, v.targetSpeed, 6, clampedDt);
      v.group.position.z += forwardZ * v.speed * clampedDt;

      // Loop around city bounds
      if (forwardZ === 1 && v.group.position.z > 360) {
        v.group.position.z = -360;
      } else if (forwardZ === -1 && v.group.position.z < -360) {
        v.group.position.z = 360;
      }

      // Update collision box
      v.box.setFromObject(v.group);
    });
  }
}
