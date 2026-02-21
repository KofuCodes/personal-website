
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

const SpotifyStatus: React.FC = () => {
  const [data, setData] = useState<LanyardResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lastPlayed, setLastPlayed] = useState<{
    track_id: string;
    song: string;
    artist: string;
    album_art_url: string;
  } | null>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('spotify_last_played');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
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



        // Check for API errors
        if (json.success === false && json.error) {
          // Silently handle "not monitored" - just hide the component until Lanyard starts tracking
          if (json.error.code === 'user_not_monitored') {

            setData(null);
            setError(null); // Don't show error, just hide component
            return;
          }
          throw new Error(json.error.message || 'Lanyard API error');
        }

        if (json.data) {
          setData(json.data);
          setError(null);

          // Save last played track when listening
          if (json.data.listening_to_spotify && json.data.spotify) {
            setLastPlayed(json.data.spotify);
            localStorage.setItem('spotify_last_played', JSON.stringify(json.data.spotify));
          }


        } else {
          setError('No data received from API');
        }
      } catch (error) {
        console.error("Error fetching Spotify status:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Check every 10 seconds instead of 30
    return () => clearInterval(interval);
  }, []);

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 py-1.5 px-2">
        <div className="w-8 h-9 bg-white dark:bg-[#f5f5dc] flex-shrink-0 shadow-[2px_2px_6px_rgba(0,0,0,0.2)] animate-pulse" style={{ padding: '2px', paddingBottom: '6px' }}>
          <div className="w-full h-full bg-[#d4a574]/30 dark:bg-[#6b5744]/30" />
        </div>
        <span className="text-[10px] mono text-[#8B7355] dark:text-[#a1785d] uppercase tracking-wider">
          Loading...
        </span>
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
    return (
      <div className="flex flex-col gap-2 py-1.5 px-2">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-red-400 dark:bg-red-600"></div>
          <span className="text-[10px] mono text-[#8B7355] dark:text-[#a1785d] uppercase tracking-wider">
            {is404 ? 'Discord ID Not Found' : 'Error'}
          </span>
        </div>
        <div className="text-[9px] text-red-500 ml-5 max-w-xs">
          {error}
          {is404 && (
            <div className="mt-1 text-[#6b5744] dark:text-[#a1785d]">
              Test URL: <a href={`https://api.lanyard.rest/v1/users/${DISCORD_ID}`} target="_blank" rel="noopener noreferrer" className="underline">Click here</a>
            </div>
          )}
        </div>
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
          className="flex items-center gap-2.5 group transition-all py-1.5 px-2 hover:opacity-80"
        >
          {/* Album art as tiny polaroid */}
          <div className="relative w-8 h-9 bg-white dark:bg-[#f5f5dc] flex-shrink-0 shadow-[2px_2px_6px_rgba(0,0,0,0.2)] group-hover:shadow-[3px_3px_8px_rgba(0,0,0,0.3)] transition-all group-hover:-rotate-3" style={{ padding: '2px', paddingBottom: '6px' }}>
            <img src={album_art_url} alt="Album Art" className="w-full h-full object-cover sepia-[0.1]" />
          </div>

          <div className="flex flex-col overflow-hidden max-w-[140px]">
            <span className="text-[10px] font-semibold text-[#2a2318] dark:text-[#f5e6d3] truncate handwritten leading-tight">
              {song}
            </span>
            <span className="text-[8px] mono text-[#8B7355] dark:text-[#a1785d] truncate uppercase tracking-wider">
              {artist}
            </span>
          </div>

          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 flex-shrink-0"></span>
        </a>
      );
    }
    // Show offline state with Spotify logo when no last played data
    return (
      <div className="flex items-center gap-2.5 py-1.5 px-2">
        <svg className="w-4 h-4 text-[#c4a882] dark:text-[#6b5744]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span className="text-[10px] mono text-[#8B7355] dark:text-[#a1785d] uppercase tracking-wider">
          Offline
        </span>
      </div>
    );
  }

  const { song, artist, album_art_url, track_id } = data.spotify;

  return (
    <a
      href={`https://open.spotify.com/track/${track_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 group transition-all py-1.5 px-2 hover:opacity-80"
    >
      {/* Album art as tiny polaroid */}
      <div className="relative w-8 h-9 bg-white dark:bg-[#f5f5dc] flex-shrink-0 shadow-[2px_2px_6px_rgba(0,0,0,0.2)] group-hover:shadow-[3px_3px_8px_rgba(0,0,0,0.3)] transition-all group-hover:-rotate-3" style={{ padding: '2px', paddingBottom: '6px' }}>
        <img src={album_art_url} alt="Album Art" className="w-full h-full object-cover sepia-[0.1]" />
      </div>

      <div className="flex flex-col overflow-hidden max-w-[140px]">
        <span className="text-[10px] font-semibold text-[#2a2318] dark:text-[#f5e6d3] truncate handwritten leading-tight">
          {song}
        </span>
        <span className="text-[8px] mono text-[#8B7355] dark:text-[#a1785d] truncate uppercase tracking-wider">
          {artist}
        </span>
      </div>

      {/* Green pulse for currently playing */}
      <span className="flex h-2 w-2 relative flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
    </a>
  );
};

export default SpotifyStatus;
