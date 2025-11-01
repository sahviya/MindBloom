import { PrismaClient, type User as PrismaUser, type JournalEntry as PrismaJournalEntry, type CommunityPost as PrismaCommunityPost, type PostComment as PrismaPostComment, type MoodEntry as PrismaMoodEntry, type AiConversation as PrismaAiConversation, type BookReading as PrismaBookReading, type BookBookmark as PrismaBookBookmark, type BookHighlight as PrismaBookHighlight } from "@prisma/client";
import { type InsertJournalEntry, type InsertCommunityPost, type InsertPostComment, type InsertMoodEntry, type InsertAiConversation, type User as SharedUser, type JournalEntry as SharedJournalEntry, type CommunityPost as SharedCommunityPost, type PostComment as SharedPostComment, type MoodEntry as SharedMoodEntry, type AiConversation as SharedAiConversation, type UpsertUser, type InsertBookReading, type BookReading as SharedBookReading, type InsertBookBookmark, type BookBookmark as SharedBookBookmark, type InsertBookHighlight, type BookHighlight as SharedBookHighlight } from "@shared/schema";

const prisma = new PrismaClient();

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<SharedUser | undefined>;
  upsertUser(user: UpsertUser): Promise<SharedUser>;
  
  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<SharedJournalEntry>;
  getJournalEntries(userId: string): Promise<SharedJournalEntry[]>;
  updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<SharedJournalEntry | undefined>;
  deleteJournalEntry(id: string, userId: string): Promise<boolean>;
  
  // Community operations
  createCommunityPost(post: InsertCommunityPost): Promise<SharedCommunityPost>;
  getCommunityPosts(limit?: number, offset?: number): Promise<Array<SharedCommunityPost & { user: SharedUser; likesCount: number; commentsCount: number; userLiked: boolean }>>;
  likeCommunityPost(userId: string, postId: string): Promise<boolean>;
  unlikeCommunityPost(userId: string, postId: string): Promise<boolean>;
  
  // Comments operations
  createPostComment(comment: InsertPostComment): Promise<SharedPostComment>;
  getPostComments(postId: string): Promise<Array<SharedPostComment & { user: SharedUser }>>;
  
  // Mood operations
  createMoodEntry(mood: InsertMoodEntry): Promise<SharedMoodEntry>;
  getMoodEntries(userId: string, days?: number): Promise<SharedMoodEntry[]>;
  
  // AI conversation operations
  createAiConversation(conversation: InsertAiConversation): Promise<SharedAiConversation>;
  getAiConversations(userId: string, limit?: number): Promise<SharedAiConversation[]>;

  // Books: reading progress
  getBookReading(userId: string, bookId: string): Promise<SharedBookReading | null>;
  createBookReading(reading: InsertBookReading): Promise<SharedBookReading>;
  updateBookReading(userId: string, bookId: string, updates: Partial<InsertBookReading>): Promise<SharedBookReading>;

  // Books: bookmarks
  getBookBookmarks(userId: string, bookId: string): Promise<SharedBookBookmark[]>;
  createBookBookmark(bookmark: InsertBookBookmark): Promise<SharedBookBookmark>;
  deleteBookBookmark(userId: string, id: string): Promise<boolean>;

  // Books: highlights
  getBookHighlights(userId: string, bookId: string): Promise<SharedBookHighlight[]>;
  createBookHighlight(highlight: InsertBookHighlight): Promise<SharedBookHighlight>;
  deleteBookHighlight(userId: string, id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<SharedUser | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user as unknown as SharedUser | undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<SharedUser> {
    if (!userData.id) {
      // if id missing, upsert by unique email when available
      if ((userData as any).email) {
        const existing = await prisma.user.findUnique({ where: { email: (userData as any).email } });
        if (existing) {
          const updated = await prisma.user.update({ where: { id: existing.id }, data: { ...(userData as any), updatedAt: new Date() } });
          return updated as unknown as SharedUser;
        }
        const created = await prisma.user.create({ data: userData as any });
        return created as unknown as SharedUser;
      }
      // no id and no email: read current user is required for update; fallback to error
      throw new Error("Unable to upsert user: missing id and email");
    }

    const user = await prisma.user.upsert({
      where: { id: userData.id },
      update: { ...(userData as any), updatedAt: new Date() },
      create: { ...(userData as any) },
    });
    return user as unknown as SharedUser;
  }

  // Journal operations
  async createJournalEntry(entry: InsertJournalEntry): Promise<SharedJournalEntry> {
    const journalEntry = await prisma.journalEntry.create({ data: entry as any });
    return journalEntry as unknown as SharedJournalEntry;
  }

  async getJournalEntries(userId: string): Promise<SharedJournalEntry[]> {
    return await prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }) as unknown as SharedJournalEntry[];
  }

  async updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<SharedJournalEntry | undefined> {
    const updated = await prisma.journalEntry.updateMany({
      where: { id, userId },
      data: { ...(updates as any), updatedAt: new Date() },
    });
    if (updated.count === 0) return undefined;
    return await prisma.journalEntry.findUnique({ where: { id } }) as unknown as SharedJournalEntry | undefined;
  }

  async deleteJournalEntry(id: string, userId: string): Promise<boolean> {
    const result = await prisma.journalEntry.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  // Community operations
  async createCommunityPost(post: InsertCommunityPost): Promise<SharedCommunityPost> {
    const communityPost = await prisma.communityPost.create({ data: post as any });
    return communityPost as unknown as SharedCommunityPost;
  }

  async getCommunityPosts(limit = 20, offset = 0): Promise<Array<SharedCommunityPost & { user: SharedUser; likesCount: number; commentsCount: number; userLiked: boolean }>> {
    const posts = await prisma.communityPost.findMany({
      include: { user: true, likesRel: true, comments: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return posts.map((p) => ({
      ...(p as any),
      user: p.user as any,
      likesCount: p.likesRel.length,
      commentsCount: p.comments.length,
      userLiked: false,
    }));
  }

  async likeCommunityPost(userId: string, postId: string): Promise<boolean> {
    try {
      await prisma.postLike.create({ data: { userId, postId } });
      return true;
    } catch {
      return false;
    }
  }

  async unlikeCommunityPost(userId: string, postId: string): Promise<boolean> {
    const result = await prisma.postLike.deleteMany({ where: { userId, postId } });
    return result.count > 0;
  }

  // Comments operations
  async createPostComment(comment: InsertPostComment): Promise<SharedPostComment> {
    const postComment = await prisma.postComment.create({ data: comment as any });
    return postComment as unknown as SharedPostComment;
  }

  async getPostComments(postId: string): Promise<Array<SharedPostComment & { user: SharedUser }>> {
    const comments = await prisma.postComment.findMany({ where: { postId }, include: { user: true }, orderBy: { createdAt: 'asc' } });
    return comments as unknown as Array<SharedPostComment & { user: SharedUser }>;
  }

  // Mood operations
  async createMoodEntry(mood: InsertMoodEntry): Promise<SharedMoodEntry> {
    const moodEntry = await prisma.moodEntry.create({ data: mood as any });
    return moodEntry as unknown as SharedMoodEntry;
  }

  async getMoodEntries(userId: string, days = 7): Promise<SharedMoodEntry[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return await prisma.moodEntry.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: 'desc' } }) as unknown as SharedMoodEntry[];
  }

  // AI conversation operations
  async createAiConversation(conversation: InsertAiConversation): Promise<SharedAiConversation> {
    const aiConversation = await prisma.aiConversation.create({ data: conversation as any });
    return aiConversation as unknown as SharedAiConversation;
  }

  async getAiConversations(userId: string, limit = 50): Promise<SharedAiConversation[]> {
    return await prisma.aiConversation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit }) as unknown as SharedAiConversation[];
  }

  // Books: reading progress
  async getBookReading(userId: string, bookId: string): Promise<SharedBookReading | null> {
    const r = await prisma.bookReading.findFirst({ where: { userId, bookId } });
    return (r as unknown as SharedBookReading) ?? null;
  }

  async createBookReading(reading: InsertBookReading): Promise<SharedBookReading> {
    const r = await prisma.bookReading.create({ data: reading as any });
    return r as unknown as SharedBookReading;
  }

  async updateBookReading(userId: string, bookId: string, updates: Partial<InsertBookReading>): Promise<SharedBookReading> {
    // ensure unique by composite (userId, bookId)
    const existing = await prisma.bookReading.findFirst({ where: { userId, bookId } });
    if (!existing) {
      const created = await prisma.bookReading.create({ data: { ...(updates as any), userId, bookId } });
      return created as unknown as SharedBookReading;
    }
    const updated = await prisma.bookReading.update({ where: { id: existing.id }, data: { ...(updates as any) } });
    return updated as unknown as SharedBookReading;
  }

  // Books: bookmarks
  async getBookBookmarks(userId: string, bookId: string): Promise<SharedBookBookmark[]> {
    const items = await prisma.bookBookmark.findMany({ where: { userId, bookId }, orderBy: { createdAt: 'desc' } });
    return items as unknown as SharedBookBookmark[];
  }

  async createBookBookmark(bookmark: InsertBookBookmark): Promise<SharedBookBookmark> {
    const b = await prisma.bookBookmark.create({ data: bookmark as any });
    return b as unknown as SharedBookBookmark;
  }

  async deleteBookBookmark(userId: string, id: string): Promise<boolean> {
    const result = await prisma.bookBookmark.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  // Books: highlights
  async getBookHighlights(userId: string, bookId: string): Promise<SharedBookHighlight[]> {
    const items = await prisma.bookHighlight.findMany({ where: { userId, bookId }, orderBy: { createdAt: 'desc' } });
    return items as unknown as SharedBookHighlight[];
  }

  async createBookHighlight(highlight: InsertBookHighlight): Promise<SharedBookHighlight> {
    const h = await prisma.bookHighlight.create({ data: highlight as any });
    return h as unknown as SharedBookHighlight;
  }

  async deleteBookHighlight(userId: string, id: string): Promise<boolean> {
    const result = await prisma.bookHighlight.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }
}

export const storage = new DatabaseStorage(); 