import React, { useState } from 'react';
import LinkPreview from './LinkPreview';

/**
 * Small inline brand/company/school logo that sits next to its name in prose.
 *
 * Logo resolution order:
 *   1. `src`     — a local asset you drop in /public/logos (best quality)
 *   2. `domain`  — falls back to the site's favicon (real logo, zero setup)
 *   3. monogram  — first initial in a neutral chip when nothing else exists
 */

interface BrandLogoProps {
  name: string;
  domain?: string;
  src?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ name, domain, src, className = '' }) => {
  const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : undefined;
  const [current, setCurrent] = useState<string | undefined>(src || favicon);

  const base =
    'inline-block shrink-0 rounded-[4px] object-contain bg-stone-100 dark:bg-stone-800 ' +
    'ring-1 ring-inset ring-black/5 dark:ring-white/10';

  if (current) {
    return (
      <img
        src={current}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={() => setCurrent(undefined)}
        className={`${base} ${className}`}
      />
    );
  }

  // Monogram fallback
  return (
    <span
      aria-hidden="true"
      className={`${base} inline-flex items-center justify-center font-semibold text-stone-500 dark:text-stone-400 ${className}`}
    >
      <span style={{ fontSize: '0.62em' }}>{name.trim().charAt(0).toUpperCase()}</span>
    </span>
  );
};

interface BrandProps extends BrandLogoProps {
  label?: string;
  href?: string;
}

/** Logo + name rendered inline, kept on one line, optionally linked. */
const Brand: React.FC<BrandProps> = ({ name, label, href, domain, src, className = '' }) => {
  // Text decoration doesn't propagate into atomic inline boxes (the inline-flex
  // wrapper), so the underline must live on the span that holds the text.
  const inner = (underline: boolean) => (
    <span className={`inline-flex items-baseline gap-1.5 whitespace-nowrap ${className}`}>
      <BrandLogo
        name={name}
        domain={domain}
        src={src}
        className="w-[1.05em] h-[1.05em] translate-y-[0.16em]"
      />
      <span
        className={
          underline
            ? 'underline decoration-stone-300 dark:decoration-stone-600 underline-offset-[3px] group-hover/lp:decoration-stone-900 dark:group-hover/lp:decoration-stone-100 transition-colors'
            : undefined
        }
      >
        {label ?? name}
      </span>
    </span>
  );

  if (href) {
    return (
      <LinkPreview
        href={href}
        title={name}
        domain={domain}
        className="font-medium text-stone-900 dark:text-stone-100"
      >
        {inner(true)}
      </LinkPreview>
    );
  }

  return <span className="font-medium text-stone-900 dark:text-stone-100">{inner(false)}</span>;
};

export default Brand;
