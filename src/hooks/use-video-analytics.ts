import { useRef, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { videoAnalyticsApi } from '@/lib/api';
import type { PlaybackAnalytics } from '@/types';

export function useVideoAnalytics(videoId: string) {
  const sessionIdRef = useRef<string | null>(null);
  const watchTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  // Log event mutation
  const logEventMutation = useMutation({
    mutationFn: (data: Omit<PlaybackAnalytics, 'id' | 'user_id' | 'created_at'>) => 
      videoAnalyticsApi.logEvent(data),
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) => videoAnalyticsApi.endSession(sessionId),
  });

  // Initialize session
  const initializeSession = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      startTimeRef.current = Date.now();
      watchTimeRef.current = 0;
    }
  }, []);

  // Log playback event
  const logEvent = useCallback((
    eventType: PlaybackAnalytics['event_type'],
    timestamp: number,
    metadata?: PlaybackAnalytics['metadata']
  ) => {
    if (!sessionIdRef.current) {
      initializeSession();
    }

    logEventMutation.mutate({
      video_id: videoId,
      event_type: eventType,
      timestamp,
      metadata,
    });
  }, [videoId, logEventMutation, initializeSession]);

  // Log play event
  const logPlay = useCallback((timestamp: number) => {
    logEvent('play', timestamp);
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, [logEvent]);

  // Log pause event
  const logPause = useCallback((timestamp: number) => {
    logEvent('pause', timestamp);
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      watchTimeRef.current += elapsed;
      startTimeRef.current = null;
    }
  }, [logEvent]);

  // Log seek event
  const logSeek = useCallback((from: number, to: number) => {
    logEvent('seek', to, { seek_from: from, seek_to: to });
  }, [logEvent]);

  // Log quality change
  const logQualityChange = useCallback((timestamp: number, quality: string) => {
    logEvent('quality_change', timestamp, { quality });
  }, [logEvent]);

  // Log volume change
  const logVolumeChange = useCallback((timestamp: number, volume: number) => {
    logEvent('volume_change', timestamp, { volume });
  }, [logEvent]);

  // Log completion
  const logComplete = useCallback((timestamp: number) => {
    logEvent('complete', timestamp, {});
    endSession();
  }, [logEvent]);

  // End session
  const endSession = useCallback(() => {
    if (sessionIdRef.current && startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      watchTimeRef.current += elapsed;
    }

    if (sessionIdRef.current) {
      // Note: In a real implementation, you'd calculate completion percentage
      // based on video duration and total watch time
      endSessionMutation.mutate(sessionIdRef.current);
      sessionIdRef.current = null;
      startTimeRef.current = null;
      watchTimeRef.current = 0;
    }
  }, [endSessionMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return {
    logPlay,
    logPause,
    logSeek,
    logQualityChange,
    logVolumeChange,
    logComplete,
    endSession,
    sessionId: sessionIdRef.current,
  };
}
