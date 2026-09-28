import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SolarOrb3DProps {
  currentKw: number;
  capacityKw: number;
  className?: string;
}

export const SolarOrb3D: React.FC<SolarOrb3DProps> = ({
  currentKw,
  capacityKw,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    meshGroup?: THREE.Group;
    ringGroup?: THREE.Group;
    particles?: THREE.Points;
    reqId?: number;
    mouseX: number;
    mouseY: number;
    targetX: number;
    targetY: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
  });

  const ratio = Math.min(1, Math.max(0.1, currentKw / Math.max(1, capacityKw)));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 260;
    const height = container.clientHeight || 260;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // 1. Core Sphere (Luminous Solar Photosphere)
    const coreGeo = new THREE.IcosahedronGeometry(0.78, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#10E79D'),
      wireframe: true,
      transparent: true,
      opacity: 0.35 + ratio * 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    meshGroup.add(coreMesh);

    // 2. Inner Glow Sphere
    const innerGeo = new THREE.SphereGeometry(0.58, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#F59E0B'),
      transparent: true,
      opacity: 0.18 + ratio * 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    meshGroup.add(innerMesh);

    // 3. Dual Orbital Solar Conduits
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringGeo1 = new THREE.TorusGeometry(1.22, 0.016, 12, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#06B6D4'),
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ringGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.4, 0.012, 12, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#10E79D'),
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    ringGroup.add(ring2);

    // 4. Solar Photon Particles
    const particleCount = 48;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.0 + Math.random() * 0.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      color: new THREE.Color('#10E79D'),
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    stateRef.current = {
      renderer,
      scene,
      camera,
      meshGroup,
      ringGroup,
      particles,
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
    };

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetX = x * 0.6;
      stateRef.current.targetY = y * 0.6;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        stateRef.current.targetX = x * 0.5;
        stateRef.current.targetY = y * 0.5;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    ro.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      stateRef.current.mouseX += (stateRef.current.targetX - stateRef.current.mouseX) * 0.05;
      stateRef.current.mouseY += (stateRef.current.targetY - stateRef.current.mouseY) * 0.05;

      // Rotations
      if (meshGroup) {
        meshGroup.rotation.y += delta * 0.5;
        meshGroup.rotation.x = stateRef.current.mouseY * 0.8 + Math.sin(elapsedTime * 0.8) * 0.1;
        meshGroup.rotation.z = stateRef.current.mouseX * 0.8;

        const pulseScale = 1 + Math.sin(elapsedTime * 2.2) * 0.04 * (ratio + 0.5);
        meshGroup.scale.set(pulseScale, pulseScale, pulseScale);
      }

      if (ringGroup) {
        ringGroup.rotation.z += delta * 0.25;
        ringGroup.rotation.y -= delta * 0.2;
      }

      if (particles) {
        particles.rotation.y -= delta * 0.15;
      }

      renderer.render(scene, camera);
      stateRef.current.reqId = requestAnimationFrame(animate);
    };

    stateRef.current.reqId = requestAnimationFrame(animate);

    return () => {
      if (stateRef.current.reqId) cancelAnimationFrame(stateRef.current.reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      ro.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [ratio]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center pointer-events-auto select-none ${className}`}
      style={{ minHeight: '220px' }}
      aria-label="Interactive 3D Solar Node"
    />
  );
};
