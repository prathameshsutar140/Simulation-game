import * as THREE from 'three';
import { WeatherType } from '../types/game';
import { sounds } from '../audio/SoundManager';

export interface WeatherState {
  current: WeatherType;
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  rainParticles: THREE.Points;
  skyMesh: THREE.Mesh;
}

export class WeatherSystem {
  private scene: THREE.Scene;
  public currentWeather: WeatherType = 'sunset';
  public sunLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  public skyMesh!: THREE.Mesh;
  public rainParticles!: THREE.Points;
  private rainGeom!: THREE.BufferGeometry;
  private rainCount: number = 2500;
  private streetLights: THREE.PointLight[] = [];

  constructor(scene: THREE.Scene, streetLights: THREE.PointLight[] = []) {
    this.scene = scene;
    this.streetLights = streetLights;
    this.initLights();
    this.initSky();
    this.initRain();
    this.setWeather('sunset');
  }

  private initLights() {
    // Hemisphere fill light (sky / ground)
    this.hemiLight = new THREE.HemisphereLight(0xffecd2, 0x1e293b, 0.7);
    this.scene.add(this.hemiLight);

    // Directional Key Sun Light with high-quality shadow map
    this.sunLight = new THREE.DirectionalLight(0xff7733, 2.5);
    this.sunLight.position.set(120, 80, -180);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 450;

    const d = 160;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
  }

  private initSky() {
    // Atmospheric Sky Dome with procedural sunset gradient
    const skyGeom = new THREE.SphereGeometry(450, 32, 16);
    skyGeom.scale(-1, 1, 1); // Render inside

    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 128;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d')!;

    // Golden Sunset gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1e1b4b'); // deep twilight purple-blue zenith
    grad.addColorStop(0.35, '#c026d3'); // vibrant magenta
    grad.addColorStop(0.65, '#f97316'); // golden orange horizon
    grad.addColorStop(0.9, '#fef08a'); // sun flare yellow
    grad.addColorStop(1.0, '#38bdf8'); // coastal water reflection
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeom, skyMat);
    this.scene.add(this.skyMesh);

    // Initial atmospheric fog
    this.scene.fog = new THREE.FogExp2(0xf97316, 0.0035);
  }

  private initRain() {
    this.rainGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
      velocities[i] = 45 + Math.random() * 25;
    }

    this.rainGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.28,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(this.rainGeom, rainMat);
    this.scene.add(this.rainParticles);
  }

  public setWeather(type: WeatherType) {
    this.currentWeather = type;

    switch (type) {
      case 'sunset': // Matches the user's uploaded screenshot!
        this.sunLight.color.setHex(0xff7733);
        this.sunLight.intensity = 2.4;
        this.sunLight.position.set(160, 65, -180);
        this.hemiLight.color.setHex(0xffedd5);
        this.hemiLight.groundColor.setHex(0x1e1b4b);
        this.hemiLight.intensity = 0.8;
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setHex(0xf97316);
          (this.scene.fog as THREE.FogExp2).density = 0.0032;
        }
        (this.rainParticles.material as THREE.PointsMaterial).opacity = 0;
        sounds.setRainActive(false);
        this.toggleStreetLights(true, 1.8);
        break;

      case 'day':
        this.sunLight.color.setHex(0xffffff);
        this.sunLight.intensity = 2.8;
        this.sunLight.position.set(60, 180, 80);
        this.hemiLight.color.setHex(0xe0f2fe);
        this.hemiLight.groundColor.setHex(0x334155);
        this.hemiLight.intensity = 1.0;
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setHex(0x93c5fd);
          (this.scene.fog as THREE.FogExp2).density = 0.0018;
        }
        (this.rainParticles.material as THREE.PointsMaterial).opacity = 0;
        sounds.setRainActive(false);
        this.toggleStreetLights(false, 0);
        break;

      case 'night':
        this.sunLight.color.setHex(0x38bdf8);
        this.sunLight.intensity = 0.45;
        this.sunLight.position.set(-80, 120, -120);
        this.hemiLight.color.setHex(0x0f172a);
        this.hemiLight.groundColor.setHex(0x020617);
        this.hemiLight.intensity = 0.35;
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setHex(0x090d16);
          (this.scene.fog as THREE.FogExp2).density = 0.0045;
        }
        (this.rainParticles.material as THREE.PointsMaterial).opacity = 0;
        sounds.setRainActive(false);
        this.toggleStreetLights(true, 3.2);
        break;

      case 'rain':
        this.sunLight.color.setHex(0x64748b);
        this.sunLight.intensity = 0.8;
        this.hemiLight.color.setHex(0x334155);
        this.hemiLight.groundColor.setHex(0x0f172a);
        this.hemiLight.intensity = 0.5;
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setHex(0x1e293b);
          (this.scene.fog as THREE.FogExp2).density = 0.008;
        }
        (this.rainParticles.material as THREE.PointsMaterial).opacity = 0.65;
        sounds.setRainActive(true);
        this.toggleStreetLights(true, 2.8);
        break;
    }
  }

  private toggleStreetLights(enable: boolean, intensity: number) {
    this.streetLights.forEach((light) => {
      light.intensity = intensity;
    });
  }

  public update(dt: number, playerPos: THREE.Vector3) {
    // Keep rain centered over player
    if (this.currentWeather === 'rain') {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const positions = this.rainGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < this.rainCount; i++) {
        positions[i * 3 + 1] -= dt * 65;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 50 + Math.random() * 10;
        }
      }
      this.rainGeom.attributes.position.needsUpdate = true;
    }

    // Sky follows camera position so it never slips
    this.skyMesh.position.set(playerPos.x, 0, playerPos.z);
    this.sunLight.target.position.set(playerPos.x, 0, playerPos.z);
  }
}
