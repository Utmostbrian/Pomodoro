import { useState, useEffect, useCallback, useRef } from 'react';

// Spotify API types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  uri: string;
}

const CLIENT_ID = '5cfea3c200d2445a8b43e9c4b1d5b6a6'; // Public demo client ID
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/callback` : '';
const SCOPE = 'user-read-private user-read-email playlist-read-private user-read-playback-state user-modify-playback-state streaming';
const STORAGE_KEY_TOKEN = 'spotify_token';
const STORAGE_KEY_EXPIRY = 'spotify_token_expiry';

export function useSpotify() {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY);
    if (saved && expiry && Date.now() < parseInt(expiry)) {
      return saved;
    }
    return null;
  });
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Check for token in URL (after OAuth redirect)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');
      if (accessToken) {
        const expiryTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
        localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEY_EXPIRY, String(expiryTime));
        setToken(accessToken);
        window.location.hash = '';
      }
    }
  }, []);

  // Fetch user data when token is available
  useEffect(() => {
    if (token) {
      fetchUser();
      fetchPlaylists();
      initializePlayer();
    }
  }, [token]);

  const initializePlayer = useCallback(() => {
    if (!token) return;

    // Load Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Pomodoro Focus',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token!);
        },
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (state) {
          setIsPlaying(!state.paused);
          if (state.track_window?.current_track) {
            setCurrentTrack({
              id: state.track_window.current_track.id,
              name: state.track_window.current_track.name,
              artists: state.track_window.current_track.artists,
              album: state.track_window.current_track.album,
              duration_ms: state.duration,
              uri: state.track_window.current_track.uri,
            });
          }
        }
      });

      player.connect();
      playerRef.current = player;
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (err) {
      setError('Error al obtener usuario de Spotify');
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchPlaylists = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.items);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  }, [token]);

  const fetchPlaylistTracks = useCallback(async (playlistId: string) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const formattedTracks: SpotifyTrack[] = data.items.map((item: any) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists,
          album: item.track.album,
          duration_ms: item.track.duration_ms,
          uri: item.track.uri,
        }));
        setTracks(formattedTracks);
      }
    } catch (err) {
      setError('Error al cargar canciones');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const playTrack = useCallback(async (trackUri: string) => {
    if (!token || !deviceId) return;
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [trackUri] }),
        }
      );
      setIsPlaying(true);
    } catch (err) {
      setError('Error al reproducir');
    }
  }, [token, deviceId]);

  const togglePlay = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      if (isPlaying) {
        await fetch(
          `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      setError('Error al controlar reproducción');
    }
  }, [token, deviceId, isPlaying]);

  const nextTrack = useCallback(async () => {
    if (!token) return;
    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setError('Error al saltar canción');
    }
  }, [token]);

  const previousTrack = useCallback(async () => {
    if (!token) return;
    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setError('Error al retroceder');
    }
  }, [token]);

  const login = useCallback(() => {
    const state = crypto.randomUUID();
    localStorage.setItem('spotify_state', state);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', SCOPE);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
    setToken(null);
    setUser(null);
    setPlaylists([]);
    setTracks([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.disconnect();
    }
  }, []);

  return {
    isAuthenticated: !!token,
    user,
    playlists,
    tracks,
    currentPlaylist,
    currentTrack,
    isPlaying,
    isLoading,
    error,
    login,
    handleLogout,
    setCurrentPlaylist,
    fetchPlaylistTracks,
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
  };
}
