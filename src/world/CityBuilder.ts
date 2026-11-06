import * as THREE from 'three';

export interface CityData {
  group: THREE.Group;
  colliders: THREE.Box3[];
  waterMesh: THREE.Mesh;
  ferrisWheelGroup: THREE.Group;
  helicopterGroup: THREE.Group;
  streetLights: THREE.PointLight[];
  roadWaypoints: THREE.Vector3[];
  pedestrianWaypoints: THREE.Vector3[];
}

// Procedural Window Grid Texture
function createWindowTexture(buildingColor: string, isBright: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = buildingColor;
  ctx.fillRect(0, 0, 256, 512);

  const windowCols = 8;
  const windowRows = 24;
  const wWidth = 18;
  const wHeight = 12;
  const gapX = 14;
  const gapY = 9;

  for (let r = 0; r < windowRows; r++) {
    for (let c = 0; c < windowCols; c++) {
      const x = 12 + c * (wWidth + gapX);
      const y = 14 + r * (wHeight + gapY);

      // Random window illumination state (warm yellow, soft cyan, or dark)
      const rand = Math.random();
      if (rand > (isBright ? 0.35 : 0.65)) {
        ctx.fillStyle = Math.random() > 0.4 ? '#fef08a' : '#bae6fd';
      } else {
        ctx.fillStyle = '#1e293b';
      }
      ctx.fillRect(x, y, wWidth, wHeight);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Billboard Texture ("DREAM BIG LIVE BETTER")
function createBillboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Sunset gradient backdrop
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#701a75');
  grad.addColorStop(0.5, '#c026d3');
  grad.addColorStop(1, '#f97316');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Stylized model portrait silhouette
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Orbitron", sans-serif';
  ctx.fillText('DREAM BIG', 40, 110);
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('LIVE BETTER', 40, 160);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '16px sans-serif';
  ctx.fillText('METRO APPAREL & LUXURY SUITES', 40, 205);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural City Mall Sign Texture
function createMallSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 128);

  // Glowing neon text
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#f0f9ff';
  ctx.font = '900 64px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CITY MALL', 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Asphalt Road Texture with Lane Markings
function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt grain
  ctx.fillStyle = '#1c2128';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle asphalt speckle
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const shade = Math.floor(25 + Math.random() * 15);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Outer solid white lines
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(24, 0, 8, 512);
  ctx.fillRect(480, 0, 8, 512);

  // Center yellow dashed double line
  ctx.fillStyle = '#eab308';
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(250, y + 12, 4, 40);
    ctx.fillRect(258, y + 12, 4, 40);
  }

  // Lane dividers (white dashed)
  ctx.fillStyle = '#e2e8f0';
  for (let y = 0; y < 512; y += 48) {
    ctx.fillRect(138, y + 10, 4, 28);
    ctx.fillRect(370, y + 10, 4, 28);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Sidewalk Pavement Texture
function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 60, 60);
  ctx.strokeRect(66, 2, 60, 60);
  ctx.strokeRect(2, 66, 60, 60);
  ctx.strokeRect(66, 66, 60, 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildCity(): CityData {
  const group = new THREE.Group();
  const colliders: THREE.Box3[] = [];
  const streetLights: THREE.PointLight[] = [];
  const roadWaypoints: THREE.Vector3[] = [];
  const pedestrianWaypoints: THREE.Vector3[] = [];

  // Ground base plane (Terrain / Foundation)
  const terrainGeom = new THREE.PlaneGeometry(900, 900);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.9,
    metalness: 0.1,
  });
  const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.y = -0.05;
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // -------------------------------------------------------------
  // 1. ANIMATED WATER (Coastal Waterfront Ocean)
  // -------------------------------------------------------------
  const waterGeom = new THREE.PlaneGeometry(500, 900, 32, 32);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x075985,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.9,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(380, -0.2, 0);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Waterfront seawall & railing
  const seawallGeom = new THREE.BoxGeometry(4, 1.2, 800);
  const seawallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  const seawall = new THREE.Mesh(seawallGeom, seawallMat);
  seawall.position.set(130, 0.4, 0);
  seawall.castShadow = true;
  seawall.receiveShadow = true;
  group.add(seawall);

  const seawallBox = new THREE.Box3().setFromObject(seawall);
  colliders.push(seawallBox);

  // -------------------------------------------------------------
  // 2. ROAD NETWORK & HIGHWAYS
  // -------------------------------------------------------------
  const roadTexture = createRoadTexture();
  const sidewalkTexture = createSidewalkTexture();

  const roadMaterial = new THREE.MeshStandardMaterial({
    map: roadTexture,
    roughness: 0.35, // sleek wet road sheen
    metalness: 0.25,
  });

  const sidewalkMaterial = new THREE.MeshStandardMaterial({
    map: sidewalkTexture,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Main Coastal Highway (North-South, 4 lanes) - Exactly like screenshot!
  const mainHighwayGeom = new THREE.PlaneGeometry(28, 800);
  roadTexture.repeat.set(1, 40);
  const mainHighway = new THREE.Mesh(mainHighwayGeom, roadMaterial);
  mainHighway.rotation.x = -Math.PI / 2;
  mainHighway.position.set(60, 0.01, 0);
  mainHighway.receiveShadow = true;
  group.add(mainHighway);

  // Sidewalks on Main Highway
  const swLeftGeom = new THREE.BoxGeometry(4.5, 0.25, 800);
  const swLeft = new THREE.Mesh(swLeftGeom, sidewalkMaterial);
  swLeft.position.set(43.75, 0.12, 0);
  swLeft.receiveShadow = true;
  group.add(swLeft);

  const swRight = swLeft.clone();
  swRight.position.x = 76.25;
  group.add(swRight);

  // Downtown Grid Roads (East-West & North-South grid)
  const gridRoadWidth = 20;
  const crossRoads = [-240, -120, 0, 120, 240];
  crossRoads.forEach((zPos) => {
    const crossGeom = new THREE.PlaneGeometry(320, gridRoadWidth);
    const crossRoad = new THREE.Mesh(crossGeom, roadMaterial);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(-80, 0.015, zPos);
    crossRoad.receiveShadow = true;
    group.add(crossRoad);

    // Crossroad waypoints for traffic AI
    roadWaypoints.push(new THREE.Vector3(-220, 0, zPos + 4));
    roadWaypoints.push(new THREE.Vector3(60, 0, zPos + 4));
    roadWaypoints.push(new THREE.Vector3(-220, 0, zPos - 4));
    roadWaypoints.push(new THREE.Vector3(60, 0, zPos - 4));
  });

  // Parallel Downtown Boulevard
  const dtBoulevardGeom = new THREE.PlaneGeometry(gridRoadWidth, 800);
  const dtBoulevard = new THREE.Mesh(dtBoulevardGeom, roadMaterial);
  dtBoulevard.rotation.x = -Math.PI / 2;
  dtBoulevard.position.set(-100, 0.012, 0);
  dtBoulevard.receiveShadow = true;
  group.add(dtBoulevard);

  // Western Outer Highway
  const westHwyGeom = new THREE.PlaneGeometry(gridRoadWidth, 800);
  const westHwy = new THREE.Mesh(westHwyGeom, roadMaterial);
  westHwy.rotation.x = -Math.PI / 2;
  westHwy.position.set(-230, 0.012, 0);
  westHwy.receiveShadow = true;
  group.add(westHwy);

  // Main highway waypoints (North <-> South)
  for (let z = -350; z <= 350; z += 50) {
    roadWaypoints.push(new THREE.Vector3(56, 0, z)); // Southbound
    roadWaypoints.push(new THREE.Vector3(64, 0, -z)); // Northbound
    pedestrianWaypoints.push(new THREE.Vector3(44, 0.25, z));
    pedestrianWaypoints.push(new THREE.Vector3(76, 0.25, z));
  }

  // -------------------------------------------------------------
  // 3. CITY MALL & PROMINENT COMMERCIAL FACADES
  // -------------------------------------------------------------
  const mallGroup = new THREE.Group();
  mallGroup.position.set(105, 0, -60);

  // Mall main building block
  const mallGeom = new THREE.BoxGeometry(45, 32, 120);
  const mallMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.6,
    roughness: 0.3,
  });
  const mallMesh = new THREE.Mesh(mallGeom, mallMat);
  mallMesh.position.y = 16;
  mallMesh.castShadow = true;
  mallMesh.receiveShadow = true;
  mallGroup.add(mallMesh);

  // Giant illuminated "CITY MALL" sign facing highway
  const mallSignMat = new THREE.MeshBasicMaterial({ map: createMallSignTexture() });
  const mallSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 9), mallSignMat);
  mallSignMesh.position.set(-22.6, 26, 15);
  mallSignMesh.rotation.y = -Math.PI / 2;
  mallGroup.add(mallSignMesh);

  // Huge billboard: "DREAM BIG LIVE BETTER"
  const billboardMat = new THREE.MeshBasicMaterial({ map: createBillboardTexture() });
  const billboardMesh = new THREE.Mesh(new THREE.PlaneGeometry(38, 19), billboardMat);
  billboardMesh.position.set(-22.6, 17, -25);
  billboardMesh.rotation.y = -Math.PI / 2;
  mallGroup.add(billboardMesh);

  // Glass entrance canopy
  const canopyGeom = new THREE.BoxGeometry(8, 0.5, 30);
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.8,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
  });
  const canopy = new THREE.Mesh(canopyGeom, canopyMat);
  canopy.position.set(-25, 7, 15);
  mallGroup.add(canopy);

  // Mall decorative lights
  const mallGlow = new THREE.PointLight(0x38bdf8, 3.5, 45);
  mallGlow.position.set(-26, 12, 15);
  mallGroup.add(mallGlow);
  streetLights.push(mallGlow);

  group.add(mallGroup);
  colliders.push(new THREE.Box3().setFromObject(mallMesh));

  // -------------------------------------------------------------
  // 4. DOWNTOWN SKYSCRAPERS & TOWERS
  // -------------------------------------------------------------
  const buildingConfigs = [
    // Downtown core high-rises (West of highway)
    { x: -30, z: -60, w: 38, h: 140, d: 38, col: '#090d16', bright: true },
    { x: -30, z: 60, w: 36, h: 110, d: 34, col: '#0b1329', bright: false },
    { x: -30, z: 180, w: 40, h: 95, d: 42, col: '#111827', bright: true },
    { x: -30, z: -180, w: 42, h: 155, d: 40, col: '#0c1a30', bright: true },

    { x: -160, z: -60, w: 48, h: 165, d: 48, col: '#081225', bright: true },
    { x: -160, z: 60, w: 44, h: 125, d: 40, col: '#172554', bright: false },
    { x: -160, z: 180, w: 40, h: 85, d: 38, col: '#1e293b', bright: true },
    { x: -160, z: -180, w: 46, h: 135, d: 44, col: '#0f172a', bright: false },

    // Waterfront East side buildings (spaced along coastal walk)
    { x: 105, z: 80, w: 36, h: 75, d: 48, col: '#1e1b4b', bright: true },
    { x: 105, z: -180, w: 42, h: 90, d: 52, col: '#0f172a', bright: false },
    { x: 105, z: 200, w: 38, h: 65, d: 42, col: '#18181b', bright: true },
  ];

  buildingConfigs.forEach((b, idx) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(b.x, 0, b.z);

    const bGeom = new THREE.BoxGeometry(b.w, b.h, b.d);
    const winTex = createWindowTexture(b.col, b.bright);
    winTex.repeat.set(Math.floor(b.w / 12), Math.floor(b.h / 14));

    const bMat = new THREE.MeshStandardMaterial({
      map: winTex,
      roughness: 0.25,
      metalness: 0.8,
    });
    const bMesh = new THREE.Mesh(bGeom, bMat);
    bMesh.position.y = b.h / 2;
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    bGroup.add(bMesh);

    // Roof spire / architectural accent
    if (idx % 2 === 0) {
      const spireGeom = new THREE.ConeGeometry(2.5, 24, 8);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
      const spire = new THREE.Mesh(spireGeom, spireMat);
      spire.position.y = b.h + 12;
      bGroup.add(spire);

      // Warning beacon light atop skyscraper
      const beacon = new THREE.PointLight(0xef4444, 2.0, 30);
      beacon.position.y = b.h + 24;
      bGroup.add(beacon);
    }

    // Helipad on select tallest roofs
    if (b.h > 130) {
      const helipadGeom = new THREE.CylinderGeometry(b.w * 0.35, b.w * 0.35, 0.4, 24);
      const helipadMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
      const helipad = new THREE.Mesh(helipadGeom, helipadMat);
      helipad.position.y = b.h + 0.2;
      bGroup.add(helipad);
    }

    group.add(bGroup);
    colliders.push(new THREE.Box3().setFromObject(bMesh));
  });

  // -------------------------------------------------------------
  // 5. COASTAL PIER & ILLUMINATED ROTATING FERRIS WHEEL
  // -------------------------------------------------------------
  const pierGroup = new THREE.Group();
  pierGroup.position.set(220, 0, -40);

  // Wooden Pier deck extending into the sea
  const pierDeckGeom = new THREE.BoxGeometry(140, 2.5, 65);
  const pierMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.8 });
  const pierDeck = new THREE.Mesh(pierDeckGeom, pierMat);
  pierDeck.position.set(0, 1.25, 0);
  pierDeck.castShadow = true;
  pierDeck.receiveShadow = true;
  pierGroup.add(pierDeck);

  // Support pillars into water
  for (let px = -50; px <= 50; px += 25) {
    for (let pz = -20; pz <= 20; pz += 20) {
      const pilGeom = new THREE.CylinderGeometry(1.2, 1.2, 10, 8);
      const pil = new THREE.Mesh(pilGeom, pierMat);
      pil.position.set(px, -3.5, pz);
      pierGroup.add(pil);
    }
  }

  // Ferris Wheel assembly
  const ferrisWheelGroup = new THREE.Group();
  ferrisWheelGroup.position.set(20, 36, 0);

  // Wheel rim rings
  const wheelRadius = 30;
  const outerRingGeom = new THREE.TorusGeometry(wheelRadius, 0.6, 8, 36);
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    emissive: 0xec4899,
    emissiveIntensity: 3.5,
    roughness: 0.2,
  });
  const outerRing = new THREE.Mesh(outerRingGeom, neonMat);
  outerRing.rotation.y = Math.PI / 2;
  ferrisWheelGroup.add(outerRing);

  const innerRingGeom = new THREE.TorusGeometry(wheelRadius * 0.6, 0.4, 8, 24);
  const innerRing = new THREE.Mesh(innerRingGeom, neonMat);
  innerRing.rotation.y = Math.PI / 2;
  ferrisWheelGroup.add(innerRing);

  // Spokes & passenger capsules
  const capsuleMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 2.0,
    roughness: 0.3,
  });

  for (let s = 0; s < 12; s++) {
    const angle = (s * Math.PI * 2) / 12;
    // Spoke rod
    const spokeGeom = new THREE.CylinderGeometry(0.2, 0.2, wheelRadius * 2, 8);
    const spoke = new THREE.Mesh(spokeGeom, neonMat);
    spoke.position.set(0, 0, 0);
    spoke.rotation.x = angle;
    ferrisWheelGroup.add(spoke);

    // Passenger pod
    const podGeom = new THREE.SphereGeometry(1.5, 8, 8);
    const pod = new THREE.Mesh(podGeom, capsuleMat);
    pod.position.set(0, Math.sin(angle) * wheelRadius, Math.cos(angle) * wheelRadius);
    ferrisWheelGroup.add(pod);
  }

  // Ferris wheel support A-frame legs
  const legGeom = new THREE.CylinderGeometry(0.8, 1.2, 40, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 });
  const leg1 = new THREE.Mesh(legGeom, legMat);
  leg1.position.set(20, 18, -14);
  leg1.rotation.x = 0.38;
  const leg2 = new THREE.Mesh(legGeom, legMat);
  leg2.position.set(20, 18, 14);
  leg2.rotation.x = -0.38;
  pierGroup.add(leg1, leg2);

  pierGroup.add(ferrisWheelGroup);
  group.add(pierGroup);
  colliders.push(new THREE.Box3().setFromObject(pierDeck));

  // -------------------------------------------------------------
  // 6. OVERHEAD POLICE / METRO PATROL HELICOPTER
  // -------------------------------------------------------------
  const helicopterGroup = new THREE.Group();
  helicopterGroup.position.set(0, 65, 0);

  // Heli Fuselage
  const heliBodyGeom = new THREE.SphereGeometry(3, 16, 16);
  heliBodyGeom.scale(1.2, 1, 2.5);
  const heliMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
  const heliBody = new THREE.Mesh(heliBodyGeom, heliMat);
  helicopterGroup.add(heliBody);

  // Heli Glass Cockpit
  const heliGlassGeom = new THREE.SphereGeometry(2.4, 12, 12);
  heliGlassGeom.scale(1.1, 0.9, 1.5);
  const heliGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
  const heliGlass = new THREE.Mesh(heliGlassGeom, heliGlassMat);
  heliGlass.position.set(0, 0.4, 2.2);
  helicopterGroup.add(heliGlass);

  // Heli Tail boom
  const tailBoomGeom = new THREE.CylinderGeometry(0.4, 0.2, 9, 8);
  tailBoomGeom.rotateX(Math.PI / 2);
  const tailBoom = new THREE.Mesh(tailBoomGeom, heliMat);
  tailBoom.position.set(0, 0.6, -6.5);
  helicopterGroup.add(tailBoom);

  // Main Rotor Blades
  const rotorRods = new THREE.Group();
  rotorRods.name = 'mainRotor';
  rotorRods.position.set(0, 3.2, 0);
  const bladeGeom = new THREE.BoxGeometry(0.5, 0.08, 14);
  const blade = new THREE.Mesh(bladeGeom, heliMat);
  const bladeCross = blade.clone();
  bladeCross.rotation.y = Math.PI / 2;
  rotorRods.add(blade, bladeCross);
  helicopterGroup.add(rotorRods);

  // Downward ground searchlight
  const heliSearchlight = new THREE.SpotLight(0xffffff, 8.0, 110, Math.PI / 8, 0.5, 1.5);
  heliSearchlight.position.set(0, -1, 1);
  heliSearchlight.target.position.set(0, -65, 30);
  helicopterGroup.add(heliSearchlight);
  helicopterGroup.add(heliSearchlight.target);

  group.add(helicopterGroup);

  // -------------------------------------------------------------
  // 7. STREETLIGHTS & PALM TREES ALONG HIGHWAY
  // -------------------------------------------------------------
  // Palm tree trunk geometry & material
  const trunkGeom = new THREE.CylinderGeometry(0.35, 0.55, 7.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

  // Streetlamp geometry
  const lampPoleGeom = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
  const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  const lampHeadGeom = new THREE.SphereGeometry(0.4, 12, 12);
  const lampHeadMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfef08a,
    emissiveIntensity: 4.0,
  });

  for (let z = -320; z <= 320; z += 40) {
    // 1. Streetlight on coastal side of highway (East)
    const poleMesh = new THREE.Mesh(lampPoleGeom, lampPoleMat);
    poleMesh.position.set(77, 3.75, z);
    poleMesh.castShadow = true;
    group.add(poleMesh);

    const lampHead = new THREE.Mesh(lampHeadGeom, lampHeadMat);
    lampHead.position.set(77, 7.4, z);
    group.add(lampHead);

    const light = new THREE.PointLight(0xffedd5, 2.2, 38);
    light.position.set(77, 7.2, z);
    group.add(light);
    streetLights.push(light);

    // 2. Palm tree on sidewalk divider
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.set(43, 3.75, z + 20);
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    group.add(trunk);

    // Palm fronds (5 angled leafy planes)
    for (let f = 0; f < 6; f++) {
      const frondGeom = new THREE.ConeGeometry(1.6, 5.5, 4);
      frondGeom.rotateX(Math.PI / 2.6);
      const frond = new THREE.Mesh(frondGeom, frondMat);
      frond.position.set(43, 7.4, z + 20);
      frond.rotation.y = (f * Math.PI * 2) / 6;
      frond.castShadow = true;
      group.add(frond);
    }

    // Streetlamps on western downtown boulevard
    const dtPole = new THREE.Mesh(lampPoleGeom, lampPoleMat);
    dtPole.position.set(-112, 3.75, z);
    group.add(dtPole);

    const dtLight = new THREE.PointLight(0xfef3c7, 1.8, 30);
    dtLight.position.set(-112, 7.2, z);
    group.add(dtLight);
    streetLights.push(dtLight);
  }

  // -------------------------------------------------------------
  // 8. BUS STOPS & AMBIENT CITY PROPS
  // -------------------------------------------------------------
  const busStopGeom = new THREE.BoxGeometry(3.5, 3.2, 7.5);
  const busStopMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const busStop = new THREE.Mesh(busStopGeom, busStopMat);
  busStop.position.set(42.5, 1.6, -10);
  busStop.castShadow = true;
  group.add(busStop);
  colliders.push(new THREE.Box3().setFromObject(busStop));

  return {
    group,
    colliders,
    waterMesh,
    ferrisWheelGroup,
    helicopterGroup,
    streetLights,
    roadWaypoints,
    pedestrianWaypoints,
  };
}
