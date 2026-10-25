import React from 'react';

/**
 * Quiet section marker: lowercase, muted, trailing em dash.
 */
const QuietHeader: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ label, children }) => (
  <div className="mb-4 flex items-baseline gap-4">
    <h2 className="text-[13px] lowercase tracking-wider text-ink-500">
      {label} —
    </h2>
    {children}
  </div>
);

export default QuietHeader;
