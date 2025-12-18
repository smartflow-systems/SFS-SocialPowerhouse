import {
  type User,
  type InsertUser,
  type Post,
  type AITemplate,
  type TeamMember,
  type InsertTeamMember,
  type Team,
  type InsertTeam,
  type SocialAccount,
  type InsertSocialAccount,
  type UserPreferences,
  type InsertUserPreferences,
  type PostComment,
  users,
  posts,
  aiTemplates,
  teamMembers,
  teams,
  socialAccounts,
  userPreferences,
  postComments
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

  // Team methods
  getTeam(teamId: string): Promise<Team | undefined>;
  getUserTeam(userId: string): Promise<Team | undefined>;
  createTeam(team: Omit<InsertTeam, 'id'>): Promise<Team>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  addTeamMember(member: Omit<InsertTeamMember, 'id'>): Promise<TeamMember>;
  updateTeamMemberRole(id: string, role: string): Promise<TeamMember | undefined>;
  removeTeamMember(id: string): Promise<boolean>;

  // Social Account methods
  getSocialAccounts(userId: string): Promise<SocialAccount[]>;
  getSocialAccount(id: string): Promise<SocialAccount | undefined>;
  createSocialAccount(account: Omit<InsertSocialAccount, 'id'>): Promise<SocialAccount>;
  updateSocialAccount(id: string, updates: Partial<Omit<InsertSocialAccount, 'userId'>>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: string): Promise<boolean>;

  // User Preferences methods
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: Omit<InsertUserPreferences, 'id'>): Promise<UserPreferences>;
  updateProfile(userId: string, updates: { name?: string; email?: string; avatar?: string }): Promise<User | undefined>;
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
    
    // Auto-create default team for new user
    await this.getOrCreateUserTeam(result[0].id, result[0].username);
    
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

  // Team methods
  private async getOrCreateUserTeam(userId: string, userName: string): Promise<Team> {
    const existing = await this.db.select().from(teams).where(eq(teams.ownerId, userId)).limit(1);
    if (existing[0]) return existing[0];

    const team = await this.db.insert(teams).values({
      ownerId: userId,
      name: `${userName}'s Workspace`
    }).returning();

    await this.db.insert(teamMembers).values({
      teamId: team[0].id,
      userId: userId,
      role: 'owner',
      invitedBy: userId
    });

    return team[0];
  }

  async getTeam(teamId: string): Promise<Team | undefined> {
    const result = await this.db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    return result[0];
  }

  async getUserTeam(userId: string): Promise<Team | undefined> {
    const result = await this.db.select().from(teams).where(eq(teams.ownerId, userId)).limit(1);
    return result[0];
  }

  async createTeam(team: Omit<InsertTeam, 'id'>): Promise<Team> {
    const result = await this.db.insert(teams).values(team).returning();
    return result[0];
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const result = await this.db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
    return result;
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const result = await this.db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
    return result[0];
  }

  async addTeamMember(member: Omit<InsertTeamMember, 'id'>): Promise<TeamMember> {
    const result = await this.db.insert(teamMembers).values(member as any).returning();
    return result[0];
  }

  async updateTeamMemberRole(id: string, role: string): Promise<TeamMember | undefined> {
    const result = await this.db.update(teamMembers)
      .set({ role, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return result[0];
  }

  async removeTeamMember(id: string): Promise<boolean> {
    const result = await this.db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return result.length > 0;
  }

  // Social Account methods
  async getSocialAccounts(userId: string): Promise<SocialAccount[]> {
    const result = await this.db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
    return result;
  }

  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    const result = await this.db.select().from(socialAccounts).where(eq(socialAccounts.id, id)).limit(1);
    return result[0];
  }

  async createSocialAccount(account: Omit<InsertSocialAccount, 'id'>): Promise<SocialAccount> {
    const result = await this.db.insert(socialAccounts).values(account).returning();
    return result[0];
  }

  async updateSocialAccount(id: string, updates: Partial<Omit<InsertSocialAccount, 'userId'>>): Promise<SocialAccount | undefined> {
    const result = await this.db.update(socialAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(socialAccounts.id, id))
      .returning();
    return result[0];
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

  // User Preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const result = await this.db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
    return result[0];
  }

  async upsertUserPreferences(prefs: Omit<InsertUserPreferences, 'id'>): Promise<UserPreferences> {
    const result = await this.db.insert(userPreferences)
      .values(prefs)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...prefs, updatedAt: new Date() }
      })
      .returning();
    return result[0];
  }

  async updateProfile(userId: string, updates: { name?: string; email?: string; avatar?: string }): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
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
  private teams: Map<string, Team>;
  private teamMembers: Map<string, TeamMember>;
  private socialAccounts: Map<string, SocialAccount>;
  private userPrefs: Map<string, UserPreferences>;
  private comments: Map<string, PostComment>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.templates = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.socialAccounts = new Map();
    this.userPrefs = new Map();
    this.comments = new Map();
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
    
    // Auto-create default team for new user
    const teamId = randomUUID();
    const team: Team = {
      id: teamId,
      ownerId: id,
      name: `${user.username}'s Workspace`,
      createdAt: now,
      updatedAt: now
    };
    this.teams.set(teamId, team);
    
    // Add user as owner of the team
    const memberId = randomUUID();
    const member: TeamMember = {
      id: memberId,
      teamId: teamId,
      userId: id,
      role: 'owner',
      permissions: null,
      invitedBy: id,
      createdAt: now,
      updatedAt: now
    };
    this.teamMembers.set(memberId, member);
    
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

  // Team methods
  async getTeam(teamId: string): Promise<Team | undefined> {
    return this.teams.get(teamId);
  }

  async getUserTeam(userId: string): Promise<Team | undefined> {
    return Array.from(this.teams.values()).find(t => t.ownerId === userId);
  }

  async createTeam(team: Omit<InsertTeam, 'id'>): Promise<Team> {
    const id = randomUUID();
    const now = new Date();
    const newTeam: Team = { ...team, id, createdAt: now, updatedAt: now };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(m => m.teamId === teamId);
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async addTeamMember(member: Omit<InsertTeamMember, 'id'>): Promise<TeamMember> {
    const id = randomUUID();
    const now = new Date();
    const newMember: TeamMember = {
      ...member,
      id,
      permissions: (member.permissions as string[]) || null,
      invitedBy: member.invitedBy || null,
      createdAt: now,
      updatedAt: now
    };
    this.teamMembers.set(id, newMember);
    return newMember;
  }

  async updateTeamMemberRole(id: string, role: string): Promise<TeamMember | undefined> {
    const member = this.teamMembers.get(id);
    if (!member) return undefined;
    member.role = role;
    member.updatedAt = new Date();
    this.teamMembers.set(id, member);
    return member;
  }

  async removeTeamMember(id: string): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // Social Account methods
  async getSocialAccounts(userId: string): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(a => a.userId === userId);
  }

  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    return this.socialAccounts.get(id);
  }

  async createSocialAccount(account: Omit<InsertSocialAccount, 'id'>): Promise<SocialAccount> {
    const id = randomUUID();
    const now = new Date();
    const newAccount: SocialAccount = {
      ...account,
      id,
      refreshToken: account.refreshToken || null,
      expiresAt: account.expiresAt || null,
      profileData: account.profileData || null,
      isActive: account.isActive !== undefined ? account.isActive : true,
      createdAt: now,
      updatedAt: now
    };
    this.socialAccounts.set(id, newAccount);
    return newAccount;
  }

  async updateSocialAccount(id: string, updates: Partial<Omit<InsertSocialAccount, 'userId'>>): Promise<SocialAccount | undefined> {
    const account = this.socialAccounts.get(id);
    if (!account) return undefined;
    const updated = { ...account, ...updates, updatedAt: new Date() };
    this.socialAccounts.set(id, updated);
    return updated;
  }

  async deleteSocialAccount(id: string): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }

  // User Preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return Array.from(this.userPrefs.values()).find(p => p.userId === userId);
  }

  async upsertUserPreferences(prefs: Omit<InsertUserPreferences, 'id'>): Promise<UserPreferences> {
    const existing = Array.from(this.userPrefs.values()).find(p => p.userId === prefs.userId);
    if (existing) {
      const updated = { ...existing, ...prefs, updatedAt: new Date() };
      this.userPrefs.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const now = new Date();
      const newPrefs: UserPreferences = {
        ...prefs,
        id,
        theme: prefs.theme || null,
        timezone: prefs.timezone || null,
        emailNotifications: prefs.emailNotifications !== undefined ? prefs.emailNotifications : null,
        pushNotifications: prefs.pushNotifications !== undefined ? prefs.pushNotifications : null,
        weeklyReports: prefs.weeklyReports !== undefined ? prefs.weeklyReports : null,
        notificationSettings: prefs.notificationSettings || null,
        createdAt: now,
        updatedAt: now
      };
      this.userPrefs.set(id, newPrefs);
      return newPrefs;
    }
  }

  async updateProfile(userId: string, updates: { name?: string; email?: string; avatar?: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
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
