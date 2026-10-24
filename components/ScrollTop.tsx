import React, { useEffect, useState } from 'react';

const SHOW_AFTER = 260; // px of scroll before it appears

/**
 * Back to top. Scrollbars are hidden site-wide, so longer pages need an
 * explicit way back up. Styled like the 404's pill — quiet, bordered,
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
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-full border border-ink-300 bg-paper/85 px-3.5 py-2 text-[13px] lowercase text-ink-500 backdrop-blur-sm transition-[opacity,transform,color,background-color] duration-300 hover:bg-paper-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beak ${
        shown ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <span aria-hidden="true" className="text-[12px] leading-none">↑</span>
      top
    </button>
  );
};

export default ScrollTop;
