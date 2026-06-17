import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { photos as allPhotos, Photo } from '../data/photography';
import Aperture from '../components/Aperture';

const Photography: React.FC = () => {
  const [active, setActive] = useState<number | null>(null);

  // Group by "location - year", with a stable priority order.
  const { groups, flat } = useMemo(() => {
    const map: { [key: string]: Photo[] } = {};
    allPhotos.forEach((photo) => {
      const key = `${photo.location} — ${photo.year}`;
      (map[key] ||= []).push(photo);
    });

    const priority = ['Waterloo, Ontario', 'San Francisco, California'];
    const keys = Object.keys(map).sort((a, b) => {
      const [locA, yearA] = a.split(' — ');
      const [locB, yearB] = b.split(' — ');
      const pa = priority.indexOf(locA);
      const pb = priority.indexOf(locB);
      if (pa !== -1 && pb !== -1) return pa !== pb ? pa - pb : yearB.localeCompare(yearA);
      if (pa !== -1) return -1;
      if (pb !== -1) return 1;
      return yearA !== yearB ? yearB.localeCompare(yearA) : a.localeCompare(b);
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

  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close, next, prev]);

  const current = active !== null ? flat[active] : null;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-12">
      <header className="mb-12 reveal">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2.5">
          <Aperture className="w-5 h-5 text-neutral-400" /> Gallery
        </h1>
        <p className="text-[15px] text-neutral-500 dark:text-neutral-400 mt-2">My story, through a lens.</p>
      </header>

      <div className="space-y-14">
        {groups.map((group) => (
          <section key={group.title} className="reveal">
            <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4">
              {group.title}
            </h2>
            <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
              {group.photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setActive(group.start + i)}
                  className="block w-full overflow-hidden rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10 break-inside-avoid group"
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={close}
          >
            <button
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
              <figcaption className="mono text-[12px] text-white/60 mt-4 text-center">
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

      <footer className="mt-20 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <p className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          End of collection
        </p>
      </footer>
    </div>
  );
};

export default Photography;
