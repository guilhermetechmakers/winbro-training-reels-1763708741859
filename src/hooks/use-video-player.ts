import { useState, useRef, useEffect, useCallback } from 'react';
import type { VideoPlayerState } from '@/types';

export function useVideoPlayer(_videoId: string, hlsUrl?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    quality: 'auto',
    availableQualities: [],
    isLoading: true,
  });

  // Initialize HLS player
  useEffect(() => {
    if (!videoRef.current || !hlsUrl) return;

    // Check if browser supports native HLS (Safari)
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = hlsUrl;
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // For other browsers, we'd use hls.js
    // Note: hls.js needs to be installed: npm install hls.js @types/hls.js
    // For now, we'll use a fallback approach
    try {
      // Dynamic import of hls.js if available
      // @ts-ignore - hls.js is optional dependency
      import('hls.js').then((Hls: any) => {
        if (Hls.default.isSupported()) {
          const hls = new Hls.default({
            enableWorker: true,
            lowLatencyMode: true,
          });
          
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current!);
          
          hls.on(Hls.default.Events.MANIFEST_PARSED, () => {
            setState(prev => ({ 
              ...prev, 
              isLoading: false,
              availableQualities: hls.levels.map((level: any, index: number) => ({
                label: level.height ? `${level.height}p` : `Level ${index}`,
                value: index.toString(),
                resolution: level.width && level.height ? `${level.width}x${level.height}` : undefined,
                bitrate: level.bitrate,
              })),
            }));
          });

          hls.on(Hls.default.Events.LEVEL_SWITCHED, (_event: any, data: any) => {
            setState(prev => ({ 
              ...prev, 
              quality: data.level.toString(),
            }));
          });

          hlsRef.current = hls;
        } else {
          // Fallback to native video element
          videoRef.current!.src = hlsUrl;
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }).catch(() => {
        // hls.js not available, use native fallback
        videoRef.current!.src = hlsUrl;
        setState(prev => ({ ...prev, isLoading: false }));
      });
    } catch {
      // Fallback to native video element
      videoRef.current!.src = hlsUrl;
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [hlsUrl]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setState(prev => ({ ...prev, currentTime: video.currentTime }));
    const updateDuration = () => setState(prev => ({ ...prev, duration: video.duration }));
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleVolumeChange = () => setState(prev => ({ ...prev, volume: video.volume }));
    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));
    const handleError = () => setState(prev => ({ ...prev, error: 'Failed to load video', isLoading: false }));

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const play = useCallback(() => {
    videoRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
    }
  }, [state.duration]);

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  const setQuality = useCallback((quality: string) => {
    if (hlsRef.current && quality !== 'auto') {
      const levelIndex = parseInt(quality, 10);
      if (!isNaN(levelIndex)) {
        hlsRef.current.currentLevel = levelIndex;
        setState(prev => ({ ...prev, quality }));
      }
    } else if (hlsRef.current) {
      hlsRef.current.currentLevel = -1; // Auto
      setState(prev => ({ ...prev, quality: 'auto' }));
    }
  }, []);

  return {
    videoRef,
    state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    setQuality,
  };
}
