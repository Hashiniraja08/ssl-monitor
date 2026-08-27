import React from 'react';
import { useScan } from '../context/ScanContext';

export function GetStarted({ onNavigate }) {
  const { executeScan } = useScan();

  const popularTargets = [
    { label: 'google.com', url: 'https://google.com' },
    { label: 'github.com', url: 'https://github.com' },
    { label: 'badssl.com (Expired)', url: 'https://expired.badssl.com' },
    { label: 'cloudflare.com', url: 'https://cloudflare.com' }
  ];

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] items-center justify-center p-xl relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tertiary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center max-w-[600px] text-center z-10 p-xl bg-surface-container-low/60 backdrop-blur-xl rounded-[32px] border border-outline-variant/20 shadow-2xl">
        {/* Animated Shield */}
        <div className="relative w-28 h-28 mb-lg">
          <svg className="w-full h-full text-secondary animate-[pulse_4s_ease-in-out_infinite]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24">
            <path className="opacity-20" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeDasharray="60" strokeDashoffset="0">
              <animate attributeName="strokeDashoffset" dur="2s" fill="freeze" values="60;0" />
            </path>
            <path d="M9 12l2 2 4-4" strokeWidth="1.5">
              <animate attributeName="opacity" begin="1.5s" dur="0.5s" fill="freeze" values="0;1" />
            </path>
          </svg>
          <div className="absolute inset-0 bg-secondary/10 blur-xl rounded-full" />
        </div>

        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-md tracking-tight font-bold">
          No Active Scans
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-md mx-auto leading-relaxed">
          Your monitoring queue is currently empty. Initiate a scan to evaluate your infrastructure against the latest threat intelligence matrices.
        </p>

        <button
          onClick={() => onNavigate('scan-home')}
          className="group relative inline-flex items-center justify-center px-lg py-md bg-secondary text-on-secondary font-headline-md text-headline-md rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_16px_rgba(93,230,255,0.3)] hover:shadow-[0_0_24px_rgba(93,230,255,0.5)] font-semibold"
        >
          <span className="material-symbols-outlined mr-sm text-[20px]">radar</span>
          Scan Your First Website
          <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
        </button>

        {/* Popular targets */}
        <div className="mt-xl pt-lg border-t border-outline-variant/10 w-full">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-md opacity-60 uppercase tracking-wider">
            Popular Test Targets
          </p>
          <div className="flex flex-wrap justify-center gap-sm">
            {popularTargets.map((t, idx) => (
              <button
                key={idx}
                onClick={() => executeScan(t.url)}
                className="px-md py-sm bg-surface-container rounded-lg font-code-sm text-xs text-on-surface-variant opacity-70 hover:opacity-100 hover:text-secondary transition-all border border-outline-variant/10 cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetStarted;
