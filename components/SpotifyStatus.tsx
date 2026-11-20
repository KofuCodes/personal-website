import React, { useState, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string | null;
}

/** From /api/now-playing: what's on Spotify now, or the last track played. */
interface NowPlaying {
  state: 'playing' | 'paused' | 'recent';
  track: Track | null;
  /** While something's loaded: how far in, and how long the song is */
  progressMs?: number | null;
  durationMs?: number | null;
}

interface PollState {
  loading: boolean;
  error: string | null;
  data: NowPlaying | null;
}

const LABEL: Record<NowPlaying['state'], string> = {
  playing: 'Now playing',
  paused: 'Paused',
  recent: 'Last played',
};

/**
 * Module-level refcounted poller: exactly one loop polls /api/now-playing and
 * every mounted instance subscribes to it. Only one instance mounts today (the
 * shell header), but the refcount keeps StrictMode's dev double-invoke — and any
 * future second mount — from starting a second loop.
 *
 * Spotify can't push changes (Lanyard could, through Discord), so it asks: every
 * POLL_MS while the tab is in view, straight away when the tab or window comes
 * back, and again just after the song playing should end, so a track change
 * lands on time instead of up to a whole poll late. The API's CDN copy is at
 * most 2 s old (api/now-playing.ts).
 */
const POLL_MS = 4000;
const END_SLACK_MS = 1200; // after a song's end, for Spotify to move on to the next one

let pollState: PollState = { loading: true, error: null, data: null };
const listeners = new Set<(s: PollState) => void>();
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let polling = false;
let inFlight = false;

/** The next check: the regular poll, or sooner if the song playing is about to end. */
const nextCheck = () => {
  const d = pollState.data;
  if (d?.state === 'playing' && d.durationMs && d.progressMs != null) {
    return Math.min(POLL_MS, Math.max(500, d.durationMs - d.progressMs + END_SLACK_MS));
  }
  return POLL_MS;
};

const schedule = (ms: number) => {
  if (pollTimer !== null) clearTimeout(pollTimer);
  pollTimer = polling ? setTimeout(poll, ms) : null;
};

const poll = async () => {
  if (!inFlight) await fetchStatus();
  schedule(nextCheck());
};

/**
 * Back in view: don't wait out the rest of a poll. At most every BACK_MS, since
 * some hosts (embedded views) fire these events far more often than a real
 * tab switch.
 */
const BACK_MS = 2000;
let lastAsked = 0;
const checkNow = () => {
  if (!document.hidden && Date.now() - lastAsked > BACK_MS) schedule(0);
};

const fetchStatus = async () => {
  // A background tab skips its turns; the first poll always runs.
  if (document.hidden && !pollState.loading) return;
  inFlight = true;
  lastAsked = Date.now();
  try {
    // The CDN decides how fresh; the browser keeps no copy of its own
    const response = await fetch('/api/now-playing', { cache: 'no-store' });
    const json = await response.json().catch(() => null);
    if (!response.ok || !json) {
      throw new Error(json?.error || `HTTP ${response.status}`);
    }
    pollState = { loading: false, error: null, data: json };
  } catch (error) {
    // A failed check (a network blip, at this rate of asking) keeps the last
    // good answer on screen; the error only shows if there's never been one
    pollState = pollState.data
      ? { ...pollState, loading: false }
      : { loading: false, error: error instanceof Error ? error.message : 'Unknown error', data: null };
  } finally {
    inFlight = false;
  }
  listeners.forEach((l) => l(pollState));
};

/** Cover + title/artist (text hidden below sm), linking to the track. */
const TrackLink: React.FC<{ track: Track; label: string; children: React.ReactNode }> = ({
  track: { title, artist, url, cover },
  label,
  children,
}) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-paper-100 transition-colors"
    title={`${label}: ${title} — ${artist}`}
  >
    {cover ? (
      <img src={cover} alt="" className="w-5 h-5 rounded-[3px] object-cover flex-shrink-0 ring-1 ring-inset ring-black/5" />
    ) : (
      <span className="w-5 h-5 rounded-[3px] bg-ink-200 flex-shrink-0" />
    )}
    <div className="hidden sm:flex flex-col overflow-hidden max-w-[130px] leading-tight">
      <span className="text-[12px] font-medium text-ink-700 truncate">{title}</span>
      <span className="text-[11px] text-ink-400 truncate">{artist}</span>
    </div>
    {children}
  </a>
);

const SpotifyStatus: React.FC = () => {
  const [{ loading, error, data }, setState] = useState<PollState>(pollState);

  useEffect(() => {
    listeners.add(setState);
    setState(pollState);
    // First subscriber starts the shared poll
    if (!polling) {
      polling = true;
      document.addEventListener('visibilitychange', checkNow);
      window.addEventListener('focus', checkNow);
      schedule(0);
    }
    return () => {
      listeners.delete(setState);
      if (listeners.size === 0 && polling) {
        polling = false;
        schedule(0); // clears the timer now that polling is off
        document.removeEventListener('visibilitychange', checkNow);
        window.removeEventListener('focus', checkNow);
      }
    };
  }, []);

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-1 px-1.5">
        <div className="w-5 h-5 rounded-[3px] bg-ink-200 flex-shrink-0 animate-pulse" />
        <span className="hidden sm:inline text-[12px] text-ink-400">loading</span>
      </div>
    );
  }

  if (error) {
    // Hidden on the live site; a quiet marker locally, with the reason on hover.
    // Single row like every other state — this sits in the header, so a
    // two-line block here would shove the whole top bar around.
    if (!isDevelopment) return null;
    return (
      <div className="flex items-center gap-2 py-1 px-1.5 min-w-0" title={error}>
        <div className="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
        <span className="hidden sm:inline text-[11px] text-ink-500 truncate">spotify: error</span>
      </div>
    );
  }

  // Nothing playing and no history to fall back on
  if (!data?.track) {
    return (
      <div className="flex items-center gap-2 py-1 px-1.5">
        <svg className="w-4 h-4 text-ink-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span className="hidden sm:inline text-[12px] text-ink-400">offline</span>
      </div>
    );
  }

  return (
    <TrackLink track={data.track} label={LABEL[data.state]}>
      {data.state === 'playing' ? (
        <span className="flex h-1.5 w-1.5 relative flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
        </span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-ink-300 flex-shrink-0" />
      )}
    </TrackLink>
  );
};

export default SpotifyStatus;
