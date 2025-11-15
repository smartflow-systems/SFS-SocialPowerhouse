import {
  type User,
  type InsertUser,
  type Post,
  type AITemplate,
  type PostComment,
  type SocialAccount,
  users,
  posts,
  aiTemplates,
  postComments,
  socialAccounts
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, and, gte, lte, sql as sqlDrizzle, or } from "drizzle-orm";
import ws from "ws";
import { encrypt, decrypt } from "./encryption";

// Configure Neon to use WebSocket for Node.js
neonConfig.webSocketConstructor = ws;

// modify the interface with any CRUD methods
// you might need

export interface InsertPost {
  userId: string;
  content: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status?: string;
  aiGenerated?: boolean;
  tone?: string;
  hashtags?: string[];
}

export interface InsertAITemplate {
  userId: string;
  name: string;
  prompt: string;
  tone: string;
  category?: string;
  isPublic?: boolean;
}

export interface InsertSocialAccount {
  userId: string;
  platform: string;
  accountName: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  profileData?: any;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Post methods
  getPost(id: string): Promise<Post | undefined>;
  getUserPosts(userId: string, filters?: {
    status?: string;
    platform?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Post[]>;
  getScheduledPostsDue(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

  // Template methods
  getTemplate(id: string): Promise<AITemplate | undefined>;
  getUserTemplates(userId: string): Promise<AITemplate[]>;
  createTemplate(template: InsertAITemplate): Promise<AITemplate>;
  updateTemplate(id: string, updates: Partial<InsertAITemplate>): Promise<AITemplate | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  incrementTemplateUsage(id: string): Promise<void>;

  // Comment methods
  getPostComments(postId: string): Promise<PostComment[]>;
  createComment(postId: string, userId: string, comment: string): Promise<PostComment>;
  deleteComment(id: string): Promise<boolean>;

  // Social Account methods
  getSocialAccount(id: string): Promise<SocialAccount | undefined>;
  getUserSocialAccounts(userId: string): Promise<SocialAccount[]>;
  getUserSocialAccountsByPlatform(userId: string, platform: string): Promise<SocialAccount[]>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: string, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: string): Promise<boolean>;
  getAccountsNeedingRefresh(): Promise<SocialAccount[]>;
}

// PostgreSQL Database Storage Implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await this.db.insert(users).values({
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  // Post methods
  async getPost(id: string): Promise<Post | undefined> {
    const result = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getUserPosts(
    userId: string,
    filters?: {
      status?: string;
      platform?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Post[]> {
    const conditions = [eq(posts.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(posts.status, filters.status));
    }

    if (filters?.startDate) {
      conditions.push(gte(posts.scheduledAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(posts.scheduledAt, filters.endDate));
    }

    let query = this.db.select().from(posts);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(posts.scheduledAt);

    // Filter by platform if needed (JSONB array check)
    if (filters?.platform) {
      return result.filter((post) => 
        post.platforms && post.platforms.includes(filters.platform!)
      );
    }

    return result;
  }

  async getScheduledPostsDue(): Promise<Post[]> {
    const now = new Date();
    const result = await this.db.select()
      .from(posts)
      .where(
        and(
          eq(posts.status, 'scheduled'),
          lte(posts.scheduledAt, now)
        )
      )
      .orderBy(posts.scheduledAt);
    return result;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await this.db.insert(posts).values({
      userId: insertPost.userId,
      content: insertPost.content,
      platforms: insertPost.platforms,
      mediaUrls: insertPost.mediaUrls || null,
      scheduledAt: insertPost.scheduledAt || null,
      publishedAt: insertPost.publishedAt || null,
      status: insertPost.status || 'draft',
      aiGenerated: insertPost.aiGenerated || false,
      tone: insertPost.tone || null,
      hashtags: insertPost.hashtags || null,
    }).returning();
    return result[0];
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const result = await this.db.update(posts)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  // Template methods
  async getTemplate(id: string): Promise<AITemplate | undefined> {
    const result = await this.db.select().from(aiTemplates).where(eq(aiTemplates.id, id)).limit(1);
    return result[0];
  }

  async getUserTemplates(userId: string): Promise<AITemplate[]> {
    const result = await this.db.select()
      .from(aiTemplates)
      .where(
        or(
          eq(aiTemplates.userId, userId),
          eq(aiTemplates.isPublic, true)
        )
      )
      .orderBy(aiTemplates.usageCount);
    return result;
  }

  async createTemplate(insertTemplate: InsertAITemplate): Promise<AITemplate> {
    const result = await this.db.insert(aiTemplates).values({
      userId: insertTemplate.userId,
      name: insertTemplate.name,
      prompt: insertTemplate.prompt,
      tone: insertTemplate.tone,
      category: insertTemplate.category || null,
      isPublic: insertTemplate.isPublic || false,
    }).returning();
    return result[0];
  }

  async updateTemplate(id: string, updates: Partial<InsertAITemplate>): Promise<AITemplate | undefined> {
    const result = await this.db.update(aiTemplates)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(aiTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.db.delete(aiTemplates).where(eq(aiTemplates.id, id)).returning();
    return result.length > 0;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await this.db.update(aiTemplates)
      .set({
        usageCount: sqlDrizzle`${aiTemplates.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(aiTemplates.id, id));
  }

  // Comment methods
  async getPostComments(postId: string): Promise<PostComment[]> {
    const result = await this.db.select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
    return result;
  }

  async createComment(postId: string, userId: string, comment: string): Promise<PostComment> {
    const result = await this.db.insert(postComments).values({
      postId,
      userId,
      comment,
    }).returning();
    return result[0];
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await this.db.delete(postComments).where(eq(postComments.id, id)).returning();
    return result.length > 0;
  }

  // Social Account methods with encryption
  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    const result = await this.db.select()
      .from(socialAccounts)
      .where(eq(socialAccounts.id, id))
      .limit(1);

    if (!result[0]) {
      return undefined;
    }

    // Decrypt tokens before returning
    return this.decryptSocialAccountTokens(result[0]);
  }

  async getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
    const result = await this.db.select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId))
      .orderBy(socialAccounts.createdAt);

    // Decrypt tokens for all accounts
    return result.map(account => this.decryptSocialAccountTokens(account));
  }

  async getUserSocialAccountsByPlatform(userId: string, platform: string): Promise<SocialAccount[]> {
    const result = await this.db.select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, platform)
        )
      )
      .orderBy(socialAccounts.createdAt);

    // Decrypt tokens for all accounts
    return result.map(account => this.decryptSocialAccountTokens(account));
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(insertAccount.accessToken);
    const encryptedRefreshToken = insertAccount.refreshToken ? encrypt(insertAccount.refreshToken) : null;

    const result = await this.db.insert(socialAccounts).values({
      userId: insertAccount.userId,
      platform: insertAccount.platform,
      accountName: insertAccount.accountName,
      accountId: insertAccount.accountId,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: insertAccount.expiresAt || null,
      profileData: insertAccount.profileData || null,
      isActive: true,
    }).returning();

    // Return with decrypted tokens
    return this.decryptSocialAccountTokens(result[0]);
  }

  async updateSocialAccount(id: string, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    // Encrypt tokens if they're being updated
    const encryptedUpdates: any = { ...updates };

    if (updates.accessToken) {
      encryptedUpdates.accessToken = encrypt(updates.accessToken);
    }

    if (updates.refreshToken !== undefined) {
      encryptedUpdates.refreshToken = updates.refreshToken ? encrypt(updates.refreshToken) : null;
    }

    const result = await this.db.update(socialAccounts)
      .set({
        ...encryptedUpdates,
        updatedAt: new Date()
      })
      .where(eq(socialAccounts.id, id))
      .returning();

    if (!result[0]) {
      return undefined;
    }

    // Return with decrypted tokens
    return this.decryptSocialAccountTokens(result[0]);
  }

  async deleteSocialAccount(id: string): Promise<boolean> {
    const result = await this.db.delete(socialAccounts).where(eq(socialAccounts.id, id)).returning();
    return result.length > 0;
  }

  async getAccountsNeedingRefresh(): Promise<SocialAccount[]> {
    // Get accounts that expire within 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const result = await this.db.select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.isActive, true),
          lte(socialAccounts.expiresAt, tomorrow)
        )
      )
      .orderBy(socialAccounts.expiresAt);

    // Decrypt tokens for all accounts
    return result.map(account => this.decryptSocialAccountTokens(account));
  }

  /**
   * Helper method to decrypt tokens in a social account
   */
  private decryptSocialAccountTokens(account: SocialAccount): SocialAccount {
    try {
      return {
        ...account,
        accessToken: decrypt(account.accessToken),
        refreshToken: account.refreshToken ? decrypt(account.refreshToken) : null,
      };
    } catch (error) {
      // If decryption fails, log error but return account with encrypted tokens
      // This prevents breaking the entire app if there's an encryption key issue
      console.error(`Failed to decrypt tokens for social account ${account.id}:`, error);
      return account;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;
  private templates: Map<string, AITemplate>;
  private comments: Map<string, PostComment>;
  private socialAccounts: Map<string, SocialAccount>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.templates = new Map();
    this.comments = new Map();
    this.socialAccounts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      password: hashedPassword,
      id,
      name: null,
      avatar: null,
      subscriptionTier: 'starter',
      sfsLevel: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  // Post methods
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getUserPosts(
    userId: string,
    filters?: {
      status?: string;
      platform?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Post[]> {
    let posts = Array.from(this.posts.values()).filter(
      (post) => post.userId === userId
    );

    if (filters?.status) {
      posts = posts.filter((post) => post.status === filters.status);
    }

    if (filters?.platform) {
      posts = posts.filter((post) =>
        post.platforms.includes(filters.platform!)
      );
    }

    if (filters?.startDate) {
      posts = posts.filter(
        (post) => post.scheduledAt && post.scheduledAt >= filters.startDate!
      );
    }

    if (filters?.endDate) {
      posts = posts.filter(
        (post) => post.scheduledAt && post.scheduledAt <= filters.endDate!
      );
    }

    return posts.sort((a, b) => {
      const aTime = a.scheduledAt?.getTime() || a.createdAt?.getTime() || 0;
      const bTime = b.scheduledAt?.getTime() || b.createdAt?.getTime() || 0;
      return aTime - bTime;
    });
  }

  async getScheduledPostsDue(): Promise<Post[]> {
    const now = new Date();
    return Array.from(this.posts.values())
      .filter((post) => 
        post.status === 'scheduled' && 
        post.scheduledAt && 
        post.scheduledAt <= now
      )
      .sort((a, b) => {
        const aTime = a.scheduledAt?.getTime() || 0;
        const bTime = b.scheduledAt?.getTime() || 0;
        return aTime - bTime;
      });
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const now = new Date();
    const post: Post = {
      id,
      userId: insertPost.userId,
      content: insertPost.content,
      platforms: insertPost.platforms,
      mediaUrls: insertPost.mediaUrls || null,
      scheduledAt: insertPost.scheduledAt || null,
      publishedAt: insertPost.publishedAt || null,
      status: insertPost.status || 'draft',
      approvalStatus: null,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      aiGenerated: insertPost.aiGenerated || false,
      tone: insertPost.tone || null,
      hashtags: insertPost.hashtags || null,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(
    id: string,
    updates: Partial<InsertPost>
  ): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) {
      return undefined;
    }

    const updatedPost: Post = {
      ...post,
      ...updates,
      updatedAt: new Date(),
    };

    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Template methods
  async getTemplate(id: string): Promise<AITemplate | undefined> {
    return this.templates.get(id);
  }

  async getUserTemplates(userId: string): Promise<AITemplate[]> {
    return Array.from(this.templates.values())
      .filter((template) => template.userId === userId || template.isPublic)
      .sort((a, b) => b.usageCount! - a.usageCount!); // Most used first
  }

  async createTemplate(insertTemplate: InsertAITemplate): Promise<AITemplate> {
    const id = randomUUID();
    const now = new Date();
    const template: AITemplate = {
      id,
      userId: insertTemplate.userId,
      name: insertTemplate.name,
      prompt: insertTemplate.prompt,
      tone: insertTemplate.tone,
      category: insertTemplate.category || null,
      isPublic: insertTemplate.isPublic || false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(
    id: string,
    updates: Partial<InsertAITemplate>
  ): Promise<AITemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) {
      return undefined;
    }

    const updatedTemplate: AITemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      template.updatedAt = new Date();
      this.templates.set(id, template);
    }
  }

  // Comment methods
  async getPostComments(postId: string): Promise<PostComment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime()); // Oldest first
  }

  async createComment(postId: string, userId: string, comment: string): Promise<PostComment> {
    const id = randomUUID();
    const now = new Date();
    const newComment: PostComment = {
      id,
      postId,
      userId,
      comment,
      createdAt: now,
      updatedAt: now,
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Social Account methods (in-memory, no encryption needed for testing)
  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    return this.socialAccounts.get(id);
  }

  async getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values())
      .filter((account) => account.userId === userId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getUserSocialAccountsByPlatform(userId: string, platform: string): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values())
      .filter((account) => account.userId === userId && account.platform === platform)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const id = randomUUID();
    const now = new Date();
    const account: SocialAccount = {
      id,
      userId: insertAccount.userId,
      platform: insertAccount.platform,
      accountName: insertAccount.accountName,
      accountId: insertAccount.accountId,
      accessToken: insertAccount.accessToken,
      refreshToken: insertAccount.refreshToken || null,
      expiresAt: insertAccount.expiresAt || null,
      profileData: insertAccount.profileData || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.socialAccounts.set(id, account);
    return account;
  }

  async updateSocialAccount(id: string, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const account = this.socialAccounts.get(id);
    if (!account) {
      return undefined;
    }

    const updatedAccount: SocialAccount = {
      ...account,
      ...updates,
      updatedAt: new Date(),
    };

    this.socialAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteSocialAccount(id: string): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }

  async getAccountsNeedingRefresh(): Promise<SocialAccount[]> {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    return Array.from(this.socialAccounts.values())
      .filter((account) =>
        account.isActive &&
        account.expiresAt &&
        account.expiresAt <= tomorrow
      )
      .sort((a, b) => {
        const aTime = a.expiresAt?.getTime() || 0;
        const bTime = b.expiresAt?.getTime() || 0;
        return aTime - bTime;
      });
  }
}

export const storage = new DbStorage();
