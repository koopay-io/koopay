'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationQRCodeProps {
  url: string;
  organizationName?: string;
}

export function OrganizationQRCode({ url, organizationName }: OrganizationQRCodeProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: organizationName || 'Organization',
        url,
      });
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-card rounded-lg border">
      {url && (
        <QRCodeSVG
          value={url}
          size={typeof window !== 'undefined' && window.innerWidth < 640 ? 180 : 200}
          level="H"
          includeMargin={true}
          fgColor="#ffffff"
          bgColor="#16132c"
        />
      )}
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <Input value={url} readOnly className="flex-1 font-mono text-xs sm:text-sm" />
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(url)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={shareUrl}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

