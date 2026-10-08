import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BodyMap3DProps {
  activeRegion: string;
  onSelectRegion: (regionId: string) => void;
  viewAngle: 'anterior' | 'posterior';
}

export const BodyMap3D: React.FC<BodyMap3DProps> = ({
  activeRegion,
  onSelectRegion,
  viewAngle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const activeHighlightMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const glassMatRef = useRef<THREE.MeshPhongMaterial | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Clinical Lighting System
    const ambientLight = new THREE.AmbientLight(0x0e2a38, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0ae2c8, 3.0);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 2.5);
    dirLight2.position.set(-5, -5, -4);
    scene.add(dirLight2);

    // Master Group
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);
    bodyGroupRef.current = bodyGroup;

    // Materials
    const glassMat = new THREE.MeshPhongMaterial({
      color: 0x061e29,
      emissive: 0x0ae2c8,
      emissiveIntensity: 0.12,
      shininess: 90,
      transparent: true,
      opacity: 0.65
    });
    glassMatRef.current = glassMat;

    const activeHighlightMat = new THREE.MeshPhongMaterial({
      color: 0x0ae2c8,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.6,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    activeHighlightMatRef.current = activeHighlightMat;

    const meshes: { [key: string]: THREE.Mesh } = {};

    // 1. Head & Cranium
    const headGeo = new THREE.SphereGeometry(0.35, 24, 24);
    headGeo.scale(0.85, 1.1, 0.95);
    const headMesh = new THREE.Mesh(headGeo, glassMat);
    headMesh.position.y = 2.65;
    headMesh.userData = { id: 'head', name: 'Cranial & Neurological' };
    bodyGroup.add(headMesh);
    meshes['head'] = headMesh;

    // 2. Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.28, 16);
    const neckMesh = new THREE.Mesh(neckGeo, glassMat);
    neckMesh.position.y = 2.22;
    bodyGroup.add(neckMesh);

    // 3. Chest / Thoracic / Respiratory
    const chestGeo = new THREE.CylinderGeometry(0.48, 0.42, 0.82, 20);
    chestGeo.scale(1.15, 1.0, 0.75);
    const chestMesh = new THREE.Mesh(chestGeo, glassMat);
    chestMesh.position.y = 1.72;
    chestMesh.userData = { id: 'chest', name: 'Pulmonology & Airway' };
    bodyGroup.add(chestMesh);
    meshes['chest'] = chestMesh;

    // 4. Abdomen / GI
    const abdomenGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.75, 20);
    abdomenGeo.scale(1.05, 1.0, 0.75);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, glassMat);
    abdomenMesh.position.y = 0.98;
    abdomenMesh.userData = { id: 'abdomen', name: 'Gastrointestinal & Hepatic' };
    bodyGroup.add(abdomenMesh);
    meshes['abdomen'] = abdomenMesh;

    // 5. Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.44, 0.36, 0.45, 18);
    pelvisGeo.scale(1.08, 1.0, 0.8);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, glassMat);
    pelvisMesh.position.y = 0.42;
    bodyGroup.add(pelvisMesh);

    // 6. Limbs - Arms
    function createArm(side: number) {
      const armGroup = new THREE.Group();
      const shoulderGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const shoulder = new THREE.Mesh(shoulderGeo, glassMat);
      shoulder.position.set(side * 0.68, 2.05, 0);
      armGroup.add(shoulder);

      const upperGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.75, 14);
      const upper = new THREE.Mesh(upperGeo, glassMat);
      upper.position.set(side * 0.78, 1.55, 0);
      upper.rotation.z = side * -0.15;
      armGroup.add(upper);

      const elbowGeo = new THREE.SphereGeometry(0.12, 14, 14);
      const elbow = new THREE.Mesh(elbowGeo, glassMat);
      elbow.position.set(side * 0.88, 1.15, 0);
      armGroup.add(elbow);

      const foreGeo = new THREE.CylinderGeometry(0.10, 0.08, 0.72, 14);
      const fore = new THREE.Mesh(foreGeo, glassMat);
      fore.position.set(side * 0.98, 0.75, 0.05);
      fore.rotation.z = side * -0.12;
      armGroup.add(fore);

      return armGroup;
    }
    bodyGroup.add(createArm(1));
    bodyGroup.add(createArm(-1));

    // 7. Limbs - Legs & Joint nodes
    function createLeg(side: number) {
      const legGroup = new THREE.Group();
      const upperGeo = new THREE.CylinderGeometry(0.20, 0.15, 1.1, 16);
      const upper = new THREE.Mesh(upperGeo, glassMat);
      upper.position.set(side * 0.28, -0.32, 0);
      legGroup.add(upper);

      const kneeGeo = new THREE.SphereGeometry(0.15, 14, 14);
      const knee = new THREE.Mesh(kneeGeo, glassMat);
      knee.position.set(side * 0.28, -0.92, 0.02);
      knee.userData = { id: 'joints', name: 'Musculoskeletal & Articular' };
      legGroup.add(knee);
      if (side === 1) meshes['joints'] = knee;

      const lowerGeo = new THREE.CylinderGeometry(0.14, 0.11, 1.15, 16);
      const lower = new THREE.Mesh(lowerGeo, glassMat);
      lower.position.set(side * 0.28, -1.55, 0);
      legGroup.add(lower);

      return legGroup;
    }
    bodyGroup.add(createLeg(1));
    bodyGroup.add(createLeg(-1));

    meshesRef.current = meshes;

    // 8. Internal Holographic Bio-Plexus Points
    const nodesGroup = new THREE.Group();
    const nodePoints = [
      { pos: [0, 2.7, 0.15], id: 'head', color: 0x00f2fe },
      { pos: [0, 1.85, 0.22], id: 'chest', color: 0x0ae2c8 },
      { pos: [-0.18, 1.7, 0.15], id: 'heart', color: 0x38ef7d },
      { pos: [0, 1.05, 0.2], id: 'abdomen', color: 0x3b82f6 },
      { pos: [0.28, -0.92, 0.15], id: 'joints', color: 0x0ae2c8 },
      { pos: [-0.28, -0.92, 0.15], id: 'joints', color: 0x0ae2c8 }
    ];

    const glowingRings: THREE.Mesh[] = [];
    nodePoints.forEach(pt => {
      const pGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({ color: pt.color });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(pt.pos[0], pt.pos[1], pt.pos[2]);
      nodesGroup.add(pMesh);

      const ringGeo = new THREE.RingGeometry(0.08, 0.11, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: pt.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(pt.pos[0], pt.pos[1], pt.pos[2]);
      glowingRings.push(ring);
      nodesGroup.add(ring);
    });
    bodyGroup.add(nodesGroup);

    // 9. Volumetric Orbital Scanning Rings
    const orbitalGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const orbitGeo = new THREE.TorusGeometry(1.8 + i * 0.4, 0.005, 8, 72);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0x0ae2c8 : 0x1e3a5f,
        transparent: true,
        opacity: 0.35 - i * 0.08
      });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2 + (i * 0.35);
      orbit.rotation.y = i * 0.25;
      orbitalGroup.add(orbit);
    }
    scene.add(orbitalGroup);

    // 10. Ambient Clinical Particle Cloud
    const particleCount = 280;
    const pGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      pPositions[p] = (Math.random() - 0.5) * 6.0;
      pPositions[p + 1] = (Math.random() - 0.5) * 6.0 + 1.0;
      pPositions[p + 2] = (Math.random() - 0.5) * 4.0;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0x0ae2c8,
      size: 0.025,
      transparent: true,
      opacity: 0.45
    });
    const particles = new THREE.Points(pGeom, pMaterial);
    scene.add(particles);

    // Mouse Interaction
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = x * 0.6;
      targetRotationX = -y * 0.25;
    };

    // Raycast Click Selection
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const interactiveMeshes = Object.values(meshes);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.id) {
          onSelectRegion(hit.userData.id);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotation & gentle idle sway
      bodyGroup.rotation.y += (targetRotationY - bodyGroup.rotation.y + Math.sin(elapsed * 0.5) * 0.06) * 0.05;
      bodyGroup.rotation.x += (targetRotationX - bodyGroup.rotation.x) * 0.05;

      orbitalGroup.rotation.z = elapsed * 0.08;
      orbitalGroup.rotation.y = elapsed * 0.05;

      glowingRings.forEach((r, idx) => {
        const s = 1.0 + Math.sin(elapsed * 2.5 + idx) * 0.35;
        r.scale.set(s, s, s);
      });

      particles.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 500;
      const nh = container.clientHeight || 520;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [onSelectRegion]);

  // Handle highlighted region prop update
  useEffect(() => {
    const meshes = meshesRef.current;
    const highlightMat = activeHighlightMatRef.current;
    const glassMat = glassMatRef.current;

    if (!highlightMat || !glassMat) return;

    Object.keys(meshes).forEach((k) => {
      meshes[k].material = glassMat;
    });

    if (activeRegion && meshes[activeRegion]) {
      meshes[activeRegion].material = highlightMat;
    }
  }, [activeRegion]);

  // Handle view angle update (anterior / posterior)
  useEffect(() => {
    if (bodyGroupRef.current) {
      const targetY = viewAngle === 'posterior' ? Math.PI : 0;
      bodyGroupRef.current.rotation.y = targetY;
    }
  }, [viewAngle]);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-surface-container-lowest/60 flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full cursor-pointer" />
    </div>
  );
};