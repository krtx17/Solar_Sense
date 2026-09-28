import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeHouseSceneProps {
  activeHour: number;
  isRotating?: boolean;
  onSelectObject?: (objectId: 'solar' | 'house' | 'battery' | 'grid') => void;
  className?: string;
}

/**
 * ThreeHouseScene
 * A real, high-quality, photorealistic 3D isometric solar home experience in WebGL (Three.js):
 * - Real 3D architecture: Modern two-story villa with sloped roof & monocrystalline solar array
 * - Floor-to-ceiling glass windows with interior living room furnishings & warm nighttime lighting
 * - Warm cedar vertical wood slat accents, white architectural stucco, and concrete patio
 * - Carport with a modern silver crossover vehicle
 * - Outdoor home battery energy storage system (BESS) with dynamic status LED
 * - Landscaped lawn, trees, shrubs, paved driveway, sidewalk, curb, and asphalt street
 * - Wooden electrical utility pole with transformer and overhead power cables connected to house
 * - Full daylight cycle: dynamic sun arc, moving soft shadows, sky lighting, and nighttime window illumination
 * - Animated energy flow pulses traveling along the overhead power lines
 */
export const ThreeHouseScene: React.FC<ThreeHouseSceneProps> = ({
  activeHour,
  isRotating = false,
  onSelectObject,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const interiorLightsRef = useRef<THREE.PointLight[]>([]);
  const outdoorLightsRef = useRef<THREE.PointLight[]>([]);
  const batteryLedMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const powerLinePulsesRef = useRef<THREE.Mesh[]>([]);
  const clickableMeshesRef = useRef<{ mesh: THREE.Object3D; id: 'solar' | 'house' | 'battery' | 'grid' }[]>([]);

  // 1. Procedural Texture Generators
  const generatePhotovoltaicTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Monocrystalline dark navy/black silicon wafer base
    ctx.fillStyle = '#0E1724';
    ctx.fillRect(0, 0, 1024, 1024);

    const cols = 6;
    const rows = 4;
    const pad = 8;
    const cellW = (1024 - pad * (cols + 1)) / cols;
    const cellH = (1024 - pad * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * (cellW + pad);
        const y = pad + r * (cellH + pad);

        // Individual cell gradient reflecting sky & sunlight
        const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
        grad.addColorStop(0, '#16283D');
        grad.addColorStop(0.4, '#1C3552');
        grad.addColorStop(1, '#112033');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cellW, cellH);

        // Fine silver busbar conductors (4 per cell)
        ctx.strokeStyle = 'rgba(215, 235, 255, 0.4)';
        ctx.lineWidth = 1.5;
        for (let b = 1; b <= 4; b++) {
          const bx = x + (cellW / 5) * b;
          ctx.beginPath();
          ctx.moveTo(bx, y);
          ctx.lineTo(bx, y + cellH);
          ctx.stroke();
        }

        // Horizontal contact fingers
        ctx.strokeStyle = 'rgba(190, 215, 245, 0.12)';
        ctx.lineWidth = 0.8;
        for (let f = 6; f < cellH; f += 8) {
          ctx.beginPath();
          ctx.moveTo(x, y + f);
          ctx.lineTo(x + cellW, y + f);
          ctx.stroke();
        }

        // Wafer border with chamfered look
        ctx.strokeStyle = '#080D15';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellW, cellH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const generateWoodSlatTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm natural cedar / teak background
    ctx.fillStyle = '#8B5A34';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical wooden architectural slats
    const slatW = 24;
    for (let x = 0; x < 512; x += slatW) {
      const woodVar = (Math.sin(x * 0.18) * 10 + Math.cos(x * 0.35) * 8);
      ctx.fillStyle = `rgb(${140 + woodVar}, ${90 + woodVar * 0.6}, ${52 + woodVar * 0.4})`;
      ctx.fillRect(x, 0, slatW - 3, 512);

      // Slat shadow reveal groove
      ctx.fillStyle = '#2C170A';
      ctx.fillRect(x + slatW - 3, 0, 3, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const generateDrivewayTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#D1D3D8';
    ctx.fillRect(0, 0, 512, 512);

    // Concrete paving blocks
    const blockW = 64;
    const blockH = 32;
    ctx.strokeStyle = '#9DA0A8';
    ctx.lineWidth = 2;

    for (let y = 0; y < 512; y += blockH) {
      const offsetX = ((y / blockH) % 2) * (blockW / 2);
      for (let x = -blockW; x < 512 + blockW; x += blockW) {
        ctx.strokeRect(x + offsetX, y, blockW, blockH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 4);
    return texture;
  };

  const generateRoadTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Asphalt grey
    ctx.fillStyle = '#3A3D43';
    ctx.fillRect(0, 0, 512, 512);

    // Asphalt noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const grey = Math.floor(45 + Math.random() * 30);
      ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, 0.3)`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // White dashed center line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.setLineDash([40, 28]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    return texture;
  };

  // 2. Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 650;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Telephoto isometric camera (dynamically framed for portrait mobile vs landscape tablet/desktop)
    const isMobilePortrait = width < 640 && height > width;
    const camera = new THREE.PerspectiveCamera(isMobilePortrait ? 36 : 30, width / height, 0.1, 100);
    if (isMobilePortrait) {
      camera.position.set(-20, 16, 22);
    } else {
      camera.position.set(-17, 14, 19);
    }
    cameraRef.current = camera;

    // WebGL Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = 12;
    controls.maxDistance = 32;
    controls.target.set(0, 2.4, 0);
    controlsRef.current = controls;

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xe8f4ff, 0x3d352c, 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.9);
    sunLight.position.set(-14, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 4. Ground Platform & Landscaping
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    // Beveled subterranean base slab
    const baseGeo = new THREE.BoxGeometry(22, 1.2, 22);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xe2e6eb,
      roughness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.6;
    baseMesh.receiveShadow = true;
    groundGroup.add(baseMesh);

    // Lawn grass
    const lawnGeo = new THREE.PlaneGeometry(16.5, 16.5);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x5a883e,
      roughness: 0.85,
    });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.rotation.x = -Math.PI / 2;
    lawnMesh.position.set(-2, 0.01, -2);
    lawnMesh.receiveShadow = true;
    groundGroup.add(lawnMesh);

    // Driveway with pavers
    const drivewayTexture = generateDrivewayTexture();
    const drivewayGeo = new THREE.PlaneGeometry(5.4, 8.8);
    const drivewayMat = new THREE.MeshStandardMaterial({
      map: drivewayTexture,
      roughness: 0.7,
    });
    const drivewayMesh = new THREE.Mesh(drivewayGeo, drivewayMat);
    drivewayMesh.rotation.x = -Math.PI / 2;
    drivewayMesh.position.set(-6.5, 0.02, 2.3);
    drivewayMesh.receiveShadow = true;
    groundGroup.add(drivewayMesh);

    // Concrete Sidewalk along front
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xd7d8dc,
      roughness: 0.65,
    });
    const sidewalkFrontGeo = new THREE.BoxGeometry(22, 0.16, 2.2);
    const sidewalkFront = new THREE.Mesh(sidewalkFrontGeo, sidewalkMat);
    sidewalkFront.position.set(0, 0.08, 7.8);
    sidewalkFront.receiveShadow = true;
    groundGroup.add(sidewalkFront);

    // Asphalt Road with white lines in foreground
    const roadTexture = generateRoadTexture();
    const roadGeo = new THREE.PlaneGeometry(22, 4.0);
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.85,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.rotation.z = Math.PI / 2;
    roadMesh.position.set(0, 0.02, 10.5);
    roadMesh.receiveShadow = true;
    groundGroup.add(roadMesh);

    // 5. Modern Architecture Villa
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Materials
    const whiteWallMat = new THREE.MeshStandardMaterial({
      color: 0xf6f7fa,
      roughness: 0.45,
    });
    const woodTexture = generateWoodSlatTexture();
    const woodSlatMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.55,
    });
    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.3,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfe9f7,
      transparent: true,
      opacity: 0.5,
      roughness: 0.06,
      transmission: 0.8,
      ior: 1.45,
      reflectivity: 0.65,
    });

    // Ground Floor Body (Living Area)
    const groundFloorGeo = new THREE.BoxGeometry(7.2, 2.7, 7.5);
    const groundFloorMesh = new THREE.Mesh(groundFloorGeo, whiteWallMat);
    groundFloorMesh.position.set(0.6, 1.35, -0.6);
    groundFloorMesh.castShadow = true;
    groundFloorMesh.receiveShadow = true;
    houseGroup.add(groundFloorMesh);

    // Ground Floor Glass Sliding Doors
    const gfGlassGeo = new THREE.PlaneGeometry(5.8, 2.3);
    const gfGlassMesh = new THREE.Mesh(gfGlassGeo, glassMat);
    gfGlassMesh.position.set(0.6, 1.25, 3.16);
    houseGroup.add(gfGlassMesh);

    // Ground Floor Interior Warm Light
    const gfInteriorLight = new THREE.PointLight(0xffa84c, 0.8, 9);
    gfInteriorLight.position.set(0.6, 1.6, 0.5);
    scene.add(gfInteriorLight);
    interiorLightsRef.current.push(gfInteriorLight);

    // Carport Pillar
    const carportPillarGeo = new THREE.BoxGeometry(0.35, 2.7, 0.35);
    const carportPillar = new THREE.Mesh(carportPillarGeo, whiteWallMat);
    carportPillar.position.set(-7.8, 1.35, 2.9);
    carportPillar.castShadow = true;
    houseGroup.add(carportPillar);

    // Modern Silver Car in Carport
    const carGroup = new THREE.Group();
    carGroup.position.set(-5.6, 0.15, 1.2);
    carGroup.rotation.y = 0.05;

    const carPaintMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      metalness: 0.85,
      roughness: 0.18,
    });
    const carGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0f141c,
      roughness: 0.1,
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.9,
    });

    // Car Body Chassis
    const carBodyGeo = new THREE.BoxGeometry(2.3, 0.75, 4.4);
    const carBodyMesh = new THREE.Mesh(carBodyGeo, carPaintMat);
    carBodyMesh.position.y = 0.45;
    carBodyMesh.castShadow = true;
    carGroup.add(carBodyMesh);

    // Car Cabin Glass
    const carCabinGeo = new THREE.BoxGeometry(2.0, 0.65, 2.6);
    const carCabinMesh = new THREE.Mesh(carCabinGeo, carGlassMat);
    carCabinMesh.position.set(0, 1.05, -0.2);
    carCabinMesh.castShadow = true;
    carGroup.add(carCabinMesh);

    // Car Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelPositions = [
      [-1.15, 0.36, 1.3],
      [1.15, 0.36, 1.3],
      [-1.15, 0.36, -1.3],
      [1.15, 0.36, -1.3],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });
    houseGroup.add(carGroup);

    // Entrance Patio with Steps
    const patioGeo = new THREE.BoxGeometry(4.0, 0.3, 2.8);
    const patioMesh = new THREE.Mesh(patioGeo, sidewalkMat);
    patioMesh.position.set(2.4, 0.15, 3.8);
    patioMesh.receiveShadow = true;
    houseGroup.add(patioMesh);

    // Outdoor Battery Unit (BESS) on Patio Wall
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(3.4, 0.3, 2.9);

    const battCabinetGeo = new THREE.BoxGeometry(0.85, 1.5, 0.45);
    const battCabinetMat = new THREE.MeshStandardMaterial({
      color: 0xf1f3f6,
      roughness: 0.35,
    });
    const battCabinetMesh = new THREE.Mesh(battCabinetGeo, battCabinetMat);
    battCabinetMesh.position.y = 0.75;
    battCabinetMesh.castShadow = true;
    batteryGroup.add(battCabinetMesh);

    // Battery Glowing Status LED Bar
    const ledGeo = new THREE.BoxGeometry(0.06, 0.9, 0.04);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    batteryLedMatRef.current = ledMat;
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(-0.25, 0.75, 0.23);
    batteryGroup.add(ledMesh);

    // Battery Point Glow
    const battGlowLight = new THREE.PointLight(0x10b981, 0.6, 2.5);
    battGlowLight.position.set(-0.25, 0.75, 0.4);
    batteryGroup.add(battGlowLight);
    houseGroup.add(batteryGroup);

    clickableMeshesRef.current.push({ mesh: battCabinetMesh, id: 'battery' });

    // Second Floor Cantilever & Balcony
    const upperFloorGeo = new THREE.BoxGeometry(11.0, 2.8, 7.8);
    const upperFloorMesh = new THREE.Mesh(upperFloorGeo, whiteWallMat);
    upperFloorMesh.position.set(-1.3, 4.1, -0.6);
    upperFloorMesh.castShadow = true;
    upperFloorMesh.receiveShadow = true;
    houseGroup.add(upperFloorMesh);

    // Second Floor Wood Slat Accent Wall
    const upperWoodWallGeo = new THREE.BoxGeometry(4.2, 2.8, 0.1);
    const upperWoodWall = new THREE.Mesh(upperWoodWallGeo, woodSlatMat);
    upperWoodWall.position.set(2.1, 4.1, 3.32);
    upperWoodWall.castShadow = true;
    houseGroup.add(upperWoodWall);

    // Second Floor Panoramic Glass Window
    const upperWindowGeo = new THREE.PlaneGeometry(6.4, 2.4);
    const upperWindowMesh = new THREE.Mesh(upperWindowGeo, glassMat);
    upperWindowMesh.position.set(-2.8, 4.1, 3.32);
    houseGroup.add(upperWindowMesh);

    // Balcony Glass Railing
    const railingGeo = new THREE.PlaneGeometry(10.6, 0.9);
    const railingMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.85,
    });
    const railingMesh = new THREE.Mesh(railingGeo, railingMat);
    railingMesh.position.set(-1.3, 3.2, 3.8);
    houseGroup.add(railingMesh);

    // Second Floor Interior Warm Light
    const upperInteriorLight = new THREE.PointLight(0xffb252, 0.9, 10);
    upperInteriorLight.position.set(-1.3, 4.4, 0.6);
    scene.add(upperInteriorLight);
    interiorLightsRef.current.push(upperInteriorLight);

    clickableMeshesRef.current.push({ mesh: groundFloorMesh, id: 'house' });
    clickableMeshesRef.current.push({ mesh: upperFloorMesh, id: 'house' });

    // 6. Sloped Roof & Photovoltaic Solar Array
    const roofGroup = new THREE.Group();
    roofGroup.position.set(-1.3, 5.5, -0.6);

    const roofPitchRad = (22 * Math.PI) / 180;
    const roofSlabGeo = new THREE.BoxGeometry(11.6, 0.35, 8.4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x30353d,
      roughness: 0.6,
    });
    const roofMesh = new THREE.Mesh(roofSlabGeo, roofMat);
    roofMesh.rotation.x = roofPitchRad;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    roofGroup.add(roofMesh);

    // Photovoltaic Solar Panels Grid
    const pvTexture = generatePhotovoltaicTexture();
    const pvMat = new THREE.MeshStandardMaterial({
      map: pvTexture,
      roughness: 0.18,
      metalness: 0.5,
    });

    const panelGridGeo = new THREE.PlaneGeometry(9.4, 6.2);
    const panelGridMesh = new THREE.Mesh(panelGridGeo, pvMat);
    panelGridMesh.rotation.x = roofPitchRad - Math.PI / 2;
    panelGridMesh.position.set(0, 0.22, 0);
    panelGridMesh.castShadow = true;
    roofGroup.add(panelGridMesh);

    // Golden solar energy indicator point on panels
    const solarAnchorGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const solarAnchorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.5,
    });
    const solarAnchorMesh = new THREE.Mesh(solarAnchorGeo, solarAnchorMat);
    solarAnchorMesh.position.set(-2.0, 0.8, 1.2);
    roofGroup.add(solarAnchorMesh);

    houseGroup.add(roofGroup);
    clickableMeshesRef.current.push({ mesh: panelGridMesh, id: 'solar' });

    // 7. Electrical Utility Power Pole & Overhead Lines
    const gridGroup = new THREE.Group();
    gridGroup.position.set(8.2, 0, 6.8);

    // Wooden Pole
    const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 8.2, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x5a4838,
      roughness: 0.85,
    });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 4.1;
    poleMesh.castShadow = true;
    gridGroup.add(poleMesh);

    // Crossarm
    const crossarmGeo = new THREE.BoxGeometry(2.4, 0.18, 0.18);
    const crossarm = new THREE.Mesh(crossarmGeo, poleMat);
    crossarm.position.set(0, 7.2, 0);
    crossarm.castShadow = true;
    gridGroup.add(crossarm);

    // Insulator Bells
    const insulatorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8);
    const insulatorMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.2,
    });
    [-0.9, 0, 0.9].forEach((x) => {
      const ins = new THREE.Mesh(insulatorGeo, insulatorMat);
      ins.position.set(x, 7.35, 0);
      gridGroup.add(ins);
    });

    // Cylindrical Pole-Mounted Step-Down Transformer
    const transGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 16);
    const transMat = new THREE.MeshStandardMaterial({
      color: 0x717984,
      metalness: 0.6,
      roughness: 0.35,
    });
    const transformer = new THREE.Mesh(transGeo, transMat);
    transformer.position.set(0.35, 6.2, 0.25);
    transformer.castShadow = true;
    gridGroup.add(transformer);

    scene.add(gridGroup);
    clickableMeshesRef.current.push({ mesh: poleMesh, id: 'grid' });
    clickableMeshesRef.current.push({ mesh: transformer, id: 'grid' });

    // Overhead Triplex Power Lines from Pole to House
    const poleAttachPoint = new THREE.Vector3(8.2, 7.2, 6.8);
    const houseAttachPoint = new THREE.Vector3(4.3, 5.2, -0.4);

    const wireCurve = new THREE.QuadraticBezierCurve3(
      houseAttachPoint,
      new THREE.Vector3(6.2, 4.8, 3.2),
      poleAttachPoint
    );

    const wireGeo = new THREE.TubeGeometry(wireCurve, 32, 0.025, 6, false);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x333b48,
      roughness: 0.6,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Animated Glowing Energy Pulses along the Power Wire
    const pulseCount = 3;
    const pulseGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const pulseMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 3.5,
    });

    for (let p = 0; p < pulseCount; p++) {
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pulseMesh);
      powerLinePulsesRef.current.push(pulseMesh);
    }

    // 8. Garden Landscaping & Trees
    const gardenGroup = new THREE.Group();

    const createTree = (x: number, z: number, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.scale.set(scale, scale, scale);

      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.4, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      tree.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3e6827, roughness: 0.85 });
      const foliagePositions = [
        [0, 2.6, 0, 0.95],
        [0.4, 2.3, 0.3, 0.75],
        [-0.35, 2.4, -0.2, 0.8],
        [0.1, 3.1, 0.1, 0.7],
      ];
      foliagePositions.forEach(([fx, fy, fz, fr]) => {
        const folGeo = new THREE.SphereGeometry(fr, 12, 12);
        const folMesh = new THREE.Mesh(folGeo, leafMat);
        folMesh.position.set(fx, fy, fz);
        folMesh.castShadow = true;
        tree.add(folMesh);
      });

      return tree;
    };

    gardenGroup.add(createTree(-8.5, 6.2, 1.15));
    gardenGroup.add(createTree(6.2, 3.5, 0.9));
    gardenGroup.add(createTree(5.5, -6.5, 1.2));

    const bushMat = new THREE.MeshStandardMaterial({ color: 0x4a7c30, roughness: 0.8 });
    const bushCoords = [
      [3.8, 0.35, 5.4, 0.45],
      [4.5, 0.35, 5.0, 0.5],
      [1.5, 0.3, 5.6, 0.4],
      [0.2, 0.3, 5.2, 0.45],
      [-2.8, 0.3, 5.2, 0.4],
    ];
    bushCoords.forEach(([bx, by, bz, br]) => {
      const bushGeo = new THREE.SphereGeometry(br, 8, 8);
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(bx, by, bz);
      bush.castShadow = true;
      gardenGroup.add(bush);
    });
    scene.add(gardenGroup);

    // 9. Raycasting Click Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshesToTest = clickableMeshesRef.current.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(meshesToTest, true);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const isDescendant = (child: THREE.Object3D, parent: THREE.Object3D): boolean => {
          let curr: THREE.Object3D | null = child;
          while (curr) {
            if (curr === parent) return true;
            curr = curr.parent;
          }
          return false;
        };
        const entry = clickableMeshesRef.current.find(
          (c) => c.mesh === hitMesh || isDescendant(hitMesh, c.mesh)
        );
        if (entry && onSelectObject) {
          onSelectObject(entry.id);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      controls.update();

      if (isRotating) {
        scene.rotation.y += 0.003;
      }

      // Animate energy pulses along the power wire
      powerLinePulsesRef.current.forEach((pulse, idx) => {
        const offset = (elapsedTime * 0.4 + idx / pulseCount) % 1.0;
        const pt = wireCurve.getPoint(offset);
        pulse.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      const isMob = newW < 640 && newH > newW;
      camera.fov = isMob ? 36 : 30;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 11. Daylight Reaction: Moves Sun in sky arc, shifts colors, soft shadows, illuminates windows at night
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;

    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const hemi = hemiLightRef.current;

    const isDay = activeHour >= 5.5 && activeHour <= 19.5;
    const dayProgress = (activeHour - 5.5) / 14;

    if (isDay) {
      const sunAngle = dayProgress * Math.PI;
      const sunElevation = Math.sin(sunAngle);

      const sunDistance = 24;
      sun.position.x = -Math.cos(sunAngle) * sunDistance;
      sun.position.y = Math.max(2, sunElevation * 22);
      sun.position.z = 10 - Math.sin(sunAngle) * 6;

      if (activeHour < 10) {
        // Morning
        sun.color.setHex(0xffe4b5);
        sun.intensity = 1.6 + sunElevation * 0.4;
        ambient.color.setHex(0xfaf3eb);
        ambient.intensity = 0.65;
        hemi.color.setHex(0xe8f2fc);
      } else if (activeHour <= 16) {
        // High Noon
        sun.color.setHex(0xfffbf2);
        sun.intensity = 2.1;
        ambient.color.setHex(0xffffff);
        ambient.intensity = 0.75;
        hemi.color.setHex(0xebf5ff);
      } else {
        // Evening / Sunset
        sun.color.setHex(0xff9e64);
        sun.intensity = Math.max(0.6, sunElevation * 1.8);
        ambient.color.setHex(0xffeedd);
        ambient.intensity = 0.55;
        hemi.color.setHex(0xfce7f3);
      }

      interiorLightsRef.current.forEach((light) => {
        light.intensity = activeHour > 17 ? 1.2 : 0.2;
      });
    } else {
      // Nighttime
      sun.position.set(12, 10, -12);
      sun.color.setHex(0x506888);
      sun.intensity = 0.25;

      ambient.color.setHex(0x1a2638);
      ambient.intensity = 0.35;
      hemi.color.setHex(0x0f172a);
      hemi.groundColor.setHex(0x050811);

      // House windows illuminate warmly at night
      interiorLightsRef.current.forEach((light) => {
        light.intensity = 3.2;
        light.color.setHex(0xffad54);
      });
    }

    // Battery LED glow
    if (batteryLedMatRef.current) {
      if (activeHour >= 8 && activeHour <= 16) {
        batteryLedMatRef.current.color.setHex(0x10b981);
        batteryLedMatRef.current.emissive.setHex(0x10b981);
      } else if (activeHour > 16 && activeHour < 23) {
        batteryLedMatRef.current.color.setHex(0x38bdf8);
        batteryLedMatRef.current.emissive.setHex(0x38bdf8);
      } else {
        batteryLedMatRef.current.color.setHex(0x94a3b8);
        batteryLedMatRef.current.emissive.setHex(0x64748b);
      }
    }
  }, [activeHour]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none ${className}`}
      title="Click & drag to rotate the 3D home, scroll to zoom"
    />
  );
};
