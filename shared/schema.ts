import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  theme: varchar("theme").default("dark"),
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal entries
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title"),
  content: text("content").notNull(),
  mood: varchar("mood"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mood entries
export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: varchar("mood").notNull(), // "very_happy", "happy", "neutral", "sad", "very_sad"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI conversation history
export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Book reading data
export const bookReadings = pgTable("book_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull(),
  currentPage: integer("current_page").default(1),
  totalPages: integer("total_pages"),
  readingTheme: varchar("reading_theme").default("light"), // light, dark, sepia
  fontSize: integer("font_size").default(16),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Book bookmarks
export const bookBookmarks = pgTable("book_bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  title: varchar("title"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Book highlights
export const bookHighlights = pgTable("book_highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  text: text("text").notNull(),
  color: varchar("color").default("yellow"), // yellow, green, blue, pink
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  communityPosts: many(communityPosts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  moodEntries: many(moodEntries),
  aiConversations: many(aiConversations),
  bookReadings: many(bookReadings),
  bookBookmarks: many(bookBookmarks),
  bookHighlights: many(bookHighlights),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [postLikes.postId],
    references: [communityPosts.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [postComments.postId],
    references: [communityPosts.id],
  }),
}));

export const moodEntriesRelations = relations(moodEntries, ({ one }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id],
  }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
});

export const insertBookReadingSchema = createInsertSchema(bookReadings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookBookmarkSchema = createInsertSchema(bookBookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertBookHighlightSchema = createInsertSchema(bookHighlights).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertJournalEntry = typeof insertJournalEntrySchema._type;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertCommunityPost = typeof insertCommunityPostSchema._type;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertPostComment = typeof insertPostCommentSchema._type;
export type PostComment = typeof postComments.$inferSelect;
export type InsertMoodEntry = typeof insertMoodEntrySchema._type;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertAiConversation = typeof insertAiConversationSchema._type;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertBookReading = typeof insertBookReadingSchema._type;
export type BookReading = typeof bookReadings.$inferSelect;
export type InsertBookBookmark = typeof insertBookBookmarkSchema._type;
export type BookBookmark = typeof bookBookmarks.$inferSelect;
export type InsertBookHighlight = typeof insertBookHighlightSchema._type;
export type BookHighlight = typeof bookHighlights.$inferSelect;
