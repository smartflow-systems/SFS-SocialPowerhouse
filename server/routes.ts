import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRouter from "./api/ai";
import passport from "passport";
import { requireAuth } from "./auth";
import type { User } from "@shared/schema";
import { publishPost, processScheduledPosts, validatePostForPlatform } from "./publisher";
import { generateSuggestions, getPlatformTips } from "./suggestions";
import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  fetchUserProfile,
  getConfiguredPlatforms,
  validatePlatformConfig
} from "./oauth";
import { randomBytes } from "crypto";
import {
  optimizeContent,
  suggestNextBestTimes,
  getBestTimesForPlatform,
  generateTrendingHashtags,
  analyzeSentiment
} from "./ai-optimizer";
import {
  getUserAnalytics,
  calculateGrowth,
  getPlatformInsights
} from "./analytics";
import { validatePassword } from "./utils/password-validator";

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

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Weak password",
          message: "Password does not meet security requirements",
          details: passwordValidation.errors
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

  // Team Management API Routes
  // Get current user's team
  app.get("/api/team", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const team = await storage.getUserTeam(user.id);
      
      if (!team) {
        return res.status(404).json({
          error: "Team not found",
          message: "No team found for this user"
        });
      }

      res.json({ team });
    } catch (error: any) {
      console.error("Error fetching team:", error);
      res.status(500).json({
        error: "Failed to fetch team",
        message: error.message || "An error occurred while fetching team"
      });
    }
  });

  // Get team members
  app.get("/api/team/members", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const team = await storage.getUserTeam(user.id);
      
      if (!team) {
        return res.status(404).json({
          error: "Team not found",
          message: "No team found for this user"
        });
      }

      const members = await storage.getTeamMembers(team.id);
      
      // Hydrate member data with user info
      const membersWithUsers = await Promise.all(
        members.map(async (member) => {
          const memberUser = await storage.getUser(member.userId);
          return {
            ...member,
            user: memberUser ? {
              id: memberUser.id,
              username: memberUser.username,
              email: memberUser.email,
              name: memberUser.name,
              avatar: memberUser.avatar
            } : null
          };
        })
      );

      res.json({ members: membersWithUsers });
    } catch (error: any) {
      console.error("Error fetching team members:", error);
      res.status(500).json({
        error: "Failed to fetch team members",
        message: error.message || "An error occurred while fetching team members"
      });
    }
  });

  // Add team member (invite)
  app.post("/api/team/members", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Email and role are required"
        });
      }

      const validRoles = ['admin', 'editor', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: "Invalid role",
          message: "Role must be one of: admin, editor, viewer"
        });
      }

      const team = await storage.getUserTeam(user.id);
      if (!team) {
        return res.status(404).json({
          error: "Team not found",
          message: "No team found for this user"
        });
      }

      // Verify user is owner or admin
      const currentMembers = await storage.getTeamMembers(team.id);
      const currentMember = currentMembers.find(m => m.userId === user.id);
      if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return res.status(403).json({
          error: "Access denied",
          message: "Only team owners and admins can invite members"
        });
      }

      // Find user to invite
      const invitedUser = await storage.getUserByEmail(email);
      if (!invitedUser) {
        return res.status(404).json({
          error: "User not found",
          message: "No user found with this email address"
        });
      }

      // Check if already a member
      const existingMember = currentMembers.find(m => m.userId === invitedUser.id);
      if (existingMember) {
        return res.status(409).json({
          error: "Already a member",
          message: "This user is already a member of the team"
        });
      }

      // Add member
      const newMember = await storage.addTeamMember({
        teamId: team.id,
        userId: invitedUser.id,
        role,
        invitedBy: user.id
      });

      // Return member with user info
      const memberWithUser = {
        ...newMember,
        user: {
          id: invitedUser.id,
          username: invitedUser.username,
          email: invitedUser.email,
          name: invitedUser.name,
          avatar: invitedUser.avatar
        }
      };

      res.status(201).json({
        message: "Team member added successfully",
        member: memberWithUser
      });
    } catch (error: any) {
      console.error("Error adding team member:", error);
      res.status(500).json({
        error: "Failed to add team member",
        message: error.message || "An error occurred while adding team member"
      });
    }
  });

  // Update team member role
  app.patch("/api/team/members/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          error: "Missing required field",
          message: "Role is required"
        });
      }

      const validRoles = ['admin', 'editor', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: "Invalid role",
          message: "Role must be one of: admin, editor, viewer"
        });
      }

      const team = await storage.getUserTeam(user.id);
      if (!team) {
        return res.status(404).json({
          error: "Team not found",
          message: "No team found for this user"
        });
      }

      // Verify user is owner or admin
      const currentMembers = await storage.getTeamMembers(team.id);
      const currentMember = currentMembers.find(m => m.userId === user.id);
      if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return res.status(403).json({
          error: "Access denied",
          message: "Only team owners and admins can update member roles"
        });
      }

      // Get member to update
      const memberToUpdate = await storage.getTeamMember(id);
      if (!memberToUpdate || memberToUpdate.teamId !== team.id) {
        return res.status(404).json({
          error: "Member not found",
          message: "Team member not found"
        });
      }

      // Cannot change owner role
      if (memberToUpdate.role === 'owner') {
        return res.status(403).json({
          error: "Cannot modify owner",
          message: "Cannot change the role of the team owner"
        });
      }

      const updatedMember = await storage.updateTeamMemberRole(id, role);
      if (!updatedMember) {
        return res.status(404).json({
          error: "Update failed",
          message: "Failed to update team member"
        });
      }

      // Hydrate with user info
      const memberUser = await storage.getUser(updatedMember.userId);
      const memberWithUser = {
        ...updatedMember,
        user: memberUser ? {
          id: memberUser.id,
          username: memberUser.username,
          email: memberUser.email,
          name: memberUser.name,
          avatar: memberUser.avatar
        } : null
      };

      res.json({
        message: "Team member role updated successfully",
        member: memberWithUser
      });
    } catch (error: any) {
      console.error("Error updating team member:", error);
      res.status(500).json({
        error: "Failed to update team member",
        message: error.message || "An error occurred while updating team member"
      });
    }
  });

  // Remove team member
  app.delete("/api/team/members/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      const team = await storage.getUserTeam(user.id);
      if (!team) {
        return res.status(404).json({
          error: "Team not found",
          message: "No team found for this user"
        });
      }

      // Verify user is owner or admin
      const currentMembers = await storage.getTeamMembers(team.id);
      const currentMember = currentMembers.find(m => m.userId === user.id);
      if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        return res.status(403).json({
          error: "Access denied",
          message: "Only team owners and admins can remove members"
        });
      }

      // Get member to remove
      const memberToRemove = await storage.getTeamMember(id);
      if (!memberToRemove || memberToRemove.teamId !== team.id) {
        return res.status(404).json({
          error: "Member not found",
          message: "Team member not found"
        });
      }

      // Cannot remove owner
      if (memberToRemove.role === 'owner') {
        return res.status(403).json({
          error: "Cannot remove owner",
          message: "Cannot remove the team owner"
        });
      }

      const removed = await storage.removeTeamMember(id);
      if (!removed) {
        return res.status(404).json({
          error: "Removal failed",
          message: "Failed to remove team member"
        });
      }

      res.json({ message: "Team member removed successfully" });
    } catch (error: any) {
      console.error("Error removing team member:", error);
      res.status(500).json({
        error: "Failed to remove team member",
        message: error.message || "An error occurred while removing team member"
      });
    }
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

  // ==========================================
  // ANALYTICS & INSIGHTS ROUTES
  // ==========================================

  // Get comprehensive analytics dashboard
  app.get("/api/analytics/dashboard", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const days = parseInt(req.query.days as string) || 30;

      const dashboard = await getUserAnalytics(user.id, days);

      res.json(dashboard);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({
        error: "Failed to fetch analytics",
        message: error.message || "An error occurred"
      });
    }
  });

  // Get platform-specific insights
  app.get("/api/analytics/platform/:platform", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { platform } = req.params;

      const posts = await storage.getUserPosts(user.id);
      const insights = getPlatformInsights(platform, posts);

      res.json({ platform, insights });
    } catch (error: any) {
      console.error("Error fetching platform insights:", error);
      res.status(500).json({
        error: "Failed to fetch insights",
        message: error.message || "An error occurred"
      });
    }
  });

  // ==========================================
  // AI-POWERED OPTIMIZATION ROUTES
  // ==========================================

  // Optimize content with AI
  app.post("/api/ai/optimize-content", requireAuth, async (req, res) => {
    try {
      const { content, platform, tone } = req.body;

      if (!content || !platform) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Content and platform are required"
        });
      }

      const optimized = await optimizeContent(content, platform, tone);

      res.json(optimized);
    } catch (error: any) {
      console.error("Error optimizing content:", error);
      res.status(500).json({
        error: "Failed to optimize content",
        message: error.message || "An error occurred"
      });
    }
  });

  // Get best posting times for platform
  app.get("/api/ai/best-times/:platform", requireAuth, async (req, res) => {
    try {
      const { platform } = req.params;
      const count = parseInt(req.query.count as string) || 7;

      const bestTimes = getBestTimesForPlatform(platform);
      const suggestions = suggestNextBestTimes(platform, count);

      res.json({ platform, bestTimes, suggestions });
    } catch (error: any) {
      console.error("Error fetching best times:", error);
      res.status(500).json({
        error: "Failed to fetch best times",
        message: error.message || "An error occurred"
      });
    }
  });

  // Generate trending hashtags
  app.post("/api/ai/hashtags", requireAuth, async (req, res) => {
    try {
      const { topic, platform, count } = req.body;

      if (!topic || !platform) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Topic and platform are required"
        });
      }

      const hashtags = await generateTrendingHashtags(topic, platform, count || 10);

      res.json({ hashtags });
    } catch (error: any) {
      console.error("Error generating hashtags:", error);
      res.status(500).json({
        error: "Failed to generate hashtags",
        message: error.message || "An error occurred"
      });
    }
  });

  // Analyze content sentiment
  app.post("/api/ai/sentiment", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          error: "Missing required field",
          message: "Content is required"
        });
      }

      const sentiment = await analyzeSentiment(content);

      res.json(sentiment);
    } catch (error: any) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({
        error: "Failed to analyze sentiment",
        message: error.message || "An error occurred"
      });
    }
  });

  // ==========================================
  // SOCIAL ACCOUNT OAUTH ROUTES
  // ==========================================

  // Get all connected social accounts for current user
  app.get("/api/social/accounts", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const accounts = await storage.getUserSocialAccounts(user.id);

      // Remove sensitive tokens from response
      const sanitizedAccounts = accounts.map(account => ({
        ...account,
        accessToken: undefined,
        refreshToken: undefined,
      }));

      res.json({ accounts: sanitizedAccounts });
    } catch (error: any) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({
        error: "Failed to fetch accounts",
        message: error.message || "An error occurred"
      });
    }
  });

  // Get configured platforms (platforms that have API keys set up)
  app.get("/api/social/platforms", requireAuth, async (req, res) => {
    try {
      const platforms = getConfiguredPlatforms();
      res.json({ platforms });
    } catch (error: any) {
      console.error("Error fetching configured platforms:", error);
      res.status(500).json({
        error: "Failed to fetch platforms",
        message: error.message || "An error occurred"
      });
    }
  });

  // Initiate OAuth flow for a platform
  app.get("/api/social/oauth/:platform/connect", requireAuth, async (req, res) => {
    try {
      const { platform } = req.params;
      const user = req.user as User;

      // Validate platform is configured
      if (!validatePlatformConfig(platform)) {
        return res.status(400).json({
          error: "Platform not configured",
          message: `OAuth credentials for ${platform} are not configured. Please check your environment variables.`
        });
      }

      // Generate state token to prevent CSRF attacks
      // State contains: userId|timestamp|randomBytes
      const stateData = {
        userId: user.id,
        timestamp: Date.now(),
        nonce: randomBytes(16).toString('hex')
      };
      const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

      // Store state in session for verification
      if (!req.session.oauthStates) {
        req.session.oauthStates = {};
      }
      req.session.oauthStates[platform] = state;

      // Generate authorization URL
      const authUrl = getAuthorizationUrl(platform, state);

      if (!authUrl) {
        return res.status(500).json({
          error: "Failed to generate auth URL",
          message: "Could not create authorization URL for this platform"
        });
      }

      res.json({ authUrl });
    } catch (error: any) {
      console.error("Error initiating OAuth:", error);
      res.status(500).json({
        error: "OAuth initiation failed",
        message: error.message || "An error occurred"
      });
    }
  });

  // OAuth callback handler
  app.get("/api/social/oauth/:platform/callback", async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state, error, error_description } = req.query;

      // Check for OAuth errors
      if (error) {
        console.error(`OAuth error for ${platform}:`, error, error_description);
        return res.redirect(`/accounts?error=${encodeURIComponent(error_description as string || error as string)}`);
      }

      // Validate state to prevent CSRF
      const storedState = req.session?.oauthStates?.[platform];
      if (!storedState || storedState !== state) {
        console.error("OAuth state mismatch - potential CSRF attack");
        return res.redirect('/accounts?error=invalid_state');
      }

      // Decode and validate state
      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      } catch (e) {
        return res.redirect('/accounts?error=invalid_state');
      }

      // Check if state is recent (within 10 minutes)
      const stateAge = Date.now() - stateData.timestamp;
      if (stateAge > 10 * 60 * 1000) {
        return res.redirect('/accounts?error=state_expired');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForToken(platform, code as string);

      if (!tokens) {
        return res.redirect('/accounts?error=token_exchange_failed');
      }

      // Fetch user profile
      const profile = await fetchUserProfile(platform, tokens.accessToken);

      if (!profile) {
        return res.redirect('/accounts?error=profile_fetch_failed');
      }

      // Save account to database
      await storage.createSocialAccount({
        userId: stateData.userId,
        platform,
        accountName: profile.username,
        accountId: profile.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || null,
        expiresAt: tokens.expiresAt || null,
        profileData: profile
      });

      // Clear state from session
      delete req.session.oauthStates[platform];

      // Redirect to accounts page with success message
      res.redirect('/accounts?success=true');
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      res.redirect(`/accounts?error=${encodeURIComponent(error.message || 'callback_failed')}`);
    }
  });

  // Manually refresh tokens for an account
  app.post("/api/social/accounts/:id/refresh", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as User;

      // Get account and verify ownership
      const account = await storage.getSocialAccount(id);

      if (!account) {
        return res.status(404).json({
          error: "Account not found",
          message: "The requested social account does not exist"
        });
      }

      if (account.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to refresh this account"
        });
      }

      if (!account.refreshToken) {
        return res.status(400).json({
          error: "No refresh token",
          message: "This account does not have a refresh token. Please reconnect the account."
        });
      }

      // Refresh tokens
      const newTokens = await refreshAccessToken(account.platform, account.refreshToken);

      if (!newTokens) {
        return res.status(500).json({
          error: "Token refresh failed",
          message: "Failed to refresh access token. Please reconnect the account."
        });
      }

      // Update account in database
      await storage.updateSocialAccount(id, {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken || account.refreshToken,
        expiresAt: newTokens.expiresAt || null
      });

      res.json({
        message: "Tokens refreshed successfully",
        expiresAt: newTokens.expiresAt
      });
    } catch (error: any) {
      console.error("Error refreshing tokens:", error);
      res.status(500).json({
        error: "Token refresh failed",
        message: error.message || "An error occurred"
      });
    }
  });

  // Disconnect/delete a social account
  app.delete("/api/social/accounts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as User;

      // Verify account exists and belongs to user
      const account = await storage.getSocialAccount(id);

      if (!account) {
        return res.status(404).json({
          error: "Account not found",
          message: "The requested social account does not exist"
        });
      }

      if (account.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to delete this account"
        });
      }

      // Delete account
      await storage.deleteSocialAccount(id);

      res.json({ message: "Account disconnected successfully" });
    } catch (error: any) {
      console.error("Error deleting social account:", error);
      res.status(500).json({
        error: "Failed to disconnect account",
        message: error.message || "An error occurred"
      });
    }
  });

  // Toggle account active status
  app.patch("/api/social/accounts/:id/toggle", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as User;

      // Verify account exists and belongs to user
      const account = await storage.getSocialAccount(id);

      if (!account) {
        return res.status(404).json({
          error: "Account not found",
          message: "The requested social account does not exist"
        });
      }

      if (account.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to modify this account"
        });
      }

      // Toggle active status
      const updatedAccount = await storage.updateSocialAccount(id, {
        userId: account.userId,
        platform: account.platform,
        accountName: account.accountName,
        accountId: account.accountId,
        accessToken: account.accessToken,
        profileData: {
          ...account.profileData,
          isActive: !account.isActive
        }
      });

      res.json({
        message: "Account status updated",
        isActive: updatedAccount?.isActive
      });
    } catch (error: any) {
      console.error("Error toggling account status:", error);
      res.status(500).json({
        error: "Failed to update account",
        message: error.message || "An error occurred"
      });
    }
  });

  // AI Content Generation Routes
  app.use("/api/ai", aiRouter);

  // Analytics endpoint
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const posts = await storage.getUserPosts(user.id, {});

      // Calculate total posts by status
      const totalPosts = posts.length;
      const publishedPosts = posts.filter(p => p.status === 'published').length;
      const draftPosts = posts.filter(p => p.status === 'draft').length;
      const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;

      // Calculate platform distribution
      const platformCounts: Record<string, number> = {};
      posts.forEach(post => {
        post.platforms.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
      });

      // Calculate posting frequency over last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPosts = posts.filter(p => 
        p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo
      );

      // Group posts by date for timeline
      const postsByDate: Record<string, number> = {};
      recentPosts.forEach(post => {
        if (post.createdAt) {
          const date = new Date(post.createdAt).toISOString().split('T')[0];
          postsByDate[date] = (postsByDate[date] || 0) + 1;
        }
      });

      // Calculate AI usage
      const aiGeneratedPosts = posts.filter(p => p.aiGenerated).length;

      // Calculate completion rate (published / total)
      const completionRate = totalPosts > 0 
        ? Math.round((publishedPosts / totalPosts) * 100)
        : 0;

      res.json({
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        platformDistribution: platformCounts,
        recentActivity: postsByDate,
        aiGeneratedPosts,
        completionRate,
        postsLast30Days: recentPosts.length,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({
        error: "Failed to fetch analytics",
        message: error.message || "An error occurred while fetching analytics"
      });
    }
  });

  // Social Accounts API Routes
  // Get all social accounts for current user
  app.get("/api/social-accounts", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const accounts = await storage.getSocialAccounts(user.id);
      res.json({ accounts });
    } catch (error: any) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({
        error: "Failed to fetch social accounts",
        message: error.message || "An error occurred while fetching social accounts"
      });
    }
  });

  // Get single social account
  app.get("/api/social-accounts/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      const account = await storage.getSocialAccount(id);
      if (!account) {
        return res.status(404).json({
          error: "Account not found",
          message: "The requested social account does not exist"
        });
      }

      // Verify account belongs to user
      if (account.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to access this account"
        });
      }

      res.json({ account });
    } catch (error: any) {
      console.error("Error fetching social account:", error);
      res.status(500).json({
        error: "Failed to fetch social account",
        message: error.message || "An error occurred while fetching the account"
      });
    }
  });

  // Create (connect) new social account
  app.post("/api/social-accounts", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { platform, accountName, accountId, accessToken, refreshToken, expiresAt, profileData } = req.body;

      if (!platform || !accountName || !accountId || !accessToken) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Platform, accountName, accountId, and accessToken are required"
        });
      }

      const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          error: "Invalid platform",
          message: `Platform must be one of: ${validPlatforms.join(', ')}`
        });
      }

      // Check if account already exists for this platform
      const existingAccounts = await storage.getSocialAccounts(user.id);
      const duplicateAccount = existingAccounts.find(
        acc => acc.platform === platform && acc.accountId === accountId
      );
      if (duplicateAccount) {
        return res.status(409).json({
          error: "Account already connected",
          message: "This social account is already connected"
        });
      }

      const account = await storage.createSocialAccount({
        userId: user.id,
        platform,
        accountName,
        accountId,
        accessToken,
        refreshToken: refreshToken || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        profileData: profileData || null,
        isActive: true
      });

      res.status(201).json({
        message: "Social account connected successfully",
        account
      });
    } catch (error: any) {
      console.error("Error creating social account:", error);
      res.status(500).json({
        error: "Failed to connect social account",
        message: error.message || "An error occurred while connecting the account"
      });
    }
  });

  // Update social account
  app.patch("/api/social-accounts/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;
      const updates = req.body;

      const account = await storage.getSocialAccount(id);
      if (!account) {
        return res.status(404).json({
          error: "Account not found",
          message: "The requested social account does not exist"
        });
      }

      // Verify account belongs to user
      if (account.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to update this account"
        });
      }

      // Convert expiresAt if present
      if (updates.expiresAt) {
        updates.expiresAt = new Date(updates.expiresAt);
      }

      const updatedAccount = await storage.updateSocialAccount(id, updates);
      if (!updatedAccount) {
        return res.status(404).json({
          error: "Update failed",
          message: "Failed to update social account"
        });
      }

      res.json({
        message: "Social account updated successfully",
        account: updatedAccount
      });
    } catch (error: any) {
      console.error("Error updating social account:", error);
      res.status(500).json({
        error: "Failed to update social account",
        message: error.message || "An error occurred while updating the account"
      });
    }
  });

  // Delete (disconnect) social account
  app.delete("/api/social-accounts/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { id } = req.params;

      const account = await storage.getSocialAccount(id);
      if (!account) {
        return res.status(404).json({
          error: "Account not found",
          message: "The requested social account does not exist"
        });
      }

      // Verify account belongs to user
      if (account.userId !== user.id) {
        return res.status(403).json({
          error: "Access denied",
          message: "You do not have permission to delete this account"
        });
      }

      const deleted = await storage.deleteSocialAccount(id);
      if (!deleted) {
        return res.status(404).json({
          error: "Deletion failed",
          message: "Failed to delete social account"
        });
      }

      res.json({ message: "Social account disconnected successfully" });
    } catch (error: any) {
      console.error("Error deleting social account:", error);
      res.status(500).json({
        error: "Failed to disconnect social account",
        message: error.message || "An error occurred while disconnecting the account"
      });
    }
  });

  // Settings API Routes
  // Get user preferences
  app.get("/api/settings/preferences", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const preferences = await storage.getUserPreferences(user.id);
      
      // Return default preferences if none exist
      if (!preferences) {
        return res.json({
          preferences: {
            userId: user.id,
            theme: 'dark',
            timezone: 'UTC',
            emailNotifications: true,
            pushNotifications: true,
            weeklyReports: true,
            notificationSettings: {}
          }
        });
      }

      res.json({ preferences });
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({
        error: "Failed to fetch preferences",
        message: error.message || "An error occurred while fetching preferences"
      });
    }
  });

  // Update user preferences
  app.put("/api/settings/preferences", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { theme, timezone, emailNotifications, pushNotifications, weeklyReports, notificationSettings } = req.body;

      const preferences = await storage.upsertUserPreferences({
        userId: user.id,
        theme: theme || null,
        timezone: timezone || null,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : null,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : null,
        weeklyReports: weeklyReports !== undefined ? weeklyReports : null,
        notificationSettings: notificationSettings || null
      });

      res.json({
        message: "Preferences updated successfully",
        preferences
      });
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      res.status(500).json({
        error: "Failed to update preferences",
        message: error.message || "An error occurred while updating preferences"
      });
    }
  });

  // Update user profile
  app.put("/api/settings/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { name, email, avatar } = req.body;

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          error: "Invalid email",
          message: "Please provide a valid email address"
        });
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(409).json({
            error: "Email already exists",
            message: "This email is already in use by another account"
          });
        }
      }

      const updates: { name?: string; email?: string; avatar?: string } = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (avatar !== undefined) updates.avatar = avatar;

      const updatedUser = await storage.updateProfile(user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({
          error: "Update failed",
          message: "Failed to update profile"
        });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({
        message: "Profile updated successfully",
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        error: "Failed to update profile",
        message: error.message || "An error occurred while updating profile"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SFS Social Powerhouse API" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
