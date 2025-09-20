import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useEffect } from "react";
declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      // no client id configured; skip script load
      return;
    }
    if (window.google && window.google.accounts?.id) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const res = await apiRequest("POST", "/api/auth/google", { idToken: response.credential });
            const data = await res.json();
            if (data?.token) {
              localStorage.setItem("auth_token", data.token);
              navigate("/");
              location.reload();
            }
          } catch (e) {
            setError("Google sign-in failed");
          }
        },
      });
      const el = document.getElementById("googleSignIn");
      if (el) {
        window.google?.accounts.id.renderButton(el, { theme: "filled", size: "large", width: 320 });
      }
    };
    document.body.appendChild(script);
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const res = await apiRequest("POST", endpoint, { email, password, name: email.split("@")[0] });
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("auth_token", data.token);
        navigate("/");
        location.reload();
      } else {
        setError(isSignup ? "Signup failed" : "Login failed");
      }
    } catch (err: any) {
      setError(err?.message || (isSignup ? "Signup failed" : "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md magical-border backdrop-blur">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 genie-gradient rounded-full flex items-center justify-center glow-effect">
              <i className="fas fa-magic text-primary-foreground"></i>
            </div>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-center mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            {isSignup ? "Start your MindBloom journey" : "Sign in to continue"}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded border bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded border bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (isSignup ? "Creating…" : "Signing in…") : (isSignup ? "Create account" : "Sign in")}
            </Button>
          </form>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div id="googleSignIn" className="flex justify-center" />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Set VITE_GOOGLE_CLIENT_ID in .env to enable Google Sign‑In
            </div>
          )}
          <p className="text-center text-sm mt-6">
            {isSignup ? "Already have an account?" : "New here?"} {" "}
            <button className="underline" onClick={() => setIsSignup((v) => !v)}>
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


