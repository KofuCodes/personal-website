import React from 'react';

/** Quiet section marker: lowercase mono, muted, trailing em dash. */
const QuietHeader: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4 flex items-baseline gap-4">
    <h2 className="mono text-[12px] lowercase tracking-wider text-stone-500 dark:text-stone-400">
      {label} —
    </h2>
    {children}
  </div>
);

export default QuietHeader;
