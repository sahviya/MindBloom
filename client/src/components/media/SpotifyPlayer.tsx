import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SpotifyPlayerProps {
  trackId: string;
  title: string;
  artist: string;
  mood: string;
  albumArt?: string;
  previewUrl?: string;
  className?: string;
}

export default function SpotifyPlayer({ 
  trackId, 
  title, 
  artist, 
  mood, 
  albumArt,
  previewUrl,
  className = ""
}: SpotifyPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Spotify embed URL for the track
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;

  const handlePlayPreview = () => {
    if (previewUrl) {
      const audio = new Audio(previewUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <>
      <Card className={`group hover:magical-border hover:glow-effect transition-all ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform relative overflow-hidden">
              {albumArt ? (
                <img 
                  src={albumArt} 
                  alt={`${title} album art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-music text-primary-foreground text-xl"></i>
              )}
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-sm ${isPlaying ? '' : 'ml-0.5'}`}></i>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-1 mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{artist}</p>
              <Badge className="text-xs genie-gradient">
                {mood}
              </Badge>
            </div>
            <div className="flex space-x-2">
              {previewUrl && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="hover:bg-primary hover:text-primary-foreground"
                  onClick={handlePlayPreview}
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost" 
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={() => setIsOpen(true)}
              >
                <i className="fas fa-external-link-alt"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-serif">{title}</DialogTitle>
            <p className="text-muted-foreground">by {artist}</p>
          </DialogHeader>
          <div className="p-6 pt-4">
            <div className="w-full">
              <iframe
                src={embedUrl}
                width="100%"
                height="152"
                className="rounded-lg"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}







