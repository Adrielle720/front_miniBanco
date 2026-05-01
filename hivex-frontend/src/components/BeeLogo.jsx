import React from 'react';

export default function BeeLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="32" cy="36" rx="12" ry="16" fill="#F4B315" />
      {/* Stripes */}
      <ellipse cx="32" cy="32" rx="12" ry="4" fill="#1A141A" />
      <ellipse cx="32" cy="40" rx="12" ry="4" fill="#1A141A" />
      {/* Head */}
      <circle cx="32" cy="20" r="9" fill="#E59312" />
      {/* Eyes */}
      <circle cx="28" cy="18" r="2.5" fill="#1A141A" />
      <circle cx="36" cy="18" r="2.5" fill="#1A141A" />
      <circle cx="28.8" cy="17.2" r="0.8" fill="white" />
      <circle cx="36.8" cy="17.2" r="0.8" fill="white" />
      {/* Antennae */}
      <line x1="28" y1="12" x2="22" y2="6" stroke="#E59312" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="21" cy="5" r="2" fill="#F4B315"/>
      <line x1="36" y1="12" x2="42" y2="6" stroke="#E59312" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="43" cy="5" r="2" fill="#F4B315"/>
      {/* Wings */}
      <ellipse cx="16" cy="30" rx="10" ry="6" fill="white" fillOpacity="0.7" transform="rotate(-20 16 30)"/>
      <ellipse cx="48" cy="30" rx="10" ry="6" fill="white" fillOpacity="0.7" transform="rotate(20 48 30)"/>
      <ellipse cx="14" cy="38" rx="7" ry="4" fill="white" fillOpacity="0.5" transform="rotate(-10 14 38)"/>
      <ellipse cx="50" cy="38" rx="7" ry="4" fill="white" fillOpacity="0.5" transform="rotate(10 50 38)"/>
      {/* Stinger */}
      <polygon points="32,52 29,58 35,58" fill="#C97A0A"/>
    </svg>
  );
}
