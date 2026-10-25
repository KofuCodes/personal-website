import React, { useCallback, useState } from 'react';
import imageMeta from '../data/image-meta.json';

/**
 * Gallery photos and project images, served from the web copies that
 * `npm run images` writes (scripts/web-images.mjs): a 640px `sm` for grids and
 * cards, a large `lg` for the lightbox and modal, and per image its size and a
 * tiny blurred preview, keyed by the original's URL.
 *
 * An image that hasn't been through the script yet falls back to the
 * original file at a 4:3 guess, so a new photo still shows before it's built.
 */

interface Meta {
  w: number;
  h: number;
  blur: string;
}

const metaFor = (url: string): Meta | undefined => (imageMeta as Record<string, Meta>)[url];

export const webCopy = (url: string, size: 'sm' | 'lg') =>
  metaFor(url) ? `/web/${size}${url.replace(/\.[^.]+$/, '.webp')}` : url;

/** Width / height, for sizing the box before the image arrives. */
export const imageRatio = (url: string) => {
  const m = metaFor(url);
  return m ? m.w / m.h : 4 / 3;
};

/**
 * Fills its (relative, sized) parent. A stand-in paints at once — the blurred
 * preview, or for `lg` the small copy the grid already cached — and the real
 * image sharpens in over it once it has loaded.
 */
const WebImage: React.FC<{ src: string; size: 'sm' | 'lg'; alt: string }> = ({ src, size, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth) setLoaded(true);
  }, []);
  const blur = metaFor(src)?.blur;
  const large = size === 'lg';

  return (
    <>
      {large ? (
        <img
          src={webCopy(src, 'sm')}
          alt=""
          aria-hidden="true"
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        blur && (
          <img
            src={blur}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
          />
        )
      )}
      <img
        ref={ref}
        src={webCopy(src, size)}
        alt={alt}
        loading={large ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`ph absolute inset-0 h-full w-full object-cover ${loaded ? 'is-loaded' : ''}`}
      />
    </>
  );
};

export default WebImage;
