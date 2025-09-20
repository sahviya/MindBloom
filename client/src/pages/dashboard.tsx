import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BreathingExercise from "@/components/BreathingExercise";
import AICompanion from "@/components/AICompanion";
import JournalEditor from "@/components/JournalEditor";
import MoodTracker from "@/components/MoodTracker";
import MediaSection from "@/components/MediaSection";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { getQueryFn } from "@/lib/queryClient";

interface Quote {
  quote: string;
  author: string;
  theme: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const { data: quote } = useQuery({
    queryKey: ["/api/content/quote"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: communityPosts } = useQuery({
    queryKey: ["/api/community/posts?limit=3"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (quote && typeof quote === 'object') {
      setCurrentQuote(quote as Quote);
    }
  }, [quote]);

  const userName = (user as any)?.firstName || (user as any)?.email?.split("@")[0] || "Friend";

  return (
    <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <section className="mb-12 fade-in">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
            Welcome back, {userName}! ✨
          </h2>
          <p className="text-muted-foreground text-lg">Your magical wellness journey continues today</p>
        </div>

        {/* Motivational Quote */}
        {currentQuote && (
          <Card className="magical-border glow-effect mb-8">
            <CardContent className="relative p-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20"></div>
              <div className="relative z-10 text-center">
                <blockquote className="text-2xl font-serif italic mb-4 text-primary-foreground">
                  "{currentQuote.quote}"
                </blockquote>
                <cite className="text-secondary font-medium">- {currentQuote.author}</cite>
              </div>
              <div className="absolute top-4 right-4 text-secondary">
                <i className="fas fa-quote-right text-2xl opacity-30"></i>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Breathing Exercise */}
      <section className="mb-12 fade-in">
        <BreathingExercise />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Journal */}
          <section className="fade-in">
            <Card className="magical-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-semibold text-primary flex items-center">
                    <i className="fas fa-feather-alt mr-2"></i>
                    Quick Journal Entry
                  </h3>
                  <Link href="/journal">
                    <Button variant="outline" size="sm" data-testid="view-journal">
                      <i className="fas fa-external-link-alt mr-2"></i>
                      Full Journal
                    </Button>
                  </Link>
                </div>
                <JournalEditor simplified={true} />
              </CardContent>
            </Card>
          </section>

          {/* Media Recommendations Preview */}
          <section className="fade-in">
            <MediaSection preview={true} />
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* AI Companion */}
          <section className="fade-in">
            <AICompanion />
          </section>

          {/* Quick Actions */}
          <section className="fade-in">
            <Card className="magical-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-serif font-semibold text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/community">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      data-testid="quick-community"
                    >
                      <i className="fas fa-users text-primary mr-3"></i>
                      Community Feed
                    </Button>
                  </Link>
                  <Link href="/books">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      data-testid="quick-books"
                    >
                      <i className="fas fa-book-open text-secondary mr-3"></i>
                      Self-Help Library
                    </Button>
                  </Link>
                  <Link href="/shopping">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      data-testid="quick-shopping"
                    >
                      <i className="fas fa-shopping-bag text-accent mr-3"></i>
                      Comfort Shopping
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      data-testid="quick-profile"
                    >
                      <i className="fas fa-user-circle text-primary mr-3"></i>
                      Profile Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Mood Tracker */}
          <section className="fade-in">
            <MoodTracker />
          </section>
        </div>
      </div>

      {/* Community Feed Preview */}
      {communityPosts && communityPosts.length > 0 && (
        <section className="mt-12 fade-in">
          <Card className="magical-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-semibold text-primary flex items-center">
                  <i className="fas fa-heart mr-2"></i>
                  Community Support
                </h3>
                <Link href="/community">
                  <Button variant="outline" data-testid="view-community">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityPosts.slice(0, 3).map((post: any) => (
                  <Card key={post.id} className="hover:bg-accent/5 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 genie-gradient rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">
                            {post.user?.firstName?.[0] || post.user?.email?.[0] || "U"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {post.user?.firstName || post.user?.email?.split("@")[0] || "Anonymous"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mb-3 line-clamp-3">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <i className="fas fa-heart"></i>
                            <span>{post.likesCount || 0}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <i className="fas fa-comment"></i>
                            <span>{post.commentsCount || 0}</span>
                          </button>
                        </div>
                        <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                          Send Support
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
        <Link href="/journal">
          <Button
            size="lg"
            className="w-14 h-14 genie-gradient rounded-full shadow-2xl hover:scale-110 transition-transform glow-effect"
            data-testid="fab-journal"
          >
            <i className="fas fa-plus text-primary-foreground text-xl"></i>
          </Button>
        </Link>
      </div>
    </main>
  );
}
