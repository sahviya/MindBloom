import { useState } from "react";

interface TEDCardProps {
  title: string;
  link: string; // TED iframe-compatible link or YouTube embed id via full URL
  thumbnail: string; // from /public/ted-thumbnails
}

export default function TEDCard({ title, link, thumbnail }: TEDCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg overflow-hidden border group">
      <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-900">
        {open ? (
          <iframe
            src={link}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img src={thumbnail} alt={`${title} thumbnail`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
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



