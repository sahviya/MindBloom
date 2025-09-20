import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ShortsPlayerProps {
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
}

export default function ShortsPlayer({ videoId, title, channel, thumbnail }: ShortsPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <>
      <Card className="group hover:magical-border hover:glow-effect transition-all cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="aspect-[9/16] overflow-hidden rounded-t-lg">
          <div className="w-full h-full bg-black group-hover:scale-[1.02] transition-transform relative flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={`${title} thumbnail`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-neutral-800" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-play text-white text-sm ml-0.5"></i>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="font-medium text-sm line-clamp-2">{title}</div>
          {channel && <div className="text-xs text-muted-foreground">{channel}</div>}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm w-full p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-3">
            <div className="w-full" style={{ aspectRatio: "9 / 16" }}>
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


