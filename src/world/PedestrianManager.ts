import * as THREE from 'three';

interface PedestrianNPC {
  group: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
  speed: number;
  dirZ: number;
  walkCycle: number;
}

export class PedestrianManager {
  private scene: THREE.Scene;
  private pedestrians: PedestrianNPC[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnPedestrians();
  }

  private createPedestrianMesh(color: number, pantsColor: number): {
    group: THREE.Group;
    legL: THREE.Mesh;
    legR: THREE.Mesh;
    armL: THREE.Mesh;
    armR: THREE.Mesh;
  } {
    const group = new THREE.Group();

    // Torso / Shirt
    const torsoGeom = new THREE.BoxGeometry(0.5, 0.7, 0.3);
    const shirtMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const torso = new THREE.Mesh(torsoGeom, shirtMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const headGeom = new THREE.SphereGeometry(0.18, 12, 12);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.72;
    group.add(head);

    // Hair
    const hairGeom = new THREE.SphereGeometry(0.19, 8, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.set(0, 1.78, -0.02);
    group.add(hair);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.16, 0.7, 0.16);
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
    const legL = new THREE.Mesh(legGeom, pantsMat);
    legL.position.set(-0.14, 0.45, 0);
    legL.castShadow = true;

    const legR = new THREE.Mesh(legGeom, pantsMat);
    legR.position.set(0.14, 0.45, 0);
    legR.castShadow = true;
    group.add(legL, legR);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.12, 0.6, 0.12);
    const armL = new THREE.Mesh(armGeom, shirtMat);
    armL.position.set(-0.35, 1.1, 0);

    const armR = new THREE.Mesh(armGeom, shirtMat);
    armR.position.set(0.35, 1.1, 0);
    group.add(armL, armR);

    return { group, legL, legR, armL, armR };
  }

  private spawnPedestrians() {
    const locations = [
      // Sidewalk near Mall & Highway
      { x: 76.5, z: -85, dir: 1, c: 0xef4444, p: 0x1e293b },
      { x: 76.5, z: -60, dir: -1, c: 0x3b82f6, p: 0x475569 },
      { x: 76.5, z: -30, dir: 1, c: 0x10b981, p: 0x0f172a },
      { x: 76.5, z: 15, dir: -1, c: 0xf59e0b, p: 0x18181b },
      { x: 76.5, z: 70, dir: 1, c: 0x8b5cf6, p: 0x334155 },

      // West Sidewalk
      { x: 43.5, z: -110, dir: 1, c: 0xec4899, p: 0x1e293b },
      { x: 43.5, z: -40, dir: -1, c: 0x06b6d4, p: 0x374151 },
      { x: 43.5, z: 50, dir: 1, c: 0x84cc16, p: 0x111827 },
      { x: 43.5, z: 120, dir: -1, c: 0xf43f5e, p: 0x1e293b },
    ];

    locations.forEach((loc) => {
      const { group, legL, legR, armL, armR } = this.createPedestrianMesh(loc.c, loc.p);
      group.position.set(loc.x, 0.2, loc.z);
      group.rotation.y = loc.dir === 1 ? 0 : Math.PI;
      this.scene.add(group);

      this.pedestrians.push({
        group,
        legL,
        legR,
        armL,
        armR,
        speed: 1.2 + Math.random() * 0.4,
        dirZ: loc.dir,
        walkCycle: Math.random() * Math.PI * 2,
      });
    });
  }

  public update(dt: number) {
    const clampedDt = Math.min(dt, 0.05);

    this.pedestrians.forEach((p) => {
      p.walkCycle += clampedDt * 6.5;
      p.group.position.z += p.dirZ * p.speed * clampedDt;

      // Limb swing kinematics
      const swing = Math.sin(p.walkCycle) * 0.45;
      p.legL.rotation.x = swing;
      p.legR.rotation.x = -swing;
      p.armL.rotation.x = -swing * 0.8;
      p.armR.rotation.x = swing * 0.8;

      // Turn around at sidewalk end
      if (p.group.position.z > 220) {
        p.dirZ = -1;
        p.group.rotation.y = Math.PI;
      } else if (p.group.position.z < -220) {
        p.dirZ = 1;
        p.group.rotation.y = 0;
      }
    });
  }
}
