import React, { useRef, useState } from 'react';

/**
 * External link with a hover preview card — a small popup under (or above)
 * the link showing a live screenshot of the destination, its name, and domain.
 *
 * The screenshot (via microlink.io) is only requested on first hover/focus so
 * page load never hits the API. If the screenshot fails, the card gracefully
 * falls back to a favicon + title row.
 *
 * Touch devices get the plain link only: without real hover the card would
 * stick open after a tap (sticky :hover / lingering focus) and waste
 * screenshot requests nobody sees.
 */

// Hover-capable pointer? Evaluated once — devices don't change pointer class mid-session.
const canHover =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Sites that serve a login wall to anonymous screenshot crawlers — for these
// the card shows only the favicon + title row.
const NO_SCREENSHOT = ['linkedin.com', 'instagram.com'];

const CARD_W = 240; // w-60
const EDGE_MARGIN = 12;

interface LinkPreviewProps {
  href: string;
  /** Card title; defaults to the domain. */
  title?: string;
  /** Domain for the favicon + label; derived from href if omitted. */
  domain?: string;
  /** Where the card opens relative to the link. */
  side?: 'top' | 'bottom';
  /** Classes applied to the anchor itself. */
  className?: string;
  'aria-label'?: string;
  children: React.ReactNode;
}

const domainFromHref = (href: string): string | undefined => {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
};

const LinkPreview: React.FC<LinkPreviewProps> = ({
  href,
  title,
  domain,
  side = 'bottom',
  className = '',
  'aria-label': ariaLabel,
  children,
}) => {
  const [armed, setArmed] = useState(false);
  const [shotLoaded, setShotLoaded] = useState(false);
  const [shotFailed, setShotFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const resolvedDomain = domain ?? domainFromHref(href);
  const isHttp = /^https?:\/\//.test(href);

  // Touch devices and non-http(s) links (mailto:, tel:) get no card.
  if (!canHover || !isHttp || !resolvedDomain) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }

  const wantShot = !NO_SCREENSHOT.some((d) => resolvedDomain === d || resolvedDomain.endsWith(`.${d}`));
  const screenshot = `https://api.microlink.io/?url=${encodeURIComponent(href)}&screenshot=true&meta=false&embed=screenshot.url`;
  const favicon = `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=64`;

  // Arm the screenshot and keep the card inside the viewport (links near the
  // column edge would otherwise center a 240px card past the screen edge,
  // where body's overflow-x-hidden clips it).
  const arm = () => {
    setArmed(true);
    const el = wrapRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const half = CARD_W / 2;
      let s = 0;
      if (center - half < EDGE_MARGIN) {
        s = EDGE_MARGIN - (center - half);
      } else if (center + half > window.innerWidth - EDGE_MARGIN) {
        s = window.innerWidth - EDGE_MARGIN - (center + half);
      }
      setShift(Math.round(s));
    }
  };

  return (
    <span ref={wrapRef} className="group/lp relative inline-block">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        onMouseEnter={arm}
        onFocus={arm}
      >
        {children}
      </a>

      <span
        aria-hidden="true"
        style={shift ? { marginLeft: shift } : undefined}
        className={`pointer-events-none absolute left-1/2 z-20 w-60 -translate-x-1/2 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 shadow-lg shadow-black/5 dark:shadow-black/40 opacity-0 scale-95 transition-[opacity,transform] duration-200 ease-out group-hover/lp:opacity-100 group-hover/lp:scale-100 group-focus-within/lp:opacity-100 group-focus-within/lp:scale-100 ${
          side === 'top' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
        }`}
      >
        {wantShot && !shotFailed && (
          <span
            className={`relative block h-32 w-full bg-stone-100 dark:bg-stone-800 ${
              armed && !shotLoaded ? 'animate-pulse' : ''
            }`}
          >
            {armed && (
              <img
                src={screenshot}
                alt=""
                onLoad={() => setShotLoaded(true)}
                onError={() => setShotFailed(true)}
                className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${
                  shotLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </span>
        )}
        <span className="flex items-center gap-2.5 px-3.5 py-2.5">
          {!faviconFailed && (
            <img
              src={favicon}
              alt=""
              onError={() => setFaviconFailed(true)}
              className="h-4 w-4 shrink-0 rounded-[3px]"
            />
          )}
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] font-semibold text-stone-900 dark:text-stone-100">
              {title ?? resolvedDomain}
            </span>
            <span className="mono truncate text-[11px] text-stone-400 dark:text-stone-500">
              {resolvedDomain}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
};

export default LinkPreview;
