import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, Cpu, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { SolarSystem } from '../types/solar';

interface SystemGallerySlider3DProps {
  system: SolarSystem;
  theme: 'dark' | 'light';
}

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  primaryMetric: string;
  metricLabel: string;
  specs: { label: string; value: string }[];
  geometryType: 'panel' | 'inverter' | 'battery' | 'gateway';
  accentColor: string;
}

/**
 * Grenergy-inspired 3D gallery / slider:
 * 1. "Hardware Architecture" title panel
 * 2. Page counter (e.g. "01 / 04")
 * 3. 3D wireframe model of hardware with interactive rotation
 * 4. "Nameplate Power" stat (and respective component primary metrics)
 * 5. Collapsible "Technical Telemetry" section
 */
export const SystemGallerySlider3D: React.FC<SystemGallerySlider3DProps> = ({
  system,
  theme,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const items: ComponentItem[] = [
    {
      id: 'pv-modules',
      name: 'Photovoltaic Array',
      category: 'Solar Generation',
      primaryMetric: `${system.capacity_kw} kW`,
      metricLabel: 'Nameplate Power',
      specs: [
        { label: 'Module Count', value: `${system.panel_count} Units` },
        { label: 'Cell Type', value: 'Monocrystalline PERC' },
        { label: 'Array Tilt', value: `${system.tilt_deg}° South` },
        { label: 'Azimuth', value: `${system.azimuth_deg}°` },
        { label: 'Degradation', value: '< 0.4% / yr' },
      ],
      geometryType: 'panel',
      accentColor: '#F59E0B',
    },
    {
      id: 'inverter-unit',
      name: 'Hybrid Inverter',
      category: 'Power Conversion',
      primaryMetric: '99.2%',
      metricLabel: 'CEC Efficiency',
      specs: [
        { label: 'Model', value: system.inverter_model },
        { label: 'Continuous Output', value: '7.6 kW AC' },
        { label: 'MPPT Trackers', value: '2 Independent' },
        { label: 'Cooling', value: 'Natural Convection' },
        { label: 'Safety', value: 'UL 1741-SA / AFCI' },
      ],
      geometryType: 'inverter',
      accentColor: '#FF6B00',
    },
    {
      id: 'storage-unit',
      name: 'Energy Storage',
      category: 'LFP Battery Pack',
      primaryMetric: '13.5 kWh',
      metricLabel: 'Usable Capacity',
      specs: [
        { label: 'Chemistry', value: 'Lithium Iron Phosphate' },
        { label: 'Peak Power', value: '7.0 kW (10s)' },
        { label: 'Round-Trip Efficiency', value: '90.5%' },
        { label: 'Depth of Discharge', value: '100%' },
        { label: 'Warranty', value: '10 Years / 80% Ret.' },
      ],
      geometryType: 'battery',
      accentColor: '#FBBF24',
    },
    {
      id: 'telemetry-gateway',
      name: 'Smart Gateway',
      category: 'Telemetry & Control',
      primaryMetric: '1 sec',
      metricLabel: 'Sampling Interval',
      specs: [
        { label: 'Connectivity', value: '4G LTE + Dual Wi-Fi' },
        { label: 'Accuracy', value: 'ANSI C12.20 (0.5%)' },
        { label: 'Local Backup', value: '48h Flash Cache' },
        { label: 'Protocols', value: 'SunSpec Modbus / TLS' },
        { label: 'Firmware', value: 'v3.8.4 Stable' },
      ],
      geometryType: 'gateway',
      accentColor: '#FB923C',
    },
  ];

  const currentItem = items[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Three.js 3D Wireframe Setup with Warm Amber Tones
  useEffect(() => {
    const holder = canvasRef.current;
    if (!holder) return;

    const width = holder.clientWidth || 320;
    const height = holder.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    holder.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const colorHex = currentItem.accentColor;
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.14,
    });

    if (currentItem.geometryType === 'panel') {
      const panelGroup = new THREE.Group();
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const pGeo = new THREE.BoxGeometry(0.5, 0.04, 0.7);
          const pMesh = new THREE.Mesh(pGeo, wireMat);
          const pFill = new THREE.Mesh(pGeo, glowMat);
          pMesh.position.set((c - 1) * 0.56, 0, (r - 0.5) * 0.76);
          pFill.position.copy(pMesh.position);
          panelGroup.add(pMesh);
          panelGroup.add(pFill);
        }
      }
      panelGroup.rotation.x = 0.45;
      group.add(panelGroup);
    } else if (currentItem.geometryType === 'inverter') {
      const invGeo = new THREE.BoxGeometry(1.0, 1.4, 0.45);
      const invMesh = new THREE.Mesh(invGeo, wireMat);
      const invFill = new THREE.Mesh(invGeo, glowMat);
      group.add(invMesh);
      group.add(invFill);

      const fins = new THREE.Group();
      for (let i = -0.5; i <= 0.5; i += 0.2) {
        const finGeo = new THREE.BoxGeometry(1.04, 0.03, 0.12);
        const finMesh = new THREE.Mesh(finGeo, wireMat);
        finMesh.position.set(0, i, -0.22);
        fins.add(finMesh);
      }
      group.add(fins);
    } else if (currentItem.geometryType === 'battery') {
      const batGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.5, 24);
      const batMesh = new THREE.Mesh(batGeo, wireMat);
      const batFill = new THREE.Mesh(batGeo, glowMat);
      group.add(batMesh);
      group.add(batFill);

      const ringGeo = new THREE.TorusGeometry(0.68, 0.02, 8, 32);
      for (let y = -0.5; y <= 0.5; y += 0.5) {
        const ring = new THREE.Mesh(ringGeo, wireMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        group.add(ring);
      }
    } else {
      const gwGeo = new THREE.DodecahedronGeometry(0.85, 0);
      const gwMesh = new THREE.Mesh(gwGeo, wireMat);
      const gwFill = new THREE.Mesh(gwGeo, glowMat);
      group.add(gwMesh);
      group.add(gwFill);
    }

    let reqId: number;
    let angle = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      angle += 0.012;
      group.rotation.y = angle;
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
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && holder.contains(renderer.domElement)) {
        holder.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentIndex, isDark]);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        isDark
          ? 'bg-[#12100E] border-[#2A2420] text-stone-100 shadow-xl'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      }`}
    >
      {/* Top Header: 1-3 word labels & Slide Counter */}
      <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[#2A2420]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Hardware Architecture
            </span>
            <div className="text-base sm:text-lg font-bold tracking-tight text-stone-100">
              {currentItem.name}
            </div>
          </div>
        </div>

        {/* Slide Counter (01 / 04) */}
        <div className="text-xs font-mono text-stone-400 bg-[#1A1714] border border-[#2A2420] px-3.5 py-1.5 rounded-xl">
          <span className="text-amber-400 font-bold">0{currentIndex + 1}</span> / 0{items.length}
        </div>
      </div>

      {/* Main 3D Gallery Stage (Grenergy-style: one item at a time with 3D slider) */}
      <div className="relative p-6 sm:p-10 flex flex-col items-center">
        {/* Carousel Slide Area */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: 3D Interactive Model Viewer */}
          <div className="lg:col-span-7 relative h-[260px] sm:h-[320px] rounded-2xl bg-[#1A1714] border border-[#2A2420] overflow-hidden flex items-center justify-center">
            <div ref={canvasRef} className="w-full h-full cursor-grab" />
            <div className="absolute top-3 left-4 text-[11px] font-mono text-stone-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentItem.accentColor }} />
              <span>{currentItem.category}</span>
            </div>
          </div>

          {/* Right: Key Metric ("Nameplate Power") & Nested Sub-Options */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                {currentItem.metricLabel}
              </span>
              <div
                className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight mt-1"
                style={{ color: currentItem.accentColor }}
              >
                {currentItem.primaryMetric}
              </div>
            </div>

            {/* Nested Sub-options Toggle: Collapsible Technical Telemetry */}
            <div className="rounded-2xl border border-[#2A2420] bg-[#1A1714] overflow-hidden">
              <button
                onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                className="w-full p-4 flex items-center justify-between text-xs font-semibold tracking-wide text-stone-300 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Technical Telemetry</span>
                </span>
                {isSpecsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {isSpecsExpanded && (
                <div className="p-4 border-t border-[#2A2420] space-y-2 text-xs font-mono animate-fadeIn">
                  {currentItem.specs.map((spec, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-[#2A2420]/60 last:border-0">
                      <span className="text-stone-400">{spec.label}</span>
                      <span className="text-stone-200 font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-2xl border border-[#2A2420] bg-[#1A1714] hover:bg-stone-800 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all active:scale-95"
            aria-label="Previous hardware"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-stone-700'
                }`}
                aria-label={`Jump to ${item.name}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-2xl border border-[#2A2420] bg-[#1A1714] hover:bg-stone-800 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all active:scale-95"
            aria-label="Next hardware"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
