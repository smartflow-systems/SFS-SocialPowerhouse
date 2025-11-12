import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRouter from "./api/ai";
import passport from "passport";
import { requireAuth } from "./auth";
import type { User } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, username, password, name } = req.body;

      // Validation
      if (!email || !username || !password) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Email, username, and password are required"
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: "Invalid password",
          message: "Password must be at least 8 characters long"
        });
      }

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          error: "Email already exists",
          message: "An account with this email already exists"
        });
      }

      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          error: "Username already exists",
          message: "An account with this username already exists"
        });
      }

      // Create user
      const user = await storage.createUser({
        email,
        username,
        password, // Will be hashed in storage.createUser
      });

      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
          message: "Account created successfully",
          user: userWithoutPassword
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Registration failed",
        message: "An error occurred during registration"
      });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          error: "Authentication failed",
          message: info?.message || "Invalid email or password"
        });
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({
          message: "Logged in successfully",
          user: userWithoutPassword
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          error: "Logout failed",
          message: "An error occurred during logout"
        });
      }

      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as User;
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Posts API Routes
  // Get all posts for current user with optional filters
  app.get("/api/posts", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { status, platform, startDate, endDate } = req.query;

      const filters: any = {};
      if (status && typeof status === 'string') {
        filters.status = status;
      }
      if (platform && typeof platform === 'string') {
        filters.platform = platform;
      }
      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }

      const posts = await storage.getUserPosts(user.id, filters);
      res.json({ posts });
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      res.status(500).json({
        error: "Failed to fetch posts",
        message: error.message || "An error occurred while fetching posts"
      });
    }
  });

  // Get single post by ID
  app.get("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({
          error: "Post not found",
          message: "The requested post does not exist"
        });
      }

      // Verify post belongs to user
      if (post.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to access this post"
        });
      }

      res.json({ post });
    } catch (error: any) {
      console.error("Error fetching post:", error);
      res.status(500).json({
        error: "Failed to fetch post",
        message: error.message || "An error occurred while fetching the post"
      });
    }
  });

  // Create new post
  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { content, platforms, scheduledAt, status, aiGenerated, tone, hashtags, mediaUrls } = req.body;

      // Validation
      if (!content || !platforms || platforms.length === 0) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Content and at least one platform are required"
        });
      }

      const post = await storage.createPost({
        userId: user.id,
        content,
        platforms,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: status || 'draft',
        aiGenerated: aiGenerated || false,
        tone,
        hashtags,
        mediaUrls,
      });

      res.status(201).json({
        message: "Post created successfully",
        post
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(500).json({
        error: "Failed to create post",
        message: error.message || "An error occurred while creating the post"
      });
    }
  });

  // Update post
  app.put("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;
      const updates = req.body;

      // Get existing post
      const existingPost = await storage.getPost(id);
      if (!existingPost) {
        return res.status(404).json({
          error: "Post not found",
          message: "The requested post does not exist"
        });
      }

      // Verify post belongs to user
      if (existingPost.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to update this post"
        });
      }

      // Convert scheduledAt if present
      if (updates.scheduledAt) {
        updates.scheduledAt = new Date(updates.scheduledAt);
      }

      const post = await storage.updatePost(id, updates);
      res.json({
        message: "Post updated successfully",
        post
      });
    } catch (error: any) {
      console.error("Error updating post:", error);
      res.status(500).json({
        error: "Failed to update post",
        message: error.message || "An error occurred while updating the post"
      });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      // Get existing post
      const existingPost = await storage.getPost(id);
      if (!existingPost) {
        return res.status(404).json({
          error: "Post not found",
          message: "The requested post does not exist"
        });
      }

      // Verify post belongs to user
      if (existingPost.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to delete this post"
        });
      }

      await storage.deletePost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      res.status(500).json({
        error: "Failed to delete post",
        message: error.message || "An error occurred while deleting the post"
      });
    }
  });

  // AI Content Generation Routes
  app.use("/api/ai", aiRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SFS Social Powerhouse API" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
