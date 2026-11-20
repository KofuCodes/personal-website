import React from 'react';
import { setTheme, useTheme, warm } from '../theme';

/**
 * Day ⇄ night. Sits in the header's top-right cluster, just ahead of what's
 * playing: an inked moon by day, a sun by night, darkening on hover the way
 * the links do.
 * Hovering (or focusing) it fetches the other painting, so it's usually in
 * hand by the time the click lands.
 */
const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      onPointerEnter={() => warm(next)}
      onFocus={() => warm(next)}
      aria-label={`Switch to ${next} mode`}
      title={next === 'dark' ? 'night' : 'day'}
      className="group -m-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beak"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[17px] w-[17px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-[18deg]"
        aria-hidden="true"
      >
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6Z" />
        )}
      </svg>
    </button>
  );
};

export default ThemeToggle;
