import React, { useState } from 'react';
import { PhotoTag } from '../data/photography';

/** The person glyph that marks a photo as having people tagged in it. */
export const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
  </svg>
);

/**
 * Instagram-style tags over a lightbox photo. Hidden until the photo or the
 * corner badge is tapped; each tag points at a person and links to their site.
 * Sits inside the photo's frame, which must be `relative overflow-hidden`.
 */
const PhotoTags: React.FC<{ tags: PhotoTag[] }> = ({ tags }) => {
  const [shown, setShown] = useState(false);

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

      {/* visibility rides along with the fade, so hidden tags can't take focus */}
      <div
        className={`transition-[opacity,visibility] duration-200 ${shown ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        {tags.map((tag) => {
          // Near the bottom edge the bubble flips above its point
          const above = tag.y > 80;
          // The caret sits this far along the bubble, so edge tags stay inside the frame
          const along = Math.min(88, Math.max(12, tag.x));
          return (
            <span key={tag.href} className="absolute" style={{ left: `${tag.x}%`, top: `${tag.y}%` }}>
              <span
                aria-hidden="true"
                className={`absolute left-0 -translate-x-1/2 border-x-[7px] border-x-transparent ${
                  above ? 'bottom-0 border-t-[7px] border-t-black/80' : 'top-0 border-b-[7px] border-b-black/80'
                }`}
              />
              <a
                href={tag.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ transform: `translateX(-${along}%)` }}
                className={`absolute left-0 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[12px] leading-none sm:px-2.5 sm:py-1.5 sm:text-[14px] text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  above ? 'bottom-[7px]' : 'top-[7px]'
                }`}
              >
                {tag.label}
              </a>
            </span>
          );
        })}
      </div>
    </>
  );
};

export default PhotoTags;
