import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Aperture from './Aperture';

/**
 * The about list's "gallery" link, with a peek: hovering it (or focusing it)
 * opens a card under the link, styled like the external links' previews
 * (LinkPreview), that slowly cycles through photos from the gallery, with
 * where and when each was taken.
 *
 * Nothing loads until the first hover: the photo list and its web copies are
 * the gallery page's own chunk (usually prefetched by then, see App.tsx), and
 * only the photo showing and the one after it are fetched as the carousel
 * goes, from the small `sm` copies. It only turns over while open, never
 * before the next photo has arrived, and resumes where it left off.
 *
 * Touch devices get the plain link, as with LinkPreview: without real hover
 * the card would stick open after a tap.
 */

const canHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CARD_W = 240; // w-60, like LinkPreview
const EDGE_MARGIN = 12;
const HOLD = 2600; // ms each photo stays
const MAX_SLIDES = 12;

type Slide = { src: string; place: string };

/**
 * Landscape shots only (the card is 4:3), taken a place at a time so the
 * carousel keeps moving between cities: each place's first, then each one's
 * second, and so on.
 */
let slides: Promise<Slide[]> | null = null;
const loadSlides = () =>
  (slides ??= Promise.all([import('../data/photography'), import('./WebImage')]).then(
    ([{ photos }, { webCopy, imageRatio }]) => {
      const byPlace = new Map<string, typeof photos>();
      for (const p of photos) {
        if (imageRatio(p.url) < 1.2) continue;
        const place = `${p.location} · ${p.year}`;
        byPlace.set(place, [...(byPlace.get(place) ?? []), p]);
      }
      const lists = [...byPlace.values()];
      const out: Slide[] = [];
      for (let round = 0; out.length < MAX_SLIDES && lists.some((l) => l.length > round); round++) {
        for (const l of lists) {
          if (l[round] && out.length < MAX_SLIDES) {
            out.push({ src: webCopy(l[round].url, 'sm'), place: `${l[round].location} · ${l[round].year}` });
          }
        }
      }
      return out;
    }
  ));

const GalleryPeek: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({
  to,
  className = '',
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Slide[]>([]);
  const [cur, setCur] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(new Set());
  const [shift, setShift] = useState(0);
  const wrap = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  // Read by the timer, so a photo still loading holds the turn instead of flashing an empty frame
  const ready = useRef(loaded);
  ready.current = loaded;

  // Turn over while open
  useEffect(() => {
    if (!open || list.length < 2) return;
    const timer = setInterval(() => {
      setCur((c) => {
        const next = (c + 1) % list.length;
        return ready.current.has(next) ? next : c;
      });
    }, HOLD);
    return () => clearInterval(timer);
  }, [open, list.length]);

  if (!canHover) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  const show = () => {
    setOpen(true);
    if (!started.current) {
      started.current = true;
      loadSlides().then((s) => {
        setCur(Math.floor(Math.random() * s.length)); // a different first photo each visit
        setList(s);
      });
    }
    // Keep the card inside the viewport, as LinkPreview does
    const el = wrap.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const half = CARD_W / 2;
      let s = 0;
      if (center - half < EDGE_MARGIN) s = EDGE_MARGIN - (center - half);
      else if (center + half > window.innerWidth - EDGE_MARGIN) s = window.innerWidth - EDGE_MARGIN - (center + half);
      setShift(Math.round(s));
    }
  };
  const hide = () => setOpen(false);

  const n = list.length;
  // Only the photo showing, the one after it, and any already seen
  const wanted = (i: number) => i === cur || i === (cur + 1) % n || loaded.has(i);

  return (
    <span ref={wrap} className="relative inline-block" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <Link to={to} className={className}>
        {children}
      </Link>

      <span
        aria-hidden="true"
        style={shift ? { marginLeft: shift } : undefined}
        className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 origin-top -translate-x-1/2 overflow-hidden rounded-xl border border-ink-200 bg-paper shadow-lg shadow-black/5 transition-[opacity,transform] duration-200 ease-out dark:bg-paper-100 dark:shadow-black/30 ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <span className={`relative block h-[180px] w-full overflow-hidden bg-ink-100 ${loaded.has(cur) ? '' : 'animate-pulse'}`}>
          {list.map(
            (slide, i) =>
              wanted(i) && (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt=""
                  decoding="async"
                  onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    opacity: i === cur && loaded.has(i) ? 1 : 0,
                    // A slow push-in on whichever photo is showing
                    transform: calm || (i === cur && open) ? 'scale(1)' : 'scale(1.06)',
                    transition: `opacity 700ms ease-out, transform ${HOLD + 900}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                />
              )
          )}
          {n > 1 && (
            <span className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
              {list.map((slide, i) => (
                <span
                  key={slide.src}
                  className={`h-1 w-1 rounded-full shadow-[0_0_2px_rgb(0_0_0/0.6)] transition-colors duration-300 ${
                    i === cur ? 'bg-white' : 'bg-white/45'
                  }`}
                />
              ))}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2.5 px-3.5 py-2.5">
          <Aperture className="h-4 w-4 shrink-0 text-ink-400" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[14px] font-semibold text-ink-900">gallery</span>
            <span className="truncate text-[12px] text-ink-400">{list[cur]?.place ?? 'my story, through a lens'}</span>
          </span>
        </span>
      </span>
    </span>
  );
};

export default GalleryPeek;
