import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BreathingExerciseProps {
  className?: string;
}

export default function BreathingExercise({ className = "" }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  const toggleBreathing = () => {
    setIsActive(!isActive);
    if (!isActive) {
      startBreathingCycle();
    }
  };

  const startBreathingCycle = () => {
    // 4-7-8 breathing pattern: inhale 4s, hold 7s, exhale 8s
    const cycle = () => {
      // Inhale phase
      setPhase("inhale");
      setTimeout(() => {
        // Hold phase
        setPhase("hold");
        setTimeout(() => {
          // Exhale phase
          setPhase("exhale");
          setTimeout(() => {
            if (isActive) {
              cycle(); // Continue the cycle
            }
          }, 8000); // 8 seconds exhale
        }, 7000); // 7 seconds hold
      }, 4000); // 4 seconds inhale
    };
    cycle();
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In...";
      case "hold":
        return "Hold...";
      case "exhale":
        return "Breathe Out...";
      default:
        return "Ready to Begin";
    }
  };

  return (
    <Card className={`magical-border ${className}`}>
      <CardContent className="p-8">
        <div className="text-center">
          <h3 className="text-2xl font-serif font-semibold mb-6 text-primary flex items-center justify-center">
            <i className="fas fa-wind mr-2"></i>
            ✨ Mindful Breathing ✨
          </h3>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div 
                className={`w-32 h-32 rounded-full genie-gradient flex items-center justify-center transition-all duration-1000 ${
                  isActive ? 'breathing-circle glow-effect' : 'opacity-70'
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-background/50 flex items-center justify-center">
                  <i className="fas fa-wind text-2xl text-primary-foreground"></i>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <p className="text-sm text-muted-foreground font-medium" data-testid="breathing-phase">
                  {isActive ? getPhaseText() : "Ready to Begin"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleBreathing}
              className={isActive ? "bg-destructive hover:bg-destructive/90" : "genie-gradient hover:opacity-90"}
              data-testid="breathing-toggle"
            >
              <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'} mr-2`}></i>
              {isActive ? 'Pause Session' : 'Start Session'}
            </Button>
            <Button variant="outline" data-testid="breathing-customize">
              <i className="fas fa-cog mr-2"></i>
              Customize
            </Button>
          </div>

          {/* Breathing Guide */}
          {isActive && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Following the 4-7-8 breathing pattern for deep relaxation
              </p>
              <div className="flex justify-center space-x-6 mt-2 text-xs">
                <span className={phase === "inhale" ? "text-primary font-semibold" : "text-muted-foreground"}>
                  Inhale (4s)
                </span>
                <span className={phase === "hold" ? "text-primary font-semibold" : "text-muted-foreground"}>
                  Hold (7s)
                </span>
                <span className={phase === "exhale" ? "text-primary font-semibold" : "text-muted-foreground"}>
                  Exhale (8s)
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
