import React, { useEffect, useState } from 'react';
import QuietHeader from './QuietHeader';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string | null;
}

/**
 * "On repeat": my five most-played Spotify tracks over the past ~4 weeks, as a
 * shelf of album covers with the title and artist underneath (the layout
 * wcagas.com's archive uses for music). Data comes from /api/top-tracks, which
 * the CDN refreshes hourly, so the shelf changes on its own as I listen.
 *
 * Renders nothing until tracks arrive, and stays hidden if the endpoint isn't
 * configured or fails — an empty shelf isn't worth a placeholder.
 */

// Fetched once per page load; route changes remount the index and reuse it.
let cached: Track[] | null = null;
let inflight: Promise<Track[] | null> | null = null;

const loadTracks = () =>
  (inflight ??= fetch('/api/top-tracks')
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const tracks: Track[] | null = Array.isArray(data?.tracks) && data.tracks.length ? data.tracks : null;
      cached = tracks;
      if (!tracks) inflight = null; // a failure isn't sticky: the next visit to the index retries
      return tracks;
    })
    .catch(() => {
      inflight = null;
      return null;
    }));

const OnRepeat: React.FC = () => {
  const [tracks, setTracks] = useState<Track[] | null>(cached);

  useEffect(() => {
    // The fetch may have landed between this mount's render and its effect
    // (route changes render in a transition): take it rather than skip it.
    if (cached) {
      setTracks(cached);
      return;
    }
    let live = true;
    loadTracks().then((t) => {
      if (live) setTracks(t);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!tracks) return null;

  return (
    <section className="mt-7 reveal" aria-label="On repeat">
      <QuietHeader label="on repeat">
        <span className="text-[13px] text-ink-500">past 4 weeks</span>
      </QuietHeader>
      {/* Capped so the covers stay small (~80px) instead of spanning the column */}
      <ol className="grid max-w-md grid-cols-5 gap-1.5 sm:gap-2">
        {tracks.slice(0, 5).map((t) => (
          <li key={t.id} className="min-w-0">
            <a href={t.url} target="_blank" rel="noopener noreferrer" className="group block">
              <span className="relative block aspect-square overflow-hidden rounded-[4px] bg-paper-200">
                {t.cover && (
                  <img src={t.cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                )}
                {/* Hairline frame over the art; darkens to a 2px outline on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10 transition-shadow duration-150 group-hover:ring-2 group-hover:ring-ink-900 group-focus-visible:ring-2 group-focus-visible:ring-beak"
                />
              </span>
              {/* no `block` here: line-clamp brings its own display, and block would win */}
              <span className="mt-1 text-[11px] leading-snug text-ink-700 line-clamp-2 transition-colors group-hover:text-ink-900 sm:text-[12px]">
                {t.title}
              </span>
              <span className="block truncate text-[10px] leading-snug text-ink-500 sm:text-[11px]">{t.artist}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default OnRepeat;
