import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import JournalEditor from "@/components/JournalEditor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Journal() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: journalEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/journal"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await apiRequest("DELETE", `/api/journal/${entryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Journal entry deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setSelectedEntry(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete journal entry.",
        variant: "destructive",
      });
    },
  });

  const filteredEntries = (journalEntries as any[])?.filter((entry: any) =>
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "very_happy": return "😄";
      case "happy": return "😊";
      case "neutral": return "😐";
      case "sad": return "😔";
      case "very_sad": return "😢";
      default: return "✨";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "very_happy": return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "happy": return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "neutral": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "sad": return "bg-orange-500/20 text-orange-600 dark:text-orange-400";
      case "very_sad": return "bg-red-500/20 text-red-600 dark:text-red-400";
      default: return "bg-primary/20 text-primary";
    }
  };

  if (isLoading || entriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-16 h-16 genie-gradient rounded-full animate-pulse glow-effect flex items-center justify-center">
            <i className="fas fa-feather-alt text-primary-foreground text-xl"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-feather-alt text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Your Magical Journal
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Capture your thoughts, feelings, and magical moments. Let your inner wisdom flow onto the pages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Entry List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card className="magical-border">
            <CardContent className="p-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                <Input
                  placeholder="Search your entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-entries"
                />
              </div>
            </CardContent>
          </Card>

          {/* New Entry Button */}
          <Button
            onClick={() => {
              setSelectedEntry(null);
              setIsEditing(true);
            }}
            className="w-full genie-gradient hover:opacity-90 py-6 text-lg"
            data-testid="new-entry-button"
          >
            <i className="fas fa-plus mr-2"></i>
            New Journal Entry
          </Button>

          {/* Entries List */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <Card className="magical-border">
                <CardContent className="p-6 text-center">
                  <i className="fas fa-feather-alt text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground">
                    {searchQuery ? "No entries match your search" : "Start your first journal entry"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry: any) => (
                <Card
                  key={entry.id}
                  className={`cursor-pointer transition-all hover:glow-effect ${
                    selectedEntry?.id === entry.id ? "magical-border glow-effect" : "border-border hover:border-primary/30"
                  }`}
                  onClick={() => {
                    setSelectedEntry(entry);
                    setIsEditing(false);
                  }}
                  data-testid={`entry-${entry.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                        <h3 className="font-medium text-sm line-clamp-1">
                          {entry.title || "Untitled Entry"}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {entry.content}
                    </p>
                    {entry.mood && (
                      <Badge variant="secondary" className={`text-xs ${getMoodColor(entry.mood)}`}>
                        {getMoodEmoji(entry.mood)} {entry.mood.replace("_", " ")}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="magical-border min-h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-primary">
                  <i className="fas fa-scroll mr-2"></i>
                  {isEditing ? "Write New Entry" : selectedEntry ? "Journal Entry" : "Select an Entry"}
                </CardTitle>
                {selectedEntry && !isEditing && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      data-testid="edit-entry"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" data-testid="delete-entry">
                          <i className="fas fa-trash mr-2"></i>
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this journal entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedEntry.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <JournalEditor
                  entry={selectedEntry}
                  onSave={() => {
                    setIsEditing(false);
                    if (selectedEntry) {
                      // Refresh the selected entry data
                      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
                    } else {
                      setSelectedEntry(null);
                    }
                  }}
                />
              ) : selectedEntry ? (
                <div className="space-y-6">
                  {/* Entry Header */}
                  <div className="border-b border-border pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-serif font-semibold">
                        {selectedEntry.title || "Untitled Entry"}
                      </h2>
                      <div className="flex items-center space-x-2">
                        {selectedEntry.mood && (
                          <Badge className={getMoodColor(selectedEntry.mood)}>
                            {getMoodEmoji(selectedEntry.mood)} {selectedEntry.mood.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(selectedEntry.createdAt).toLocaleDateString()} at{" "}
                      {new Date(selectedEntry.createdAt).toLocaleTimeString()}
                    </p>
                    {selectedEntry.updatedAt !== selectedEntry.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        Last updated on {new Date(selectedEntry.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Entry Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {selectedEntry.content}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-24 h-24 genie-gradient rounded-full flex items-center justify-center mb-6 opacity-50">
                    <i className="fas fa-book-open text-primary-foreground text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2 text-muted-foreground">
                    Your Journal Awaits
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Select an entry from the sidebar to read, or create a new one to capture your thoughts.
                  </p>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="genie-gradient hover:opacity-90"
                    data-testid="start-writing"
                  >
                    <i className="fas fa-pen mr-2"></i>
                    Start Writing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
