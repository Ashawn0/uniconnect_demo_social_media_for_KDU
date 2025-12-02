import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, unique, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Helper to generate UUIDs in SQLite
const genId = () => sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`;

// Session storage table (used for cookie-based anonymous user sessions)
// Note: connect-sqlite3 manages its own table, but we define it here for reference if needed
// or we can let connect-sqlite3 handle it automatically.

// User storage table (authenticated users with email/password)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  department: text("department"), // e.g., "Smart Computing"
  batch: text("batch"), // e.g., "Fall-22"
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  reactions: many(reactions),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  groupMemberships: many(groupMembers),
  resources: many(resources),
  notifications: many(notifications),
  pollVotes: many(pollVotes),
}));

// Posts table
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
  reactions: many(reactions),
  poll: one(polls),
}));

// Comments table
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Likes table
export const likes = sqliteTable("likes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

// Reactions table (multiple emoji reactions)
export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  emojiType: text("emoji_type").notNull(), // 'like', 'love', 'fire', 'lightbulb', 'thinking'
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  idx_reactions_post: index("idx_reactions_post").on(table.postId),
  idx_reactions_user: index("idx_reactions_user").on(table.userId),
  // Composite unique constraint: one user can only react once with each emoji type per post
  unique_reaction: unique("unique_reaction").on(table.postId, table.userId, table.emojiType),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

// Follows table (user following system)
export const follows = sqliteTable("follows", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: text("following_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  idx_follows_follower: index("idx_follows_follower").on(table.followerId),
  idx_follows_following: index("idx_follows_following").on(table.followingId),
  // Composite unique constraint: prevent duplicate follows
  unique_follow: unique("unique_follow").on(table.followerId, table.followingId),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

// Polls table
export const polls = sqliteTable("polls", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  options: text("options", { mode: "json" }).notNull().$type<string[]>(), // Array of poll options
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  endsAt: integer("ends_at", { mode: "timestamp" }),
});

export const pollsRelations = relations(polls, ({ one, many }) => ({
  post: one(posts, {
    fields: [polls.postId],
    references: [posts.id],
  }),
  votes: many(pollVotes),
}));

// Poll votes table
export const pollVotes = sqliteTable("poll_votes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  optionIndex: integer("option_index").notNull(), // Index of the selected option
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  idx_poll_votes_poll: index("idx_poll_votes_poll").on(table.pollId),
  idx_poll_votes_user: index("idx_poll_votes_user").on(table.userId),
  // Composite unique constraint: one vote per user per poll
  unique_poll_vote: unique("unique_poll_vote").on(table.pollId, table.userId),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
}));

// Groups table (departments, clubs, semesters)
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'department', 'club', 'semester'
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
}));

// Group members table
export const groupMembers = sqliteTable("group_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").default('member'), // 'admin', 'member'
  joinedAt: integer("joined_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  idx_group_members_group: index("idx_group_members_group").on(table.groupId),
  idx_group_members_user: index("idx_group_members_user").on(table.userId),
  // Composite unique constraint: prevent duplicate memberships
  unique_group_member: unique("unique_group_member").on(table.groupId, table.userId),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

// Resources table (study materials, notes, PDFs)
export const resources = sqliteTable("resources", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"), // 'pdf', 'image', 'link', etc.
  uploadedBy: text("uploaded_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: text("group_id").references(() => groups.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const resourcesRelations = relations(resources, ({ one }) => ({
  uploader: one(users, {
    fields: [resources.uploadedBy],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [resources.groupId],
    references: [groups.id],
  }),
}));

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'like', 'comment', 'follow', 'mention', etc.
  content: text("content").notNull(),
  relatedId: text("related_id"), // ID of related post, comment, or user
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type Like = typeof likes.$inferSelect;

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;

export type Follow = typeof follows.$inferSelect;

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type PollVote = typeof pollVotes.$inferSelect;

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdBy: true,
  createdAt: true,
});
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  userId: true,
  joinedAt: true,
});
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  uploadedBy: true,
  createdAt: true,
});
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Extended types for frontend use
export interface PostWithDetails extends Post {
  author: User;
  comments: Array<Comment & { author: User }>;
  likes: Like[];
  reactions: Reaction[];
  poll?: Poll & { votes: PollVote[] };
  isLiked: boolean;
  likesCount: number;
  reactionsCount: { [key: string]: number };
}

export interface UserWithStats extends User {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface GroupWithMembers extends Group {
  creator: User;
  members: Array<GroupMember & { user: User }>;
  membersCount: number;
}

export interface ResourceWithDetails extends Resource {
  uploader: User;
  group?: Group;
}
