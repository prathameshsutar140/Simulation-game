import * as THREE from 'three';
import { VehicleType } from '../types/game';

export interface VehicleMeshes {
  root: THREE.Group;
  bodyMesh: THREE.Mesh;
  bodyMaterial: THREE.MeshPhysicalMaterial;
  wheels: THREE.Group[];
  wheelMeshes: THREE.Mesh[];
  headlights: THREE.Mesh;
  taillights: THREE.Mesh;
  headlightBeams: THREE.SpotLight[];
  exhaustPipes: THREE.Mesh[];
  brakeCaliperMaterial: THREE.MeshStandardMaterial;
}

// Procedural license plate texture
function createLicensePlateTexture(text: string = 'METROLIFE'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Plate background with blue European/metro band
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 128);

  // Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 500, 116);

  // Blue country strip
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(10, 10, 50, 108);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ML', 35, 64);

  // Plate text
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 68px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 285, 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural carbon fiber / grille texture
function createGrilleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#030712';
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      ctx.beginPath();
      ctx.arc(x + 4, y + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 4);
  return tex;
}

// Procedural taxi checker texture
function createTaxiCheckerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 256, 32);

  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * 32, 0, 32, 16);
      ctx.fillRect((i + 1) * 32, 16, 32, 16);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createVehicleModel(type: VehicleType, paintColor: string = '#dc2626'): VehicleMeshes {
  const root = new THREE.Group();
  root.name = `vehicle-${type}`;

  const isSupercar = type === 'supercar';
  const isSportscar = type === 'sportscar';
  const isSUV = type === 'suv';
  const isTaxi = type === 'taxi';

  // Proportions
  const length = isSUV ? 4.9 : isSupercar ? 4.65 : 4.4;
  const width = isSupercar ? 2.12 : isSUV ? 2.1 : 1.95;
  const height = isSUV ? 1.75 : isSupercar ? 1.18 : 1.35;
  const wheelRadius = isSUV ? 0.44 : isSupercar ? 0.38 : 0.36;
  const wheelWidth = isSupercar ? 0.32 : 0.26;
  const groundClearance = isSUV ? 0.32 : isSupercar ? 0.16 : 0.22;

  // 1. CAR BODY MATERIAL (Rich PBR clearcoat lacquer)
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(paintColor),
    metalness: isTaxi ? 0.4 : 0.82,
    roughness: isTaxi ? 0.35 : 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
  });

  // Carbon / black trim material
  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
    metalness: 0.6,
  });

  // Glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050b14,
    metalness: 0.2,
    roughness: 0.05,
    transparent: true,
    opacity: 0.65,
    reflectivity: 1.0,
  });

  // Headlight glass / emitter
  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xdbeafe,
    emissiveIntensity: 3.5,
    roughness: 0.1,
  });

  // Taillight glowing bar
  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0x990000,
    emissive: 0xff0022,
    emissiveIntensity: 4.0,
    roughness: 0.2,
  });

  // Chrome exhaust material
  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.98,
    roughness: 0.08,
  });

  // Brake Caliper material
  const brakeCaliperMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red performance caliper
    metalness: 0.7,
    roughness: 0.25,
  });

  // -------------------------------------------------------------
  // MAIN BODY (Composite shapes with aerodynamics)
  // -------------------------------------------------------------
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = groundClearance;

  // Lower chassis / Hull
  const chassisGeom = new THREE.BoxGeometry(width * 0.96, height * 0.4, length * 0.96);
  const chassisMesh = new THREE.Mesh(chassisGeom, bodyMaterial);
  chassisMesh.position.y = height * 0.22;
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  bodyGroup.add(chassisMesh);

  // Front Hood slope
  const hoodLength = length * 0.35;
  const hoodGeom = new THREE.BoxGeometry(width * 0.94, height * 0.25, hoodLength);
  const hoodMesh = new THREE.Mesh(hoodGeom, bodyMaterial);
  hoodMesh.position.set(0, height * 0.28, length * 0.28);
  hoodMesh.rotation.x = isSupercar ? -0.16 : -0.09;
  hoodMesh.castShadow = true;
  bodyGroup.add(hoodMesh);

  // Cabin / Greenhouse
  const cabinWidth = width * 0.82;
  const cabinLength = length * (isSUV ? 0.6 : 0.45);
  const cabinHeight = height * (isSupercar ? 0.48 : 0.58);
  const cabinGeom = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
  const cabinMesh = new THREE.Mesh(cabinGeom, glassMaterial);
  cabinMesh.position.set(0, height * 0.58, isSupercar ? -length * 0.06 : -length * 0.02);
  cabinMesh.castShadow = true;
  bodyGroup.add(cabinMesh);

  // Roof cap
  const roofGeom = new THREE.BoxGeometry(cabinWidth * 0.94, height * 0.08, cabinLength * 0.88);
  const roofMesh = new THREE.Mesh(roofGeom, bodyMaterial);
  roofMesh.position.set(0, cabinMesh.position.y + cabinHeight * 0.48, cabinMesh.position.z);
  roofMesh.castShadow = true;
  bodyGroup.add(roofMesh);

  // Front Splitter / Bumper
  const splitterGeom = new THREE.BoxGeometry(width * 0.98, height * 0.12, 0.4);
  const splitterMesh = new THREE.Mesh(splitterGeom, carbonMaterial);
  splitterMesh.position.set(0, height * 0.06, length * 0.48);
  bodyGroup.add(splitterMesh);

  // Front Radiator Grille
  const grilleGeom = new THREE.PlaneGeometry(width * 0.65, height * 0.22);
  const grilleMat = new THREE.MeshStandardMaterial({
    map: createGrilleTexture(),
    color: 0x111111,
    roughness: 0.8,
  });
  const grilleMesh = new THREE.Mesh(grilleGeom, grilleMat);
  grilleMesh.position.set(0, height * 0.2, length * 0.495);
  bodyGroup.add(grilleMesh);

  // Rear Diffuser
  const diffuserGeom = new THREE.BoxGeometry(width * 0.95, height * 0.16, 0.45);
  const diffuserMesh = new THREE.Mesh(diffuserGeom, carbonMaterial);
  diffuserMesh.position.set(0, height * 0.1, -length * 0.48);
  diffuserMesh.rotation.x = 0.12;
  bodyGroup.add(diffuserMesh);

  // Supercar Aerodynamic Wing / Spoiler
  if (isSupercar || isSportscar) {
    const wingWidth = width * 0.92;
    const wingGeom = new THREE.BoxGeometry(wingWidth, 0.05, 0.35);
    const wingMesh = new THREE.Mesh(wingGeom, carbonMaterial);
    wingMesh.position.set(0, height * 0.72, -length * 0.42);

    // Wing uprights
    const postGeom = new THREE.BoxGeometry(0.04, 0.28, 0.15);
    const postLeft = new THREE.Mesh(postGeom, carbonMaterial);
    postLeft.position.set(-wingWidth * 0.32, height * 0.58, -length * 0.42);
    const postRight = postLeft.clone();
    postRight.position.x = wingWidth * 0.32;

    bodyGroup.add(wingMesh, postLeft, postRight);
  }

  // Taxi Rooftop Sign
  if (isTaxi) {
    const signGeom = new THREE.BoxGeometry(0.8, 0.25, 0.3);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 1.5,
      roughness: 0.3,
    });
    const signMesh = new THREE.Mesh(signGeom, signMat);
    signMesh.position.set(0, roofMesh.position.y + 0.16, roofMesh.position.z);
    bodyGroup.add(signMesh);

    // Checker strips on sides
    const checkerMat = new THREE.MeshStandardMaterial({ map: createTaxiCheckerTexture() });
    const sideStripLeft = new THREE.Mesh(new THREE.PlaneGeometry(length * 0.7, 0.14), checkerMat);
    sideStripLeft.position.set(-width * 0.482, height * 0.28, 0);
    sideStripLeft.rotation.y = -Math.PI / 2;
    const sideStripRight = sideStripLeft.clone();
    sideStripRight.position.x = width * 0.482;
    sideStripRight.rotation.y = Math.PI / 2;
    bodyGroup.add(sideStripLeft, sideStripRight);
  }

  // Side mirrors
  const mirrorGeom = new THREE.BoxGeometry(0.18, 0.1, 0.12);
  const mirrorL = new THREE.Mesh(mirrorGeom, carbonMaterial);
  mirrorL.position.set(-width * 0.49, height * 0.48, length * 0.12);
  const mirrorR = mirrorL.clone();
  mirrorR.position.x = width * 0.49;
  bodyGroup.add(mirrorL, mirrorR);

  // -------------------------------------------------------------
  // HEADLIGHTS & REAL LIGHT CONES
  // -------------------------------------------------------------
  const headlightGeom = new THREE.BoxGeometry(width * 0.24, height * 0.1, 0.12);
  const headlights = new THREE.Mesh(headlightGeom, headlightMaterial);
  headlights.position.set(0, height * 0.32, length * 0.48);

  const hlLeft = new THREE.Mesh(headlightGeom, headlightMaterial);
  hlLeft.position.set(-width * 0.35, height * 0.32, length * 0.47);
  hlLeft.rotation.y = -0.15;

  const hlRight = new THREE.Mesh(headlightGeom, headlightMaterial);
  hlRight.position.set(width * 0.35, height * 0.32, length * 0.47);
  hlRight.rotation.y = 0.15;
  bodyGroup.add(hlLeft, hlRight);

  // Spotlights for nighttime driving beams
  const headlightBeams: THREE.SpotLight[] = [];
  [-width * 0.35, width * 0.35].forEach((xPos) => {
    const spot = new THREE.SpotLight(0xfffaed, 8.0, 65, Math.PI / 6, 0.4, 1.2);
    spot.position.set(xPos, height * 0.35, length * 0.48);
    spot.target.position.set(xPos * 0.4, 0, length * 0.48 + 40);
    bodyGroup.add(spot);
    bodyGroup.add(spot.target);
    headlightBeams.push(spot);
  });

  // -------------------------------------------------------------
  // TAILLIGHTS (Continuous sleek light strip)
  // -------------------------------------------------------------
  const taillightGeom = new THREE.BoxGeometry(width * 0.88, height * 0.08, 0.08);
  const taillights = new THREE.Mesh(taillightGeom, taillightMaterial);
  taillights.position.set(0, height * 0.34, -length * 0.48);
  bodyGroup.add(taillights);

  // Rear License Plate
  const plateMat = new THREE.MeshBasicMaterial({ map: createLicensePlateTexture('METROLIFE') });
  const plateGeom = new THREE.PlaneGeometry(0.52, 0.15);
  const plateMesh = new THREE.Mesh(plateGeom, plateMat);
  plateMesh.position.set(0, height * 0.22, -length * 0.482);
  plateMesh.rotation.y = Math.PI;
  bodyGroup.add(plateMesh);

  // Front License Plate
  const frontPlate = plateMesh.clone();
  frontPlate.position.set(0, height * 0.12, length * 0.485);
  frontPlate.rotation.y = 0;
  bodyGroup.add(frontPlate);

  // Exhaust pipes
  const exhaustPipes: THREE.Mesh[] = [];
  const exhaustGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.2, 16);
  exhaustGeom.rotateX(Math.PI / 2);

  const exhaustOffsets = isSupercar ? [-0.35, -0.22, 0.22, 0.35] : [-0.3, 0.3];
  exhaustOffsets.forEach((xOff) => {
    const pipe = new THREE.Mesh(exhaustGeom, chromeMaterial);
    pipe.position.set(xOff, height * 0.14, -length * 0.485);
    bodyGroup.add(pipe);
    exhaustPipes.push(pipe);
  });

  root.add(bodyGroup);

  // -------------------------------------------------------------
  // 4 WHEELS (Rubber tire + sports alloy rim + brake disc & caliper)
  // -------------------------------------------------------------
  const wheels: THREE.Group[] = [];
  const wheelMeshes: THREE.Mesh[] = [];

  const tireGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
  tireGeom.rotateZ(Math.PI / 2);

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    roughness: 0.85,
    metalness: 0.08,
  });

  const rimGeom = new THREE.CylinderGeometry(wheelRadius * 0.72, wheelRadius * 0.72, wheelWidth * 1.02, 16);
  rimGeom.rotateZ(Math.PI / 2);

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: isSupercar ? 0x111827 : 0xd1d5db,
    metalness: 0.9,
    roughness: 0.2,
  });

  const brakeDiscGeom = new THREE.CylinderGeometry(wheelRadius * 0.58, wheelRadius * 0.58, 0.04, 16);
  brakeDiscGeom.rotateZ(Math.PI / 2);
  const brakeDiscMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.25,
  });

  const caliperGeom = new THREE.BoxGeometry(0.06, wheelRadius * 0.35, 0.12);

  const wheelPositions = [
    { x: -width * 0.48, z: length * 0.29 }, // Front-Left
    { x: width * 0.48, z: length * 0.29 },  // Front-Right
    { x: -width * 0.48, z: -length * 0.29 }, // Rear-Left
    { x: width * 0.48, z: -length * 0.29 },  // Rear-Right
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheelHub = new THREE.Group();
    wheelHub.position.set(pos.x, wheelRadius, pos.z);

    // Rotating wheel spin node
    const spinNode = new THREE.Group();

    const tire = new THREE.Mesh(tireGeom, tireMaterial);
    tire.castShadow = true;
    spinNode.add(tire);

    const rim = new THREE.Mesh(rimGeom, rimMaterial);
    spinNode.add(rim);

    // 5-Spoke geometric accents
    for (let s = 0; s < 5; s++) {
      const spokeGeom = new THREE.BoxGeometry(wheelWidth * 1.03, wheelRadius * 0.65, 0.04);
      const spoke = new THREE.Mesh(spokeGeom, rimMaterial);
      spoke.rotation.x = (s * Math.PI * 2) / 5;
      spinNode.add(spoke);
    }

    const brakeDisc = new THREE.Mesh(brakeDiscGeom, brakeDiscMat);
    spinNode.add(brakeDisc);

    // Fixed caliper (does not spin with wheel)
    const caliper = new THREE.Mesh(caliperGeom, brakeCaliperMaterial);
    caliper.position.set(pos.x < 0 ? 0.04 : -0.04, wheelRadius * 0.22, 0);
    wheelHub.add(caliper);

    wheelHub.add(spinNode);
    root.add(wheelHub);

    wheels.push(wheelHub);
    wheelMeshes.push(tire);
  });

  // Soft contact shadow plane under the vehicle (grounding)
  const shadowGeom = new THREE.PlaneGeometry(width * 1.3, length * 1.15);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0,0,0,0.7)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  return {
    root,
    bodyMesh: chassisMesh,
    bodyMaterial,
    wheels,
    wheelMeshes,
    headlights,
    taillights,
    headlightBeams,
    exhaustPipes,
    brakeCaliperMaterial,
  };
}
