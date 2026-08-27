import React, { useState, useEffect } from 'react';
import { AnimatedRadar } from '../components/AnimatedRadar';
import { useScan } from '../context/ScanContext';

export function ScanningPage({ onCancel }) {
  const { scanningUrl } = useScan();
  const [lines, setLines] = useState([]);

  const sequence = [
    'INITIALIZING SECURE HANDSHAKE...',
    `Resolving host vectors for ${scanningUrl || 'target'}...`,
    'Connecting via HTTPS port 443 with SNI...',
    'Retrieving remote X.509 certificate payload...',
    'Validating SSL/TLS chain of trust (Leaf -> Intermediate -> Root)...',
    'Extracting cryptographic signatures and Subject Alternative Names (SANs)...',
    'Analyzing cipher suites & key exchange algorithms...',
    'Calculating certificate expiration timeline and security grading...'
  ];

  useEffect(() => {
    setLines([sequence[0]]);
    let currentIdx = 1;

    const interval = setInterval(() => {
      if (currentIdx < sequence.length) {
        setLines(prev => [...prev, sequence[currentIdx]]);
        currentIdx++;
      }
    }, 240);

    return () => clearInterval(interval);
  }, [scanningUrl]);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] items-center justify-center relative overflow-hidden py-xl px-lg">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <div className="w-[80vw] h-[80vw] rounded-full bg-secondary/5 blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,203,230,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl">
        {/* Animated Scanner HUD */}
        <div className="mb-xl">
          <AnimatedRadar size="lg" />
        </div>

        {/* Status Output / Terminal Panel */}
        <div className="w-full bg-surface-container-low shadow-2xl relative overflow-hidden flex flex-col rounded-xl border border-outline-variant/30 backdrop-blur-md">
          {/* Panel Header */}
          <div className="relative z-10 flex items-center justify-between px-lg py-sm bg-surface-container-high/80 border-b border-outline-variant/20">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-secondary text-sm">terminal</span>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant tracking-[0.1em] uppercase">
                Scan Protocol Active
              </h2>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-1.5 h-1.5 bg-surface-variant rounded-full" />
              <div className="w-1.5 h-1.5 bg-surface-variant rounded-full" />
              <div className="w-1.5 h-1.5 bg-secondary shadow-[0_0_6px_#00cbe6] rounded-full animate-pulse" />
            </div>
          </div>

          {/* Terminal Output Area */}
          <div className="relative z-10 p-xl font-code-sm text-code-sm min-h-[190px] flex flex-col justify-end bg-gradient-to-b from-transparent to-primary-container/30">
            <div className="flex flex-col gap-sm w-full">
              {lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-xs text-on-surface-variant">
                  <span className="text-secondary text-xs">✔</span>
                  <span className={idx === lines.length - 1 ? 'text-secondary font-medium animate-pulse' : 'text-on-surface/80'}>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            {/* Blinking Cursor */}
            <div className="mt-sm flex items-center">
              <span className="text-secondary mr-xs">&gt;</span>
              <span className="w-2 h-4 bg-secondary animate-pulse shadow-[0_0_4px_#00cbe6]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanningPage;
