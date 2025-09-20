import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import TEDTalkPlayer from "@/components/media/TEDTalkPlayer";
import SpotifyPlayer from "@/components/media/SpotifyPlayer";

interface MediaSectionProps {
  preview?: boolean;
}

export default function MediaSection({ preview = false }: MediaSectionProps) {
  const [activeTab, setActiveTab] = useState("movies");

  const { data: movies } = useQuery({
    queryKey: ["/api/media/movies"],
    queryFn: async () => {
      const response = await fetch("/api/media/movies");
      return response.json();
    },
  });

  const { data: music } = useQuery({
    queryKey: ["/api/media/music"],
    queryFn: async () => {
      const response = await fetch("/api/media/music");
      return response.json();
    },
  });

  const { data: tedTalks } = useQuery({
    queryKey: ["/api/media/ted-talks"],
    queryFn: async () => {
      const response = await fetch("/api/media/ted-talks");
      return response.json();
    },
  });

  const displayItems = (items: any[], limit?: number) => {
    return limit ? items?.slice(0, limit) : items;
  };

  return (
    <Card className="magical-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif font-semibold text-primary flex items-center">
            <i className="fas fa-star mr-2"></i>
            Uplifting Media
          </h3>
          {preview && (
            <Link href="/media">
              <Button variant="outline" size="sm" data-testid="view-all-media">
                View All
              </Button>
            </Link>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movies" data-testid="tab-movies">Movies</TabsTrigger>
            <TabsTrigger value="music" data-testid="tab-music">Music</TabsTrigger>
            <TabsTrigger value="tedtalks" data-testid="tab-tedtalks">TED Talks</TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-6">
            <div className={`grid ${preview ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'} gap-4`}>
              {displayItems(movies || [], preview ? 3 : undefined)?.map((movie) => (
                <YouTubePlayer
                  key={movie.id}
                  videoId={movie.videoId}
                  title={movie.title}
                  thumbnail={movie.thumbnail}
                  genre={movie.genre}
                  description={movie.description}
                  className="h-full"
                  data-testid={`movie-${movie.id}`}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-6">
            <div className="space-y-3">
              {displayItems(music || [], preview ? 3 : undefined)?.map((song) => (
                <SpotifyPlayer
                  key={song.id}
                  trackId={song.trackId}
                  title={song.title}
                  artist={song.artist}
                  mood={song.mood}
                  albumArt={song.albumArt}
                  previewUrl={song.previewUrl}
                  data-testid={`song-${song.id}`}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tedtalks" className="mt-6">
            <div className="space-y-3">
              {displayItems(tedTalks || [], preview ? 3 : undefined)?.map((talk) => (
                <TEDTalkPlayer
                  key={talk.id}
                  talkId={talk.talkId}
                  title={talk.title}
                  speaker={talk.speaker}
                  duration={talk.duration}
                  thumbnail={talk.thumbnail}
                  description={talk.description}
                  data-testid={`tedtalk-${talk.id}`}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {preview && (
          <div className="mt-4 text-center">
            <Link href="/media">
              <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="view-more-media">
                <i className="fas fa-chevron-down mr-2"></i>View More
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
