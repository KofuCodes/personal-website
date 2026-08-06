import React from 'react';

/**
 * Quiet section marker: lowercase mono, muted, trailing em dash. `as` lets a
 * page use it as its own h1 without changing how it looks.
 */
const QuietHeader: React.FC<{
  label: string;
  as?: 'h1' | 'h2';
  children?: React.ReactNode;
}> = ({ label, as: Tag = 'h2', children }) => (
  <div className="mb-4 flex items-baseline gap-4">
    <Tag className="mono text-[12px] lowercase tracking-wider text-stone-500 dark:text-stone-400">
      {label} —
    </Tag>
    {children}
  </div>
);

export default QuietHeader;
