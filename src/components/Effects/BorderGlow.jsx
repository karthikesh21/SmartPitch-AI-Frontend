import React, { useRef, useEffect } from 'react';
import './BorderGlow.css';

const BorderGlow = ({
  children,
  className = '',
  style = {},
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#060010',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const dist = Math.min(x, y, r.width - x, r.height - y);
      const pct = Math.max(0, 1 - dist / edgeSensitivity) * glowIntensity;
      el.style.setProperty('--gx', `${(x / r.width) * 100}%`);
      el.style.setProperty('--gy', `${(y / r.height) * 100}%`);
      el.style.setProperty('--gi', pct.toFixed(3));
    };
    const onLeave = () => el.style.setProperty('--gi', '0');

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [edgeSensitivity, glowIntensity]);

  return (
    <div
      ref={ref}
      className={`bg-glow ${className}`}
      style={{
        '--bg': backgroundColor,
        '--br': `${borderRadius}px`,
        '--gr': `${glowRadius}px`,
        '--c1': colors[0] || '#c084fc',
        '--c2': colors[1] || '#f472b6',
        '--c3': colors[2] || '#38bdf8',
        '--gi': '0',
        ...style,
      }}
    >
      <div className="bg-glow__inner">{children}</div>
    </div>
  );
};

export default BorderGlow;
