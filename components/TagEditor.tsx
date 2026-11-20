import React, { useEffect, useRef, useState } from 'react';
import { PhotoTag } from '../data/photography';
import { Arrow, PlacedPin, TagPin, arrowTip, arrowToward, bubble, isPlaced, useFrameSize } from './PhotoTags';

type Person = Pick<PhotoTag, 'label' | 'href'>;
type Pt = { x: number; y: number };

/** "www.ivyzhang.ca" → { label: "ivyzhang.ca", href: "https://www.ivyzhang.ca/" } */
const personFrom = (link: string): Person | null => {
  try {
    const url = new URL(/^https?:\/\//.test(link) ? link : `https://${link}`);
    return { label: url.hostname.replace(/^www\./, ''), href: url.href };
  } catch {
    return null;
  }
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pct = (v: number) => Math.round(clamp(v, 0, 100) * 10) / 10;

/**
 * A tag being put down, one click at a time: first its label follows the
 * mouse until a click sets it ('label'), then its arrow travels round the
 * label's edge toward the mouse until a click sets that too ('arrow').
 */
type Placing = {
  person: Person;
  /** What a tag being moved keeps (its face size) */
  keep: Partial<PhotoTag>;
  stage: 'label' | 'arrow';
  /** The label's centre, % of the photo */
  at: Pt;
  arrow: Arrow;
};

/**
 * Dev-only tag editor over a lightbox photo — the gallery loads it only under
 * `npm run dev`, so it never reaches the live site.
 *
 * Tagging someone is three clicks: click the photo and say who it is; the label
 * then follows the mouse, click to set it down; then its arrow, snug against
 * the label, travels round the edge toward the mouse, click to set it. Click a
 * tag that's already there to place it again the same way, × to remove it, Esc
 * to drop whatever is being placed. Every change goes through onChange, which
 * saves it to data/photo-tags.json.
 */
const TagEditor: React.FC<{
  tags: PhotoTag[];
  people: Person[];
  onChange: (tags: PhotoTag[]) => void;
}> = ({ tags, people, onChange }) => {
  const root = useRef<HTMLDivElement>(null);
  const firstChoice = useRef<HTMLButtonElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const bubbles = useRef<(HTMLSpanElement | null)[]>([]);
  const placingLabel = useRef<HTMLSpanElement>(null);
  const frame = useFrameSize(root);
  const [pending, setPending] = useState<Pt | null>(null);
  const [link, setLink] = useState('');
  const [placing, setPlacing] = useState<Placing | null>(null);

  useEffect(() => {
    if (pending) (firstChoice.current ?? linkInput.current)?.focus({ preventScroll: true });
  }, [pending]);

  // Esc drops the tag being placed. Caught on the way down, before the
  // lightbox's own Esc (close) hears it.
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setPlacing(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [placing !== null]);

  const pointAt = (e: { clientX: number; clientY: number }): Pt => {
    const r = root.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  /** The label being placed, its size in px, once it's on screen */
  const labelSize = () => {
    const el = placingLabel.current;
    return el ? { w: el.offsetWidth, h: el.offsetHeight } : { w: 0, h: 0 };
  };

  /** Follow the mouse: the label while it's being set down, then its arrow. */
  const follow = (p: Pt) => {
    if (!placing || !frame.w) return;
    const { w, h } = labelSize();
    if (placing.stage === 'label') {
      // Keep the whole label inside the photo
      const hx = (w / 2 / frame.w) * 100;
      const hy = (h / 2 / frame.h) * 100;
      setPlacing({ ...placing, at: { x: clamp(p.x, hx, 100 - hx), y: clamp(p.y, hy, 100 - hy) } });
    } else if (w) {
      const dx = ((p.x - placing.at.x) / 100) * frame.w;
      const dy = ((p.y - placing.at.y) / 100) * frame.h;
      setPlacing({ ...placing, arrow: arrowToward(dx, dy, w, h) });
    }
  };

  const confirm = (p: Pt) => {
    if (!placing) return;
    const { w, h } = labelSize();
    if (placing.stage === 'label') {
      // The arrow starts out already facing the mouse
      const dx = ((p.x - placing.at.x) / 100) * frame.w;
      const dy = ((p.y - placing.at.y) / 100) * frame.h;
      setPlacing({ ...placing, stage: 'arrow', arrow: w ? arrowToward(dx, dy, w, h) : placing.arrow });
      return;
    }
    // Also stored: where the arrow's tip lands, as the tag's point (the
    // label's centre if the frame hasn't been measured, never NaN: one bad
    // tag would get the whole photo's save refused)
    const tip = frame.w && frame.h ? arrowTip(placing.arrow, w, h) : { x: 0, y: 0 };
    const tag: PhotoTag = {
      ...placing.keep,
      ...placing.person,
      x: pct(placing.at.x + (frame.w ? (tip.x / frame.w) * 100 : 0)),
      y: pct(placing.at.y + (frame.h ? (tip.y / frame.h) * 100 : 0)),
      lx: pct(placing.at.x),
      ly: pct(placing.at.y),
      side: placing.arrow.side,
      at: placing.arrow.at,
    };
    // One tag per person per photo: placing them again replaces the old one
    onChange([...tags.filter((t) => t.href !== tag.href), tag]);
    setPlacing(null);
  };

  /** Start placing someone, their label beginning at `at`. */
  const place = (person: Person, at: Pt, keep: Partial<PhotoTag> = {}) =>
    setPlacing({ person, keep, stage: 'label', at, arrow: { side: 'bottom', at: 0.5 } });

  const tagAs = (person: Person | null) => {
    if (!pending || !person) return;
    place(person, pending);
    setPending(null);
    setLink('');
  };

  /** Pick a tag that's already there back up, its label where it sits now. */
  const pickUp = (i: number) => {
    const r = root.current!.getBoundingClientRect();
    const b = bubbles.current[i]!.getBoundingClientRect();
    const { label, href, face } = tags[i];
    place(
      { label, href },
      { x: ((b.left + b.width / 2 - r.left) / r.width) * 100, y: ((b.top + b.height / 2 - r.top) / r.height) * 100 },
      face === undefined ? {} : { face }
    );
  };

  // Not yet tagged in this photo, so the list only offers new choices
  const choices = people.filter((p) => !tags.some((t) => t.href === p.href));
  const moving = placing?.person.href;

  return (
    <div
      ref={root}
      className={`absolute inset-0 ${placing ? (placing.stage === 'label' ? 'cursor-move' : 'cursor-crosshair') : 'cursor-crosshair'}`}
      onPointerMove={(e) => placing && follow(pointAt(e))}
      onClick={(e) => {
        const p = pointAt(e);
        if (placing) confirm(p);
        else setPending(pending ? null : { x: pct(p.x), y: pct(p.y) });
      }}
      // Keep clicks here from reading as the lightbox's swipe-to-next
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {tags.map((tag, i) => {
        // The one being placed again is drawn from `placing` instead
        if (tag.href === moving) return null;
        const label = (
          <span
            ref={(el) => {
              bubbles.current[i] = el;
            }}
            title="click to place again"
            className={`${bubble} relative ${placing ? 'pointer-events-none' : 'cursor-pointer hover:ring-2 hover:ring-beak'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!placing) pickUp(i);
            }}
          >
            {tag.label}
            <button
              aria-label={`Remove ${tag.label}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(tags.filter((_, j) => j !== i));
              }}
              className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-white text-[11px] leading-none text-black shadow hover:bg-beak hover:text-white"
            >
              ×
            </button>
          </span>
        );
        return isPlaced(tag) ? (
          <PlacedPin key={tag.href} tag={tag} frame={frame}>
            {label}
          </PlacedPin>
        ) : (
          <TagPin key={tag.href} tag={tag}>
            {label}
          </TagPin>
        );
      })}

      {placing && (
        <>
          <PlacedPin
            tag={{ ...placing.person, x: placing.at.x, y: placing.at.y, lx: placing.at.x, ly: placing.at.y, ...placing.arrow }}
            frame={frame}
            arrow={placing.stage === 'arrow'}
          >
            <span ref={placingLabel} className={`${bubble} pointer-events-none ring-2 ring-beak`}>
              {placing.person.label}
            </span>
          </PlacedPin>
          <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-3 py-1 text-[12px] lowercase text-white/90">
            {placing.stage === 'label' ? 'move the label · click to set it' : 'aim the arrow · click to set it'} · esc to cancel
          </p>
        </>
      )}

      {pending && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-beak shadow"
            style={{ left: `${pending.x}%`, top: `${pending.y}%` }}
          />
          <div
            role="dialog"
            aria-label="Who's this?"
            className="absolute z-10 w-56 cursor-default rounded-lg bg-paper p-2 text-ink-900 shadow-xl"
            style={{
              left: `${pending.x}%`,
              top: `${pending.y}%`,
              // Opens below the point, or above it in the lower half, and slides to stay in frame
              transform: `translate(-${Math.min(90, Math.max(10, pending.x))}%, ${pending.y > 50 ? 'calc(-100% - 12px)' : '12px'})`,
            }}
            onClick={(e) => e.stopPropagation()}
            // Typing here mustn't page the lightbox or close it
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') setPending(null);
            }}
          >
            <p className="px-1 pb-1 text-[12px] lowercase text-ink-500">who's this?</p>
            {choices.length > 0 && (
              <div className="max-h-56 overflow-y-auto">
                {choices.map((p, i) => (
                  <button
                    key={p.href}
                    ref={i === 0 ? firstChoice : undefined}
                    onClick={() => tagAs(p)}
                    className="block w-full rounded px-2 py-1 text-left text-[13.5px] hover:bg-paper-200 focus-visible:bg-paper-200 focus-visible:outline-none"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <form
              className="mt-1 flex gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                tagAs(personFrom(link.trim()));
              }}
            >
              <input
                ref={linkInput}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="new person's site"
                aria-label="New person's website"
                className="min-w-0 flex-1 rounded border border-ink-200 bg-white px-2 py-1 text-[13px] placeholder:text-ink-400 focus:border-beak focus:outline-none"
              />
              <button type="submit" className="rounded bg-ink-900 px-2.5 text-[12px] text-paper hover:bg-beak">
                tag
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default TagEditor;
