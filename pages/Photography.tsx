import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { photos as allPhotos, Photo } from '../data/photography';
import Aperture from '../components/Aperture';
import PhotoTags, { TagIcon } from '../components/PhotoTags';
import QuietHeader from '../components/QuietHeader';
import WebImage, { imageRatio, webCopy } from '../components/WebImage';

/**
 * The gallery: albums of balanced masonry columns, then a lightbox.
 *
 * Nothing on this page shifts while it loads. Every tile is sized up front
 * from the photo's known shape, shows a blurred preview straight away, and
 * sharpens when the small web copy lands (WebImage). Opening a photo flies it
 * from its tile into the lightbox (View Transitions, where supported), which
 * shows that same small copy at once and sharpens to the large one.
 */

const ratio = (p: Photo) => imageRatio(p.url);

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canMorph = () => 'startViewTransition' in document && !reduceMotion();

/** 2 columns on phones, 3 from md up. */
const useColumnCount = () => {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide ? 3 : 2;
};

/** Each photo goes to the currently shortest column, so the columns end level. */
const balance = <T,>(items: T[], count: number, heightOf: (item: T) => number) => {
  const cols = Array.from({ length: count }, () => ({ items: [] as T[], height: 0 }));
  items.forEach((item) => {
    const shortest = cols.reduce((a, b) => (b.height < a.height - 1e-6 ? b : a));
    shortest.items.push(item);
    shortest.height += heightOf(item);
  });
  return cols.map((c) => c.items);
};

const Photography: React.FC = () => {
  const [active, setActive] = useState<number | null>(null);
  const columnCount = useColumnCount();

  // Group by "location - year": newest year first; within a year the featured
  // places lead, in this order, then the rest alphabetically.
  const { groups, flat } = useMemo(() => {
    const map: { [key: string]: Photo[] } = {};
    allPhotos.forEach((photo) => {
      const key = `${photo.location} — ${photo.year}`;
      (map[key] ||= []).push(photo);
    });

    const priority = ['Vancouver & California', 'Québec', 'Waterloo, Ontario', 'San Francisco, California'];
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
      flat.push(...map[title]);
      return { title, photos: map[title] };
    });
    return { groups, flat };
  }, []);

  const indexOf = useMemo(() => new Map(flat.map((p, i) => [p.id, i])), [flat]);

  // Tiles drift up as they scroll in. A data attribute (not React state) so
  // one observer can flip hundreds of them without re-rendering the page.
  const tiles = useRef(new Map<string, HTMLElement>());
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', '');
          observer.current?.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px' }
    );
    tiles.current.forEach((el) => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, []);
  const tileRefs = useRef(new Map<string, (el: HTMLElement | null) => void>());
  const tileRef = (id: string) => {
    let fn = tileRefs.current.get(id);
    if (!fn) {
      fn = (el) => {
        if (el) {
          tiles.current.set(id, el);
          if (!el.hasAttribute('data-in')) observer.current?.observe(el);
        } else {
          tiles.current.delete(id);
        }
      };
      tileRefs.current.set(id, fn);
    }
    return fn;
  };

  // Open/close morph the photo between its tile and the lightbox frame: the
  // shared view-transition-name sits on exactly one of the two at a time.
  // One morph at a time — anything landing mid-flight applies its update
  // without animating — and a stale morph's update is dropped (seq), so a
  // quick open-then-close can't reopen the lightbox behind the user.
  const morphing = useRef(false);
  const seq = useRef(0);
  const settle = (vt: ViewTransition, tile: HTMLElement) => {
    morphing.current = true;
    // An interrupted morph (tab hidden, say) still applies its update; only
    // the animation is skipped.
    vt.ready.catch(() => {});
    vt.finished.finally(() => {
      tile.style.viewTransitionName = '';
      morphing.current = false;
    });
  };

  const open = (i: number) => {
    const n = ++seq.current;
    const tile = tiles.current.get(flat[i].id);
    if (!tile || morphing.current || !canMorph()) {
      setActive(i);
      return;
    }
    tile.style.viewTransitionName = 'photo';
    const vt = document.startViewTransition(() => {
      tile.style.viewTransitionName = '';
      if (n === seq.current) flushSync(() => setActive(i));
    });
    settle(vt, tile);
  };

  const close = useCallback(() => {
    const n = ++seq.current;
    if (active === null) return;
    const tile = tiles.current.get(flat[active].id);
    if (!tile || morphing.current || !canMorph()) {
      setActive(null);
      return;
    }
    const vt = document.startViewTransition(() => {
      if (n !== seq.current) return;
      flushSync(() => setActive(null));
      // Paging may have moved far from where the lightbox opened: bring this
      // photo's tile into view so it has somewhere to land.
      tile.scrollIntoView({ block: 'nearest' });
      if (!tile.hasAttribute('data-in')) {
        tile.style.transition = 'none'; // land on it, don't watch it drift in
        tile.setAttribute('data-in', '');
      }
      tile.style.viewTransitionName = 'photo';
    });
    settle(vt, tile);
  }, [active, flat]);

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
        const focusables = root.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])');
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
      closeRef.current?.focus({ preventScroll: true });
    } else if (!open && wasOpen.current) {
      wasOpen.current = false;
      openerRef.current?.focus?.({ preventScroll: true });
    }
  }, [active]);

  // Warm the neighbours' large copies so paging never waits
  useEffect(() => {
    if (active === null) return;
    [1, -1].forEach((d) => {
      new Image().src = webCopy(flat[(active + d + flat.length) % flat.length].url, 'lg');
    });
  }, [active, flat]);

  // Swipe between photos on touch screens
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  };

  const current = active !== null ? flat[active] : null;
  const r = current ? ratio(current) : 1;

  return (
    <div className="reveal">
      <header className="mb-8 group">
        <QuietHeader label="gallery">
          <Aperture className="w-3.5 h-3.5 text-ink-400 self-center" animate />
        </QuietHeader>
        <p className="text-[14.5px] text-ink-500">my story, through a lens.</p>
      </header>

      <div className="space-y-14">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-4 flex items-baseline gap-2 text-[13px] lowercase tracking-wider text-ink-500">
              {group.title}
              <span className="text-[11px] tabular-nums text-ink-400">{group.photos.length}</span>
            </h2>
            <div className="flex gap-2.5 sm:gap-3">
              {balance(group.photos, columnCount, (p) => 1 / ratio(p)).map((column, c) => (
                <div key={c} className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
                  {column.map((photo) => (
                    <button
                      key={photo.id}
                      ref={tileRef(photo.id)}
                      onClick={() => open(indexOf.get(photo.id)!)}
                      aria-label={`${photo.location}, ${photo.year}${photo.tags ? `, ${photo.tags.length} tagged` : ''} — open`}
                      // A touch of stagger across the row as they come in
                      style={{ aspectRatio: ratio(photo), transitionDelay: `${c * 70}ms` }}
                      className="tile group relative block w-full overflow-hidden rounded-lg bg-paper-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beak focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                      <WebImage src={photo.url} size="sm" alt={photo.location} />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5"
                      />
                      {photo.tags && (
                        <span className="pointer-events-none absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white">
                          <TagIcon className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
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
            className="modal-fade fixed inset-0 z-[9999] flex items-center justify-center bg-[#0d0f11]/95 p-4 backdrop-blur-sm sm:p-10"
            // Pinch-zoom stays native; one-finger drags reach the swipe handlers
            style={{ touchAction: 'pinch-zoom' }}
            onClick={close}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <button
              ref={closeRef}
              className="absolute top-4 right-4 z-10 w-10 h-10 grid place-items-center text-white/70 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              className="absolute left-2 sm:left-5 z-10 hidden sm:grid w-11 h-11 place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <figure className="flex w-full flex-col items-center sm:px-12">
              {/* Sized from the photo's own ratio, so it holds its final shape
                  before a single byte of the large copy arrives */}
              <div
                key={current.id}
                onClick={(e) => e.stopPropagation()}
                style={{
                  aspectRatio: r,
                  width: `min(100%, calc((100dvh - 8.5rem) * ${r}))`,
                  viewTransitionName: 'photo',
                }}
                className="relative overflow-hidden rounded-lg bg-white/5 shadow-2xl shadow-black/40"
              >
                <WebImage src={current.url} size="lg" alt={current.location} />
                {current.tags && <PhotoTags tags={current.tags} />}
              </div>
              <figcaption className="mt-4 text-center text-[13px] text-white/60" onClick={(e) => e.stopPropagation()}>
                {current.location} · {current.year}
                <span className="ml-3 tabular-nums text-white/40">{active! + 1} / {flat.length}</span>
              </figcaption>
            </figure>

            <button
              className="absolute right-2 sm:right-5 z-10 hidden sm:grid w-11 h-11 place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
