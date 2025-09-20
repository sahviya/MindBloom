import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, register as registerHandler, login as loginHandler, googleLogin } from "./auth";
import { chatWithGenie, analyzeMoodFromText, generateMotivationalQuote } from "./gemini";
import { 
  insertJournalEntrySchema, 
  insertCommunityPostSchema, 
  insertPostCommentSchema,
  insertMoodEntrySchema,
  insertBookReadingSchema,
  insertBookBookmarkSchema,
  insertBookHighlightSchema
} from "@shared/schema";
import { z } from "zod";
import { readdir } from "fs/promises";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from client/public
  app.use('/books', express.static(join(process.cwd(), 'client', 'public', 'books')));
  app.use('/ted-thumbnails', express.static(join(process.cwd(), 'client', 'public', 'ted-thumbnails')));
  
  // Auth routes (local JWT)
  app.post('/api/auth/register', registerHandler);
  app.post('/api/auth/login', loginHandler);
  app.post('/api/auth/google', googleLogin);

  // Current user
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.patch('/api/user/profile', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const updates = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...updates,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Journal routes
  app.get('/api/journal', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const entryData = insertJournalEntrySchema.parse({
        ...req.body,
        userId,
      });

      // Analyze mood from content
      const moodAnalysis = await analyzeMoodFromText(entryData.content);
      entryData.mood = moodAnalysis.mood;

      const entry = await storage.createJournalEntry(entryData);
      
      // Also create a mood entry
      await storage.createMoodEntry({
        userId,
        mood: moodAnalysis.mood,
        notes: `From journal: ${entryData.title || 'Untitled entry'}`,
      });

      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.patch('/api/journal/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const entryId = req.params.id;
      const updates = req.body;

      if (updates.content) {
        const moodAnalysis = await analyzeMoodFromText(updates.content);
        updates.mood = moodAnalysis.mood;
      }

      const entry = await storage.updateJournalEntry(entryId, userId, updates);
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  app.delete('/api/journal/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const entryId = req.params.id;
      
      const success = await storage.deleteJournalEntry(entryId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Community routes
  app.get('/api/community/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getCommunityPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { imageBase64, ...bodyData } = req.body;
      
      let imageUrl = null;
      
      // Handle base64 image if provided
      if (imageBase64 && typeof imageBase64 === 'string') {
        // For now, we'll store the base64 directly as the imageUrl
        // In a production app, you'd upload to a service like Cloudinary or AWS S3
        imageUrl = imageBase64;
      }
      
      const postData = insertCommunityPostSchema.parse({
        ...bodyData,
        userId,
        imageUrl,
      });

      const post = await storage.createCommunityPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.post('/api/community/posts/:id/like', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      
      const success = await storage.likeCommunityPost(userId, postId);
      res.json({ success });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/community/posts/:id/like', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      
      const success = await storage.unlikeCommunityPost(userId, postId);
      res.json({ success });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.get('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const postId = req.params.id;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/community/posts/:id/comments', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const postId = req.params.id;
      const commentData = insertPostCommentSchema.parse({
        ...req.body,
        userId,
        postId,
      });

      const comment = await storage.createPostComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Mood routes
  app.get('/api/mood', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const days = parseInt(req.query.days as string) || 7;
      
      const moods = await storage.getMoodEntries(userId, days);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.post('/api/mood', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });

      const mood = await storage.createMoodEntry(moodData);
      res.json(mood);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  // AI routes
  app.get('/api/ai/conversations', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const conversations = await storage.getAiConversations(userId, limit);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/ai/chat', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await chatWithGenie(message, context);
      
      // Store the conversation
      await storage.createAiConversation({
        userId,
        message,
        response: response.message,
      });

      res.json(response);
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Content routes
  app.get('/api/content/quote', async (req, res) => {
    try {
      const quote = await generateMotivationalQuote();
      res.json(quote);
    } catch (error) {
      console.error("Error generating quote:", error);
      res.status(500).json({ message: "Failed to generate quote" });
    }
  });

  // Media recommendations with embed IDs
  app.get('/api/media/movies', async (req, res) => {
    res.json([
      { 
        id: 1, 
        title: "The Pursuit of Happyness", 
        genre: "Drama • Inspiration", 
        thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
        videoId: "dKi5XoeTN0k", // YouTube video ID
        description: "A struggling salesman takes custody of his son as he's poised to begin a life-changing professional career."
      },
      { 
        id: 2, 
        title: "Soul", 
        genre: "Animation • Philosophy", 
        thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9",
        videoId: "xOsLiwp0A-M", // YouTube video ID
        description: "A musician who has lost his passion for music is transported out of his body and must find his way back."
      },
      { 
        id: 3, 
        title: "Inside Out", 
        genre: "Animation • Emotional", 
        thumbnail: "https://images.unsplash.com/photo-1489599613-e715e6ebe90d",
        videoId: "yRUAzGQ3nSY", // YouTube video ID
        description: "After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions conflict on how best to navigate a new city."
      },
      { 
        id: 4, 
        title: "The Secret Life of Walter Mitty", 
        genre: "Adventure • Inspiration", 
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        videoId: "QD6cy4PBQPI", // YouTube video ID
        description: "When his job along with that of his co-worker are threatened, Walter takes action in the real world embarking on a global journey."
      },
      { 
        id: 5, 
        title: "Good Will Hunting", 
        genre: "Drama • Growth", 
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        videoId: "QSMvyuEeIyw", // YouTube video ID
        description: "Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life."
      },
    ]);
  });

  // YouTube Movies search (uses YOUTUBE_API_KEY)
  app.get('/api/media/movies/search', async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const query = (req.query.q as string) || '';
      if (!apiKey) {
        return res.status(500).json({ message: 'Missing YOUTUBE_API_KEY' });
      }
      if (!query) {
        return res.json([]);
      }

      const params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        q: query,
        maxResults: '24',
        type: 'video',
        videoEmbeddable: 'true',
        safeSearch: 'moderate',
      });
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      const data = await ytRes.json();
      const items = (data.items || []).map((it: any, idx: number) => ({
        id: it.id?.videoId || idx,
        title: it.snippet?.title || 'Untitled',
        genre: it.snippet?.channelTitle || 'YouTube',
        thumbnail: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url,
        videoId: it.id?.videoId,
        description: it.snippet?.description || '',
      }));
      res.json(items);
    } catch (error) {
      console.error('Error searching movies:', error);
      res.status(500).json({ message: 'Failed to search movies' });
    }
  });

  app.get('/api/media/music', async (req, res) => {
    res.json([
      { 
        id: 1, 
        title: "Three Little Birds", 
        artist: "Bob Marley", 
        mood: "Uplifting", 
        trackId: "0JG5IlmQdM6BKlqpxkDW", // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example1"
      },
      { 
        id: 2, 
        title: "Happy", 
        artist: "Pharrell Williams", 
        mood: "Joyful", 
        trackId: "60nZcImufyMA1MKQY3dcC", // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example2"
      },
      { 
        id: 3, 
        title: "Here Comes the Sun", 
        artist: "The Beatles", 
        mood: "Hopeful", 
        trackId: "6dGnYIeXmHdcikdzNNDMm2", // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example3"
      },
      { 
        id: 4, 
        title: "Good Vibrations", 
        artist: "The Beach Boys", 
        mood: "Positive", 
        trackId: "2hZI2AO4gOBlBf4J7kqDkT", // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example4"
      },
      { 
        id: 5, 
        title: "I Can See Clearly Now", 
        artist: "Johnny Nash", 
        mood: "Optimistic", 
        trackId: "0oRL9MD8wWfkdUFdtK6kc", // Spotify track ID
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        previewUrl: "https://p.scdn.co/mp3-preview/example5"
      },
    ]);
  });

  app.get('/api/media/ted-talks', async (req, res) => {
    // Use real YouTube IDs and thumbnails for better visuals
    const talks = [
      {
        id: 1,
        title: "The Power of Vulnerability",
        speaker: "Brené Brown",
        duration: "20:50",
        talkId: "iCvmsMzlF7o",
        thumbnail: "/ted-thumbnails/iCvmsMzlF7o.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/brene_brown_the_power_of_vulnerability",
        description: "Brené Brown studies human connection — our ability to empathize, belong, love."
      },
      {
        id: 2,
        title: "How to Make Stress Your Friend",
        speaker: "Kelly McGonigal",
        duration: "14:28",
        talkId: "RcGyVTAoXEU",
        thumbnail: "/ted-thumbnails/RcGyVTAoXEU.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/kelly_mcgonigal_how_to_make_stress_your_friend",
        description: "Psychologist Kelly McGonigal urges us to see stress as a positive, and introduces us to an unsung mechanism for stress reduction."
      },
      {
        id: 3,
        title: "The Happy Secret to Better Work",
        speaker: "Shawn Achor",
        duration: "12:20",
        talkId: "GXy__kBVq1M",
        thumbnail: "/ted-thumbnails/GXy__kBVq1M.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/shawn_achor_the_happy_secret_to_better_work",
        description: "We believe we should work hard in order to be happy, but could we be thinking about things backwards?"
      },
      {
        id: 4,
        title: "Your Body Language May Shape Who You Are",
        speaker: "Amy Cuddy",
        duration: "21:02",
        talkId: "Ks-_Mh1QhMc",
        thumbnail: "/ted-thumbnails/Ks-_Mh1QhMc.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/amy_cuddy_your_body_language_may_shape_who_you_are",
        description: "Body language affects how others see us, but it may also change how we see ourselves."
      },
      {
        id: 5,
        title: "The Puzzle of Motivation",
        speaker: "Dan Pink",
        duration: "18:36",
        talkId: "rrkrvAUbU9Y",
        thumbnail: "/ted-thumbnails/rrkrvAUbU9Y.jpg",
        embedUrl: "https://embed.ted.com/talks/lang/en/dan_pink_the_puzzle_of_motivation",
        description: "Career analyst Dan Pink examines the puzzle of motivation, starting with a fact that social scientists know but most managers don't."
      },
    ];
    res.json(talks);
  });

  // Shorts/Reels: default to funny shorts; optional ?q= query
  app.get('/api/media/shorts', async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const query = (req.query.q as string) || 'funny shorts';
      if (!apiKey) {
        return res.status(500).json({ message: 'Missing YOUTUBE_API_KEY' });
      }
      const params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        q: query,
        maxResults: '20',
        type: 'video',
        videoEmbeddable: 'true',
        safeSearch: 'moderate',
        videoDuration: 'short',
      });
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      const data = await ytRes.json();
      const items = (data.items || []).map((it: any, idx: number) => ({
        id: it.id?.videoId || idx,
        title: it.snippet?.title || 'Short',
        channel: it.snippet?.channelTitle || 'YouTube',
        thumbnail: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url,
        videoId: it.id?.videoId,
      }));
      res.json(items);
    } catch (error) {
      console.error('Error fetching shorts:', error);
      res.status(500).json({ message: 'Failed to load shorts' });
    }
  });

  app.get('/api/games', async (req, res) => {
    res.json([
      { id: 1, title: "Peaceful Puzzles", description: "Relaxing jigsaw puzzles", icon: "puzzle-piece", url: "https://www.jigsawplanet.com" },
      { id: 2, title: "Garden Zen", description: "Virtual gardening", icon: "seedling", url: "https://www.gardenscapes.com" },
      { id: 3, title: "Meditation Quest", description: "Mindful adventure", icon: "leaf", url: "https://example.com/meditation-quest" },
      { id: 4, title: "Color Therapy", description: "Relaxing coloring", icon: "palette", url: "https://www.colorfy.net" },
      { id: 5, title: "Breathing Bubbles", description: "Breath-guided game", icon: "circle", url: "https://example.com/breathing-bubbles" },
    ]);
  });

  app.get('/api/books', async (req, res) => {
    try {
      const booksDir = join(process.cwd(), 'client', 'public', 'books');
      const files = await readdir(booksDir);
      
      // Filter for PDF files only
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
      
      const books = pdfFiles.map((filename, index) => {
        // Extract title from filename
        const title = filename
          .replace(/\.pdf$/i, '') // Remove .pdf extension
          .replace(/-/g, ' ') // Replace hyphens with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
        
        // Try to extract author from filename if it follows pattern "title-author.pdf"
        let author = "Unknown";
        const authorMatch = filename.match(/-([^-]+)\.pdf$/i);
        if (authorMatch) {
          author = authorMatch[1]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return {
          id: index + 1,
          title,
          author,
          description: `A transformative book about ${title.toLowerCase()}.`,
          pdfUrl: `/books/${filename}`,
          thumbnail: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=center`
        };
      });
      
      res.json(books);
    } catch (error) {
      console.error("Error loading books:", error);
      res.status(500).json({ message: "Failed to load books" });
    }
  });

  // Book reading API endpoints
  app.get('/api/books/:bookId/reading', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      
      const reading = await storage.getBookReading(userId, bookId);
      res.json(reading);
    } catch (error) {
      console.error("Error fetching book reading:", error);
      res.status(500).json({ message: "Failed to fetch book reading" });
    }
  });

  app.post('/api/books/:bookId/reading', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const readingData = insertBookReadingSchema.parse({
        ...req.body,
        userId,
        bookId,
      });

      const reading = await storage.createBookReading(readingData);
      res.json(reading);
    } catch (error) {
      console.error("Error creating book reading:", error);
      res.status(500).json({ message: "Failed to create book reading" });
    }
  });

  app.patch('/api/books/:bookId/reading', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const updates = req.body;

      const reading = await storage.updateBookReading(userId, bookId, updates);
      res.json(reading);
    } catch (error) {
      console.error("Error updating book reading:", error);
      res.status(500).json({ message: "Failed to update book reading" });
    }
  });

  // Book bookmarks API endpoints
  app.get('/api/books/:bookId/bookmarks', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      
      const bookmarks = await storage.getBookBookmarks(userId, bookId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post('/api/books/:bookId/bookmarks', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const bookmarkData = insertBookBookmarkSchema.parse({
        ...req.body,
        userId,
        bookId,
      });

      const bookmark = await storage.createBookBookmark(bookmarkData);
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete('/api/books/:bookId/bookmarks/:bookmarkId', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookmarkId = req.params.bookmarkId;
      
      const success = await storage.deleteBookBookmark(userId, bookmarkId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // Book highlights API endpoints
  app.get('/api/books/:bookId/highlights', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      
      const highlights = await storage.getBookHighlights(userId, bookId);
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });

  app.post('/api/books/:bookId/highlights', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const bookId = req.params.bookId;
      const highlightData = insertBookHighlightSchema.parse({
        ...req.body,
        userId,
        bookId,
      });

      const highlight = await storage.createBookHighlight(highlightData);
      res.json(highlight);
    } catch (error) {
      console.error("Error creating highlight:", error);
      res.status(500).json({ message: "Failed to create highlight" });
    }
  });

  app.delete('/api/books/:bookId/highlights/:highlightId', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.userId;
      const highlightId = req.params.highlightId;
      
      const success = await storage.deleteBookHighlight(userId, highlightId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ message: "Failed to delete highlight" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}      