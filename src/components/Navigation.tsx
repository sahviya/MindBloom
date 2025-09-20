import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import mindbloomLogo from "@/assets/mindbloom-logo.png";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "bn", name: "বাংলা" },
  { code: "mr", name: "मराठी" },
  { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "or", name: "ଓଡ଼ିଆ" },
  { code: "ur", name: "اردو" },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth() as any;
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("hi");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/journal", label: "Journal", icon: "fas fa-feather-alt" },
    { path: "/community", label: "Community", icon: "fas fa-users" },
    { path: "/snap", label: "Snap", icon: "fas fa-camera" },
    { path: "/genie", label: "Ur Genie", icon: "fas fa-robot" },
    { path: "/media", label: "Media", icon: "fas fa-play-circle" },
    { path: "/games", label: "Games", icon: "fas fa-gamepad" },
    { path: "/books", label: "Books", icon: "fas fa-book-open" },
    { path: "/shopping", label: "Shopping", icon: "fas fa-shopping-bag" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 genie-gradient rounded-full flex items-center justify-center glow-effect shrink-0">
                <i className="fas fa-magic text-primary-foreground text-lg"></i>
              </div>
              {!isCollapsed && (
                <h1 className="text-xl font-serif font-bold text-primary">
                  MindBloom
                </h1>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
              data-testid="sidebar-toggle"
            >
              <i
                className={`fas fa-${
                  isCollapsed ? "angle-right" : "angle-left"
                }`}
              ></i>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start rounded-2xl px-3 py-3 text-sm transition-all",
                    "border border-transparent",
                    !isActive && "text-muted-foreground hover:bg-accent/10 hover:text-primary",
                    isActive && "genie-gradient text-primary-foreground shadow-md",
                    isCollapsed && "px-2 py-2"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive ? (
                    <span className={cn(
                      "mr-3 inline-flex items-center justify-center",
                      "w-6 h-6 rounded-md bg-white/20 text-white"
                    )}>
                      <i className={`${item.icon}`}></i>
                    </span>
                  ) : (
                    <i
                      className={cn(
                        `${item.icon} w-4 h-4`,
                        !isCollapsed && "mr-3"
                      )}
                    ></i>
                  )}
                  {!isCollapsed && (
                    <span className={cn("tracking-wide", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start p-2", isCollapsed && "justify-center")}
                data-testid="profile-menu"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="genie-gradient text-primary-foreground">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 text-left overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {user?.firstName || user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "start"} side="right">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("auth_token");
                  window.location.href = "/login";
                }}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isCollapsed && (
            <div className="space-y-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full" data-testid="language-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" data-testid="theme-selector">
                    <i className="fas fa-palette mr-2"></i>
                    Theme
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <i className="fas fa-sun mr-2"></i>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <i className="fas fa-moon mr-2"></i>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <i className="fas fa-desktop mr-2"></i>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center py-2 px-3",
                  location === item.path ? "text-primary" : "text-muted-foreground",
                )}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} mb-1`}></i>
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
