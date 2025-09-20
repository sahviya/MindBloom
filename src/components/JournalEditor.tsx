import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface JournalEditorProps {
  simplified?: boolean;
  entry?: any;
  onSave?: () => void;
}

export default function JournalEditor({ simplified = false, entry, onSave }: JournalEditorProps) {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [selectedEmoji, setSelectedEmoji] = useState("🌟");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const emojis = ["🌟", "✨", "🌙", "🦋", "💜", "🌸", "🌈", "💫", "🕊️", "🌺"];

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (entry) {
        return await apiRequest("PATCH", `/api/journal/${entry.id}`, data);
      } else {
        return await apiRequest("POST", "/api/journal", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: entry ? "Journal entry updated!" : "Journal entry saved!",
      });
      if (!entry) {
        setTitle("");
        setContent("");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      onSave?.();
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
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Required",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      title: title.trim() || undefined,
      content: content.trim(),
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (!selectedText) return;

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className="space-y-4">
      {!simplified && (
        <Input
          placeholder="Give your entry a title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="journal-title"
        />
      )}

      <div>
        <p className="text-muted-foreground mb-3 text-sm">
          ✨ {simplified ? "What's on your mind today?" : "What magical moments happened today? Share your thoughts..."}
        </p>
        
        {!simplified && (
          <div className="flex items-center space-x-2 mb-3 p-2 bg-muted rounded-lg">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => formatText('bold')}
              data-testid="format-bold"
            >
              <i className="fas fa-bold"></i>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => formatText('italic')}
              data-testid="format-italic"
            >
              <i className="fas fa-italic"></i>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => formatText('underline')}
              data-testid="format-underline"
            >
              <i className="fas fa-underline"></i>
            </Button>
            <div className="w-px h-4 bg-border"></div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => insertAtCursor(`${selectedEmoji} `)}
              data-testid="insert-emoji"
            >
              <i className="fas fa-smile mr-1"></i>
              {selectedEmoji}
            </Button>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          placeholder={simplified ? "I'm feeling..." : "Today I felt grateful for..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={simplified ? "min-h-20" : "min-h-32"}
          data-testid="journal-content"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={`text-2xl hover:scale-110 transition-transform ${
                selectedEmoji === emoji ? 'scale-125' : ''
              }`}
              data-testid={`emoji-${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <Button
          onClick={handleSave}
          disabled={!content.trim() || saveMutation.isPending}
          className="genie-gradient hover:opacity-90"
          data-testid="save-journal"
        >
          {saveMutation.isPending ? (
            <i className="fas fa-spinner animate-spin mr-2"></i>
          ) : (
            <i className="fas fa-save mr-2"></i>
          )}
          {entry ? "Update Entry" : "Save Entry"}
        </Button>
      </div>
    </div>
  );
}
