import { useVideoPlayer } from '@/hooks/use-video-player';
import { useVideoAnalytics } from '@/hooks/use-video-analytics';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveVideoPlayerProps {
  videoId: string;
  hlsUrl: string;
  title?: string;
  onQualityChange?: (quality: string) => void;
  onSeek?: (time: number) => void;
  onStateChange?: (state: { currentTime: number; duration: number; isPlaying: boolean }) => void;
  showControls?: boolean;
  className?: string;
}

export function AdaptiveVideoPlayer({
  videoId,
  hlsUrl,
  onQualityChange,
  onSeek: externalSeek,
  onStateChange,
  showControls = true,
  className,
}: AdaptiveVideoPlayerProps) {
  const {
    videoRef,
    state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setQuality,
  } = useVideoPlayer(videoId, hlsUrl);

  const { logPlay, logPause, logSeek, logQualityChange, logVolumeChange } = useVideoAnalytics(videoId);

  const [isMuted, setIsMuted] = useState(false);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);

  // Log analytics events
  useEffect(() => {
    if (state.isPlaying) {
      logPlay(state.currentTime);
    } else {
      logPause(state.currentTime);
    }
  }, [state.isPlaying, state.currentTime, logPlay, logPause]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.({
      currentTime: state.currentTime,
      duration: state.duration,
      isPlaying: state.isPlaying,
    });
  }, [state.currentTime, state.duration, state.isPlaying, onStateChange]);

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    const wasPlaying = state.isPlaying;
    if (wasPlaying) {
      pause();
      setWasPlayingBeforeSeek(true);
    }
    seek(newTime);
    logSeek(state.currentTime, newTime);
    externalSeek?.(newTime);
    
    // Resume playback if it was playing before
    if (wasPlayingBeforeSeek) {
      setTimeout(() => {
        play();
        setWasPlayingBeforeSeek(false);
      }, 100);
    }
  };

  // Expose seek function for external use (e.g., from transcript viewer)
  // The parent component should use onSeek callback
  const handleExternalSeek = useCallback((time: number) => {
    const wasPlaying = state.isPlaying;
    if (wasPlaying) {
      pause();
    }
    seek(time);
    logSeek(state.currentTime, time);
    externalSeek?.(time);
    if (wasPlaying) {
      setTimeout(() => play(), 100);
    }
  }, [state.isPlaying, seek, logSeek, pause, play, externalSeek, state.currentTime]);

  // Store seek function for parent access
  useEffect(() => {
    (window as any)[`videoSeek_${videoId}`] = handleExternalSeek;
    return () => {
      delete (window as any)[`videoSeek_${videoId}`];
    };
  }, [videoId, handleExternalSeek]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    logVolumeChange(state.currentTime, newVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.5);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleQualityChange = (quality: string) => {
    setQuality(quality);
    logQualityChange(state.currentTime, quality);
    onQualityChange?.(quality);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className={cn('relative w-full bg-black rounded-lg overflow-hidden', className)}>
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onLoadedMetadata={() => {
          // Video metadata loaded
        }}
      />

      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-white">{state.error}</p>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <Slider
              value={[state.currentTime]}
              max={state.duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-white/80">
              <span>{formatTime(state.currentTime)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {state.isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[state.volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <span className="text-sm text-white/80">{formatTime(state.currentTime)} / {formatTime(state.duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              {state.availableQualities.length > 0 && (
                <Select value={state.quality} onValueChange={handleQualityChange}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    {state.availableQualities.map((quality) => (
                      <SelectItem key={quality.value} value={quality.value}>
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
