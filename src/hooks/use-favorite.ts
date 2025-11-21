import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/lib/api';
import { toast } from 'sonner';

export interface Favorite {
  id: string;
  user_id: string;
  reel_id: string;
  created_at: string;
}

// Get user's favorites
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getFavorites(),
  });
}

// Check if a reel is favorited
export function useIsFavorited(reelId: string) {
  const { data: favorites } = useFavorites();
  return favorites?.some((f: Favorite) => f.reel_id === reelId) || false;
}

// Toggle favorite
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reelId: string) => {
      // Check if already favorited
      const favorites = await favoritesApi.getFavorites();
      const existing = favorites?.find((f: Favorite) => f.reel_id === reelId);

      if (existing) {
        // Remove favorite
        await favoritesApi.removeFavorite(existing.id);
        return { favorited: false };
      } else {
        // Add favorite
        await favoritesApi.addFavorite(reelId);
        return { favorited: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update favorite');
    },
  });
}
