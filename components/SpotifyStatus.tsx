
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
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
        
        // Debug logging
        console.log('Lanyard API Response:', json);
        setDebugInfo(json);
        
        // Check for API errors
        if (json.success === false && json.error) {
          // Silently handle "not monitored" - just hide the component until Lanyard starts tracking
          if (json.error.code === 'user_not_monitored') {
            console.log('ℹ️ Lanyard not monitoring yet. Component will appear once you start playing music and Lanyard picks you up.');
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
          
          // Log Spotify status for debugging
          if (json.data.listening_to_spotify) {
            console.log('✅ Spotify is active:', json.data.spotify);
          } else {
            console.log('❌ Not listening to Spotify. Discord status:', json.data.discord_status || 'unknown');
            console.log('Full API response:', json);
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

  // Show debug info in development
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-2 px-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-full">
        <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
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
      <div className="flex flex-col gap-2 py-2 px-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-full">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-400 dark:bg-red-600"></div>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
            {is404 ? 'Discord ID Not Found' : 'Error'}
          </span>
        </div>
        <div className="text-[9px] text-red-500 ml-5 max-w-xs">
          {error}
          {is404 && (
            <div className="mt-1 text-zinc-500">
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
          className="flex items-center gap-3 py-2 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full group transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <div className="relative flex items-center justify-center">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          
          <div className="flex items-center gap-2 overflow-hidden max-w-[200px]">
            <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200 truncate">
              {song} <span className="text-zinc-400 dark:text-zinc-600 font-normal">by</span> {artist}
            </span>
          </div>
          
          <div className="w-5 h-5 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 group-hover:scale-110 transition-transform flex-shrink-0">
            <img src={album_art_url} alt="Album Art" className="w-full h-full object-cover" />
          </div>
        </a>
      );
    }
    // Show offline state with Spotify logo when no last played data
    return (
      <div className="flex items-center gap-3 py-2 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full">
        <div className="relative flex items-center justify-center">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-zinc-100"></span>
        </div>
        
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
          Offline
        </span>
        
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
      </div>
    );
  }

  const { song, artist, album_art_url, track_id } = data.spotify;

  return (
    <a
      href={`https://open.spotify.com/track/${track_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-2 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full group transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <div className="relative flex items-center justify-center">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
      
      <div className="flex items-center gap-2 overflow-hidden max-w-[200px]">
        <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200 truncate">
          {song} <span className="text-zinc-400 dark:text-zinc-600 font-normal">by</span> {artist}
        </span>
      </div>
      
      <div className="w-5 h-5 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 group-hover:scale-110 transition-transform flex-shrink-0">
        <img src={album_art_url} alt="Album Art" className="w-full h-full object-cover" />
      </div>
    </a>
  );
};

export default SpotifyStatus;
