import * as THREE from 'three';
import { Mission } from '../types/game';
import { sounds } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1-city-mall',
    title: 'Reach the City Mall',
    category: 'delivery',
    description: 'Cruise along the coastal highway to the grand Metro City Mall entrance.',
    reward: 15000,
    checkpoints: [
      { x: 60, z: -100, radius: 10, label: 'Highway North' },
      { x: 60, z: -180, radius: 10, label: 'Midway Overpass' },
      { x: 85, z: -70, radius: 8, label: 'City Mall Plaza' },
    ],
    completed: false,
  },
  {
    id: 'm2-coastal-sprint',
    title: 'Coastal Checkpoint Sprint',
    category: 'race',
    description: 'Full throttle sprint down the 4-lane ocean boulevard through 4 checkpoints.',
    reward: 22000,
    timeLimit: 50,
    checkpoints: [
      { x: 56, z: 220, radius: 12, label: 'South Gate' },
      { x: 56, z: 80, radius: 12, label: 'Palm Way' },
      { x: 56, z: -60, radius: 12, label: 'Mall Approach' },
      { x: 56, z: -200, radius: 12, label: 'North Terminus' },
    ],
    completed: false,
  },
  {
    id: 'm3-pier-tour',
    title: 'Explore the Coastal Pier & Ferris Wheel',
    category: 'explore',
    description: 'Visit the illuminated amusement pier and park at the boardwalk lookout.',
    reward: 18000,
    checkpoints: [
      { x: 100, z: 0, radius: 12, label: 'Pier Turn-off' },
      { x: 170, z: -35, radius: 10, label: 'Boardwalk Ramp' },
      { x: 215, z: -40, radius: 9, label: 'Ferris Wheel Lookout' },
    ],
    completed: false,
  },
  {
    id: 'm4-financial-rush',
    title: 'Downtown Financial Rush',
    category: 'delivery',
    description: 'Navigate the skyscraper canyons from the west avenue to the central bank tower.',
    reward: 25000,
    timeLimit: 60,
    checkpoints: [
      { x: -95, z: 160, radius: 12, label: 'Boulevard South' },
      { x: -95, z: 0, radius: 12, label: 'Downtown Crossing' },
      { x: -30, z: -120, radius: 10, label: 'Skyscraper Courtyard' },
    ],
    completed: false,
  },
  {
    id: 'm5-parking-master',
    title: 'Mall VIP Parking Challenge',
    category: 'parking',
    description: 'Park cleanly into the designated VIP bay in front of the City Mall entrance.',
    reward: 12000,
    timeLimit: 40,
    checkpoints: [
      { x: 80, z: -40, radius: 8, label: 'Mall Turn-in' },
      { x: 85, z: -55, radius: 4.5, label: 'VIP Bay #1' },
    ],
    completed: false,
  },
];

export class MissionManager {
  private scene: THREE.Scene;
  public missions: Mission[] = [];
  public activeMission: Mission | null = null;
  public currentCheckpointIndex: number = 0;
  public timeRemaining: number = 0;

  // 3D Visual Checkpoint Mesh in World
  public checkpointGroup: THREE.Group;
  private ringMesh: THREE.Mesh;
  private cylinderBeam: THREE.Mesh;

  private onCompleteCallback?: (reward: number, mission: Mission) => void;

  constructor(scene: THREE.Scene, savedMissions?: Mission[]) {
    this.scene = scene;
    this.missions = savedMissions && savedMissions.length ? savedMissions : INITIAL_MISSIONS;

    // Create 3D floating checkpoint marker
    this.checkpointGroup = new THREE.Group();
    this.checkpointGroup.name = 'checkpoint-marker';

    const ringGeom = new THREE.TorusGeometry(5, 0.45, 12, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 3.5,
      roughness: 0.2,
    });
    this.ringMesh = new THREE.Mesh(ringGeom, ringMat);
    this.ringMesh.rotation.x = Math.PI / 2;
    this.ringMesh.position.y = 1.2;
    this.checkpointGroup.add(this.ringMesh);

    // Vertical translucent light beam
    const beamGeom = new THREE.CylinderGeometry(4.8, 4.8, 35, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.cylinderBeam = new THREE.Mesh(beamGeom, beamMat);
    this.cylinderBeam.position.y = 17.5;
    this.checkpointGroup.add(this.cylinderBeam);

    this.checkpointGroup.visible = false;
    this.scene.add(this.checkpointGroup);

    // Auto-select first mission (Reach the City Mall)
    this.startMission(this.missions[0].id);
  }

  public setOnComplete(cb: (reward: number, mission: Mission) => void) {
    this.onCompleteCallback = cb;
  }

  public startMission(missionId: string): boolean {
    const m = this.missions.find((x) => x.id === missionId);
    if (!m) return false;

    this.activeMission = m;
    this.currentCheckpointIndex = 0;
    this.timeRemaining = m.timeLimit || 0;

    const cp = m.checkpoints[0];
    this.checkpointGroup.position.set(cp.x, 0, cp.z);
    this.checkpointGroup.visible = true;

    sounds.playUiClick();
    return true;
  }

  public update(dt: number, playerPos: THREE.Vector3): {
    distanceMeters: number;
    completedNow: boolean;
    activeTitle: string;
    targetLabel: string;
    timeRemaining: number;
  } {
    if (!this.activeMission) {
      this.checkpointGroup.visible = false;
      return { distanceMeters: 0, completedNow: false, activeTitle: 'Free Roam', targetLabel: 'Explore City', timeRemaining: 0 };
    }

    const currentCp = this.activeMission.checkpoints[this.currentCheckpointIndex];
    if (!currentCp) {
      return { distanceMeters: 0, completedNow: false, activeTitle: 'Free Roam', targetLabel: 'Explore City', timeRemaining: 0 };
    }

    // Animate checkpoint ring
    this.ringMesh.rotation.z += dt * 2.5;
    this.cylinderBeam.rotation.y += dt * 1.5;

    // Time limit countdown
    if (this.activeMission.timeLimit && this.timeRemaining > 0) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        // Mission failed due to timeout
        this.timeRemaining = 0;
        this.startMission(this.activeMission.id); // restart
      }
    }

    // Check distance to checkpoint
    const dx = playerPos.x - currentCp.x;
    const dz = playerPos.z - currentCp.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    let completedNow = false;

    if (dist <= currentCp.radius) {
      // Reached this checkpoint!
      sounds.playCheckpoint();
      this.currentCheckpointIndex++;

      if (this.currentCheckpointIndex >= this.activeMission.checkpoints.length) {
        // Mission finished!
        this.activeMission.completed = true;
        sounds.playMissionComplete();
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (this.onCompleteCallback) {
          this.onCompleteCallback(this.activeMission.reward, this.activeMission);
        }

        completedNow = true;
        this.checkpointGroup.visible = false;
        this.activeMission = null;
      } else {
        // Move to next checkpoint
        const nextCp = this.activeMission.checkpoints[this.currentCheckpointIndex];
        this.checkpointGroup.position.set(nextCp.x, 0, nextCp.z);
      }
    }

    return {
      distanceMeters: Math.round(dist),
      completedNow,
      activeTitle: this.activeMission?.title || 'Mission Complete!',
      targetLabel: currentCp.label || 'Destination',
      timeRemaining: Math.ceil(this.timeRemaining),
    };
  }
}
