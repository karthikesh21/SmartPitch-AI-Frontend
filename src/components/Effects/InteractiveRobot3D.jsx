import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const InteractiveRobot3D = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false, isClicked: false });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    // Scene, Camera, Renderer (Ultra-HD 4K Setup)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 6.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Color Palette - HD Orange & Navy Theme
    const ORANGE_PRIMARY = 0xff6b35;  // Glossy Orange
    const NAVY_DARK = 0x080d1a;  // Deep Visor Navy
    const NAVY_MID = 0x1e293b;  // Mid Metallic Navy
    const CYAN_GLOW = 0x00f0ff;  // Glowing Cyan

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainKeyLight.position.set(5, 7, 5);
    mainKeyLight.castShadow = true;
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const orangeFillLight = new THREE.PointLight(ORANGE_PRIMARY, 3.2, 8);
    orangeFillLight.position.set(-4, -2, 3);
    scene.add(orangeFillLight);

    // Main Robot Group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // 1. Glossy Orange Helmet
    const helmetGeo = new THREE.SphereGeometry(1.25, 128, 128);
    helmetGeo.scale(1.15, 0.95, 0.95);

    const helmetMat = new THREE.MeshPhysicalMaterial({
      color: ORANGE_PRIMARY,
      roughness: 0.14,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    robotGroup.add(helmet);

    // 2. Visor Outer Bezel (Navy Chrome)
    const bezelGeo = new THREE.SphereGeometry(1.12, 96, 96, 0, Math.PI * 2, 0, Math.PI * 0.54);
    bezelGeo.scale(1.08, 0.79, 0.68);
    bezelGeo.rotateX(Math.PI * 0.5);

    const bezelMat = new THREE.MeshStandardMaterial({
      color: NAVY_MID,
      metalness: 0.7,
      roughness: 0.2,
    });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(0, -0.04, 0.40);
    robotGroup.add(bezel);

    // 3. Visor Screen Glass Base
    const visorGeo = new THREE.SphereGeometry(1.08, 96, 96, 0, Math.PI * 2, 0, Math.PI * 0.51);
    visorGeo.scale(1.05, 0.76, 0.65);
    visorGeo.rotateX(Math.PI * 0.5);

    const visorMat = new THREE.MeshPhysicalMaterial({
      color: NAVY_DARK,
      roughness: 0.05,
      metalness: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, -0.04, 0.42);
    robotGroup.add(visor);

    // 4. Dynamic HD Face Texture for Crisp Glowing Cyan Eyes
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 256;
    const faceCtx = faceCanvas.getContext('2d');

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;

    // Face Decal Overlay Plane on dark glass
    const faceOverlayGeo = new THREE.PlaneGeometry(1.6, 0.8);
    const faceOverlayMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    const faceOverlay = new THREE.Mesh(faceOverlayGeo, faceOverlayMat);
    faceOverlay.position.set(0, -0.02, 1.08);
    robotGroup.add(faceOverlay);

    // Function to draw crisp HD face & glowing eyes onto texture
    const renderFaceTexture = (offsetX, offsetY, blinkFactor, isHover) => {
      faceCtx.clearRect(0, 0, 512, 256);

      const centerX = 256 + offsetX * 65;
      const centerY = 128 - offsetY * 45;

      // Glow intensity setup for Glowing Orange Square Eyes matching brand mascot
      const eyeSize = 42;
      const eyeSpacing = 75;

      faceCtx.shadowColor = '#FF6B35';
      faceCtx.shadowBlur = isHover ? 32 : 20;
      faceCtx.fillStyle = '#FF6B35';

      // Scale for blinking
      const scaleY = Math.max(0.06, 1 - blinkFactor);

      // Left Glowing Orange Square Eye
      faceCtx.save();
      faceCtx.translate(centerX - eyeSpacing, centerY);
      faceCtx.scale(1, scaleY);
      if (faceCtx.roundRect) {
        faceCtx.beginPath();
        faceCtx.roundRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize, 9);
        faceCtx.fill();
      } else {
        faceCtx.fillRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);
      }
      faceCtx.restore();

      // Right Glowing Orange Square Eye
      faceCtx.save();
      faceCtx.translate(centerX + eyeSpacing, centerY);
      faceCtx.scale(1, scaleY);
      faceCtx.shadowColor = '#FF6B35';
      faceCtx.shadowBlur = isHover ? 32 : 20;
      if (faceCtx.roundRect) {
        faceCtx.beginPath();
        faceCtx.roundRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize, 9);
        faceCtx.fill();
      } else {
        faceCtx.fillRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);
      }
      faceCtx.restore();

      faceTex.needsUpdate = true;
    };

    // Initial texture render
    renderFaceTexture(0, 0, 0, false);

    // 5. Top Antenna
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0, 1.15, 0);

    const rodGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 32);
    const navyMat = new THREE.MeshStandardMaterial({ color: NAVY_MID, metalness: 0.6, roughness: 0.2 });
    const rod = new THREE.Mesh(rodGeo, navyMat);
    rod.position.y = 0.2;
    antennaGroup.add(rod);

    const orbGeo = new THREE.SphereGeometry(0.13, 32, 32);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xff8c42,
      emissive: ORANGE_PRIMARY,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 0.42;
    antennaGroup.add(orb);

    robotGroup.add(antennaGroup);

    // 6. Headphones (Left & Right Ear Cups)
    const hpGroup = new THREE.Group();

    // Ear Cups
    const cupGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 48);
    const cupMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c1322,
      roughness: 0.2,
      metalness: 0.5,
      clearcoat: 0.8,
    });

    const orangeRingGeo = new THREE.TorusGeometry(0.42, 0.04, 24, 48);
    const orangeRingMat = new THREE.MeshStandardMaterial({ color: ORANGE_PRIMARY, metalness: 0.4, roughness: 0.2 });

    // Left Cup
    const leftCup = new THREE.Mesh(cupGeo, cupMat);
    leftCup.rotation.z = Math.PI * 0.5;
    leftCup.position.set(-1.42, 0.02, 0);
    hpGroup.add(leftCup);

    const leftRing = new THREE.Mesh(orangeRingGeo, orangeRingMat);
    leftRing.rotation.y = Math.PI * 0.5;
    leftRing.position.set(-1.58, 0.02, 0);
    hpGroup.add(leftRing);

    // Right Cup
    const rightCup = new THREE.Mesh(cupGeo, cupMat);
    rightCup.rotation.z = Math.PI * 0.5;
    rightCup.position.set(1.42, 0.02, 0);
    hpGroup.add(rightCup);

    const rightRing = new THREE.Mesh(orangeRingGeo, orangeRingMat);
    rightRing.rotation.y = Math.PI * 0.5;
    rightRing.position.set(1.58, 0.02, 0);
    hpGroup.add(rightRing);

    robotGroup.add(hpGroup);

    // 7. Base Navy Collar
    const collarGeo = new THREE.CylinderGeometry(0.72, 0.88, 0.28, 48);
    const collarMat = new THREE.MeshStandardMaterial({ color: NAVY_MID, metalness: 0.5, roughness: 0.3 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, -1.05, 0);
    robotGroup.add(collar);

    // 8. Ground Shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(8, 13, 26, 0.75)');
    grad.addColorStop(0.5, 'rgba(8, 13, 26, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.7 });
    const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.75, 0);
    scene.add(shadowMesh);

    // Mouse Event Handlers
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkFactor = 0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Fast Physics Interpolation for instant eye cursor movement
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.22;
      m.y += (m.targetY - m.y) * 0.22;

      // Head Tilt & Rotation towards cursor
      const targetRotY = m.x * 0.45;
      const targetRotX = -m.y * 0.32;

      robotGroup.rotation.y = THREE.MathUtils.lerp(robotGroup.rotation.y, targetRotY, 0.1);
      robotGroup.rotation.x = THREE.MathUtils.lerp(robotGroup.rotation.x, targetRotX, 0.1);

      // Idle Floating Motion & Tilt
      const floatY = Math.sin(elapsedTime * 2.5) * 0.15;
      const floatZ = Math.sin(elapsedTime * 1.8) * 0.05;
      robotGroup.position.y = floatY;
      robotGroup.rotation.z = floatZ;

      // Dynamic Top Antenna Head-Tail Motion (Spring Sway & Cursor Reactive)
      const antennaSwayZ = Math.sin(elapsedTime * 3.8) * 0.18 - m.x * 0.4;
      const antennaSwayX = Math.cos(elapsedTime * 3.0) * 0.14 + m.y * 0.3;
      antennaGroup.rotation.z = THREE.MathUtils.lerp(antennaGroup.rotation.z, antennaSwayZ, 0.12);
      antennaGroup.rotation.x = THREE.MathUtils.lerp(antennaGroup.rotation.x, antennaSwayX, 0.12);

      // Blinking Cycle (Every 4 seconds)
      blinkTimer += 0.016;
      if (blinkTimer > 4.0 && !isBlinking) {
        isBlinking = true;
        blinkFactor = 0;
      }

      if (isBlinking) {
        blinkFactor += 0.12;
        if (blinkFactor >= 1) {
          isBlinking = false;
          blinkTimer = 0;
          blinkFactor = 0;
        }
      }

      // Render Dynamic HD Face Texture (Eyes follow cursor & blink smoothly)
      renderFaceTexture(m.x, m.y, blinkFactor, m.isHovered);

      // Hover Glow & Scale
      const targetScale = m.isHovered ? 1.07 : 1.0;
      robotGroup.scale.setScalar(THREE.MathUtils.lerp(robotGroup.scale.x, targetScale, 0.1));

      if (m.isHovered) {
        orbMat.emissiveIntensity = THREE.MathUtils.lerp(orbMat.emissiveIntensity, 4.2, 0.1);
      } else {
        orbMat.emissiveIntensity = THREE.MathUtils.lerp(orbMat.emissiveIntensity, 3.0, 0.1);
      }

      // Click Bounce
      if (m.isClicked) {
        robotGroup.position.y += Math.sin(elapsedTime * 24) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handlePointerEnter = () => {
    mouseRef.current.isHovered = true;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    mouseRef.current.isHovered = false;
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    setIsHovered(false);
  };

  const handleClick = () => {
    mouseRef.current.isClicked = true;
    setTimeout(() => {
      mouseRef.current.isClicked = false;
    }, 350);
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      style={{
        width: '100%',
        height: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isHovered ? 'pointer' : 'default',
        userSelect: 'none',
        position: 'relative',
      }}
    />
  );
};

export default InteractiveRobot3D;
