import React, { useState } from 'react';
import './CopyButton.css';

const CopyButton = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      className={`copy-btn ${copied ? 'copy-btn--copied' : ''} ${className}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
};

export default CopyButton;
