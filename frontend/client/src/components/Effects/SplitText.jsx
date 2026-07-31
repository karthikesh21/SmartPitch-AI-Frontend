import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * SplitText - Staggered character animation powered by GSAP
 */
const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = 'center',
  tag: Tag = 'h1',
  onLetterAnimationComplete,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    const elements = containerRef.current.querySelectorAll('.split-char');

    if (elements.length > 0) {
      gsap.fromTo(
        elements,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: () => {
            if (onLetterAnimationComplete) onLetterAnimationComplete();
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, duration, ease]);

  const words = text.split(' ');

  return (
    <Tag
      ref={containerRef}
      className={`split-parent ${className}`}
      style={{ textAlign, display: 'inline-block', overflow: 'hidden' }}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split('').map((char, cIdx) => (
            <span
              key={cIdx}
              className="split-char"
              style={{
                display: 'inline-block',
                willChange: 'transform, opacity',
              }}
            >
              {char}
            </span>
          ))}
          {wIdx < words.length - 1 && (
            <span style={{ display: 'inline-block' }}>&nbsp;</span>
          )}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;
