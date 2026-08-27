import React from 'react';

export function StatusBadge({ status, pulse = true, size = 'md' }) {
  const normalized = (status || 'valid').toLowerCase();

  let bgClass = 'bg-tertiary/10 text-tertiary border-tertiary/30 shadow-[0_0_8px_rgba(78,222,163,0.2)]';
  let dotClass = 'bg-tertiary shadow-[0_0_6px_#4edea3]';
  let label = 'Valid';

  if (normalized === 'expired' || normalized === 'critical' || normalized === 'error') {
    bgClass = 'bg-error/10 text-error border-error/30 shadow-[0_0_8px_rgba(255,180,171,0.2)]';
    dotClass = 'bg-error shadow-[0_0_6px_#ffb4ab]';
    label = normalized === 'error' ? 'Error' : 'Expired';
  } else if (normalized === 'warning') {
    bgClass = 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]';
    dotClass = 'bg-[#FBBF24] shadow-[0_0_6px_#fbbf24]';
    label = 'Warning';
  } else if (normalized === 'system' || normalized === 'pending') {
    bgClass = 'bg-secondary/10 text-secondary border-secondary/30 shadow-[0_0_8px_rgba(93,230,255,0.2)]';
    dotClass = 'bg-secondary shadow-[0_0_6px_#5de6ff]';
    label = normalized === 'pending' ? 'Pending' : 'System';
  }

  const sizeClasses = size === 'lg'
    ? 'px-lg py-sm text-headline-md font-bold uppercase tracking-wider gap-sm'
    : size === 'sm'
    ? 'px-2 py-0.5 text-[10px] font-label-caps uppercase gap-xs'
    : 'px-md py-xs text-label-caps font-semibold uppercase gap-xs';

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-md ${sizeClasses} ${bgClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
