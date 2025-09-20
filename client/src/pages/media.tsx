import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import YouTubePlayer from "@/components/media/YouTubePlayer";
import TEDTalkPlayer from "@/components/media/TEDTalkPlayer";
import SpotifyPlayer from "@/components/media/SpotifyPlayer";
import ShortsPlayer from "@/components/media/ShortsPlayer";

export default function Media() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("movies");
  const [movieSearch, setMovieSearch] = useState("");
  const [shortsSearch, setShortsSearch] = useState("");

  const { data: movies } = useQuery({
    queryKey: movieSearch ? ["/api/media/movies/search", movieSearch] : ["/api/media/movies"],
    queryFn: async ({ queryKey }) => {
      const [base, q] = queryKey as [string, string | undefined];
      const url = q ? `${base}?q=${encodeURIComponent(q)}` : base;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load movies");
      return res.json();
    },
  });

  const { data: music } = useQuery({
    queryKey: ["/api/media/music"],
  });

  const { data: tedTalks } = useQuery({
    queryKey: ["/api/media/ted-talks"],
  });

  const { data: shorts } = useQuery({
    queryKey: ["/api/media/shorts", shortsSearch],
    queryFn: async ({ queryKey }) => {
      const [, q] = queryKey as [string, string];
      const url = q ? `/api/media/shorts?q=${encodeURIComponent(q)}` : `/api/media/shorts`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load shorts");
      return res.json();
    },
  });

  const filterItems = (items: any[]) => {
    if (!searchQuery) return items || [];
    return items?.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-play-circle text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Uplifting Media
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover inspiring movies, uplifting music, and motivational talks to brighten your day and nourish your soul.
        </p>
      </div>

      {/* Search */}
      <Card className="magical-border mb-8 fade-in">
        <CardContent className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              placeholder="Search movies, music, speakers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-media"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="movies" className="flex items-center" data-testid="tab-movies">
            <i className="fas fa-film mr-2"></i>
            Movies
          </TabsTrigger>
          <TabsTrigger value="music" className="flex items-center" data-testid="tab-music">
            <i className="fas fa-music mr-2"></i>
            Music
          </TabsTrigger>
          <TabsTrigger value="tedtalks" className="flex items-center" data-testid="tab-talks">
            <i className="fas fa-video mr-2"></i>
            TED Talks
          </TabsTrigger>
          <TabsTrigger value="shorts" className="flex items-center" data-testid="tab-shorts">
            <i className="fas fa-bolt mr-2"></i>
            Shorts
          </TabsTrigger>
        </TabsList>

        {/* TED Talks (first) */}
        <TabsContent value="tedtalks" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filterItems(tedTalks || []).map((talk) => (
              <TEDTalkPlayer
                key={talk.id}
                talkId={talk.talkId}
                title={talk.title}
                speaker={talk.speaker}
                duration={talk.duration}
                thumbnail={talk.thumbnail}
                description={talk.description}
                data-testid={`talk-${talk.id}`}
              />
            ))}
          </div>

          {filterItems(tedTalks || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-video text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {searchQuery ? "No TED talks match your search" : "Loading inspiring TED talks..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Music (second) */}
        <TabsContent value="music" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItems(music || []).map((song) => (
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

          {filterItems(music || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-music text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {searchQuery ? "No music matches your search" : "Loading uplifting music..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Movies (third) with search */}
        <TabsContent value="movies" className="fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search movies on YouTube (e.g., uplifting documentaries)"
              value={movieSearch}
              onChange={(e) => setMovieSearch(e.target.value)}
              className="max-w-xl"
            />
            {movieSearch && (
              <Button variant="outline" onClick={() => setMovieSearch("")}>Clear</Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filterItems(movies || []).map((movie) => (
              <YouTubePlayer
                key={movie.id}
                videoId={movie.videoId}
                title={movie.title}
                thumbnail={movie.thumbnail}
                genre={movie.genre}
                description={movie.description}
                data-testid={`movie-${movie.id}`}
              />
            ))}
          </div>
          
          {filterItems(movies || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-film text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {movieSearch ? "No movies match your search" : "Loading inspiring movies..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shorts (fourth) */}
        <TabsContent value="shorts" className="fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search funny shorts"
              value={shortsSearch}
              onChange={(e) => setShortsSearch(e.target.value)}
              className="max-w-xl"
            />
            {shortsSearch && (
              <Button variant="outline" onClick={() => setShortsSearch("")}>Clear</Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {(shorts || []).map((s: any) => (
              <ShortsPlayer key={s.id} videoId={s.videoId} title={s.title} channel={s.channel} />
            ))}
          </div>
          {(shorts || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-bolt text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">{shortsSearch ? "No shorts match your search" : "Loading shorts..."}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Featured Section */}
      <Card className="magical-border glow-effect mt-12 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary flex items-center justify-center">
            <i className="fas fa-star mr-2"></i>
            ✨ Daily Inspiration ✨
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center max-w-2xl mx-auto">
            <blockquote className="text-lg font-serif italic mb-4 text-foreground">
              "The only way to make sense out of change is to plunge into it, move with it, and join the dance."
            </blockquote>
            <cite className="text-secondary font-medium">- Alan Watts</cite>
            <p className="text-sm text-muted-foreground mt-4">
              Explore more wisdom in our curated collection of transformative content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
