import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Games() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: games } = useQuery({
    queryKey: ["/api/games"],
  });

  const filteredGames = games?.filter((game: any) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const gameCategories = [
    {
      name: "Relaxation",
      games: filteredGames.filter((g: any) => ["puzzle-piece", "leaf", "palette"].includes(g.icon)),
      color: "bg-green-500/20 text-green-600 dark:text-green-400",
      icon: "fas fa-leaf"
    },
    {
      name: "Mindfulness", 
      games: filteredGames.filter((g: any) => ["circle", "seedling"].includes(g.icon)),
      color: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      icon: "fas fa-circle"
    },
    {
      name: "Creative",
      games: filteredGames.filter((g: any) => !["puzzle-piece", "leaf", "palette", "circle", "seedling"].includes(g.icon)),
      color: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      icon: "fas fa-paint-brush"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-gamepad text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Healing Games
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover calming, mood-lifting games designed to bring joy, reduce stress, and create moments of peace in your day.
        </p>
      </div>

      {/* Search */}
      <Card className="magical-border mb-8 fade-in">
        <CardContent className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-games"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Game */}
      <Card className="magical-border glow-effect mb-8 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary flex items-center justify-center">
            <i className="fas fa-star mr-2"></i>
            ✨ Featured Game ✨
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6 max-w-2xl mx-auto">
            <div className="w-24 h-24 genie-gradient rounded-2xl flex items-center justify-center">
              <i className="fas fa-puzzle-piece text-primary-foreground text-3xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-serif font-semibold mb-2">Peaceful Puzzles</h3>
              <p className="text-muted-foreground mb-4">
                Immerse yourself in beautiful, calming jigsaw puzzles featuring serene landscapes and inspiring imagery. 
                Perfect for mindful moments and gentle mental exercise.
              </p>
              <div className="flex space-x-2 mb-4">
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">Relaxing</Badge>
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400">Mindful</Badge>
                <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400">Creative</Badge>
              </div>
              <Button className="genie-gradient hover:opacity-90" asChild data-testid="play-featured">
                <a href="https://www.jigsawplanet.com" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-play mr-2"></i>
                  Play Now
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Categories */}
      <div className="space-y-8">
        {gameCategories.map((category) => (
          category.games.length > 0 && (
            <div key={category.name} className="fade-in">
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                  <i className={`${category.icon} text-lg`}></i>
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-primary">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {category.games.length} game{category.games.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.games.map((game: any) => (
                  <Card key={game.id} className="hover:magical-border hover:glow-effect transition-all group" data-testid={`game-${game.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 genie-gradient rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <i className={`fas fa-${game.icon} text-primary-foreground text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-1">{game.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                          <Button 
                            size="sm" 
                            className="genie-gradient hover:opacity-90" 
                            asChild
                            data-testid={`play-${game.id}`}
                          >
                            <a href={game.url} target="_blank" rel="noopener noreferrer">
                              <i className="fas fa-play mr-2"></i>
                              Play
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* No Games Found */}
      {filteredGames.length === 0 && games && (
        <Card className="magical-border fade-in">
          <CardContent className="p-8 text-center">
            <i className="fas fa-gamepad text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-xl font-serif font-semibold mb-2 text-muted-foreground">
              No Games Found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms to find the perfect game for you."
                : "We're working on adding more healing games to your collection."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card className="magical-border mt-12 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary">
            Why Play Healing Games?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-brain text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Mental Wellness</h3>
              <p className="text-sm text-muted-foreground">
                Gentle cognitive exercises that promote focus and mental clarity
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-heart text-blue-600 dark:text-blue-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Stress Relief</h3>
              <p className="text-sm text-muted-foreground">
                Calming activities that help reduce anxiety and promote relaxation
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-smile text-purple-600 dark:text-purple-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Mood Boost</h3>
              <p className="text-sm text-muted-foreground">
                Engaging experiences designed to lift your spirits and bring joy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
