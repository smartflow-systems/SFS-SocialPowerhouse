import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - enhanced for SFS platform
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  subscriptionTier: text("subscription_tier").default('starter'), // starter, growth, agency, enterprise
  sfsLevel: integer("sfs_level").default(1), // Easter egg: Level 10 Mage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social media accounts
export const socialAccounts = pgTable("social_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: text("platform").notNull(), // facebook, instagram, twitter, linkedin, tiktok, youtube, pinterest
  accountName: text("account_name").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  profileData: jsonb("profile_data"), // Store profile pic, follower count, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("social_accounts_user_id_idx").on(table.userId),
  platformIdx: index("social_accounts_platform_idx").on(table.platform),
  isActiveIdx: index("social_accounts_is_active_idx").on(table.isActive),
}));

// Posts/Content
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(), // Array of platform IDs
  mediaUrls: jsonb("media_urls").$type<string[]>(), // Images/videos
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  status: text("status").default('draft'), // draft, scheduled, published, failed, pending_approval
  approvalStatus: text("approval_status"), // pending, approved, rejected, changes_requested
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  aiGenerated: boolean("ai_generated").default(false),
  tone: text("tone"), // professional, casual, witty, etc.
  hashtags: jsonb("hashtags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("posts_user_id_idx").on(table.userId),
  statusIdx: index("posts_status_idx").on(table.status),
  scheduledAtIdx: index("posts_scheduled_at_idx").on(table.scheduledAt),
  publishedAtIdx: index("posts_published_at_idx").on(table.publishedAt),
  approvalStatusIdx: index("posts_approval_status_idx").on(table.approvalStatus),
}));

// Post Comments (for approval workflows and team collaboration)
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Templates
export const aiTemplates = pgTable("ai_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  tone: text("tone").notNull(),
  category: text("category"), // promotional, educational, engagement, etc.
  isPublic: boolean("is_public").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics snapshots
export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  socialAccountId: varchar("social_account_id").references(() => socialAccounts.id, { onDelete: 'cascade' }),
  impressions: integer("impressions").default(0),
  engagement: integer("engagement").default(0),
  clicks: integer("clicks").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  likes: integer("likes").default(0),
  saves: integer("saves").default(0),
  reach: integer("reach").default(0),
  snapshotDate: timestamp("snapshot_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  postIdIdx: index("analytics_post_id_idx").on(table.postId),
  socialAccountIdIdx: index("analytics_social_account_id_idx").on(table.socialAccountId),
  snapshotDateIdx: index("analytics_snapshot_date_idx").on(table.snapshotDate),
}));

// Teams - workspace/organization entity
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull(), // owner, admin, editor, viewer
  permissions: jsonb("permissions").$type<string[]>(),
  invitedBy: varchar("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueTeamUser: sql`UNIQUE(${table.teamId}, ${table.userId})`
}));

// User preferences/settings
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  theme: text("theme").default('dark'), // light, dark, system
  timezone: text("timezone").default('UTC'),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  notificationSettings: jsonb("notification_settings").$type<Record<string, boolean>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competitors tracking
export const competitors = pgTable("competitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  socialHandles: jsonb("social_handles").$type<Record<string, string>>(), // platform: handle
  trackedMetrics: jsonb("tracked_metrics").$type<Record<string, any>>(),
  lastChecked: timestamp("last_checked"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Automation rules
export const automationRules = pgTable("automation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: text("type").notNull(), // rss_feed, auto_respond, dm_sequence, content_recycling
  config: jsonb("config").$type<Record<string, any>>().notNull(),
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content calendar
export const contentCalendar = pgTable("content_calendar", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  scheduledDate: timestamp("scheduled_date").notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(),
  status: text("status").default('pending'), // pending, published, failed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts);
export const insertAITemplateSchema = createInsertSchema(aiTemplates);
export const insertPostCommentSchema = createInsertSchema(postComments);

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type User = typeof users.$inferSelect;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type AITemplate = typeof aiTemplates.$inferSelect;
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type ContentCalendar = typeof contentCalendar.$inferSelect;
