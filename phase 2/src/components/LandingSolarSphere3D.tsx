import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sun, Home as HomeIcon, BatteryCharging } from 'lucide-react';

interface LandingSolarSphere3DProps {
  className?: string;
}

/**
 * Helper to generate soft radial glow canvas texture for the warm golden pool of light under the sun.
 */
function createRadialGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 193, 7, 0.68)');
    gradient.addColorStop(0.35, 'rgba(255, 160, 0, 0.32)');
    gradient.addColorStop(0.65, 'rgba(255, 140, 0, 0.10)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 3D Solar Model Matching SolarSense Visual Reference:
 * - Scaled & calibrated with wide camera frustum so it NEVER gets clipped or trapped in a square box!
 * - 100% transparent canvas (clearColor 0x000000, alpha: true) floating cleanly above the cloudy sky background
 * - Radiant warm golden sun sphere (#FEA807, #FFC912)
 * - Tilted warm golden ring with golden orbital beads (connected to Solar Panels & Grid)
 * - Crossed electric cyan-blue ring with cyan & emerald green beads (connected to Your Home & Battery)
 * - Concentric crystalline ground radar grid discs with grid dots and soft floor reflection
 * - Surrounding feature callout cards positioned at the outer corners with zero collision/overlap with 3D rings
 */
export const LandingSolarSphere3D: React.FC<LandingSolarSphere3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const width = container.clientWidth || (isMobile ? 360 : 800);
    const height = container.clientHeight || (isMobile ? 380 : 540);

    const scene = new THREE.Scene();
    
    // Generous camera distance + fov ensures 3D geometry NEVER touches or clips the canvas bounds
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.65, isMobile ? 8.8 : 7.2);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent background - no square box artifacts
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    
    // Explicit styling to ensure seamless borderless floating
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.outline = 'none';
    renderer.domElement.style.overflow = 'visible';
    renderer.domElement.style.pointerEvents = 'auto';

    container.appendChild(renderer.domElement);

    // Master Group containing the complete solar assembly
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ==========================================
    // 1. LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfffaed, 2.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainLight.position.set(3, 6, 4);
    scene.add(mainLight);

    const sunPointLight = new THREE.PointLight(0xffb703, 3.2, 10, 1.5);
    sunPointLight.position.set(0, 0, 0);
    masterGroup.add(sunPointLight);

    const blueRimLight = new THREE.DirectionalLight(0x00a6fb, 1.5);
    blueRimLight.position.set(-4, -1, 3);
    scene.add(blueRimLight);

    // ==========================================
    // 2. WARM GOLDEN SUN SPHERE (Center Core)
    // ==========================================
    const sunRadius = 0.78;
    const sunGeo = new THREE.SphereGeometry(sunRadius, 48, 48);
    const sunMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFBE1A'),
      emissive: new THREE.Color('#FE9B00'),
      emissiveIntensity: 0.78,
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.30,
      clearcoatRoughness: 0.2,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    masterGroup.add(sunMesh);

    // Inner Radiant Core
    const innerCoreGeo = new THREE.SphereGeometry(sunRadius * 0.94, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFE266'),
      transparent: true,
      opacity: 0.85,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    masterGroup.add(innerCoreMesh);

    // Soft Golden Sun Glow Halo
    const haloGeo = new THREE.SphereGeometry(sunRadius * 1.15, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFA000'),
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    masterGroup.add(haloMesh);

    // Soft Golden Pool of Light on Floor
    const glowTexture = createRadialGlowTexture();
    const floorGlowGeo = new THREE.PlaneGeometry(2.8, 2.8);
    const floorGlowMat = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const floorGlowMesh = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlowMesh.rotation.x = -Math.PI / 2;
    floorGlowMesh.position.y = -0.42;
    masterGroup.add(floorGlowMesh);

    // ==========================================
    // 3. CRYSTALLINE GROUND RADAR GRID DISCS
    // ==========================================
    const groundGridGroup = new THREE.Group();
    groundGridGroup.position.y = -0.40;

    const radarRadii = [0.85, 1.15, 1.45, 1.75];
    radarRadii.forEach((r, idx) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.0055, 8, isMobile ? 48 : 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(idx === 1 ? '#94A3B8' : '#CBD5E1'),
        transparent: true,
        opacity: 0.28 - idx * 0.04,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      groundGridGroup.add(ringMesh);
    });

    // Faint radial radar spokes and dots
    const spokeCount = 12;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(angle) * 0.85, 0, Math.sin(angle) * 0.85),
        new THREE.Vector3(Math.cos(angle) * 1.75, 0, Math.sin(angle) * 1.75),
      ]);
      const spokeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#94A3B8'),
        transparent: true,
        opacity: 0.16,
      });
      const spokeLine = new THREE.Line(spokeGeo, spokeMat);
      groundGridGroup.add(spokeLine);

      // Dots along the spokes
      radarRadii.forEach((r) => {
        const dotGeo = new THREE.SphereGeometry(0.014, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#E2E8F0'),
          transparent: true,
          opacity: 0.50,
        });
        const dotMesh = new THREE.Mesh(dotGeo, dotMat);
        dotMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        groundGridGroup.add(dotMesh);
      });
    }
    masterGroup.add(groundGridGroup);

    // ==========================================
    // 4. RING 1: WARM GOLDEN ORBITAL RING
    // ==========================================
    const goldenRingRadius = 1.48;
    const goldenRingGeo = new THREE.TorusGeometry(goldenRingRadius, 0.018, 16, isMobile ? 64 : 110);
    const goldenRingMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFC107'),
      emissive: new THREE.Color('#FFA000'),
      emissiveIntensity: 0.95,
      roughness: 0.18,
      metalness: 0.2,
      clearcoat: 0.4,
    });
    const goldenRing = new THREE.Mesh(goldenRingGeo, goldenRingMat);
    goldenRing.rotation.set(Math.PI * 0.42, -Math.PI * 0.06, -Math.PI * 0.04);
    masterGroup.add(goldenRing);

    // Golden Beads along the Golden Ring
    const goldBeadMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFD54F'),
      emissive: new THREE.Color('#FFB300'),
      emissiveIntensity: 1.05,
      roughness: 0.12,
      metalness: 0.25,
      clearcoat: 0.5,
    });

    const goldenBeadAngles = [
      Math.PI * 0.38,  // Solar Panels Node (top-left)
      Math.PI * 0.56,  // Decorative bead
      Math.PI * 0.68,  // Decorative bead
      Math.PI * 1.58,  // Grid Node (bottom-right)
    ];

    goldenBeadAngles.forEach((angle, idx) => {
      const radius = idx === 0 || idx === 3 ? 0.052 : 0.035;
      const beadGeo = new THREE.SphereGeometry(radius, 16, 16);
      const beadMesh = new THREE.Mesh(beadGeo, goldBeadMat);
      beadMesh.position.set(
        Math.cos(angle) * goldenRingRadius,
        Math.sin(angle) * goldenRingRadius,
        0
      );
      goldenRing.add(beadMesh);
    });

    // ==========================================
    // 5. RING 2: ELECTRIC CYAN-BLUE ORBITAL RING
    // ==========================================
    const blueRingRadius = 1.54;
    const blueRingGeo = new THREE.TorusGeometry(blueRingRadius, 0.021, 16, isMobile ? 64 : 110);
    const blueRingMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00A6FB'),
      emissive: new THREE.Color('#0077B6'),
      emissiveIntensity: 1.15,
      roughness: 0.14,
      metalness: 0.2,
      clearcoat: 0.4,
    });
    const blueRing = new THREE.Mesh(blueRingGeo, blueRingMat);
    blueRing.rotation.set(Math.PI * 0.32, Math.PI * 0.28, Math.PI * 0.15);
    masterGroup.add(blueRing);

    // Cyan Bead (Your Home Node - top-right)
    const cyanBeadGeo = new THREE.SphereGeometry(0.056, 18, 18);
    const cyanBeadMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#38BDF8'),
      emissive: new THREE.Color('#00B4D8'),
      emissiveIntensity: 1.25,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 0.5,
    });
    const cyanBeadMesh = new THREE.Mesh(cyanBeadGeo, cyanBeadMat);
    cyanBeadMesh.position.set(
      Math.cos(Math.PI * 0.32) * blueRingRadius,
      Math.sin(Math.PI * 0.32) * blueRingRadius,
      0
    );
    blueRing.add(cyanBeadMesh);

    // Emerald Green Bead (Battery Node - bottom-left)
    const greenBeadGeo = new THREE.SphereGeometry(0.056, 18, 18);
    const greenBeadMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#34D399'),
      emissive: new THREE.Color('#059669'),
      emissiveIntensity: 1.35,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 0.5,
    });
    const greenBeadMesh = new THREE.Mesh(greenBeadGeo, greenBeadMat);
    greenBeadMesh.position.set(
      Math.cos(Math.PI * 1.36) * blueRingRadius,
      Math.sin(Math.PI * 1.36) * blueRingRadius,
      0
    );
    blueRing.add(greenBeadMesh);

    // ==========================================
    // 6. INTERACTIVE PARALLAX & ANIMATION LOOP
    // ==========================================
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = normX * 0.20;
      targetRotX = -normY * 0.12;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove, { passive: true });

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inertia smoothing for mouse interaction
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      // Gentle floating animation - calibrated to never clip edges
      masterGroup.position.y = Math.sin(elapsedTime * 0.85) * 0.04;
      masterGroup.rotation.y = elapsedTime * 0.07 + currentRotY;
      masterGroup.rotation.x = Math.sin(elapsedTime * 0.55) * 0.02 + currentRotX;

      // Subtle breathing pulse on the core
      const pulse = Math.sin(elapsedTime * 2.0) * 0.016;
      sunMesh.scale.setScalar(1 + pulse);
      innerCoreMesh.scale.setScalar(1 + pulse * 1.15);

      // Gentle slow orbit rotation of the rings
      goldenRing.rotation.z += 0.0014;
      blueRing.rotation.z -= 0.0018;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const mobile = window.innerWidth < 768;
      camera.aspect = w / h;
      camera.position.set(0, 0.65, mobile ? 8.8 : 7.2);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      floorGlowGeo.dispose();
      floorGlowMat.dispose();
      goldenRingGeo.dispose();
      goldenRingMat.dispose();
      blueRingGeo.dispose();
      blueRingMat.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full max-w-5xl lg:max-w-6xl mx-auto select-none ${className}`}>
      {/* 3D Model Main Stage */}
      <div className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px]">
        {/* 1. SOFT GOLDEN SUNLIGHT AURA DIRECTLY BEHIND THE 3D SUN (No square borders!) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[340px] bg-gradient-to-r from-amber-200/30 via-yellow-100/20 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

        {/* 2. THREE.JS 3D CANVAS (Floats freely in the cloudy sky above background without square cutoff) */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 overflow-visible"
          aria-label="SolarSense 3D Energy Solar Model"
        />

        {/* 3. SVG POINTER LINES CONNECTING CARDS TO 3D RING NODES (Desktop Only) */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 1000 540"
          preserveAspectRatio="none"
        >
          {/* Solar Panels -> Golden Ring Node (Top-Left) */}
          <polyline
            points="230,75 320,75 410,210"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="opacity-75"
          />
          <circle cx="410" cy="210" r="4.5" fill="#F59E0B" />

          {/* Your Home -> Cyan Ring Node (Top-Right) */}
          <polyline
            points="770,75 680,75 595,200"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="opacity-75"
          />
          <circle cx="595" cy="200" r="4.5" fill="#0284C7" />

          {/* Battery -> Emerald Green Ring Node (Bottom-Left) */}
          <polyline
            points="230,465 320,465 390,340"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="opacity-75"
          />
          <circle cx="390" cy="340" r="4.5" fill="#10B981" />

          {/* Grid -> Golden Ring Node (Bottom-Right) */}
          <polyline
            points="770,465 680,465 610,335"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="opacity-75"
          />
          <circle cx="610" cy="335" r="4.5" fill="#7C3AED" />
        </svg>

        {/* 4. SURROUNDING 4 FEATURE CALLOUT CARDS (Positioned At Outer Corners — Zero Ring Overlap) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-30">
          {/* Top Left: Solar Panels */}
          <div className="absolute top-2 left-0 lg:left-2 pointer-events-auto">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_6px_20px_rgba(2,132,199,0.06)] hover:bg-white/95 transition-all max-w-[215px] lg:max-w-[230px]">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0B2545] leading-tight">Solar Panels</h4>
                <p className="text-xs text-[#1E3A8A]/75 mt-1 leading-relaxed">
                  Capture sunlight and convert it into electricity.
                </p>
              </div>
            </div>
          </div>

          {/* Top Right: Your Home */}
          <div className="absolute top-2 right-0 lg:right-2 pointer-events-auto">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_6px_20px_rgba(2,132,199,0.06)] hover:bg-white/95 transition-all max-w-[215px] lg:max-w-[230px]">
              <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200/60 flex items-center justify-center text-[#0284C7] shrink-0 shadow-xs">
                <HomeIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0B2545] leading-tight">Your Home</h4>
                <p className="text-xs text-[#1E3A8A]/75 mt-1 leading-relaxed">
                  Use clean energy for your everyday needs.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Left: Battery */}
          <div className="absolute bottom-4 left-0 lg:left-2 pointer-events-auto">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_6px_20px_rgba(2,132,199,0.06)] hover:bg-white/95 transition-all max-w-[215px] lg:max-w-[230px]">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-500 shrink-0 shadow-xs">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0B2545] leading-tight">Battery</h4>
                <p className="text-xs text-[#1E3A8A]/75 mt-1 leading-relaxed">
                  Store extra energy for later use.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Right: Grid */}
          <div className="absolute bottom-4 right-0 lg:right-2 pointer-events-auto">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_6px_20px_rgba(2,132,199,0.06)] hover:bg-white/95 transition-all max-w-[215px] lg:max-w-[230px]">
              <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0 shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 3h16M7 8h10M6 13h12M5 21l3-18m8 18-3-18M7 8l10 13M17 8 7 21" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0B2545] leading-tight">Grid</h4>
                <p className="text-xs text-[#1E3A8A]/75 mt-1 leading-relaxed">
                  Send or receive energy when needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Layout: Cards flow cleanly BELOW the 3D model with ZERO overlapping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 md:hidden px-2">
        {/* Solar Panels */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-[#0B2545]">Solar Panels</h4>
            <p className="text-xs text-[#1E3A8A]/75 mt-0.5">Capture sunlight and convert it into electricity.</p>
          </div>
        </div>

        {/* Your Home */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
            <HomeIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-[#0B2545]">Your Home</h4>
            <p className="text-xs text-[#1E3A8A]/75 mt-0.5">Use clean energy for your everyday needs.</p>
          </div>
        </div>

        {/* Battery */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-[#0B2545]">Battery</h4>
            <p className="text-xs text-[#1E3A8A]/75 mt-0.5">Store extra energy for later use.</p>
          </div>
        </div>

        {/* Grid */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 3h16M7 8h10M6 13h12M5 21l3-18m8 18-3-18M7 8l10 13M17 8 7 21" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-[#0B2545]">Grid</h4>
            <p className="text-xs text-[#1E3A8A]/75 mt-0.5">Send or receive energy when needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
