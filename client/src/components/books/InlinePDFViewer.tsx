import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface InlinePDFViewerProps {
  title: string;
  pdfUrl: string;
  onClose: () => void;
}

type HighlightColor = "yellow" | "green" | "blue" | "pink";

interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  notes?: string;
  createdAt: string;
}

interface Highlight {
  id: string;
  pageNumber: number;
  text: string;
  color: HighlightColor;
  notes?: string;
  createdAt: string;
}

export default function InlinePDFViewer({ title, pdfUrl, onClose }: InlinePDFViewerProps) {
  const storageKey = `pdf_${pdfUrl}`;
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");
  const [newBookmarkNotes, setNewBookmarkNotes] = useState("");
  const [newHighlightText, setNewHighlightText] = useState("");
  const [newHighlightColor, setNewHighlightColor] = useState<HighlightColor>("yellow");
  const [newHighlightNotes, setNewHighlightNotes] = useState("");
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCurrentPage(data.currentPage || 1);
        setBookmarks(data.bookmarks || []);
        setHighlights(data.highlights || []);
      } catch {}
    }
  }, [storageKey]);

  useEffect(() => {
    const data = { currentPage, bookmarks, highlights };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [currentPage, bookmarks, highlights, storageKey]);

  const addBookmark = () => {
    if (!newBookmarkTitle.trim()) return;
    const bm: Bookmark = {
      id: Date.now().toString(),
      pageNumber: currentPage,
      title: newBookmarkTitle,
      notes: newBookmarkNotes,
      createdAt: new Date().toISOString(),
    };
    setBookmarks(prev => [bm, ...prev]);
    setNewBookmarkTitle("");
    setNewBookmarkNotes("");
    setShowAddBookmark(false);
  };

  const removeBookmark = (id: string) => setBookmarks(prev => prev.filter(b => b.id !== id));

  const addHighlight = () => {
    if (!newHighlightText.trim()) return;
    const hl: Highlight = {
      id: Date.now().toString(),
      pageNumber: currentPage,
      text: newHighlightText,
      color: newHighlightColor,
      notes: newHighlightNotes,
      createdAt: new Date().toISOString(),
    };
    setHighlights(prev => [hl, ...prev]);
    setNewHighlightText("");
    setNewHighlightNotes("");
    setShowAddHighlight(false);
  };

  const removeHighlight = (id: string) => setHighlights(prev => prev.filter(h => h.id !== id));

  const getHighlightColorClass = (color: HighlightColor) => {
    switch (color) {
      case "green":
        return "bg-green-200 text-green-900";
      case "blue":
        return "bg-blue-200 text-blue-900";
      case "pink":
        return "bg-pink-200 text-pink-900";
      default:
        return "bg-yellow-200 text-yellow-900";
    }
  };

  const containerClasses = isFullscreen
    ? "w-screen h-screen max-w-none"
    : "max-w-7xl w-full";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${containerClasses} p-0`}>
        {!focusMode && (
          <DialogHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-serif">{title}</DialogTitle>
                <p className="text-muted-foreground text-xs">{new URL(pdfUrl, window.location.origin).pathname}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setFocusMode(true)} title="Focus">
                  <i className="fas fa-eye mr-2"></i>
                  Focus
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsFullscreen(f => !f)}>
                  <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"} mr-2`}></i>
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </Button>
                <Button size="sm" variant="outline" onClick={onClose}>
                  <i className="fas fa-times mr-2"></i>
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>
        )}

        {/* Toolbar */}
        {!focusMode && (
        <div className="p-3 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Page</Label>
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value || "1", 10)))}
                className="w-20 h-8 text-center"
                min={1}
              />
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <i className="fas fa-chevron-left"></i>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => p + 1)}>
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddBookmark(true)}>
                <i className="fas fa-bookmark mr-2"></i>
                Bookmark
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddHighlight(true)}>
                <i className="fas fa-highlighter mr-2"></i>
                Highlight
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowBookmarks(v => !v)}>
                <i className="fas fa-list mr-2"></i>
                Bookmarks ({bookmarks.length})
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowHighlights(v => !v)}>
                <i className="fas fa-palette mr-2"></i>
                Highlights ({highlights.length})
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={pdfUrl} download>
                  <i className="fas fa-download mr-2"></i>
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {!focusMode && (showBookmarks || showHighlights) && (
            <div className="w-80 border-r bg-muted/20 overflow-y-auto">
              {showBookmarks && (
                <div className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <i className="fas fa-bookmark mr-2"></i>
                    Bookmarks
                  </h3>
                  <div className="space-y-2">
                    {bookmarks.map(bm => (
                      <Card key={bm.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{bm.title}</div>
                            <div className="text-xs text-muted-foreground">Page {bm.pageNumber}</div>
                            {bm.notes && <div className="text-xs text-muted-foreground mt-1">{bm.notes}</div>}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setCurrentPage(bm.pageNumber)}>
                              <i className="fas fa-arrow-right text-xs"></i>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeBookmark(bm.id)}>
                              <i className="fas fa-trash text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {bookmarks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No bookmarks yet</p>
                    )}
                  </div>
                </div>
              )}

              {showHighlights && (
                <div className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <i className="fas fa-palette mr-2"></i>
                    Highlights
                  </h3>
                  <div className="space-y-2">
                    {highlights.map(hl => (
                      <Card key={hl.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className={`inline-block px-2 py-1 rounded text-xs mb-2 ${getHighlightColorClass(hl.color)}`}>{hl.text}</div>
                            <div className="text-xs text-muted-foreground">Page {hl.pageNumber}</div>
                            {hl.notes && <div className="text-xs text-muted-foreground mt-1">{hl.notes}</div>}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setCurrentPage(hl.pageNumber)}>
                              <i className="fas fa-arrow-right text-xs"></i>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeHighlight(hl.id)}>
                              <i className="fas fa-trash text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {highlights.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No highlights yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <div className={`${focusMode ? "max-w-5xl mx-auto" : ""} w-full h-full`}>
              <iframe
                src={`${pdfUrl}#page=${currentPage}&toolbar=1`}
                className={`w-full ${focusMode ? "h-[calc(100vh-40px)]" : "h-[calc(100vh-180px)] md:h-[calc(100vh-160px)]"} border-0`}
                title={title}
              />
            </div>
          </div>
        </div>

        {/* Add Bookmark Inline Panel */}
        {!focusMode && showAddBookmark && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <Label htmlFor="bm-title">Bookmark title</Label>
                <Input id="bm-title" value={newBookmarkTitle} onChange={(e) => setNewBookmarkTitle(e.target.value)} placeholder="Chapter 1" />
              </div>
              <div>
                <Label htmlFor="bm-page">Page</Label>
                <Input id="bm-page" type="number" value={currentPage} min={1} onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value || "1", 10)))} />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="bm-notes">Notes (optional)</Label>
                <Textarea id="bm-notes" value={newBookmarkNotes} onChange={(e) => setNewBookmarkNotes(e.target.value)} placeholder="Key idea from this page..." />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddBookmark(false)}>Cancel</Button>
                <Button onClick={addBookmark} disabled={!newBookmarkTitle.trim()}>Add Bookmark</Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Highlight Inline Panel */}
        {!focusMode && showAddHighlight && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-3">
                <Label htmlFor="hl-text">Highlighted text</Label>
                <Textarea id="hl-text" value={newHighlightText} onChange={(e) => setNewHighlightText(e.target.value)} placeholder="Paste or type the text to highlight" />
              </div>
              <div>
                <Label htmlFor="hl-page">Page</Label>
                <Input id="hl-page" type="number" value={currentPage} min={1} onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value || "1", 10)))} />
              </div>
              <div>
                <Label>Color</Label>
                <Select value={newHighlightColor} onValueChange={(v: HighlightColor) => setNewHighlightColor(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="hl-notes">Notes (optional)</Label>
                <Textarea id="hl-notes" value={newHighlightNotes} onChange={(e) => setNewHighlightNotes(e.target.value)} placeholder="Why is this important?" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddHighlight(false)}>Cancel</Button>
                <Button onClick={addHighlight} disabled={!newHighlightText.trim()}>Add Highlight</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


