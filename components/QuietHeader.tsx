import React from 'react';

/**
 * Quiet section marker: lowercase, muted, trailing em dash. `as` lets a
 * page use it as its own h1 without changing how it looks.
 */
const QuietHeader: React.FC<{
  label: string;
  as?: 'h1' | 'h2';
  children?: React.ReactNode;
}> = ({ label, as: Tag = 'h2', children }) => (
  <div className="mb-4 flex items-baseline gap-4">
    <Tag className="text-[13px] lowercase tracking-wider text-ink-500">
      {label} —
    </Tag>
    {children}
  </div>
);

export default QuietHeader;
