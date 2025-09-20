import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { useAuth } from "./hooks/useAuth";

// Import your page components
import Landing from "./pages/landing";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";
import Journal from "./pages/journal";
import Community from "./pages/community";
import Snap from "./pages/snap";
import Genie from "./pages/genie";
import Profile from "./pages/profile";
import Media from "./pages/media";
import Games from "./pages/games";
import Books from "./pages/books";
import Shopping from "./pages/shopping";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 genie-gradient rounded-full animate-pulse glow-effect flex items-center justify-center">
          <i className="fas fa-magic text-primary-foreground text-xl"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAuthenticated ? (
        <>
          <div className="flex-1">
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/login" component={Login} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer />
        </>
      ) : (
        <>
          <div className="flex flex-1 min-h-0">
            <Navigation />
            <main className="flex-1 pb-16 md:pb-0">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/journal" component={Journal} />
                <Route path="/community" component={Community} />
                <Route path="/snap" component={Snap} />
                <Route path="/genie" component={Genie} />
                <Route path="/profile" component={Profile} />
                <Route path="/media" component={Media} />
                <Route path="/games" component={Games} />
                <Route path="/books" component={Books} />
                <Route path="/shopping" component={Shopping} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;