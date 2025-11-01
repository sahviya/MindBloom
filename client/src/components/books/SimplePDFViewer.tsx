import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  pdfUrl: string;
  thumbnail?: string;
}

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
  color: string;
  notes?: string;
  createdAt: string;
}

interface SimplePDFViewerProps {
  book: Book;
  onClose: () => void;
}

type ReadingTheme = "light" | "dark" | "sepia";
type HighlightColor = "yellow" | "green" | "blue" | "pink";

export default function SimplePDFViewer({ book, onClose }: SimplePDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("light");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");
  const [newBookmarkNotes, setNewBookmarkNotes] = useState("");
  const [newHighlightColor, setNewHighlightColor] = useState<HighlightColor>("yellow");
  const [newHighlightNotes, setNewHighlightNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`book_${book.id}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setCurrentPage(data.currentPage || 1);
      setReadingTheme(data.readingTheme || "light");
      setBookmarks(data.bookmarks || []);
      setHighlights(data.highlights || []);
    }
  }, [book.id]);

  // Save data to localStorage
  const saveData = () => {
    const data = {
      currentPage,
      readingTheme,
      bookmarks,
      highlights,
    };
    localStorage.setItem(`book_${book.id}`, JSON.stringify(data));
  };

  useEffect(() => {
    saveData();
  }, [currentPage, readingTheme, bookmarks, highlights]);

  // Set up PDF URL
  useEffect(() => {
    // Use Google Docs viewer as a fallback for better PDF display
    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + book.pdfUrl)}&embedded=true`;
    setPdfUrl(googleDocsUrl);
    setLoading(false);
  }, [book.pdfUrl]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const addBookmark = () => {
    if (newBookmarkTitle.trim()) {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        title: newBookmarkTitle,
        notes: newBookmarkNotes,
        createdAt: new Date().toISOString(),
      };
      setBookmarks([...bookmarks, newBookmark]);
      setNewBookmarkTitle("");
      setNewBookmarkNotes("");
      setShowAddBookmark(false);
    }
  };

  const addHighlight = () => {
    if (selectedText.trim()) {
      const newHighlight: Highlight = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        text: selectedText,
        color: newHighlightColor,
        notes: newHighlightNotes,
        createdAt: new Date().toISOString(),
      };
      setHighlights([...highlights, newHighlight]);
      setSelectedText("");
      setNewHighlightNotes("");
      setShowAddHighlight(false);
    }
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
  };

  const removeHighlight = (highlightId: string) => {
    setHighlights(highlights.filter(h => h.id !== highlightId));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, pageNumber)));
  };

  const getThemeClasses = () => {
    switch (readingTheme) {
      case "dark":
        return "bg-gray-900 text-gray-100";
      case "sepia":
        return "bg-amber-50 text-amber-900";
      default:
        return "bg-white text-gray-900";
    }
  };

  const getHighlightColor = (color: string) => {
    switch (color) {
      case "yellow":
        return "bg-yellow-200 text-yellow-900";
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

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-serif">{book.title}</DialogTitle>
              <p className="text-muted-foreground">by {book.author}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <i className="fas fa-times mr-2"></i>
              Close
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="p-6 pt-4 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {/* Page Navigation */}
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Page</span>
                  <Input
                    type="number"
                    value={currentPage}
                    onChange={handlePageInputChange}
                    className="w-16 h-8 text-center"
                    min={1}
                    max={totalPages}
                  />
                  <span className="text-sm">of {totalPages || "?"}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Theme:</Label>
                <Select value={readingTheme} onValueChange={(value: ReadingTheme) => setReadingTheme(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Bookmark Button */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAddBookmark(true)}
              >
                <i className="fas fa-bookmark mr-2"></i>
                Bookmark
              </Button>

              {/* Highlight Button */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAddHighlight(true)}
                disabled={!selectedText}
              >
                <i className="fas fa-highlighter mr-2"></i>
                Highlight
              </Button>

              {/* View Bookmarks */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowBookmarks(!showBookmarks)}
              >
                <i className="fas fa-list mr-2"></i>
                Bookmarks ({bookmarks.length})
              </Button>

              {/* View Highlights */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowHighlights(!showHighlights)}
              >
                <i className="fas fa-palette mr-2"></i>
                Highlights ({highlights.length})
              </Button>

              {/* Download */}
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <a href={book.pdfUrl} download>
                  <i className="fas fa-download mr-2"></i>
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for Bookmarks and Highlights */}
          {(showBookmarks || showHighlights) && (
            <div className="w-80 border-r bg-muted/20 overflow-y-auto">
              {showBookmarks && (
                <div className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <i className="fas fa-bookmark mr-2"></i>
                    Bookmarks
                  </h3>
                  <div className="space-y-2">
                    {bookmarks.map((bookmark) => (
                      <Card key={bookmark.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{bookmark.title}</h4>
                            <p className="text-xs text-muted-foreground">Page {bookmark.pageNumber}</p>
                            {bookmark.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{bookmark.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => goToPage(bookmark.pageNumber)}
                            >
                              <i className="fas fa-arrow-right text-xs"></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => removeBookmark(bookmark.id)}
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {bookmarks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No bookmarks yet
                      </p>
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
                    {highlights.map((highlight) => (
                      <Card key={highlight.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className={`inline-block px-2 py-1 rounded text-xs mb-2 ${getHighlightColor(highlight.color)}`}>
                              {highlight.text}
                            </div>
                            <p className="text-xs text-muted-foreground">Page {highlight.pageNumber}</p>
                            {highlight.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{highlight.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => goToPage(highlight.pageNumber)}
                            >
                              <i className="fas fa-arrow-right text-xs"></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => removeHighlight(highlight.id)}
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {highlights.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No highlights yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden">
            <div 
              className={`w-full h-full ${getThemeClasses()}`}
              onMouseUp={handleTextSelection}
            >
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={book.title}
                onLoad={() => {
                  setLoading(false);
                }}
                onError={() => {
                  setError("Failed to load PDF. Please try again.");
                  setLoading(false);
                }}
              />
            </div>
          </div>
        </div>

        {/* Add Bookmark Dialog */}
        <Dialog open={showAddBookmark} onOpenChange={setShowAddBookmark}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bookmark</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bookmark-title">Title</Label>
                <Input
                  id="bookmark-title"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  placeholder="Bookmark title"
                />
              </div>
              <div>
                <Label htmlFor="bookmark-notes">Notes (optional)</Label>
                <Textarea
                  id="bookmark-notes"
                  value={newBookmarkNotes}
                  onChange={(e) => setNewBookmarkNotes(e.target.value)}
                  placeholder="Add notes about this bookmark"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddBookmark(false)}>
                  Cancel
                </Button>
                <Button onClick={addBookmark} disabled={!newBookmarkTitle.trim()}>
                  Add Bookmark
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Highlight Dialog */}
        <Dialog open={showAddHighlight} onOpenChange={setShowAddHighlight}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Highlight</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Selected Text</Label>
                <div className="p-3 bg-muted rounded-md">
                  "{selectedText}"
                </div>
              </div>
              <div>
                <Label htmlFor="highlight-color">Color</Label>
                <Select value={newHighlightColor} onValueChange={(value: HighlightColor) => setNewHighlightColor(value)}>
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
              <div>
                <Label htmlFor="highlight-notes">Notes (optional)</Label>
                <Textarea
                  id="highlight-notes"
                  value={newHighlightNotes}
                  onChange={(e) => setNewHighlightNotes(e.target.value)}
                  placeholder="Add notes about this highlight"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddHighlight(false)}>
                  Cancel
                </Button>
                <Button onClick={addHighlight}>
                  Add Highlight
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}











