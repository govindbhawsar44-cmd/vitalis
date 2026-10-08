import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const OrganScroll3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e13, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Clinical Lighting System
    const ambientLight = new THREE.AmbientLight(0x0a2233, 3.0);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x0ae2c8, 3.5);
    cyanLight.position.set(6, 12, 8);
    scene.add(cyanLight);

    const blueLight = new THREE.DirectionalLight(0x3b82f6, 3.0);
    blueLight.position.set(-8, -6, 6);
    scene.add(blueLight);

    const pulseLight = new THREE.PointLight(0x00f2fe, 2.0, 15);
    pulseLight.position.set(0, 0, 4);
    scene.add(pulseLight);

    // Group to hold organs
    const organsGroup = new THREE.Group();
    scene.add(organsGroup);

    // Materials
    const glassWireMat = new THREE.MeshPhongMaterial({
      color: 0x05202e,
      emissive: 0x0ae2c8,
      emissiveIntensity: 0.35,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });

    const glowingCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });

    const pulmonaryMat = new THREE.MeshPhongMaterial({
      color: 0x092e3d,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.45,
      shininess: 80,
      transparent: true,
      opacity: 0.75
    });

    const cardiacMat = new THREE.MeshPhongMaterial({
      color: 0x1a1236,
      emissive: 0x38ef7d,
      emissiveIntensity: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });

    // 1. Brain / Neural Cortex
    const brainGroup = new THREE.Group();
    brainGroup.position.set(3.8, 2.0, 0.5);

    const leftHemiGeo = new THREE.SphereGeometry(0.75, 20, 20);
    leftHemiGeo.scale(0.85, 1.1, 1.35);
    const leftHemi = new THREE.Mesh(leftHemiGeo, glassWireMat);
    leftHemi.position.set(-0.35, 0, 0);
    brainGroup.add(leftHemi);

    const rightHemiGeo = new THREE.SphereGeometry(0.75, 20, 20);
    rightHemiGeo.scale(0.85, 1.1, 1.35);
    const rightHemi = new THREE.Mesh(rightHemiGeo, glassWireMat);
    rightHemi.position.set(0.35, 0, 0);
    brainGroup.add(rightHemi);

    const brainCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 2), glowingCoreMat);
    brainGroup.add(brainCore);

    const brainRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.015, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x0ae2c8, transparent: true, opacity: 0.45 })
    );
    brainRing.rotation.x = Math.PI / 2.5;
    brainGroup.add(brainRing);

    organsGroup.add(brainGroup);

    // 2. Pulmonary Lungs
    const lungsGroup = new THREE.Group();
    lungsGroup.position.set(-4.0, 0.0, 0.2);

    const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8, 12), pulmonaryMat);
    trachea.position.set(0, 0.9, 0);
    lungsGroup.add(trachea);

    const leftLobe = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.6, 16), glassWireMat);
    leftLobe.position.set(-0.6, 0.1, 0);
    leftLobe.rotation.z = -0.18;
    lungsGroup.add(leftLobe);

    const rightLobe = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.65, 16), glassWireMat);
    rightLobe.position.set(0.6, 0.1, 0);
    rightLobe.rotation.z = 0.18;
    lungsGroup.add(rightLobe);

    organsGroup.add(lungsGroup);

    // 3. Cardiac Heart Hub
    const heartGroup = new THREE.Group();
    heartGroup.position.set(3.6, -2.5, -0.5);

    const heartMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), cardiacMat);
    heartGroup.add(heartMesh);

    const aortaMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.08, 8, 24, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0x38ef7d, wireframe: true })
    );
    aortaMesh.position.set(0, 0.75, 0);
    heartGroup.add(aortaMesh);

    organsGroup.add(heartGroup);

    // Ambient Particle Field
    const pCount = 350;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 14;
      pPos[i + 1] = (Math.random() - 0.5) * 14;
      pPos[i + 2] = (Math.random() - 0.5) * 10;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x0ae2c8,
      size: 0.03,
      transparent: true,
      opacity: 0.4
    });
    scene.add(new THREE.Points(pGeom, pMat));

    // Scroll & Parallax Handlers
    let targetScrollY = 0;
    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth parallax based on scroll
      const scrollOffset = targetScrollY * 0.003;
      organsGroup.position.y += (scrollOffset - organsGroup.position.y) * 0.05;

      // Brain gentle rotation & synpase pulse
      brainGroup.rotation.y = elapsed * 0.15;
      brainRing.rotation.z = elapsed * 0.2;
      const coreScale = 1.0 + Math.sin(elapsed * 4.0) * 0.12;
      brainCore.scale.set(coreScale, coreScale, coreScale);

      // Lungs gentle respiratory expansion
      const lungBreath = 1.0 + Math.sin(elapsed * 1.5) * 0.06;
      lungsGroup.scale.set(lungBreath, lungBreath, lungBreath);
      lungsGroup.rotation.y = -0.2 + Math.sin(elapsed * 0.8) * 0.08;

      // Cardiac rhythmic double-pulse (lub-dub)
      const heartBeat = 1.0 + Math.pow(Math.sin(elapsed * 2.5), 6) * 0.2;
      heartGroup.scale.set(heartBeat, heartBeat, heartBeat);
      heartGroup.rotation.y = elapsed * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-transparent">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};