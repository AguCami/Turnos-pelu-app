"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mount.appendChild(renderer.domElement);

    // Gold material
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#C9A227"),
      metalness: 1.0,
      roughness: 0.12,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
    });
    const darkGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#8a6a10"),
      metalness: 1.0,
      roughness: 0.2,
      clearcoat: 0.5,
    });

    // Build one scissor half: blade + finger ring
    function buildHalf() {
      const group = new THREE.Group();

      // Blade — tapered box, wide at pivot, thin at tip
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-0.12, 0);
      bladeShape.lineTo(0.18, 0);
      bladeShape.lineTo(0.06, 2.8);
      bladeShape.lineTo(-0.02, 2.8);
      bladeShape.closePath();

      const extrudeSettings = {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 4,
      };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      bladeGeo.center();
      const blade = new THREE.Mesh(bladeGeo, goldMat);
      blade.position.y = 1.4; // shift up so pivot is at origin
      group.add(blade);

      // Sharpened edge (thin dark strip along blade)
      const edgeGeo = new THREE.BoxGeometry(0.015, 2.6, 0.015);
      const edge = new THREE.Mesh(edgeGeo, darkGoldMat);
      edge.position.set(0.09, 1.5, 0);
      group.add(edge);

      // Finger ring — torus
      const ringGeo = new THREE.TorusGeometry(0.38, 0.07, 20, 64);
      const ring = new THREE.Mesh(ringGeo, goldMat);
      ring.position.y = -0.6;
      group.add(ring);

      // Ring inner detail
      const innerRingGeo = new THREE.TorusGeometry(0.24, 0.025, 12, 48);
      const innerRing = new THREE.Mesh(innerRingGeo, darkGoldMat);
      innerRing.position.y = -0.6;
      group.add(innerRing);

      return group;
    }

    // Pivot screw
    const pivotGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 32);
    const pivot = new THREE.Mesh(pivotGeo, darkGoldMat);
    pivot.rotation.x = Math.PI / 2;

    // Scissor group
    const scissors = new THREE.Group();

    const halfA = buildHalf();
    halfA.rotation.z = 0.28; // open angle
    halfA.position.z = 0.04;

    const halfB = buildHalf();
    halfB.rotation.z = -0.28;
    halfB.position.z = -0.04;
    halfB.scale.x = -1; // mirror

    scissors.add(halfA);
    scissors.add(halfB);
    scissors.add(pivot);

    // Tilt scissors for a natural 3D look
    scissors.rotation.z = Math.PI / 5;
    scissors.rotation.x = 0.2;

    scene.add(scissors);

    // Floating particles
    const pCount = 180;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 18;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: "#C9A227", size: 0.04, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(pGeo, pMat));

    // Lights — cinematic
    scene.add(new THREE.AmbientLight("#ffffff", 0.2));

    const key = new THREE.DirectionalLight("#FFE5A0", 8);
    key.position.set(5, 8, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight("#C9A227", 4);
    rim.position.set(-6, -4, -3);
    scene.add(rim);

    const fill = new THREE.PointLight("#ffffff", 2, 20);
    fill.position.set(0, 0, 8);
    scene.add(fill);

    const goldGlow = new THREE.PointLight("#D4AF37", 10, 10);
    goldGlow.position.set(2, 3, 3);
    scene.add(goldGlow);

    // Mouse
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let id: number;
    const clock = new THREE.Clock();
    const animate = () => {
      id = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      curX += (targetX - curX) * 0.03;
      curY += (targetY - curY) * 0.03;

      // Rotate scissors with mouse + gentle auto-spin
      scissors.rotation.y = curX * 1.0 + t * 0.12;
      scissors.rotation.x = 0.2 + curY * 0.5;

      // Subtle float
      scissors.position.y = Math.sin(t * 0.5) * 0.12;

      // Light follows mouse
      goldGlow.position.x = 2 + curX * 3;
      goldGlow.position.y = 3 + curY * 3;
      key.position.x = 5 + curX * 2;
      key.position.y = 8 + curY * 2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
