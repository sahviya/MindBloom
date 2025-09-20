import { useEffect, useMemo, useState } from "react";
import BookCard from "./BookCard";
import YouTubeCard from "./YouTubeCard";
import TEDCard from "./TEDCard";

interface MediaLibraryProps {
  youtubeIds: string[];
  tedTalks: Array<{ title: string; link: string; thumbnail: string }>;
}

interface BookItem {
  title: string;
  pdfUrl: string;
}

export default function MediaLibrary({ youtubeIds, tedTalks }: MediaLibraryProps) {
  const [books, setBooks] = useState<BookItem[]>([]);

  useEffect(() => {
    // Load from existing API which maps files in client/public/books
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        const mapped: BookItem[] = (data || []).map((b: any) => ({ title: b.title, pdfUrl: b.pdfUrl }));
        setBooks(mapped);
      })
      .catch(() => setBooks([]));
  }, []);

  const youTubeItems = useMemo(() => youtubeIds.map((id) => ({ id, title: "YouTube Video" })), [youtubeIds]);

  return (
    <div className="space-y-10">
      {/* Books */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Books</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((b) => (
            <BookCard key={b.pdfUrl} title={b.title} pdfUrl={b.pdfUrl} />
          ))}
          {books.length === 0 && (
            <div className="text-sm text-muted-foreground">No books found.</div>
          )}
        </div>
      </section>

      {/* YouTube */}
      <section>
        <h2 className="text-xl font-semibold mb-4">YouTube</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {youTubeItems.map((v) => (
            <YouTubeCard key={v.id} videoId={v.id} title={"Video " + v.id} />
          ))}
          {youTubeItems.length === 0 && (
            <div className="text-sm text-muted-foreground">No videos.</div>
          )}
        </div>
      </section>

      {/* TED Talks */}
      <section>
        <h2 className="text-xl font-semibold mb-4">TED Talks</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tedTalks.map((t) => (
            <TEDCard key={t.link} title={t.title} link={t.link} thumbnail={t.thumbnail} />
          ))}
          {tedTalks.length === 0 && (
            <div className="text-sm text-muted-foreground">No talks.</div>
          )}
        </div>
      </section>
    </div>
  );
}



