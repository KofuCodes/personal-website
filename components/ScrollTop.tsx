import React, { useEffect, useState } from 'react';

const SHOW_AFTER = 260; // px of scroll before it appears

/**
 * Back to top. Scrollbars are hidden site-wide, so longer pages need an
 * explicit way back up. Styled like the 404's pill — quiet mono, bordered,
 * darkening on hover the way the links do.
 */
const ScrollTop: React.FC = () => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setShown(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        })
      }
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-full border border-stone-300 dark:border-stone-700 bg-amber-50/85 dark:bg-stone-950/85 px-3.5 py-2 mono text-[12px] lowercase text-stone-500 dark:text-stone-400 backdrop-blur-sm transition-[opacity,transform,color,background-color] duration-300 hover:bg-amber-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 dark:focus-visible:ring-coral/80 ${
        shown ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <span aria-hidden="true" className="text-[11px] leading-none">↑</span>
      top
    </button>
  );
};

export default ScrollTop;
