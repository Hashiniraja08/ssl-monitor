import React from 'react';

export function AnimatedRadar({ size = 'md' }) {
  const containerSize = size === 'lg' ? 'w-80 h-80' : size === 'sm' ? 'w-32 h-32' : 'w-64 h-64';
  const innerSvgSize = size === 'lg' ? 'w-48 h-48' : size === 'sm' ? 'w-20 h-20' : 'w-40 h-40';

  return (
    <div className={`relative flex items-center justify-center ${containerSize} group`}>
      {/* Outer HUD Ring - Rotates slowly clockwise */}
      <svg className="absolute inset-0 w-full h-full origin-center animate-[spin_12s_linear_infinite]" fill="none" viewBox="0 0 200 200">
        <circle className="text-secondary/40" cx="100" cy="100" r="98" stroke="currentColor" strokeDasharray="4 12" strokeWidth="0.5" />
        <circle className="text-secondary/60" cx="100" cy="100" r="90" stroke="currentColor" strokeDasharray="30 10 5 10" strokeWidth="1" />
      </svg>

      {/* Inner HUD Ring - Rotates counter-clockwise */}
      <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] origin-center animate-[spin_8s_linear_infinite_reverse]" fill="none" viewBox="0 0 200 200">
        <circle className="text-tertiary/40" cx="100" cy="100" r="85" stroke="currentColor" strokeDasharray="1 6" strokeWidth="1.5" />
        <path className="text-secondary/80" d="M 10 100 A 90 90 0 0 1 190 100" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* Central Animated SVG Pulse & Crosshairs */}
      <div className={`relative z-20 ${innerSvgSize} filter drop-shadow-[0_0_16px_rgba(93,230,255,0.4)]`}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="100" cy="100" fill="none" r="80" stroke="#22D3EE" strokeDasharray="4 4" strokeWidth="2">
            <animate attributeName="r" dur="2s" from="0" repeatCount="indefinite" to="80" />
            <animate attributeName="opacity" dur="2s" from="1" repeatCount="indefinite" to="0" />
          </circle>
          <circle cx="100" cy="100" fill="none" opacity="0.3" r="80" stroke="#10B981" strokeWidth="1" />
          <path d="M100 20 L100 100 L170 100" fill="none" stroke="#22D3EE" strokeLinecap="round" strokeWidth="2">
            <animateTransform attributeName="transform" dur="4s" from="0 100 100" repeatCount="indefinite" to="360 100 100" type="rotate" />
          </path>
          <path d="M100 40 L100 100 L150 100" fill="none" opacity="0.5" stroke="#10B981" strokeWidth="1">
            <animateTransform attributeName="transform" dur="3s" from="0 100 100" repeatCount="indefinite" to="360 100 100" type="rotate" />
          </path>
          <circle cx="100" cy="100" fill="#22D3EE" r="5" />
        </svg>
      </div>

      {/* Scanning Sweep Overlay */}
      <div className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden z-30 pointer-events-none mix-blend-screen opacity-50">
        <div className="w-full h-[2px] bg-secondary shadow-[0_0_12px_#00cbe6] animate-sweep relative top-[50%]" />
      </div>
    </div>
  );
}

export default AnimatedRadar;
