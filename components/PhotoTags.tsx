import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PhotoTag } from '../data/photography';

/** The person glyph that marks a photo as having people tagged in it. */
export const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
  </svg>
);

/** A tag's black label; the editor reuses it so placement there is what ships. */
export const bubble =
  'whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[12px] leading-none text-white sm:px-2.5 sm:py-1.5 sm:text-[14px]';

/** Labels hang below their point, unless flipped in the editor or near the bottom edge. */
export const isAbove = (tag: PhotoTag) => tag.above ?? tag.y > 80;
/** How far along its label (%) a tag's caret sits. */
const alongOf = (tag: PhotoTag) => Math.min(88, Math.max(12, tag.x));

/**
 * Where a label hangs: below its point, or above it — lifted clear of the
 * face (px) so the caret points down at the top of the head — and how much
 * further out on a thin stem.
 */
type Placement = { above: boolean; lift: number; offset: number };

/**
 * One tag: a caret at its point with the label (children) hanging off it,
 * below or above. The caret sits as far along the label as the point is
 * across the photo, so edge tags stay inside the frame. A `placement` offset
 * moves the label further away on a thin stem, for when it would otherwise
 * land on another tag.
 */
export const TagPin: React.FC<{ tag: PhotoTag; placement?: Placement; children: React.ReactNode }> = ({
  tag,
  placement = { above: isAbove(tag), lift: 0, offset: 0 },
  children,
}) => {
  const { above, offset } = placement;
  const lift = above ? placement.lift : 0;
  const along = alongOf(tag);
  const side = above ? 'bottom' : 'top';
  return (
    <span className="absolute" style={{ left: `${tag.x}%`, top: `${tag.y}%` }}>
      <span
        aria-hidden="true"
        style={{ [side]: lift }}
        className={`absolute left-0 -translate-x-1/2 border-x-[7px] border-x-transparent ${
          above ? 'border-t-[7px] border-t-black/80' : 'border-b-[7px] border-b-black/80'
        }`}
      />
      {offset > 0 && (
        <span
          aria-hidden="true"
          className="absolute left-0 w-0.5 -translate-x-1/2 bg-black/80"
          style={{ [side]: lift + 7, height: offset }}
        />
      )}
      <span
        data-tag-label
        style={{ transform: `translateX(-${along}%)`, [side]: lift + 7 + offset }}
        className="absolute left-0 flex"
      >
        {children}
      </span>
    </span>
  );
};

/** A tag whose label was dragged off its arrow in the editor. */
export const isPlaced = (tag: PhotoTag): tag is PhotoTag & { lx: number; ly: number } =>
  tag.lx !== undefined && tag.ly !== undefined;

/** The frame's layout size (px), kept current; layout, not on-screen, so the lightbox's zoom can't skew it. */
export const useFrameSize = (frame: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const read = () =>
      setSize((prev) => (prev.w === el.clientWidth && prev.h === el.clientHeight ? prev : { w: el.clientWidth, h: el.clientHeight }));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [frame]);
  return size;
};

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Arrow = { side: Side; at: number };

const CARET = 7; // the arrowhead's length and half-width, px: the same as TagPin's caret
// Keeps the arrow off the label's rounded corners (6px) along the long edges
const CORNER = 6 + CARET;

/**
 * Which edge of a label an arrow sits on, and how far along it (0–1), for a
 * point at (dx, dy) px from the label's centre: the edge facing it (split along
 * the label's diagonals, so the arrow travels round the label as the point
 * circles it), at the spot nearest the point. On the short ends it stays
 * centred. `w`/`h` is the label's size, px.
 */
export const arrowToward = (dx: number, dy: number, w: number, h: number): Arrow => {
  const hw = w / 2;
  const hh = h / 2;
  if (Math.abs(dy) / hh < Math.abs(dx) / hw) return { side: dx < 0 ? 'left' : 'right', at: 0.5 };
  const room = hw - CORNER;
  const along = room > 0 ? Math.min(room, Math.max(-room, dx)) : 0;
  return { side: dy < 0 ? 'top' : 'bottom', at: Math.round(((along + hw) / w) * 1000) / 1000 };
};

/** Where an arrow's tip lands, px from the label's centre. */
export const arrowTip = ({ side, at }: Arrow, w: number, h: number) => {
  if (side === 'left' || side === 'right') return { x: (side === 'left' ? -1 : 1) * (w / 2 + CARET), y: (at - 0.5) * h };
  return { x: (at - 0.5) * w, y: (side === 'top' ? -1 : 1) * (h / 2 + CARET) };
};

/** The arrowhead itself: a caret snug against one edge of the label, pointing out of it. */
const Caret: React.FC<Arrow> = ({ side, at }) => {
  const along = `clamp(${CORNER}px, ${at * 100}%, calc(100% - ${CORNER}px))`;
  const shape: Record<Side, string> = {
    top: 'bottom-full -translate-x-1/2 border-x-[7px] border-b-[7px] border-x-transparent border-b-black/80',
    bottom: 'top-full -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-black/80',
    left: 'right-full -translate-y-1/2 border-y-[7px] border-r-[7px] border-y-transparent border-r-black/80',
    right: 'left-full -translate-y-1/2 border-y-[7px] border-l-[7px] border-y-transparent border-l-black/80',
  };
  const horizontal = side === 'top' || side === 'bottom';
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute ${shape[side]}`}
      style={horizontal ? { left: along } : { top: '50%' }}
    />
  );
};

/**
 * A placed tag: the label (children) centred where it was put, with its arrow
 * snug against whichever edge was picked in the editor (`side`, `at`). Tags
 * placed before arrows were set that way have only an arrow tip (x, y): they
 * get the snug arrow on the edge facing it. `arrow={false}` leaves the arrow
 * off (the editor, while the label is still being placed). `frame` is the
 * photo's size (px).
 */
export const PlacedPin: React.FC<{
  tag: PhotoTag & { lx: number; ly: number };
  frame: { w: number; h: number };
  arrow?: boolean;
  children: React.ReactNode;
}> = ({ tag, frame, arrow = true, children }) => {
  const label = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = label.current;
    if (!el) return;
    const read = () =>
      setBox((prev) => (prev.w === el.offsetWidth && prev.h === el.offsetHeight ? prev : { w: el.offsetWidth, h: el.offsetHeight }));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let caret: Arrow | null = null;
  if (arrow) {
    if (tag.side) caret = { side: tag.side, at: tag.at ?? 0.5 };
    else if (frame.w && box.w) {
      caret = arrowToward(((tag.x - tag.lx) / 100) * frame.w, ((tag.y - tag.ly) / 100) * frame.h, box.w, box.h);
    }
  }

  return (
    <span
      ref={label}
      data-placed-label
      className="absolute flex -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${tag.lx}%`, top: `${tag.ly}%` }}
    >
      {children}
      {caret && <Caret {...caret} />}
    </span>
  );
};

const GAP = 3;
/** Flipping to the other side has to save more than this much stem (px). */
const FLIP_COST = 12;

/** Face size (% of photo height) for tags saved without one: their photo's typical face, else a guess. */
const faceOf = (tag: PhotoTag, tags: PhotoTag[]) => {
  if (tag.face !== undefined) return tag.face;
  const known = tags.flatMap((t) => (t.face === undefined ? [] : [t.face])).sort((a, b) => a - b);
  return known.length ? known[known.length >> 1] : 10;
};

/**
 * Keeps crowded tags (a group shot on a phone) from stacking on each other.
 * Each label hangs below its point, or above the person's head with the caret
 * pointing down at them; one that would still touch another slides further
 * out on a stem. Of every below/above combination, the photo gets the one
 * with the least total stem, flips counting a little, so a crowd resolves by
 * lifting a label over a head rather than pushing the rest far down. Points
 * never move. Re-runs whenever the frame changes size.
 */
const useUnstacked = (layer: React.RefObject<HTMLDivElement | null>, tags: PhotoTag[]) => {
  const [placements, setPlacements] = useState<Placement[]>([]);

  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return;
    const place = () => {
      // Worked out from layout sizes rather than measured on screen, so the
      // lightbox's opening zoom can't skew it
      const W = el.clientWidth;
      const H = el.clientHeight;
      const labels = el.querySelectorAll<HTMLElement>('[data-tag-label]');
      const boxes = tags.map((tag, i) => {
        const w = labels[i].offsetWidth;
        const left = (tag.x / 100) * W - (alongOf(tag) / 100) * w;
        // A tag flipped in the editor already points where its caret should
        // go; any other label moved above has to clear the face first
        const lift = tag.above ? 0 : Math.round((faceOf(tag, tags) / 100) * H);
        return { left, right: left + w, h: labels[i].offsetHeight, y: (tag.y / 100) * H, lift };
      });
      const order = tags.map((_, i) => i).sort((a, b) => tags[a].y - tags[b].y);

      // Top to bottom with each label on the given side, sliding any that
      // would touch an earlier one further out
      const layout = (above: boolean[]) => {
        const placed: { left: number; right: number; top: number; bottom: number }[] = [];
        const result: Placement[] = tags.map(() => ({ above: false, lift: 0, offset: 0 }));
        let cost = 0;
        for (const i of order) {
          const { left, right, h, y, lift } = boxes[i];
          const clash = (top: number) =>
            placed.find((p) => left < p.right + GAP && p.left < right + GAP && top < p.bottom + GAP && p.top < top + h + GAP);
          const start = above[i] ? y - lift - 7 - h : y + 7;
          let offset = 0;
          for (let hit = clash(start); hit; hit = clash(above[i] ? start - offset : start + offset)) {
            offset = Math.ceil(above[i] ? start + h - hit.top + GAP : hit.bottom + GAP - start);
          }
          const top = above[i] ? start - offset : start + offset;
          result[i] = { above: above[i], lift, offset };
          placed.push({ left, right, top, bottom: top + h });
          cost += offset + (above[i] !== isAbove(tags[i]) ? FLIP_COST : 0) + (top >= 0 && top + h <= H ? 0 : 1e6);
        }
        return { result, cost };
      };

      let best = layout(tags.map(isAbove));
      // Every flip combination: a handful of tags makes at most a few hundred
      if (tags.length <= 8) {
        for (let mask = 1; mask < 1 << tags.length; mask++) {
          const tried = layout(tags.map((tag, i) => ((mask >> i) & 1 ? !isAbove(tag) : isAbove(tag))));
          if (tried.cost < best.cost) best = tried;
        }
      }
      const next = best.result;
      setPlacements((prev) =>
        prev.length === next.length &&
        prev.every((p, i) => p.above === next[i].above && p.lift === next[i].lift && p.offset === next[i].offset)
          ? prev
          : next
      );
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [layer, tags]);

  return placements;
};

/**
 * Instagram-style tags over a lightbox photo. Hidden until the photo or the
 * corner badge is tapped; each tag points at a person and links to their site.
 * Labels placed in the editor show exactly where they were put, joined to
 * their arrow; the rest hang off their point and are kept apart automatically.
 * Sits inside the photo's frame, which must be `relative overflow-hidden`.
 */
const PhotoTags: React.FC<{ tags: PhotoTag[] }> = ({ tags }) => {
  const [shown, setShown] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  const hanging = useMemo(() => tags.filter((t) => !isPlaced(t)), [tags]);
  const placed = useMemo(() => tags.filter(isPlaced), [tags]);
  const placements = useUnstacked(layer, hanging);
  const frame = useFrameSize(layer);

  const link = (tag: PhotoTag) => (
    <a
      href={tag.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${bubble} pointer-events-auto transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70`}
    >
      {tag.label}
    </a>
  );

  return (
    <>
      {/* The whole photo toggles, like tapping a post */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => setShown((s) => !s)} />

      <button
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        aria-label={shown ? 'Hide tags' : `Show ${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}`}
        className="absolute bottom-3 left-3 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <TagIcon className="h-3.5 w-3.5" />
      </button>

      {/* visibility rides along with the fade, so hidden tags can't take focus.
          Spans the frame so the layout pass can measure against it, but lets
          clicks through to the photo except on the tags themselves. */}
      <div
        ref={layer}
        className={`pointer-events-none absolute inset-0 transition-[opacity,visibility] duration-200 ${
          shown ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {/* The layout pass reads the hanging labels in this order */}
        {hanging.map((tag, i) => (
          <TagPin key={tag.href} tag={tag} placement={placements[i]}>
            {link(tag)}
          </TagPin>
        ))}
        {placed.map((tag) => (
          <PlacedPin key={tag.href} tag={tag} frame={frame}>
            {link(tag)}
          </PlacedPin>
        ))}
      </div>
    </>
  );
};

export default PhotoTags;
