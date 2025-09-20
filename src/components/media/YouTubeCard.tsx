import { useState } from "react";

interface YouTubeCardProps {
  videoId: string;
  title: string;
}

export default function YouTubeCard({ videoId, title }: YouTubeCardProps) {
  const [open, setOpen] = useState(false);
  const thumb = `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  const embed = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="rounded-lg overflow-hidden border group">
      <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-900">
        {open ? (
          <iframe
            src={embed}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img src={thumb} alt={`${title} thumbnail`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
        )}
        {!open && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-play text-white text-sm ml-0.5"></i>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="font-medium text-sm line-clamp-2 pr-3">{title}</div>
        <button className="text-xs px-2 py-1 rounded border hover:bg-accent" onClick={() => setOpen((v) => !v)}>
          {open ? "Back" : "Play"}
        </button>
      </div>
    </div>
  );
}



