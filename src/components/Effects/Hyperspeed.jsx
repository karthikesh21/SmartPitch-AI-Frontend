import React, { useRef, useEffect } from 'react';
import './Hyperspeed.css';

const Hyperspeed = ({ className = '' }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const NUM = 260, FOV = 420, SPEED = 7;
    let w = 0, h = 0, stars = [], raf;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      spawn();
    };

    const spawn = () => {
      stars = Array.from({ length: NUM }, () => ({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * FOV,
        pz: 0,
      }));
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(6,0,16,0.18)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED;
        if (s.z <= 1) {
          s.x = (Math.random() - 0.5) * w * 2;
          s.y = (Math.random() - 0.5) * h * 2;
          s.z = FOV;
          s.pz = FOV;
        }
        const k = FOV / s.z, pk = FOV / s.pz;
        const sx = s.x * k + cx, sy = s.y * k + cy;
        const px = s.x * pk + cx, py = s.y * pk + cy;
        const bright = 1 - s.z / FOV;
        ctx.strokeStyle = `rgba(${Math.round(150 + bright * 105)},${Math.round(120 + bright * 80)},255,${(bright * 0.9).toFixed(2)})`;
        ctx.lineWidth = Math.max(0.4, bright * 2.4);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className={`hyperspeed ${className}`} />;
};

export default Hyperspeed;
