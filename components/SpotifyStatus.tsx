
import React, { useState, useEffect } from 'react';

const DISCORD_ID = "369238803656998912";

interface LanyardResponse {
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
  data?: {
    listening_to_spotify: boolean;
    discord_status?: string;
    spotify?: {
      track_id: string;
      song: string;
      artist: string;
      album_art_url: string;
    };
  };
}

interface PollState {
  loading: boolean;
  error: string | null;
  data: LanyardResponse['data'] | null;
}

/**
 * Module-level refcounted poller: exactly one interval polls the Lanyard API and
 * every mounted instance subscribes to it. Only one instance mounts today (the
 * shell header), but the refcount keeps StrictMode's dev double-invoke — and any
 * future second mount — from starting a second interval.
 */
let pollState: PollState = { loading: true, error: null, data: null };
const listeners = new Set<(s: PollState) => void>();
let pollTimer: ReturnType<typeof setInterval> | null = null;

const fetchStatus = async () => {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Discord ID not found.`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: LanyardResponse = await response.json();

    if (json.success === false && json.error) {
      // Silently handle "not monitored" — hide the widget until Lanyard tracks the user
      if (json.error.code === 'user_not_monitored') {
        pollState = { loading: false, error: null, data: null };
      } else {
        throw new Error(json.error.message || 'Lanyard API error');
      }
    } else if (json.data) {
      pollState = { loading: false, error: null, data: json.data };
      if (json.data.listening_to_spotify && json.data.spotify) {
        localStorage.setItem('spotify_last_played', JSON.stringify(json.data.spotify));
      }
    } else {
      pollState = { loading: false, error: 'No data received from API', data: null };
    }
  } catch (error) {
    console.error("Error fetching Spotify status:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    pollState = { loading: false, error: errorMessage, data: null };
  }
  listeners.forEach((l) => l(pollState));
};

const SpotifyStatus: React.FC = () => {
  const [{ loading, error, data }, setState] = useState<PollState>(pollState);

  const [lastPlayed, setLastPlayed] = useState<{
    track_id: string;
    song: string;
    artist: string;
    album_art_url: string;
  } | null>(() => {
    const saved = localStorage.getItem('spotify_last_played');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const listener = (s: PollState) => {
      setState(s);
      if (s.data?.listening_to_spotify && s.data.spotify) {
        setLastPlayed(s.data.spotify);
      }
    };
    listeners.add(listener);
    listener(pollState);
    // First subscriber starts the shared poll
    if (pollTimer === null) {
      fetchStatus();
      pollTimer = setInterval(fetchStatus, 10000);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && pollTimer !== null) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };
  }, []);

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-1 px-1.5">
        <div className="w-5 h-5 rounded-[3px] bg-stone-200 dark:bg-stone-800 flex-shrink-0 animate-pulse" />
        <span className="hidden sm:inline text-[11px] mono text-stone-400 dark:text-stone-500">loading</span>
      </div>
    );
  }

  // Only show errors for real issues (not "not monitored" - that's handled silently)
  if (error) {
    const is404 = error.includes('404') || error.includes('not found');
    // Only show in development for debugging
    if (!isDevelopment) {
      return null; // Hide errors in production
    }
    // Single row like every other state — this sits in the header, so a
    // two-line block here would shove the whole top bar around.
    return (
      <div
        className="flex items-center gap-2 py-1 px-1.5 min-w-0"
        title={is404 ? `${error} — check https://api.lanyard.rest/v1/users/${DISCORD_ID}` : error}
      >
        <div className="h-2 w-2 rounded-full bg-red-400 dark:bg-red-600 flex-shrink-0" />
        <span className="hidden sm:inline text-[10px] mono text-stone-500 dark:text-stone-400 truncate">
          {is404 ? 'lanyard: id not found' : 'lanyard: error'}
        </span>
      </div>
    );
  }

  // Show last played when not currently listening
  if (!data?.listening_to_spotify || !data.spotify) {
    if (lastPlayed) {
      const { song, artist, album_art_url, track_id } = lastPlayed;
      return (
        <a
          href={`https://open.spotify.com/track/${track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group py-1 px-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-stone-900 transition-colors"
          title={`Last played: ${song} — ${artist}`}
        >
          <img src={album_art_url} alt="" className="w-5 h-5 rounded-[3px] object-cover flex-shrink-0 ring-1 ring-inset ring-black/5 dark:ring-white/10" />
          <div className="hidden sm:flex flex-col overflow-hidden max-w-[130px] leading-tight">
            <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate">{song}</span>
            <span className="text-[10px] mono text-stone-400 dark:text-stone-500 truncate">{artist}</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 flex-shrink-0" />
        </a>
      );
    }
    // Show offline state with Spotify logo when no last played data
    return (
      <div className="flex items-center gap-2 py-1 px-1.5">
        <svg className="w-4 h-4 text-stone-300 dark:text-stone-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span className="hidden sm:inline text-[11px] mono text-stone-400 dark:text-stone-500">offline</span>
      </div>
    );
  }

  const { song, artist, album_art_url, track_id } = data.spotify;

  return (
    <a
      href={`https://open.spotify.com/track/${track_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 group py-1 px-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-stone-900 transition-colors"
      title={`Now playing: ${song} — ${artist}`}
    >
      <img src={album_art_url} alt="" className="w-5 h-5 rounded-[3px] object-cover flex-shrink-0 ring-1 ring-inset ring-black/5 dark:ring-white/10" />
      <div className="hidden sm:flex flex-col overflow-hidden max-w-[130px] leading-tight">
        <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate">{song}</span>
        <span className="text-[10px] mono text-stone-400 dark:text-stone-500 truncate">{artist}</span>
      </div>
      <span className="flex h-1.5 w-1.5 relative flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
    </a>
  );
};

export default SpotifyStatus;
