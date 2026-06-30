"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Main sphere — polished gold metal
    const sphereGeo = new THREE.SphereGeometry(1.6, 128, 128);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1a1400"),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Thin gold ring around the sphere
    const ringGeo = new THREE.TorusGeometry(2.1, 0.025, 16, 120);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#C9A227"),
      metalness: 1,
      roughness: 0.1,
      emissive: new THREE.Color("#7a5a00"),
      emissiveIntensity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.8;
    scene.add(ring);

    // Second thinner ring, tilted differently
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.012, 16, 120),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#D4AF37"),
        metalness: 1,
        roughness: 0.2,
        transparent: true,
        opacity: 0.55,
      })
    );
    ring2.rotation.x = Math.PI / 5;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Gold specular highlight blob (fake specular)
    const blobGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const blobMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#FFE566"),
      transparent: true,
      opacity: 0.18,
    });
    const blob = new THREE.Mesh(blobGeo, blobMat);
    blob.position.set(0.6, 0.7, 1.3);
    scene.add(blob);

    // Floating dust particles
    const particleCount = 200;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pPositions[i] = (Math.random() - 0.5) * 20;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: "#C9A227",
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Lights — Apple-style: one strong key, one rim
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#FFE5A0", 6);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#C9A227", 3);
    rimLight.position.set(-5, -3, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight("#ffffff", 1.5, 20);
    fillLight.position.set(0, 0, 8);
    scene.add(fillLight);

    const goldGlow = new THREE.PointLight("#C9A227", 8, 8);
    goldGlow.position.set(2, 2, 3);
    scene.add(goldGlow);

    // Mouse
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

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

      // Silky smooth mouse follow (Apple-like inertia)
      curX += (targetX - curX) * 0.025;
      curY += (targetY - curY) * 0.025;

      // Sphere: gentle auto-rotation + mouse tilt
      sphere.rotation.y = t * 0.08 + curX * 0.6;
      sphere.rotation.x = curY * 0.4;

      // Rings orbit slowly
      ring.rotation.z = t * 0.05;
      ring2.rotation.z = -t * 0.04;
      ring2.rotation.x = Math.PI / 5 + curY * 0.3;

      // Specular blob follows mouse direction
      blob.position.x = 0.6 + curX * 0.4;
      blob.position.y = 0.7 + curY * 0.4;

      // Key light follows mouse
      keyLight.position.x = 4 + curX * 3;
      keyLight.position.y = 6 + curY * 3;
      goldGlow.position.x = 2 + curX * 2;
      goldGlow.position.y = 2 + curY * 2;

      // Subtle float
      sphere.position.y = Math.sin(t * 0.4) * 0.08;
      ring.position.y = Math.sin(t * 0.4) * 0.08;
      ring2.position.y = Math.sin(t * 0.4 + 0.3) * 0.06;

      particles.rotation.y = t * 0.02;

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
