import React from 'react';

interface ClimanovaIconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Climanova-inspired lightweight animated SVG icons.
 * Restyled with glowing warm amber, solar orange, and warm light accents.
 */

// 1. Solar Pulse Icon
export const ClimanovaSun: React.FC<ClimanovaIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block overflow-visible ${className}`}
    aria-hidden="true"
  >
    {/* Ambient pulsating halo */}
    <circle
      cx="12"
      cy="12"
      r="7"
      className="fill-amber-500/15 animate-ping-subtle origin-center"
    />
    {/* Rotating solar ray crown */}
    <g className="animate-spin-slow origin-center stroke-amber-500" strokeWidth="1.75" strokeLinecap="round">
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.5" y1="4.5" x2="6.3" y2="6.3" />
      <line x1="17.7" y1="17.7" x2="19.5" y2="19.5" />
      <line x1="4.5" y1="19.5" x2="6.3" y2="17.7" />
      <line x1="17.7" y1="6.3" x2="19.5" y2="4.5" />
    </g>
    {/* Glowing core sphere */}
    <circle cx="12" cy="12" r="4.5" className="fill-orange-500 stroke-amber-300" strokeWidth="1" />
  </svg>
);

// 2. Battery Flow Icon (Warm Solar Gold / Amber)
export const ClimanovaBattery: React.FC<ClimanovaIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block overflow-visible ${className}`}
    aria-hidden="true"
  >
    {/* Battery terminal */}
    <path d="M22 10.5V13.5" className="stroke-amber-400" strokeWidth="2" strokeLinecap="round" />
    {/* Battery enclosure */}
    <rect
      x="2"
      y="6"
      width="18"
      height="12"
      rx="3"
      className="stroke-amber-500/80"
      strokeWidth="1.75"
    />
    {/* Fluid animated charge level */}
    <rect
      x="4"
      y="8"
      width="11"
      height="8"
      rx="1.5"
      className="fill-amber-400 animate-pulse-glow"
    />
    {/* Energy photon dash */}
    <line
      x1="8"
      y1="10"
      x2="8"
      y2="14"
      className="stroke-stone-950"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// 3. Dynamic Grid Power Icon (Warm Solar Orange)
export const ClimanovaGrid: React.FC<ClimanovaIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block overflow-visible ${className}`}
    aria-hidden="true"
  >
    <path
      d="M12 2L4 9V21H20V9L12 2Z"
      className="stroke-orange-500/60"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Dynamic transmission chevron */}
    <path
      d="M8 14L12 10L16 14"
      className="stroke-amber-400 animate-bounce"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="12" y1="10" x2="12" y2="18" className="stroke-orange-400" strokeWidth="1.75" />
  </svg>
);

// 4. Clean Home Load Icon (Warm Terracotta / Gold)
export const ClimanovaHome: React.FC<ClimanovaIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block overflow-visible ${className}`}
    aria-hidden="true"
  >
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V10.5Z"
      className="stroke-orange-400"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    {/* Internal energy beam */}
    <path
      d="M12 9V15M10 13H14"
      className="stroke-amber-300 animate-pulse-glow"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

// 5. Minimalist Efficiency Shield Icon (Warm Amber / Solar Gold)
export const ClimanovaShield: React.FC<ClimanovaIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block overflow-visible ${className}`}
    aria-hidden="true"
  >
    <path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      className="stroke-amber-400"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 9"
      className="stroke-orange-300 animate-pulse-glow"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
