import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Community() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentContent, setCommentContent] = useState("");
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Allow viewing the community feed without forcing login
  useEffect(() => {
    // no redirect here; interactions will prompt auth in toasts
  }, [isAuthenticated, isLoading]);

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community/posts?limit=50"],
    // public endpoint; don't require auth to view
    queryFn: async () => {
      const res = await fetch("/api/community/posts?limit=50");
      return res.json();
    },
    enabled: true,
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/community/posts", selectedPost?.id, "comments"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/community/posts/${selectedPost.id}/comments`);
      return response.json();
    },
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/community/posts", { content });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been shared with the community!",
      });
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        return await apiRequest("DELETE", `/api/community/posts/${postId}/like`);
      } else {
        return await apiRequest("POST", `/api/community/posts/${postId}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return await apiRequest("POST", `/api/community/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
      setCommentContent("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/community/posts", selectedPost?.id, "comments"] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Required",
        description: "Please write something to share.",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPostContent);
  };

  const handleLike = (post: any) => {
    likeMutation.mutate({
      postId: post.id,
      isLiked: post.userLiked,
    });
  };

  const handleComment = () => {
    if (!commentContent.trim()) return;
    commentMutation.mutate({
      postId: selectedPost.id,
      content: commentContent,
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading || postsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="w-16 h-16 genie-gradient rounded-full animate-pulse glow-effect flex items-center justify-center">
            <i className="fas fa-users text-primary-foreground text-xl"></i>
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
            <i className="fas fa-users text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Healing Community
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Share your journey, support others, and grow together in a safe space of understanding and compassion.
        </p>
      </div>

      {/* Create Post */}
      <Card className="magical-border mb-8 fade-in">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="genie-gradient text-primary-foreground">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">Share Your Journey</h3>
              <p className="text-sm text-muted-foreground">
                What's on your mind, {user?.firstName || "friend"}?
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your thoughts, progress, or ask for support..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-20 resize-none"
            data-testid="new-post-content"
          />
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" disabled>
                <i className="fas fa-image mr-2"></i>Photo
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <i className="fas fa-smile mr-2"></i>Mood
              </Button>
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || createPostMutation.isPending}
              className="genie-gradient hover:opacity-90"
              data-testid="create-post"
            >
              {createPostMutation.isPending ? (
                <i className="fas fa-spinner animate-spin mr-2"></i>
              ) : (
                <i className="fas fa-paper-plane mr-2"></i>
              )}
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {!posts || posts.length === 0 ? (
          <Card className="magical-border">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 genie-gradient rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                <i className="fas fa-heart text-primary-foreground text-2xl"></i>
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2 text-muted-foreground">
                Be the First to Share
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start the conversation by sharing your thoughts, experiences, or offering support to the community.
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: any) => (
            <Card key={post.id} className="magical-border hover:glow-effect transition-all fade-in">
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.user?.profileImageUrl} />
                    <AvatarFallback className="genie-gradient text-primary-foreground">
                      {post.user?.firstName?.[0] || post.user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">
                        {post.user?.firstName || post.user?.email?.split("@")[0] || "Anonymous"}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        Community Member
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post)}
                      className={`flex items-center space-x-2 ${
                        post.userLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-primary"
                      }`}
                      data-testid={`like-post-${post.id}`}
                    >
                      <i className={`fas fa-heart ${post.userLiked ? "text-red-500" : ""}`}></i>
                      <span>{post.likesCount || 0}</span>
                    </Button>
                    <Dialog onOpenChange={(open) => open && setSelectedPost(post)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                          data-testid={`comment-post-${post.id}`}
                        >
                          <i className="fas fa-comment"></i>
                          <span>{post.commentsCount || 0}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center text-primary">
                            <i className="fas fa-comments mr-2"></i>
                            Comments
                          </DialogTitle>
                        </DialogHeader>
                        
                        {/* Original Post */}
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={post.user?.profileImageUrl} />
                                <AvatarFallback className="genie-gradient text-primary-foreground text-xs">
                                  {post.user?.firstName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-sm">
                                  {post.user?.firstName || "Anonymous"}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelativeTime(post.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm">{post.content}</p>
                          </CardContent>
                        </Card>

                        {/* Comments */}
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {comments?.map((comment: any) => (
                            <div key={comment.id} className="flex items-start space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.user?.profileImageUrl} />
                                <AvatarFallback className="genie-gradient text-primary-foreground text-xs">
                                  {comment.user?.firstName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-sm">
                                      {comment.user?.firstName || "Anonymous"}
                                    </h4>
                                    <span className="text-xs text-muted-foreground">
                                      {formatRelativeTime(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Comment */}
                        <div className="flex space-x-3 pt-4 border-t">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user?.profileImageUrl} />
                            <AvatarFallback className="genie-gradient text-primary-foreground text-xs">
                              {user?.firstName?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="Write a supportive comment..."
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              className="min-h-20 resize-none"
                              data-testid="comment-input"
                            />
                            <Button
                              onClick={handleComment}
                              disabled={!commentContent.trim() || commentMutation.isPending}
                              size="sm"
                              className="genie-gradient hover:opacity-90"
                              data-testid="post-comment"
                            >
                              {commentMutation.isPending ? (
                                <i className="fas fa-spinner animate-spin mr-2"></i>
                              ) : (
                                <i className="fas fa-paper-plane mr-2"></i>
                              )}
                              Comment
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    data-testid={`support-post-${post.id}`}
                  >
                    <i className="fas fa-hands-helping mr-2"></i>
                    Send Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}