import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reelId: string;
  reelTitle: string;
}

export function ShareModal({
  open,
  onOpenChange,
  reelId,
  reelTitle,
}: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const shareUrl = `${window.location.origin}/reel/${reelId}`;
  const embedCode = `<iframe src="${shareUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch (error) {
      toast.error('Failed to copy embed code');
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reelTitle,
          text: `Check out this training reel: ${reelTitle}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Reel
          </DialogTitle>
          <DialogDescription>
            Share "{reelTitle}" with others via link or embed code.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Share URL</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className={cn(
                    'shrink-0',
                    copiedLink && 'bg-success/10 border-success text-success'
                  )}
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                onClick={handleShareNative}
                className="w-full"
                variant="outline"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via...
              </Button>
            )}
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Code</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="embed-code"
                    value={embedCode}
                    readOnly
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyEmbed}
                    className={cn(
                      'shrink-0',
                      copiedEmbed && 'bg-success/10 border-success text-success'
                    )}
                  >
                    {copiedEmbed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-foreground-secondary">
                  Copy this code and paste it into your website or LMS to embed the video.
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-foreground-secondary" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="aspect-video bg-black rounded border border-border flex items-center justify-center">
                <p className="text-sm text-white/60">Video Preview</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
