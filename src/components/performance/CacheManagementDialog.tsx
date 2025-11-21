import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCacheRecords,
  useInvalidateCache,
  useRefreshCache,
  useClearCache,
} from "@/hooks/use-performance";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Database, RefreshCw, Trash2, X } from "lucide-react";

interface CacheManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CacheManagementDialog({ open, onOpenChange }: CacheManagementDialogProps) {
  const [action, setAction] = useState<'invalidate' | 'refresh' | 'clear'>('invalidate');
  const [cacheKeys, setCacheKeys] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [pattern, setPattern] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: cacheRecords, isLoading } = useCacheRecords({ limit: 50 });
  const invalidateCache = useInvalidateCache();
  const refreshCache = useRefreshCache();
  const clearCache = useClearCache();

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const data: any = {};
    
    if (cacheKeys) {
      data.cache_keys = cacheKeys.split('\n').filter(k => k.trim());
    }
    if (endpoint) {
      data.endpoint = endpoint;
    }
    if (pattern) {
      data.pattern = pattern;
    }

    if (action === 'invalidate') {
      invalidateCache.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          setCacheKeys('');
          setEndpoint('');
          setPattern('');
        },
      });
    } else if (action === 'refresh') {
      refreshCache.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          setCacheKeys('');
          setEndpoint('');
        },
      });
    } else if (action === 'clear') {
      clearCache.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          setEndpoint('');
          setPattern('');
        },
      });
    }
    
    setShowConfirm(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Management
            </DialogTitle>
            <DialogDescription>
              Manage cache entries by invalidating, refreshing, or clearing cached data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Action Selection */}
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(value: any) => setAction(value)}>
                <SelectTrigger id="action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invalidate">Invalidate Cache</SelectItem>
                  <SelectItem value="refresh">Refresh Cache</SelectItem>
                  <SelectItem value="clear">Clear Cache</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cache Keys */}
            {action !== 'clear' && (
              <div className="space-y-2">
                <Label htmlFor="cache-keys">
                  Cache Keys (one per line)
                </Label>
                <Textarea
                  id="cache-keys"
                  placeholder="cache:key:1&#10;cache:key:2&#10;..."
                  value={cacheKeys}
                  onChange={(e) => setCacheKeys(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Endpoint */}
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint (optional)</Label>
              <Input
                id="endpoint"
                placeholder="/api/videos"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>

            {/* Pattern */}
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern (optional)</Label>
              <Input
                id="pattern"
                placeholder="cache:*:videos"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
              />
              <p className="text-xs text-foreground-secondary">
                Use wildcards (*) to match multiple keys
              </p>
            </div>

            {/* Recent Cache Records */}
            <div className="space-y-2">
              <Label>Recent Cache Records</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : cacheRecords && cacheRecords.length > 0 ? (
                  <div className="divide-y">
                    {cacheRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-foreground-primary truncate">
                              {record.cache_key}
                            </div>
                            <div className="text-xs text-foreground-secondary mt-1">
                              {record.endpoint} • {record.method} • Hits: {record.hit_count} • Misses: {record.miss_count}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCacheKeys(prev => prev ? `${prev}\n${record.cache_key}` : record.cache_key);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-foreground-secondary">
                    No cache records found
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!cacheKeys && !endpoint && !pattern}>
              {action === 'invalidate' && <RefreshCw className="h-4 w-4 mr-2" />}
              {action === 'refresh' && <RefreshCw className="h-4 w-4 mr-2" />}
              {action === 'clear' && <Trash2 className="h-4 w-4 mr-2" />}
              {action === 'invalidate' ? 'Invalidate' : action === 'refresh' ? 'Refresh' : 'Clear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {action === 'invalidate' ? 'Invalidation' : action === 'refresh' ? 'Refresh' : 'Clear'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} the cache
              {cacheKeys ? ` for ${cacheKeys.split('\n').filter(k => k.trim()).length} key(s)` : ''}
              {endpoint ? ` for endpoint ${endpoint}` : ''}
              {pattern ? ` matching pattern ${pattern}` : ''}?
              {action === 'clear' && ' This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
