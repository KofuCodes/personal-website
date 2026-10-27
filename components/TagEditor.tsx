import React, { useEffect, useRef, useState } from 'react';
import { PhotoTag } from '../data/photography';
import { TagPin, bubble } from './PhotoTags';

type Person = Pick<PhotoTag, 'label' | 'href'>;

/** "www.ivyzhang.ca" → { label: "ivyzhang.ca", href: "https://www.ivyzhang.ca/" } */
const personFrom = (link: string): Person | null => {
  try {
    const url = new URL(/^https?:\/\//.test(link) ? link : `https://${link}`);
    return { label: url.hostname.replace(/^www\./, ''), href: url.href };
  } catch {
    return null;
  }
};

const clampPct = (v: number) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10;

/**
 * Dev-only tag editor over a lightbox photo — the gallery loads it only under
 * `npm run dev`, so it never reaches the live site. Click the photo to drop a
 * tag and pick who it is, drag a tag to move it, × to remove it. Every change
 * goes through onChange, which saves it to data/photo-tags.json.
 */
const TagEditor: React.FC<{
  tags: PhotoTag[];
  people: Person[];
  onChange: (tags: PhotoTag[]) => void;
}> = ({ tags, people, onChange }) => {
  const root = useRef<HTMLDivElement>(null);
  const firstChoice = useRef<HTMLButtonElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number; moved: boolean } | null>(null);
  const [link, setLink] = useState('');

  useEffect(() => {
    if (pending) (firstChoice.current ?? linkInput.current)?.focus({ preventScroll: true });
  }, [pending]);

  const pointAt = (e: React.MouseEvent) => {
    const r = root.current!.getBoundingClientRect();
    return { x: clampPct(((e.clientX - r.left) / r.width) * 100), y: clampPct(((e.clientY - r.top) / r.height) * 100) };
  };

  const tagAs = (person: Person | null) => {
    if (!pending || !person) return;
    // One tag per person per photo: picking them again moves it here
    onChange([...tags.filter((t) => t.href !== person.href), { ...person, ...pending }]);
    setPending(null);
    setLink('');
  };

  // Not yet tagged in this photo, so the list only offers new choices
  const choices = people.filter((p) => !tags.some((t) => t.href === p.href));

  return (
    <div
      ref={root}
      className="absolute inset-0 cursor-crosshair"
      onClick={(e) => setPending(pending ? null : pointAt(e))}
      // Keep drags here from reading as the lightbox's swipe-to-next
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {tags.map((tag, i) => {
        const live = drag?.i === i ? { ...tag, x: drag.x, y: drag.y } : tag;
        return (
          <TagPin key={tag.href} tag={live}>
            <span
              className={`${bubble} relative cursor-grab touch-none select-none ${drag?.i === i ? 'cursor-grabbing ring-2 ring-beak' : ''}`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag({ i, x: tag.x, y: tag.y, moved: false });
              }}
              onPointerMove={(e) => {
                if (drag?.i !== i) return;
                const p = pointAt(e);
                const moved = drag.moved || Math.hypot(p.x - tag.x, p.y - tag.y) > 0.5;
                setDrag({ i, ...p, moved });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                if (drag?.i === i && drag.moved) onChange(tags.map((t, j) => (j === i ? { ...t, x: drag.x, y: drag.y } : t)));
                setDrag(null);
              }}
            >
              {tag.label}
              <button
                aria-label={`Remove ${tag.label}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(tags.filter((_, j) => j !== i));
                }}
                className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-white text-[11px] leading-none text-black shadow hover:bg-beak hover:text-white"
              >
                ×
              </button>
            </span>
          </TagPin>
        );
      })}

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
