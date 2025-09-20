import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const moods = [
  { emoji: "😄", value: "very_happy", label: "Very Happy" },
  { emoji: "😊", value: "happy", label: "Happy" },
  { emoji: "😐", value: "neutral", label: "Neutral" },
  { emoji: "😔", value: "sad", label: "Sad" },
  { emoji: "😢", value: "very_sad", label: "Very Sad" },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: moodEntries } = useQuery({
    queryKey: ["/api/mood?days=7"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/mood?days=7");
      return res.json();
    },
  });

  const moodMutation = useMutation({
    mutationFn: async (mood: string) => {
      return await apiRequest("POST", "/api/mood", { mood });
    },
    onSuccess: () => {
      toast({
        title: "Mood Logged",
        description: "Your mood has been recorded for today.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
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
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
    moodMutation.mutate(moodValue);
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "very_happy":
        return "bg-green-500";
      case "happy":
        return "bg-blue-500";
      case "neutral":
        return "bg-yellow-500";
      case "sad":
        return "bg-orange-500";
      case "very_sad":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getAverageMood = () => {
    if (!moodEntries || moodEntries.length === 0) return "No data";
    
    const moodValues = {
      very_sad: 1,
      sad: 2,
      neutral: 3,
      happy: 4,
      very_happy: 5,
    };

    const average = moodEntries.reduce((sum: number, entry: any) => {
      return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3);
    }, 0) / moodEntries.length;

    if (average >= 4.5) return "Great";
    if (average >= 3.5) return "Good";
    if (average >= 2.5) return "Okay";
    if (average >= 1.5) return "Low";
    return "Poor";
  };

  // Get today's mood if already logged
  const todaysMood = moodEntries?.find((entry: any) => {
    const today = new Date();
    const entryDate = new Date(entry.createdAt);
    return entryDate.toDateString() === today.toDateString();
  });

  return (
    <Card className="magical-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-serif font-semibold text-primary mb-4">Daily Mood</h3>
        
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            {todaysMood ? "Your mood today:" : "How are you feeling today?"}
          </p>
          
          <div className="flex justify-center space-x-2">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => !todaysMood && handleMoodSelect(mood.value)}
                disabled={moodMutation.isPending || !!todaysMood}
                className={`text-2xl hover:scale-125 transition-transform p-1 rounded-full ${
                  selectedMood === mood.value || todaysMood?.mood === mood.value
                    ? 'bg-primary/20 scale-125'
                    : ''
                } ${todaysMood ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                title={mood.label}
                data-testid={`mood-${mood.value}`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
          
          {todaysMood && (
            <p className="text-xs text-muted-foreground mt-2">
              Logged at {new Date(todaysMood.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {moodEntries && moodEntries.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This Week</span>
              <span>Avg: {getAverageMood()}</span>
            </div>
            <div className="flex space-x-1 h-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                
                const dayMood = moodEntries.find((entry: any) => {
                  const entryDate = new Date(entry.createdAt);
                  return entryDate.toDateString() === date.toDateString();
                });
                
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      dayMood ? getMoodColor(dayMood.mood) : 'bg-muted'
                    }`}
                    title={`${date.toLocaleDateString()}: ${
                      dayMood ? moods.find(m => m.value === dayMood.mood)?.label : 'No data'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6 days ago</span>
              <span>Today</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
