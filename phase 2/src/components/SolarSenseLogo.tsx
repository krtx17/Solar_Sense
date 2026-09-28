import React from 'react';

interface SolarSenseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * SolarSense Brand Logo:
 * Matches the official brand mark reference:
 * - Radiant golden-yellow sun rising behind the roof
 * - Perspective solar panel array on the left roof slope
 * - House gable roof with chimney on the right
 * - 4-pane blue window
 * - Wordmark: "Solar" (Navy #0B2545) + "Sense" (Electric Sky Blue #0284C7)
 */
export const SolarSenseLogo: React.FC<SolarSenseLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  wordmarkClassName = '',
}) => {
  // Dimension sizing
  const iconDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 72, height: 72 },
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact Vector Emblem Matching Reference Photo */}
      <svg
        width={iconDimensions.width}
        height={iconDimensions.height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Sun Gradient */}
          <linearGradient id="sunGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="45%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#F57C00" />
          </linearGradient>

          {/* Solar Panel Sky Blue Gradient */}
          <linearGradient id="panelGrad" x1="10" y1="40" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* House Roof Blue Gradient */}
          <linearGradient id="roofGrad" x1="60" y1="45" x2="115" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0B2545" />
          </linearGradient>
        </defs>

        {/* 1. RADIATING SUN RAYS */}
        <g stroke="url(#sunGrad)" strokeWidth="3.5" strokeLinecap="round">
          {/* Ray 1 (Leftmost horizontal) */}
          <line x1="22" y1="68" x2="14" y2="70" />
          {/* Ray 2 */}
          <line x1="25" y1="56" x2="18" y2="54" />
          {/* Ray 3 */}
          <line x1="30" y1="45" x2="23" y2="40" />
          {/* Ray 4 */}
          <line x1="38" y1="36" x2="33" y2="29" />
          {/* Ray 5 */}
          <line x1="49" y1="30" x2="46" y2="22" />
          {/* Ray 6 (Top vertical) */}
          <line x1="61" y1="27" x2="61" y2="19" />
          {/* Ray 7 */}
          <line x1="73" y1="30" x2="76" y2="22" />
          {/* Ray 8 */}
          <line x1="84" y1="36" x2="89" y2="29" />
          {/* Ray 9 */}
          <line x1="92" y1="45" x2="99" y2="40" />
        </g>

        {/* 2. RISING SUN DISK */}
        <circle cx="61" cy="62" r="23" fill="url(#sunGrad)" />
        {/* Sun Inner Highlight Arc */}
        <path
          d="M 45 52 A 18 18 0 0 1 76 52"
          stroke="#FFF9C4"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* 3. HOUSE ROOF & CHIMNEY (Right Side) */}
        {/* Chimney */}
        <rect x="91" y="55" width="8" height="15" rx="1" fill="url(#panelGrad)" />
        {/* Roofline Right Slope */}
        <path
          d="M 68 49 L 109 76"
          stroke="url(#panelGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 4. 4-PANE BLUE WINDOW */}
        <g fill="url(#panelGrad)">
          {/* Top-Left Pane */}
          <rect x="74" y="65" width="5.5" height="5.5" rx="1" />
          {/* Top-Right Pane */}
          <rect x="81.5" y="65" width="5.5" height="5.5" rx="1" />
          {/* Bottom-Left Pane */}
          <rect x="74" y="72.5" width="5.5" height="5.5" rx="1" />
          {/* Bottom-Right Pane */}
          <rect x="81.5" y="72.5" width="5.5" height="5.5" rx="1" />
        </g>

        {/* 5. SOLAR PANEL ARRAY (Left Slope) */}
        {/* Main Panel Polygon Base */}
        <path
          d="M 67 48 L 86 52 L 56 79 L 13 79 Z"
          fill="url(#panelGrad)"
        />
        {/* White Grid Lines Dividing Solar Cells */}
        {/* Longitudinal Grid Lines */}
        <line x1="50" y1="49.5" x2="27" y2="79" stroke="#FFFFFF" strokeWidth="1.8" />
        <line x1="60" y1="50.8" x2="42" y2="79" stroke="#FFFFFF" strokeWidth="1.8" />
        <line x1="72" y1="51.5" x2="49" y2="79" stroke="#FFFFFF" strokeWidth="1.8" />
        {/* Transverse Latitudinal Grid Lines */}
        <line x1="22" y1="70" x2="72" y2="61" stroke="#FFFFFF" strokeWidth="1.8" />
        <line x1="33" y1="60" x2="79" y2="56" stroke="#FFFFFF" strokeWidth="1.8" />
      </svg>

      {/* Wordmark: "SolarSense" (Solar in Navy Blue, Sense in Sky Blue) */}
      {showWordmark && (
        <span className={`font-extrabold tracking-tight ${textSize} ${wordmarkClassName}`}>
          <span className="text-[#0B2545]">Solar</span>
          <span className="text-[#0284C7]">Sense</span>
        </span>
      )}
    </div>
  );
};
