import React, { useState } from 'react';
import { useScan } from '../context/ScanContext';

export function ScanHome({ onNavigate }) {
  const [inputUrl, setInputUrl] = useState('');
  const { executeScan, isScanning } = useScan();

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      executeScan(inputUrl.trim());
    }
  };

  const sampleTargets = [
    { label: 'google.com', url: 'https://google.com' },
    { label: 'github.com', url: 'https://github.com' },
    { label: 'cloudflare.com', url: 'https://cloudflare.com' },
    { label: 'expired.badssl.com (Test)', url: 'https://expired.badssl.com' },
    { label: 'self-signed.badssl.com (Test)', url: 'https://self-signed.badssl.com' }
  ];

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle animated background scanning effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex justify-center items-center">
        <div className="w-[80vw] h-[80vw] rounded-full border border-secondary animate-[ping_6s_ease-out_infinite] absolute" />
        <div className="w-[60vw] h-[60vw] rounded-full border border-secondary animate-[ping_6s_ease-out_infinite_2s] absolute" />
        <div className="w-[40vw] h-[40vw] rounded-full border border-secondary animate-[ping_6s_ease-out_infinite_4s] absolute" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-lg">
        {/* Header Section */}
        <div className="text-center mb-xl space-y-md">
          <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant mb-md shadow-sm">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4edea3]" />
            <span className="font-label-caps text-label-caps text-tertiary tracking-widest uppercase">
              Active Scanning Engine v2.4
            </span>
          </div>

          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm">
            Scan Any Website's{' '}
            <span className="text-secondary bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary drop-shadow-[0_0_12px_rgba(0,203,230,0.5)]">
              SSL Certificate
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Instantly analyze certificate chains, cipher suites, and TLS vulnerabilities with our advanced security reconnaissance tool.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleScanSubmit} className="w-full max-w-2xl mb-lg group relative z-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary/50 via-primary/50 to-tertiary/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant/50 focus-within:border-secondary shadow-lg transition-all duration-300 overflow-hidden">
            <div className="pl-md flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-headline-md">lock</span>
            </div>
            <input
              className="w-full bg-transparent border-none py-lg px-md font-code-sm text-code-sm text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
              placeholder="https://example.com or domain name"
              required
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={isScanning}
            />
            <button
              className="m-sm px-lg py-md bg-secondary text-on-secondary font-headline-md text-body-md rounded-lg flex items-center gap-xs hover:bg-secondary-fixed transition-colors shadow-[0_0_16px_rgba(0,203,230,0.4)] whitespace-nowrap group-focus-within:animate-pulse disabled:opacity-50"
              type="submit"
              disabled={isScanning}
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              Scan Now
            </button>
          </div>
        </form>

        {/* Quick Sample Targets */}
        <div className="flex flex-wrap justify-center items-center gap-sm mb-xl">
          <span className="text-xs text-on-surface-variant font-label-caps uppercase mr-1">Quick Sample:</span>
          {sampleTargets.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInputUrl(t.url);
                executeScan(t.url);
              }}
              className="px-sm py-1 rounded bg-surface-container-high/60 hover:bg-surface-container-highest border border-outline-variant/20 text-xs font-code-sm text-on-surface hover:text-secondary transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-lg mt-md">
          <div className="flex items-center gap-sm px-md py-sm rounded-lg bg-surface-container/50 border border-outline-variant/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">HTTPS Verified</span>
          </div>
          <div className="flex items-center gap-sm px-md py-sm rounded-lg bg-surface-container/50 border border-outline-variant/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">TLS 1.3 Certified</span>
          </div>
          <div className="flex items-center gap-sm px-md py-sm rounded-lg bg-surface-container/50 border border-outline-variant/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              policy
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">SOC 2 Compliant</span>
          </div>
        </div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute bottom-lg left-lg text-on-surface-variant/30 flex flex-col gap-xs pointer-events-none">
        <div className="w-8 h-px bg-current" />
        <span className="font-code-sm text-[10px] [writing-mode:vertical-rl] tracking-widest uppercase">Target Analysis</span>
      </div>
      <div className="absolute top-lg right-lg text-on-surface-variant/30 flex flex-col items-end gap-xs pointer-events-none">
        <div className="w-8 h-px bg-current" />
        <span className="font-code-sm text-[10px] tracking-widest uppercase">Sys.01</span>
      </div>
    </div>
  );
}

export default ScanHome;
