import React from 'react';

export const PitchGenerator = ({ onGenerate }) => (
  <div className="pitch-generator">{/* Pitch generator UI */}</div>
);

export const PitchDisplay = ({ pitch }) => (
  <div className="pitch-display">{pitch}</div>
);

export const EmailPitch = ({ content }) => (
  <div className="email-pitch">{content}</div>
);

export const LinkedInPitch = ({ content }) => (
  <div className="linkedin-pitch">{content}</div>
);

export const ColdCallPitch = ({ content }) => (
  <div className="cold-call-pitch">{content}</div>
);

export const AdCopyPitch = ({ content }) => (
  <div className="ad-copy-pitch">{content}</div>
);
