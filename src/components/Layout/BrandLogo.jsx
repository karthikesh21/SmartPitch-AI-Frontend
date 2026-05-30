import React from 'react';

/**
 * BrandLogo – the shared SmartPitch AI robot SVG + wordmark.
 * Drop it anywhere: navbars, auth cards, footers, etc.
 *
 * Props:
 *   size        – icon side length in px  (default 32)
 *   fontSize    – wordmark font-size       (default '1.1rem')
 *   fontWeight  – wordmark font-weight     (default 800)
 *   color       – wordmark colour          (default '#FF6B35')
 *   gap         – gap between icon & text  (default '10px')
 *   style       – extra inline style for wrapper
 *   className   – extra class for wrapper
 */
const BrandLogo = ({
  size = 32,
  fontSize = '1.1rem',
  fontWeight = 800,
  color = '#FF6B35',
  gap = '10px',
  style,
  className = '',
}) => (
  <div
    className={`brand-logo ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap,
      cursor: 'pointer',
      userSelect: 'none',
      ...style,
    }}
  >
    {/* Robot icon – matches the SmartPitch AI brand mark */}
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* background tile */}
      <rect width="40" height="40" rx="10" fill="#1a1a2e" />
      {/* antenna */}
      <rect x="19" y="3" width="2" height="6" rx="1" fill="#FF6B35" />
      <circle cx="20" cy="2" r="2" fill="#FF6B35" />
      {/* head */}
      <rect x="8" y="10" width="24" height="16" rx="5" fill="#232340" />
      {/* eyes */}
      <rect x="13" y="15" width="5" height="5" rx="1.5" fill="#FF6B35" />
      <rect x="22" y="15" width="5" height="5" rx="1.5" fill="#FF6B35" />
      {/* body */}
      <rect x="11" y="28" width="18" height="10" rx="4" fill="#232340" />
      <rect x="15" y="31" width="10" height="4" rx="2" fill="#FF6B35" opacity="0.6" />
      {/* arms */}
      <rect x="4"  y="28" width="5" height="8" rx="2.5" fill="#232340" />
      <rect x="31" y="28" width="5" height="8" rx="2.5" fill="#232340" />
    </svg>

    {/* Wordmark */}
    <span style={{ color, fontSize, fontWeight, letterSpacing: '-0.01em', lineHeight: 1 }}>
      SmartPitch AI
    </span>
  </div>
);

export default BrandLogo;
