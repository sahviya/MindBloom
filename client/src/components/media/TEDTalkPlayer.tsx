import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TEDTalkPlayerProps {
  talkId: string;
  title: string;
  speaker: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
  embedUrl?: string; // official TED embed URL if provided
}

export default function TEDTalkPlayer({ talkId, title, speaker, duration, thumbnail, description, embedUrl }: TEDTalkPlayerProps) {
  const videoId = talkId;
  // Standard embed (best compatibility). No autoplay; inline playback; show controls.
  const tedUrl = embedUrl;
  const primaryUrl = tedUrl || `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1&controls=1`;
  const fallbackUrl = tedUrl ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1&controls=1` : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1&controls=1`;
  const playerUrl = primaryUrl;

  return (
    <Card className="group hover:magical-border hover:glow-effect transition-all">
      <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-neutral-200 dark:bg-neutral-900">
        <iframe
          key={playerUrl}
          src={playerUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="font-medium line-clamp-2">{title}</div>
          <div className="text-sm text-muted-foreground">{speaker}{duration ? ` • ${duration}` : ''}</div>
        </div>
        <div className="flex items-center gap-2"></div>
      </CardContent>
      {description && (
        <div className="px-4 pb-4 text-sm text-muted-foreground">{description}</div>
      )}
    </Card>
  );
}


