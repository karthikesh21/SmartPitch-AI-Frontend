import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * InteractiveRobot3D
 * Vibrant Glossy Orange Robot with big sleek fixed black eyes:
 * - Highly responsive 3D cursor tracking across the entire window
 * - Rotates yaw, pitch, and tilt directly aligned with cursor position
 * - Blinks randomly every 3-6s and on click via vertical eye scaling
 * - Floats and breathes with a natural sine wave
 */
const InteractiveRobot3D = ({ height: customHeight = '420px', cameraDistance = 8.2 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // --- SCENE, CAMERA, RENDERER SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, cameraDistance);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Root Robot Group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // --- MATERIALS (ORANGE THEME) ---
    const headMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff6b35,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });

    const eyeShellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x07090e,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
    });



    const blackMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x111520,
      roughness: 0.25,
      metalness: 0.85,
    });

    const silverRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d4554,
      roughness: 0.2,
      metalness: 0.9,
    });

    const orangeGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      emissive: 0xff5500,
      emissiveIntensity: 3.5,
      roughness: 0.05,
    });

    const collarMaterial = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      roughness: 0.3,
      metalness: 0.8,
    });

    // --- HEAD ---
    const headGeo = new THREE.SphereGeometry(1.65, 64, 64);
    const headMesh = new THREE.Mesh(headGeo, headMaterial);
    headMesh.scale.set(1.15, 0.96, 1.05);
    robotGroup.add(headMesh);

    // --- FIXED BIG BLACK EYES ---
    const createFixedEyeGroup = (baseX) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(baseX, 0.02, 1.5);

      const shellGeo = new THREE.SphereGeometry(0.34, 32, 32);
      const shellMesh = new THREE.Mesh(shellGeo, eyeShellMaterial);
      shellMesh.scale.set(1, 1.3, 0.4);
      eyeGroup.add(shellMesh);

      return { eyeGroup, shellMesh };
    };

    const leftEye = createFixedEyeGroup(-0.58);
    const rightEye = createFixedEyeGroup(0.58);

    robotGroup.add(leftEye.eyeGroup);
    robotGroup.add(rightEye.eyeGroup);

    // --- EARS ---
    const earGeo = new THREE.CylinderGeometry(0.44, 0.46, 0.38, 32);
    const earRingGeo = new THREE.TorusGeometry(0.44, 0.04, 16, 32);

    const leftEar = new THREE.Mesh(earGeo, blackMetalMaterial);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-1.82, 0.02, 0);
    robotGroup.add(leftEar);

    const leftEarRing = new THREE.Mesh(earRingGeo, silverRingMaterial);
    leftEarRing.rotation.y = Math.PI / 2;
    leftEarRing.position.set(-1.92, 0.02, 0);
    robotGroup.add(leftEarRing);

    const rightEar = new THREE.Mesh(earGeo, blackMetalMaterial);
    rightEar.rotation.z = -Math.PI / 2;
    rightEar.position.set(1.82, 0.02, 0);
    robotGroup.add(rightEar);

    const rightEarRing = new THREE.Mesh(earRingGeo, silverRingMaterial);
    rightEarRing.rotation.y = -Math.PI / 2;
    rightEarRing.position.set(1.92, 0.02, 0);
    robotGroup.add(rightEarRing);

    // --- ANTENNA ---
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0, 1.5, 0);

    const antennaBaseGeo = new THREE.ConeGeometry(0.15, 0.15, 32);
    const antennaBase = new THREE.Mesh(antennaBaseGeo, blackMetalMaterial);
    antennaBase.position.set(0, 0.08, 0);
    antennaGroup.add(antennaBase);

    const antennaStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.52, 16);
    const antennaStem = new THREE.Mesh(antennaStemGeo, blackMetalMaterial);
    antennaStem.position.set(0, 0.32, 0);
    antennaGroup.add(antennaStem);

    const antennaBallGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const antennaBall = new THREE.Mesh(antennaBallGeo, orangeGlowMaterial);
    antennaBall.position.set(0, 0.62, 0);
    antennaGroup.add(antennaBall);

    robotGroup.add(antennaGroup);

    // --- BASE / COLLAR ---
    const upperCollarGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.2, 32);
    const upperCollar = new THREE.Mesh(upperCollarGeo, collarMaterial);
    upperCollar.position.set(0, -1.02, 0);
    robotGroup.add(upperCollar);

    const lowerBaseGeo = new THREE.CylinderGeometry(0.95, 1.32, 0.38, 32);
    const lowerBase = new THREE.Mesh(lowerBaseGeo, collarMaterial);
    lowerBase.position.set(0, -1.28, 0);
    robotGroup.add(lowerBase);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xff6b35, 2.2);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);

    const ballPointLight = new THREE.PointLight(0xff6b35, 3.5, 4.0);
    ballPointLight.position.set(0, 2.12, 0);
    robotGroup.add(ballPointLight);

    // --- WINDOW-WIDE CURSOR TRACKING VARIABLES ---
    let mouseX = 0; // Normalized (-1 to +1)
    let mouseY = 0; // Normalized (-1 to +1)
    let currentEyeX = 0;
    let currentEyeY = 0;

    let isHovered = false;
    let lastMouseMoveTime = Date.now();

    // Blinking
    let isBlinking = false;
    let blinkStartTime = 0;
    const BLINK_DURATION = 150;
    let nextRandomBlinkTime = Date.now() + 3000 + Math.random() * 3000;

    const triggerBlink = () => {
      isBlinking = true;
      blinkStartTime = Date.now();
    };

    // Window-wide Mouse Move Handler for seamless responsive tracking across the page
    const handleWindowMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMouseMoveTime = Date.now();
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    const handleClick = () => {
      triggerBlink();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    // --- ANIMATION LOOP ---
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const now = Date.now();

      // Floating & breathing
      robotGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.14;
      const scaleBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.015;
      robotGroup.scale.set(scaleBreath, scaleBreath, scaleBreath);

      // Idle scanning after 3.5s of mouse inactivity
      let targetX = mouseX;
      let targetY = mouseY;

      const idleDuration = now - lastMouseMoveTime;
      if (idleDuration > 3500) {
        const scanCycle = (elapsedTime * 1.2) % (Math.PI * 4);
        targetX = Math.sin(scanCycle) * 0.65;
        targetY = Math.cos(scanCycle * 0.5) * 0.2;
      }

      // Snappy LERP (0.12 factor for alive, responsive cursor alignment)
      currentEyeX += (targetX - currentEyeX) * 0.12;
      currentEyeY += (targetY - currentEyeY) * 0.12;

      // Enhanced 3D Head Rotation Range to follow cursor closely
      const clampPitch = (val) => Math.max(-0.50, Math.min(0.50, val));
      const targetHeadRotY = currentEyeX * 0.75; // Wider horizontal turn angle
      const targetHeadRotX = clampPitch(-currentEyeY * 0.50); // Pitch up/down
      const targetHeadRotZ = -currentEyeX * 0.20 + Math.sin(elapsedTime * 1.5) * 0.05; // Head tilt

      robotGroup.rotation.y += (targetHeadRotY - robotGroup.rotation.y) * 0.12;
      robotGroup.rotation.x += (targetHeadRotX - robotGroup.rotation.x) * 0.12;
      robotGroup.rotation.z += (targetHeadRotZ - robotGroup.rotation.z) * 0.12;

      // Antenna springy sway reacting to head rotation
      antennaGroup.rotation.z = Math.sin(elapsedTime * 3.5) * 0.08 - robotGroup.rotation.z * 0.45;
      antennaGroup.rotation.x = Math.cos(elapsedTime * 2.8) * 0.05 - robotGroup.rotation.x * 0.3;

      // Random + click blinking
      if (!isBlinking && now >= nextRandomBlinkTime) {
        triggerBlink();
        nextRandomBlinkTime = now + 3000 + Math.random() * 3000;
      }

      let eyeScaleY = 1.0;
      if (isBlinking) {
        const blinkProgress = (now - blinkStartTime) / BLINK_DURATION;
        if (blinkProgress >= 1.0) {
          isBlinking = false;
          eyeScaleY = 1.0;
        } else {
          eyeScaleY = 0.05 + 0.95 * Math.abs(Math.sin(blinkProgress * Math.PI));
        }
      }

      // Hover scaling
      const baseScale = isHovered ? 1.08 : 1.0;

      leftEye.eyeGroup.scale.set(baseScale, baseScale * eyeScaleY, baseScale);
      rightEye.eyeGroup.scale.set(baseScale, baseScale * eyeScaleY, baseScale);

      orangeGlowMaterial.emissiveIntensity = 3.0 + Math.sin(elapsedTime * 4) * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    // --- RESIZE ---
    let resizeRafId;
    const handleResize = () => {
      if (!container) return;
      cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW && newH) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      });
    };

    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cameraDistance]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: customHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        filter: 'drop-shadow(0 20px 40px rgba(255, 107, 53, 0.45))',
      }}
    />
  );
};

export default InteractiveRobot3D;
