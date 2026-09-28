import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, Clock, Compass, Sparkles } from 'lucide-react';

interface VoltaHero3DProps {
  capacityKw: number;
  activeHour: number;
  onHourChange: (hour: number) => void;
  theme: 'dark' | 'light';
}

/**
 * Volta Solar inspired 3D focal stage.
 * Features:
 * - One restrained, high-fidelity 3D photovoltaic node
 * - Warm glowing light, amber/solar orange wireframe sun
 * - Solar Generation card showing kW output and % capacity with Sun icon
 * - Daylight time slider control (draggable handle)
 * - Footer stats showing Peak output and "Optimal %" value
 */
export const VoltaHero3D: React.FC<VoltaHero3DProps> = ({
  capacityKw,
  activeHour,
  onHourChange,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isDark = theme === 'dark';

  // Solar insolation formula based on daytime (6:00 to 18:00)
  const isDaytime = activeHour >= 6 && activeHour <= 18;
  const solarAngle = isDaytime ? ((activeHour - 6) / 12) * Math.PI : 0;
  const insolationFactor = isDaytime ? Math.sin(solarAngle) : 0;

  const currentKw = Math.round(capacityKw * 0.74 * insolationFactor * 10) / 10;
  const currentRatioPct = Math.round((currentKw / capacityKw) * 100);

  const formattedTime =
    activeHour === 12
      ? '12:00 PM'
      : activeHour < 12
      ? `${activeHour}:00 AM`
      : `${activeHour - 12}:00 PM`;

  // Scroll reveal trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Three.js 3D Focal Setup with Warm Light & Amber Glow
  useEffect(() => {
    const holder = canvasHolderRef.current;
    if (!holder) return;

    const isMobile = window.innerWidth <= 640;
    const width = holder.clientWidth || (isMobile ? 320 : 640);
    const height = holder.clientHeight || (isMobile ? 340 : 460);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.z = isMobile ? 5.2 : 4.4;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    holder.appendChild(renderer.domElement);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central Photovoltaic Polyhedral Core (Restyled in glowing warm amber / solar orange)
    const coreDetail = isMobile ? 1 : 2;
    const coreGeo = new THREE.IcosahedronGeometry(1.05, coreDetail);
    const coreWireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(isDark ? '#F59E0B' : '#EA580C'),
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const coreWireMesh = new THREE.Mesh(coreGeo, coreWireMat);
    rootGroup.add(coreWireMesh);

    // Inner glowing sphere (Volta Solar warm light core)
    const innerGeo = new THREE.SphereGeometry(0.78, isMobile ? 16 : 28, isMobile ? 16 : 28);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF6B00'),
      transparent: true,
      opacity: 0.28 + insolationFactor * 0.52,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    rootGroup.add(innerMesh);

    // 2. Concentric Kinetic Energy Rings (Warm solar amber & gold)
    const ringGroup = new THREE.Group();
    rootGroup.add(ringGroup);

    const ringCount = isMobile ? 2 : 3;
    const rings: THREE.Mesh[] = [];

    for (let i = 0; i < ringCount; i++) {
      const radius = 1.45 + i * 0.32;
      const ringGeo = new THREE.TorusGeometry(radius, 0.014, 8, isMobile ? 48 : 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(i % 2 === 0 ? '#FBBF24' : '#FB923C'),
        transparent: true,
        opacity: 0.5 - i * 0.1,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = (Math.PI / 4) * (i + 1);
      ringMesh.rotation.y = (Math.PI / 6) * i;
      ringGroup.add(ringMesh);
      rings.push(ringMesh);
    }

    // 3. Solar Dust / Golden Photon Particles
    const particleCount = isMobile ? 50 : 130;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.7 + Math.random() * 1.6;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color('#FDE047'),
      size: isMobile ? 0.035 : 0.045,
      transparent: true,
      opacity: 0.75,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particlePoints);

    // Interactive pointer handling
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = holder.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = normX * 0.85;
      targetRotX = -normY * 0.65;
    };

    const containerEl = holder;
    containerEl.addEventListener('mousemove', handlePointerMove);
    containerEl.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Animation Loop with scroll reveal entrance
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inertia smoothing
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      rootGroup.rotation.y = elapsedTime * 0.25 + currentRotY;
      rootGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.15 + currentRotX;

      // Pulse inner glow with dynamic insolation
      const pulse = Math.sin(elapsedTime * 2) * 0.08;
      innerMesh.scale.setScalar(1 + pulse * insolationFactor);

      // Spin orbital rings
      rings.forEach((ring, idx) => {
        ring.rotation.z += (idx % 2 === 0 ? 0.008 : -0.006) * (1 + insolationFactor * 0.5);
      });

      // Orbit particles
      particlePoints.rotation.y = -elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!holder) return;
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      containerEl.removeEventListener('mousemove', handlePointerMove);
      containerEl.removeEventListener('touchmove', handlePointerMove);

      if (renderer.domElement && holder.contains(renderer.domElement)) {
        holder.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreWireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isDark, insolationFactor]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl border transition-all duration-300 overflow-hidden ${
        isDark
          ? 'bg-[#12100E] border-[#2A2420] text-stone-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transition: 'opacity 350ms ease-in-out, transform 350ms ease-in-out' }}
    >
      {/* Background Atmosphere: Warm glowing amber light halo */}
      <div className="absolute inset-0 bg-radial from-amber-500/12 via-orange-500/5 to-transparent pointer-events-none blur-3xl" />

      {/* Top HUD: "Solar Generation" card & Daylight Time Scrubber */}
      <div className="relative z-10 px-6 sm:px-10 pt-6 sm:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 2. Solar Generation card showing kW output and % capacity with Sun icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Solar Generation
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-stone-100 flex items-baseline gap-2">
              <span>{currentKw.toFixed(1)}</span>
              <span className="text-xs font-sans text-stone-400 font-normal">kW</span>
              <span className="text-xs font-mono text-amber-400 font-semibold ml-2">
                {currentRatioPct}% Capacity
              </span>
            </div>
          </div>
        </div>

        {/* 4. Daylight Time Slider Control with draggable handle */}
        <div className="flex items-center gap-2.5 bg-[#1A1714] border border-[#2A2420] px-4 py-2 rounded-xl text-xs font-mono self-start sm:self-auto backdrop-blur-sm shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-stone-400">Time:</span>
          <span className="text-amber-400 font-bold min-w-[65px]">{formattedTime}</span>
          <input
            type="range"
            min="6"
            max="18"
            step="1"
            value={activeHour}
            onChange={(e) => onHourChange(parseInt(e.target.value))}
            className="w-24 sm:w-32 accent-amber-500 cursor-pointer ml-1 h-1.5 bg-stone-800 rounded-lg"
            aria-label="Solar daylight slider"
          />
        </div>
      </div>

      {/* 3. 3D Visual Stage (Wireframe Sun with glowing warm light) */}
      <div className="relative w-full h-[320px] sm:h-[420px] flex items-center justify-center">
        <div
          ref={canvasHolderRef}
          className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        />

        {/* 5. Footer stats showing Peak output and an "Optimal %" value */}
        <div className="absolute bottom-5 left-6 sm:left-10 right-6 sm:right-10 flex items-center justify-between pointer-events-none text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive 3D Node</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Peak: {capacityKw} kW</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">92% Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
