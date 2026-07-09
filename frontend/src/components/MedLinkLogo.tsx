import React from 'react';

interface MedLinkLogoProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const MedLinkLogo: React.FC<MedLinkLogoProps> = ({ size = 20, color = 'var(--primary)', style }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
    >
      {/* Medical Cross Body */}
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="6" y1="12" x2="18" y2="12" />
      
      {/* Link Network Nodes */}
      <circle cx="12" cy="6" r="2" fill={color} />
      <circle cx="12" cy="18" r="2" fill={color} />
      <circle cx="6" cy="12" r="2" fill={color} />
      <circle cx="18" cy="12" r="2" fill={color} />
      
      {/* Center node */}
      <circle cx="12" cy="12" r="2.5" fill={color} />
      
      {/* Network background mesh links */}
      <path d="M7.5 7.5 C 9.5 9.5, 14.5 14.5, 16.5 16.5" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
      <path d="M7.5 16.5 C 9.5 14.5, 14.5 9.5, 16.5 7.5" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  );
};
