import React from 'react';

export function GradeBadge({ grade = 'A' }) {
  const g = (grade || 'A').toUpperCase();

  let colorClass = 'bg-tertiary/15 text-tertiary border-tertiary/40 shadow-[0_0_12px_rgba(78,222,163,0.3)]';
  if (g === 'A+' || g === 'A') {
    colorClass = 'bg-tertiary/15 text-tertiary border-tertiary/40 shadow-[0_0_12px_rgba(78,222,163,0.3)]';
  } else if (g === 'B') {
    colorClass = 'bg-secondary/15 text-secondary border-secondary/40 shadow-[0_0_12px_rgba(93,230,255,0.3)]';
  } else if (g === 'C') {
    colorClass = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]';
  } else {
    colorClass = 'bg-error/15 text-error border-error/40 shadow-[0_0_12px_rgba(255,180,171,0.3)]';
  }

  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-headline-lg font-bold ${colorClass}`}>
      {g}
    </div>
  );
}

export default GradeBadge;
