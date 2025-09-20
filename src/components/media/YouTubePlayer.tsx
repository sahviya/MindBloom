import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  thumbnail: string;
  genre?: string;
  description?: string;
  className?: string;
}

export default function YouTubePlayer({ 
  videoId, 
  title, 
  thumbnail, 
  genre, 
  description,
  className = ""
}: YouTubePlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <>
      <Card className={`group hover:magical-border hover:glow-effect transition-all cursor-pointer ${className}`}>
        <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 group-hover:scale-105 transition-transform flex items-center justify-center relative">
            <img 
              src={thumbnail} 
              alt={`${title} poster`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
              <i className="fas fa-play text-6xl text-primary/50"></i>
            </div>
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-play text-white text-xl ml-1"></i>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{title}</h3>
          {genre && (
            <Badge variant="outline" className="text-xs">
              {genre}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-serif">{title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {description && (
              <p className="text-muted-foreground mt-4 text-sm">{description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

