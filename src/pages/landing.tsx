import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 genie-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-secondary/30 rounded-full float"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-primary/20 rounded-full float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-accent/25 rounded-full float" style={{ animationDelay: '2s' }}></div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 genie-gradient rounded-full flex items-center justify-center glow-effect">
              <i className="fas fa-magic text-primary-foreground text-3xl"></i>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6">
            <span className="genie-gradient bg-clip-text text-transparent">MindBloom</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Your magical wellness companion powered by AI. Transform your mental health journey with 
            personalized support, community connection, and ancient wisdom.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <Card className="magical-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 genie-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-robot text-primary-foreground"></i>
                </div>
                <h3 className="font-serif font-semibold mb-2">AI Genie Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal AI companion offering 24/7 support and wisdom
                </p>
              </CardContent>
            </Card>

            <Card className="magical-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 genie-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-primary-foreground"></i>
                </div>
                <h3 className="font-serif font-semibold mb-2">Healing Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with others on similar journeys of growth and healing
                </p>
              </CardContent>
            </Card>

            <Card className="magical-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 genie-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-heart text-primary-foreground"></i>
                </div>
                <h3 className="font-serif font-semibold mb-2">Holistic Wellness</h3>
                <p className="text-sm text-muted-foreground">
                  Journal, meditate, track moods, and discover uplifting content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="genie-gradient hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-effect"
            asChild
            data-testid="login-button"
          >
            <a href="/login">
              <i className="fas fa-sparkles mr-2"></i>
              Begin Your Journey
            </a>
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            Free to start • No credit card required • Secure authentication
          </p>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-6 genie-gradient bg-clip-text text-transparent">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              MindBloom combines cutting-edge AI with proven wellness practices to create 
              a magical experience tailored just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "fas fa-feather-alt", title: "Smart Journaling", desc: "AI-powered insights from your daily reflections" },
              { icon: "fas fa-wind", title: "Breathing Exercises", desc: "Guided meditation and mindfulness practices" },
              { icon: "fas fa-chart-line", title: "Mood Tracking", desc: "Visualize your emotional journey over time" },
              { icon: "fas fa-book-open", title: "Wisdom Library", desc: "Curated self-help books and inspiring content" },
              { icon: "fas fa-gamepad", title: "Healing Games", desc: "Fun activities designed to boost your mood" },
              { icon: "fas fa-shopping-bag", title: "Comfort Shopping", desc: "Positive distractions and self-care suggestions" },
            ].map((feature, index) => (
              <Card key={index} className="magical-border hover:glow-effect transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 genie-gradient rounded-full flex items-center justify-center mb-4">
                    <i className={`${feature.icon} text-primary-foreground`}></i>
                  </div>
                  <h3 className="font-serif font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-card/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Transform Your Wellness Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have discovered the magic of mindful living
          </p>
          <Button
            size="lg"
            className="genie-gradient hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-effect"
            asChild
            data-testid="cta-login-button"
          >
            <a href="/login">
              <i className="fas fa-magic mr-2"></i>
              Start Your Free Journey
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
