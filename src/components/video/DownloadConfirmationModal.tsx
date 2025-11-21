import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle, HardDrive } from 'lucide-react';
import { useState } from 'react';
import type { VideoQuality } from '@/types';

interface DownloadConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quality?: string) => void;
  videoTitle: string;
  availableQualities?: VideoQuality[];
  estimatedSize?: string;
  isLoading?: boolean;
}

export function DownloadConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  videoTitle,
  availableQualities = [],
  estimatedSize,
  isLoading = false,
}: DownloadConfirmationModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');

  const handleConfirm = () => {
    onConfirm(selectedQuality === 'auto' ? undefined : selectedQuality);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Video for Offline Playback
          </DialogTitle>
          <DialogDescription>
            Download "{videoTitle}" to watch offline on registered devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableQualities.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="quality">Video Quality</Label>
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Recommended)</SelectItem>
                  {availableQualities.map((quality) => (
                    <SelectItem key={quality.value} value={quality.value}>
                      {quality.label}
                      {quality.resolution && ` - ${quality.resolution}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {estimatedSize && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <HardDrive className="h-4 w-4 text-foreground-secondary" />
              <span className="text-sm text-foreground-secondary">
                Estimated size: <strong>{estimatedSize}</strong>
              </span>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Downloaded videos are encrypted and can only be played on
              registered devices through this application. The download will expire after a certain
              period and may require re-downloading.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Storage:</strong> Make sure you have sufficient storage space on your device.
              Large video files may take several minutes to download depending on your connection
              speed.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Starting Download...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Start Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
