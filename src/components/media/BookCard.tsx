import { useMemo, useState } from "react";

interface BookCardProps {
  title: string;
  pdfUrl: string;
}

export default function BookCard({ title, pdfUrl }: BookCardProps) {
  const [open, setOpen] = useState(false);

  const baseName = useMemo(() => {
    try {
      const url = new URL(pdfUrl, window.location.origin);
      const file = url.pathname.split("/").pop() || "";
      return file.replace(/\.pdf$/i, "");
    } catch {
      const file = pdfUrl.split("/").pop() || "";
      return file.replace(/\.pdf$/i, "");
    }
  }, [pdfUrl]);

  const thumbUrl = `/thumbnails/${baseName}.jpg`;

  return (
    <div className="rounded-lg overflow-hidden border group">
      <div
        className={`relative w-full ${open ? "" : "aspect-[3/4]"} bg-neutral-100 dark:bg-neutral-900`}
      >
        {open ? (
          <iframe
            src={pdfUrl}
            title={title}
            className="w-full h-[360px] md:h-[420px] lg:h-[480px] border-0"
          />
        ) : (
          <img
            src={thumbUrl}
            alt={`${title} cover`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const placeholder = target.nextElementSibling as HTMLDivElement | null;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
        )}
        {!open && (
          <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
            <i className="fas fa-book text-5xl text-primary/50"></i>
          </div>
        )}
      </div>

      <div className="p-3 flex items-center justify-between">
        <div className="font-medium text-sm line-clamp-2 pr-3">{title}</div>
        <button
          className="text-xs px-2 py-1 rounded border hover:bg-accent"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Back" : "Open"}
        </button>
      </div>
    </div>
  );
}



