import React, { useRef, useEffect } from 'react';
import './LightRays.css';

/**
 * LightRays — canvas-based god-ray / crepuscular rays effect.
 * Supports mouse influence, pulsating, saturation, and all props
 * from the @react-bits spec without requiring an npm package.
 */
const LightRays = ({
  raysOrigin = 'top-center',
  raysColor = '#ffffff',
  raysSpeed = 1,
  lightSpread = 0.5,
  rayLength = 3,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0 });
  const origin = useRef({ x: 0.5, y: 0 });
  const pulseRef = useRef(0);

  /* Parse raysOrigin string → normalised {x,y} */
  const parseOrigin = (str) => {
    const map = {
      'top-center': { x: 0.5, y: 0 },
      'top-left': { x: 0.15, y: 0 },
      'top-right': { x: 0.85, y: 0 },
      'center': { x: 0.5, y: 0.5 },
      'bottom-center': { x: 0.5, y: 1 },
    };
    return map[str] || { x: 0.5, y: 0 };
  };

  /* Hex / named colour → [r, g, b] */
  const parseColor = (c) => {
    if (c === '#ffffff' || c === 'white') return [255, 255, 255];
    const d = document.createElement('div');
    d.style.color = c;
    document.body.appendChild(d);
    const rgb = window.getComputedStyle(d).color.match(/\d+/g).map(Number);
    document.body.removeChild(d);
    return rgb;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const base = parseOrigin(raysOrigin);
    const [r, g, b] = parseColor(raysColor);

    /* Deterministic ray angles seeded per index */
    const RAY_COUNT = Math.round(10 + lightSpread * 30);
    const rays = Array.from({ length: RAY_COUNT }, (_, i) => ({
      angle: ((i / RAY_COUNT) - 0.5) * Math.PI * 0.9 * lightSpread,
      width: 2 + Math.random() * 28,
      alpha: 0.03 + Math.random() * 0.10,
      length: 0.7 + Math.random() * 0.3,
      speed: (0.4 + Math.random() * 0.6) * raysSpeed * 0.0004,
      offset: Math.random() * Math.PI * 2,
    }));

    let w = 0, h = 0, raf, t = 0;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const onMouseMove = (e) => {
      if (!followMouse) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const lerp = (a, b, k) => a + (b - a) * k;

    const draw = (ts) => {
      t = ts * 0.001;

      /* Smooth-lerp origin toward mouse */
      const mx = followMouse ? mouse.current.x : base.x;
      const my = followMouse ? mouse.current.y : base.y;
      origin.current.x = lerp(origin.current.x, base.x + (mx - base.x) * mouseInfluence, 0.06);
      origin.current.y = lerp(origin.current.y, base.y + (my - base.y) * mouseInfluence, 0.06);

      /* Pulse scale */
      pulseRef.current = pulsating ? 0.85 + 0.15 * Math.sin(t * raysSpeed * 1.5) : 1;

      const ox = origin.current.x * w;
      const oy = origin.current.y * h;
      const maxLen = Math.hypot(w, h) * rayLength * pulseRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const ray of rays) {
        const breathe = 0.6 + 0.4 * Math.sin(t * ray.speed * 1000 + ray.offset);
        const a = ray.alpha * breathe * saturation * (pulsating ? pulseRef.current : 1);
        const spread = ray.angle + (noiseAmount ? (Math.random() - 0.5) * noiseAmount * 0.4 : 0);
        const drift = distortion * 0.15 * Math.sin(t + ray.offset);
        const finalA = spread + drift;

        const ex = ox + Math.sin(finalA) * maxLen * ray.length;
        const ey = oy + Math.cos(finalA) * maxLen * ray.length;

        /* Gradient fades from opaque at origin to transparent at tip */
        const grad = ctx.createLinearGradient(ox, oy, ex, ey);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(fadeDistance * 0.5, `rgba(${r},${g},${b},${a * 0.4})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.save();
        ctx.beginPath();
        /* Ray is a thin triangle from origin point */
        const halfW = (ray.width * lightSpread) / 2;
        const perpX = Math.cos(finalA) * halfW;
        const perpY = -Math.sin(finalA) * halfW;
        ctx.moveTo(ox + perpX, oy + perpY);
        ctx.lineTo(ex, ey);
        ctx.lineTo(ox - perpX, oy - perpY);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    origin.current = { x: base.x, y: base.y };
    canvas.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousemove', onMouseMove);
    raf = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousemove', onMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`light-rays ${className}`}
    />
  );
};

export default LightRays;
