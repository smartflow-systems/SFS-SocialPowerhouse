import { type User, type InsertUser, type Post } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

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
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
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
}

export const storage = new MemStorage();
