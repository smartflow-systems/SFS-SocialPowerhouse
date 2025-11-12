import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRouter from "./api/ai";
import passport from "passport";
import { requireAuth } from "./auth";
import type { User } from "@shared/schema";
import { publishPost, processScheduledPosts, validatePostForPlatform } from "./publisher";
import { generateSuggestions, getPlatformTips } from "./suggestions";

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

  // AI Templates API Routes
  // Get all templates for current user (including public ones)
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const templates = await storage.getUserTemplates(user.id);
      res.json({ templates });
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      res.status(500).json({
        error: "Failed to fetch templates",
        message: error.message || "An error occurred while fetching templates"
      });
    }
  });

  // Get single template by ID
  app.get("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({
          error: "Template not found",
          message: "The requested template does not exist"
        });
      }

      // Verify template belongs to user or is public
      if (template.userId !== user.id && !template.isPublic) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to access this template"
        });
      }

      res.json({ template });
    } catch (error: any) {
      console.error("Error fetching template:", error);
      res.status(500).json({
        error: "Failed to fetch template",
        message: error.message || "An error occurred while fetching the template"
      });
    }
  });

  // Create new template
  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { name, prompt, tone, category, isPublic } = req.body;

      // Validation
      if (!name || !prompt || !tone) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Name, prompt, and tone are required"
        });
      }

      const template = await storage.createTemplate({
        userId: user.id,
        name,
        prompt,
        tone,
        category,
        isPublic: isPublic || false,
      });

      res.status(201).json({
        message: "Template created successfully",
        template
      });
    } catch (error: any) {
      console.error("Error creating template:", error);
      res.status(500).json({
        error: "Failed to create template",
        message: error.message || "An error occurred while creating the template"
      });
    }
  });

  // Update template
  app.put("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;
      const updates = req.body;

      // Get existing template
      const existingTemplate = await storage.getTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({
          error: "Template not found",
          message: "The requested template does not exist"
        });
      }

      // Verify template belongs to user
      if (existingTemplate.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to update this template"
        });
      }

      const template = await storage.updateTemplate(id, updates);
      res.json({
        message: "Template updated successfully",
        template
      });
    } catch (error: any) {
      console.error("Error updating template:", error);
      res.status(500).json({
        error: "Failed to update template",
        message: error.message || "An error occurred while updating the template"
      });
    }
  });

  // Delete template
  app.delete("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      // Get existing template
      const existingTemplate = await storage.getTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({
          error: "Template not found",
          message: "The requested template does not exist"
        });
      }

      // Verify template belongs to user
      if (existingTemplate.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to delete this template"
        });
      }

      await storage.deleteTemplate(id);
      res.json({ message: "Template deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting template:", error);
      res.status(500).json({
        error: "Failed to delete template",
        message: error.message || "An error occurred while deleting the template"
      });
    }
  });

  // Increment template usage count
  app.post("/api/templates/:id/use", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({
          error: "Template not found",
          message: "The requested template does not exist"
        });
      }

      // Verify template belongs to user or is public
      if (template.userId !== user.id && !template.isPublic) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to use this template"
        });
      }

      await storage.incrementTemplateUsage(id);
      res.json({ message: "Template usage recorded" });
    } catch (error: any) {
      console.error("Error recording template usage:", error);
      res.status(500).json({
        error: "Failed to record usage",
        message: error.message || "An error occurred"
      });
    }
  });

  // Publishing API Routes
  // Manually publish a post immediately
  app.post("/api/posts/:id/publish", requireAuth, async (req, res) => {
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
          message: "You do not have permission to publish this post"
        });
      }

      // Validate content for each platform
      const validationErrors: string[] = [];
      for (const platform of post.platforms) {
        const validation = validatePostForPlatform(post.content, platform);
        if (!validation.valid) {
          validationErrors.push(`${platform}: ${validation.error}`);
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Post content violates platform requirements",
          validationErrors
        });
      }

      // Publish the post
      const result = await publishPost(post);

      res.json({
        message: result.success ? "Post published successfully" : "Post publishing completed with errors",
        success: result.success,
        results: result.results,
      });
    } catch (error: any) {
      console.error("Error publishing post:", error);
      res.status(500).json({
        error: "Failed to publish post",
        message: error.message || "An error occurred while publishing the post"
      });
    }
  });

  // Manually trigger the scheduled posts processor (admin/testing)
  app.post("/api/publisher/process", requireAuth, async (req, res) => {
    try {
      await processScheduledPosts();
      res.json({ message: "Scheduled posts processed" });
    } catch (error: any) {
      console.error("Error processing scheduled posts:", error);
      res.status(500).json({
        error: "Failed to process scheduled posts",
        message: error.message || "An error occurred"
      });
    }
  });

  // Validate post content for platforms
  app.post("/api/posts/validate", requireAuth, async (req, res) => {
    try {
      const { content, platforms } = req.body;

      if (!content || !platforms || !Array.isArray(platforms)) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Content and platforms array are required"
        });
      }

      const validationResults: Record<string, { valid: boolean; error?: string }> = {};

      for (const platform of platforms) {
        validationResults[platform] = validatePostForPlatform(content, platform);
      }

      const allValid = Object.values(validationResults).every(r => r.valid);

      res.json({
        valid: allValid,
        results: validationResults,
      });
    } catch (error: any) {
      console.error("Error validating post:", error);
      res.status(500).json({
        error: "Validation failed",
        message: error.message || "An error occurred during validation"
      });
    }
  });

  // Approval Workflow Routes
  // Request approval for a post
  app.post("/api/posts/:id/request-approval", requireAuth, async (req, res) => {
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

      if (post.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to modify this post"
        });
      }

      const updatedPost = await storage.updatePost(id, {
        status: 'pending_approval',
        //@ts-ignore
        approvalStatus: 'pending',
      });

      res.json({
        message: "Approval requested successfully",
        post: updatedPost,
      });
    } catch (error: any) {
      console.error("Error requesting approval:", error);
      res.status(500).json({
        error: "Failed to request approval",
        message: error.message || "An error occurred"
      });
    }
  });

  // Approve a post
  app.post("/api/posts/:id/approve", requireAuth, async (req, res) => {
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

      const updatedPost = await storage.updatePost(id, {
        //@ts-ignore
        approvalStatus: 'approved',
        //@ts-ignore
        approvedBy: user.id,
        //@ts-ignore
        approvedAt: new Date(),
        status: 'scheduled', // Move to scheduled after approval
      });

      res.json({
        message: "Post approved successfully",
        post: updatedPost,
      });
    } catch (error: any) {
      console.error("Error approving post:", error);
      res.status(500).json({
        error: "Failed to approve post",
        message: error.message || "An error occurred"
      });
    }
  });

  // Reject a post
  app.post("/api/posts/:id/reject", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;
      const { reason } = req.body;

      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({
          error: "Post not found",
          message: "The requested post does not exist"
        });
      }

      const updatedPost = await storage.updatePost(id, {
        //@ts-ignore
        approvalStatus: 'rejected',
        //@ts-ignore
        approvedBy: user.id,
        //@ts-ignore
        approvedAt: new Date(),
        //@ts-ignore
        rejectionReason: reason || 'No reason provided',
        status: 'draft', // Move back to draft after rejection
      });

      res.json({
        message: "Post rejected",
        post: updatedPost,
      });
    } catch (error: any) {
      console.error("Error rejecting post:", error);
      res.status(500).json({
        error: "Failed to reject post",
        message: error.message || "An error occurred"
      });
    }
  });

  // Get comments for a post
  app.get("/api/posts/:id/comments", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({
          error: "Post not found",
          message: "The requested post does not exist"
        });
      }

      const comments = await storage.getPostComments(id);

      // Fetch user details for each comment
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const commentUser = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: commentUser ? {
              id: commentUser.id,
              name: commentUser.name,
              username: commentUser.username,
              avatar: commentUser.avatar,
            } : null,
          };
        })
      );

      res.json({ comments: commentsWithUsers });
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      res.status(500).json({
        error: "Failed to fetch comments",
        message: error.message || "An error occurred"
      });
    }
  });

  // Add a comment to a post
  app.post("/api/posts/:id/comments", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;
      const { comment } = req.body;

      if (!comment || !comment.trim()) {
        return res.status(400).json({
          error: "Missing comment",
          message: "Comment text is required"
        });
      }

      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({
          error: "Post not found",
          message: "The requested post does not exist"
        });
      }

      const newComment = await storage.createComment(id, user.id, comment);

      res.json({
        message: "Comment added successfully",
        comment: {
          ...newComment,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          },
        },
      });
    } catch (error: any) {
      console.error("Error adding comment:", error);
      res.status(500).json({
        error: "Failed to add comment",
        message: error.message || "An error occurred"
      });
    }
  });

  // Delete a comment
  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const success = await storage.deleteComment(id);

      if (!success) {
        return res.status(404).json({
          error: "Comment not found",
          message: "The requested comment does not exist"
        });
      }

      res.json({ message: "Comment deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      res.status(500).json({
        error: "Failed to delete comment",
        message: error.message || "An error occurred"
      });
    }
  });

  // Smart Suggestions API
  app.post("/api/suggestions", requireAuth, async (req, res) => {
    try {
      const { content, platforms, scheduledAt, tone } = req.body;

      if (!content || !platforms || !Array.isArray(platforms)) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Content and platforms array are required"
        });
      }

      const suggestions = generateSuggestions(
        content,
        platforms,
        scheduledAt ? new Date(scheduledAt) : null,
        tone
      );

      res.json({ suggestions });
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({
        error: "Failed to generate suggestions",
        message: error.message || "An error occurred while generating suggestions"
      });
    }
  });

  // Get platform-specific tips
  app.get("/api/suggestions/platform/:platform", requireAuth, async (req, res) => {
    try {
      const { platform } = req.params;
      const tips = getPlatformTips(platform);

      res.json({ platform, tips });
    } catch (error: any) {
      console.error("Error fetching platform tips:", error);
      res.status(500).json({
        error: "Failed to fetch platform tips",
        message: error.message || "An error occurred"
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
