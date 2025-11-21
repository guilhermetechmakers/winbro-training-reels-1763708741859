import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videoDownloadApi } from '@/lib/api';
import { toast } from 'sonner';
import type { DownloadRequest, VideoDownload } from '@/types';

// Get or create device ID
function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export function useVideoDownload() {
  const queryClient = useQueryClient();
  const deviceId = getDeviceId();

  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Get user's downloads
  const { data: downloads, isLoading } = useQuery({
    queryKey: ['video-downloads'],
    queryFn: () => videoDownloadApi.getDownloads(),
  });

  // Request download mutation
  const requestDownloadMutation = useMutation({
    mutationFn: (data: DownloadRequest) => videoDownloadApi.requestDownload({ ...data, device_id: deviceId }),
    onSuccess: (response) => {
      toast.success('Download started');
      queryClient.invalidateQueries({ queryKey: ['video-downloads'] });
      
      // Start polling for download progress
      pollDownloadStatus(response.download_id);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start download');
    },
  });

  // Poll download status
  const pollDownloadStatus = useCallback((downloadId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await videoDownloadApi.getDownloadStatus(downloadId);
        setDownloadProgress(prev => ({ ...prev, [downloadId]: status.progress }));

        if (status.status === 'completed') {
          clearInterval(interval);
          toast.success('Download completed');
          queryClient.invalidateQueries({ queryKey: ['video-downloads'] });
        } else if (status.status === 'failed') {
          clearInterval(interval);
          toast.error('Download failed');
          queryClient.invalidateQueries({ queryKey: ['video-downloads'] });
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling download status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  }, [queryClient]);

  // Cancel download mutation
  const cancelDownloadMutation = useMutation({
    mutationFn: (downloadId: string) => videoDownloadApi.cancelDownload(downloadId),
    onSuccess: () => {
      toast.success('Download cancelled');
      queryClient.invalidateQueries({ queryKey: ['video-downloads'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel download');
    },
  });

  // Delete download mutation
  const deleteDownloadMutation = useMutation({
    mutationFn: (downloadId: string) => videoDownloadApi.deleteDownload(downloadId),
    onSuccess: () => {
      toast.success('Download deleted');
      queryClient.invalidateQueries({ queryKey: ['video-downloads'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete download');
    },
  });

  const requestDownload = useCallback((videoId: string, quality?: string) => {
    requestDownloadMutation.mutate({ video_id: videoId, quality });
  }, [requestDownloadMutation]);

  const cancelDownload = useCallback((downloadId: string) => {
    cancelDownloadMutation.mutate(downloadId);
  }, [cancelDownloadMutation]);

  const deleteDownload = useCallback((downloadId: string) => {
    deleteDownloadMutation.mutate(downloadId);
  }, [deleteDownloadMutation]);

  const getDownloadForVideo = useCallback((videoId: string): VideoDownload | undefined => {
    return downloads?.find(d => d.video_id === videoId && d.status === 'completed');
  }, [downloads]);

  return {
    downloads,
    isLoading,
    downloadProgress,
    requestDownload,
    cancelDownload,
    deleteDownload,
    getDownloadForVideo,
    deviceId,
    isRequesting: requestDownloadMutation.isPending,
  };
}
