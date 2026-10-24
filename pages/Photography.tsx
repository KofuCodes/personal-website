import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { photos as allPhotos, Photo } from '../data/photography';
import Aperture from '../components/Aperture';
import QuietHeader from '../components/QuietHeader';

const Photography: React.FC = () => {
  const [active, setActive] = useState<number | null>(null);

  // Group by "location - year": newest year first; within a year the featured
  // places lead, in this order, then the rest alphabetically.
  const { groups, flat } = useMemo(() => {
    const map: { [key: string]: Photo[] } = {};
    allPhotos.forEach((photo) => {
      const key = `${photo.location} — ${photo.year}`;
      (map[key] ||= []).push(photo);
    });

    const priority = ['Vancouver & California', 'Waterloo, Ontario', 'San Francisco, California'];
    const rank = (loc: string) => {
      const i = priority.indexOf(loc);
      return i === -1 ? priority.length : i;
    };
    const keys = Object.keys(map).sort((a, b) => {
      const [locA, yearA] = a.split(' — ');
      const [locB, yearB] = b.split(' — ');
      if (yearA !== yearB) return yearB.localeCompare(yearA);
      return rank(locA) - rank(locB) || locA.localeCompare(locB);
    });

    const flat: Photo[] = [];
    const groups = keys.map((title) => {
      const start = flat.length;
      flat.push(...map[title]);
      return { title, photos: map[title], start };
    });
    return { groups, flat };
  }, []);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(() => setActive((i) => (i === null ? i : (i + 1) % flat.length)), [flat.length]);
  const prev = useCallback(() => setActive((i) => (i === null ? i : (i - 1 + flat.length) % flat.length)), [flat.length]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Tab') {
        // Trap focus inside the lightbox
        const root = overlayRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement;
        if (!root.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && activeEl === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close, next, prev]);

  // Move focus into the lightbox on open; restore it to the thumbnail on close
  useEffect(() => {
    const open = active !== null;
    if (open && !wasOpen.current) {
      wasOpen.current = true;
      openerRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
    } else if (!open && wasOpen.current) {
      wasOpen.current = false;
      openerRef.current?.focus?.();
    }
  }, [active]);

  const current = active !== null ? flat[active] : null;

  return (
    <div>
      <header className="mb-8 reveal group">
        <QuietHeader label="gallery">
          <Aperture className="w-3.5 h-3.5 text-ink-400 self-center" animate />
        </QuietHeader>
        <p className="text-[14.5px] text-ink-500">my story, through a lens.</p>
      </header>

      <div className="space-y-14">
        {groups.map((group) => (
          <section key={group.title} className="reveal">
            <h2 className="text-[13px] lowercase tracking-wider text-ink-500 mb-4">
              {group.title}
            </h2>
            <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
              {group.photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setActive(group.start + i)}
                  className="block w-full overflow-hidden rounded-lg ring-1 ring-inset ring-black/5 break-inside-avoid group"
                >
                  <img
                    src={photo.url}
                    alt={photo.location}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {current &&
        createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${current.location} — photo viewer`}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={close}
          >
            <button
              ref={closeRef}
              className="absolute top-4 right-4 w-10 h-10 grid place-items-center text-white/70 hover:text-white transition-colors"
              onClick={close}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              className="absolute left-2 sm:left-6 w-11 h-11 grid place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <figure className="max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={current.url}
                alt={current.location}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <figcaption className="text-[13px] text-white/60 mt-4 text-center">
                {current.location} · {current.year}
                <span className="ml-3 text-white/40">{active! + 1} / {flat.length}</span>
              </figcaption>
            </figure>

            <button
              className="absolute right-2 sm:right-6 w-11 h-11 grid place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>,
          document.body
        )}

      {/* No rule here — the shell footer below draws the page's only one */}
      <footer className="mt-16 text-center">
        <p className="text-[13px] lowercase tracking-wider text-ink-400">
          end of collection ✵
        </p>
      </footer>
    </div>
  );
};

export default Photography;
