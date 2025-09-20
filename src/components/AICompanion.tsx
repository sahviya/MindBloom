import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  tone?: string;
  suggestions?: string[];
}

export default function AICompanion() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation history
  const { data: conversations } = useQuery({
    queryKey: ["/api/ai/conversations?limit=20"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (conversations) {
      const formattedMessages: Message[] = [];
      conversations.reverse().forEach((conv: any) => {
        formattedMessages.push({
          id: `user-${conv.id}`,
          content: conv.message,
          isUser: true,
          timestamp: new Date(conv.createdAt),
        });
        formattedMessages.push({
          id: `ai-${conv.id}`,
          content: conv.response,
          isUser: false,
          timestamp: new Date(conv.createdAt),
        });
      });
      setMessages(formattedMessages);
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/ai/chat", { message });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        tone: data.tone,
        suggestions: data.suggestions,
      };
      setMessages(prev => [...prev, aiMessage]);

      // Text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.message);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Could not capture voice. Please try again.",
        variant: "destructive",
      });
    };

    recognition.start();
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Initialize with welcome message if no conversations
  useEffect(() => {
    if (conversations && conversations.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hello! ✨ I'm your Genie Guide, here to support you on your wellness journey. How are you feeling today?",
        isUser: false,
        timestamp: new Date(),
        tone: "supportive",
      };
      setMessages([welcomeMessage]);
    }
  }, [conversations]);

  return (
    <Card className="magical-border glow-effect h-96">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-serif font-semibold text-primary flex items-center">
            <div className="w-8 h-8 mr-2 genie-gradient rounded-full flex items-center justify-center float">
              <i className="fas fa-robot text-primary-foreground text-sm"></i>
            </div>
            Ur Genie
          </h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={startVoiceRecognition}
              disabled={isListening}
              data-testid="voice-input"
            >
              <i className={`fas fa-microphone ${isListening ? 'animate-pulse text-destructive' : ''}`}></i>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={stopSpeaking}
              disabled={!isSpeaking}
              data-testid="stop-speech"
            >
              <i className={`fas fa-volume-up ${isSpeaking ? 'animate-pulse text-primary' : ''}`}></i>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!message.isUser && (
                  <div className="w-6 h-6 genie-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-magic text-xs text-primary-foreground"></i>
                  </div>
                )}
                
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.isUser
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/20 text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6"
                          onClick={() => setInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.isUser && (
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user text-xs"></i>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={chatMutation.isPending}
              data-testid="ai-chat-input"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || chatMutation.isPending}
              className="genie-gradient hover:opacity-90"
              data-testid="send-message"
            >
              {chatMutation.isPending ? (
                <i className="fas fa-spinner animate-spin text-primary-foreground"></i>
              ) : (
                <i className="fas fa-paper-plane text-primary-foreground"></i>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extend window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
