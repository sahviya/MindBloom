import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिंदी" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
];

const avatarOptions = [
  "🧙‍♀️", "🧙‍♂️", "🌟", "✨", "🦋", "🌸", "🌙", "💫", "🕊️", "🌺",
  "🦄", "🐙", "🦊", "🐨", "🐼", "🦁", "🐸", "🦉", "🌈", "🎭"
];

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState("🌟");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      theme: user?.theme as "light" | "dark" | "system" || "dark",
      language: user?.language || "en",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        theme: user.theme as "light" | "dark" | "system" || "dark",
        language: user.language || "en",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Your profile has been updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Update theme immediately if changed
      const formData = form.getValues();
      if (formData.theme && formData.theme !== theme) {
        setTheme(formData.theme);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-16 h-16 genie-gradient rounded-full animate-pulse glow-effect flex items-center justify-center">
            <i className="fas fa-user text-primary-foreground text-xl"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-user-circle text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Customize your MindBloom experience and make it truly yours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="magical-border glow-effect">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="genie-gradient text-primary-foreground text-2xl">
                    {selectedAvatar}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl font-serif">
                {user?.firstName || user?.email?.split("@")[0] || "Wellness Seeker"}
              </CardTitle>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge className="genie-gradient">Community Member</Badge>
                <Badge variant="outline">Joined {new Date(user?.createdAt || Date.now()).getFullYear()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Choose Your Avatar</h4>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg hover:bg-accent transition-colors ${
                        selectedAvatar === avatar ? 'bg-primary/20 scale-110' : ''
                      }`}
                      data-testid={`avatar-${avatar}`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Theme</span>
                  <Badge variant="outline">{theme}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">
                    {languages.find(l => l.code === user?.language)?.name || "English"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
              <TabsTrigger value="preferences" data-testid="tab-preferences">Preferences</TabsTrigger>
              <TabsTrigger value="privacy" data-testid="tab-privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <Card className="magical-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-user mr-2"></i>
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your first name" data-testid="first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your last name" data-testid="last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Label className="text-sm text-muted-foreground">
                          Email Address (cannot be changed)
                        </Label>
                        <Input value={user?.email || ""} disabled className="mt-2" />
                      </div>

                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="genie-gradient hover:opacity-90"
                        data-testid="save-personal"
                      >
                        {updateProfileMutation.isPending ? (
                          <i className="fas fa-spinner animate-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-save mr-2"></i>
                        )}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card className="magical-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-cog mr-2"></i>
                    App Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="theme-select">
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">
                                  <div className="flex items-center">
                                    <i className="fas fa-sun mr-2"></i>
                                    Light Mode
                                  </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                  <div className="flex items-center">
                                    <i className="fas fa-moon mr-2"></i>
                                    Dark Mode
                                  </div>
                                </SelectItem>
                                <SelectItem value="system">
                                  <div className="flex items-center">
                                    <i className="fas fa-desktop mr-2"></i>
                                    System Default
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="language-select">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.code} value={lang.code}>
                                    {lang.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="genie-gradient hover:opacity-90"
                        data-testid="save-preferences"
                      >
                        {updateProfileMutation.isPending ? (
                          <i className="fas fa-spinner animate-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-save mr-2"></i>
                        )}
                        Save Preferences
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <Card className="magical-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Data Export</h4>
                        <p className="text-sm text-muted-foreground">Download all your data</p>
                      </div>
                      <Button variant="outline" data-testid="export-data">
                        <i className="fas fa-download mr-2"></i>
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Community Visibility</h4>
                        <p className="text-sm text-muted-foreground">Control how others see your profile</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">AI Data Usage</h4>
                        <p className="text-sm text-muted-foreground">Allow AI to learn from your interactions</p>
                      </div>
                      <Button variant="outline">
                        <i className="fas fa-toggle-on mr-2 text-primary"></i>
                        Enabled
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-destructive/20">
                    <h4 className="font-medium text-destructive mb-4 flex items-center">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Danger Zone
                    </h4>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        data-testid="delete-account"
                      >
                        <i className="fas fa-user-times mr-2"></i>
                        Delete Account
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      data-testid="logout"
                    >
                      <a href="/api/logout">
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Sign Out
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
