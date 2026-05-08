import { describe, it, expect, beforeEach } from '@jest/globals';
import { MemStorage } from '../storage';
import type {
  InsertUser,
  User,
  Post,
  AITemplate,
  Team,
  TeamMember,
  SocialAccount,
  UserPreferences,
  PostComment,
} from '@shared/schema';

describe('Storage Layer (MemStorage)', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('User Management', () => {
    const mockUser: InsertUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecureP@ss123',
    };

    it('should create a user with hashed password', async () => {
      const user = await storage.createUser(mockUser);

      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      // Password should be hashed, not plaintext
      expect(user.password).not.toBe('SecureP@ss123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
      expect(user.subscriptionTier).toBe('starter');
      expect(user.sfsLevel).toBe(1);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should auto-create a team when user is created', async () => {
      const user = await storage.createUser(mockUser);
      const team = await storage.getUserTeam(user.id);

      expect(team).toBeDefined();
      expect(team?.ownerId).toBe(user.id);
      expect(team?.name).toContain("testuser's Workspace");

      // User should be a team member with owner role
      const members = await storage.getTeamMembers(team!.id);
      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe(user.id);
      expect(members[0].role).toBe('owner');
    });

    it('should retrieve user by ID', async () => {
      const created = await storage.createUser(mockUser);
      const retrieved = await storage.getUser(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.username).toBe('testuser');
    });

    it('should retrieve user by username', async () => {
      await storage.createUser(mockUser);
      const retrieved = await storage.getUserByUsername('testuser');

      expect(retrieved).toBeDefined();
      expect(retrieved?.username).toBe('testuser');
    });

    it('should retrieve user by email', async () => {
      await storage.createUser(mockUser);
      const retrieved = await storage.getUserByEmail('test@example.com');

      expect(retrieved).toBeDefined();
      expect(retrieved?.email).toBe('test@example.com');
    });

    it('should return undefined for non-existent user', async () => {
      const user = await storage.getUser('nonexistent-id');
      expect(user).toBeUndefined();
    });

    it('should update user profile', async () => {
      const user = await storage.createUser(mockUser);
      const updated = await storage.updateProfile(user.id, {
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Test User');
      expect(updated?.avatar).toBe('https://example.com/avatar.jpg');
      expect(updated?.email).toBe('test@example.com'); // Original email preserved
    });
  });

  describe('Post Management', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'postuser',
        email: 'post@example.com',
        password: 'password123',
      });
      userId = user.id;
    });

    it('should create a post', async () => {
      const post = await storage.createPost({
        userId,
        content: 'Test post content',
        platforms: ['facebook', 'twitter'],
        status: 'draft',
      });

      expect(post.id).toBeDefined();
      expect(post.userId).toBe(userId);
      expect(post.content).toBe('Test post content');
      expect(post.platforms).toEqual(['facebook', 'twitter']);
      expect(post.status).toBe('draft');
      expect(post.aiGenerated).toBe(false);
    });

    it('should retrieve a post by ID', async () => {
      const created = await storage.createPost({
        userId,
        content: 'Retrieve me',
        platforms: ['instagram'],
      });

      const retrieved = await storage.getPost(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.content).toBe('Retrieve me');
    });

    it('should get all user posts', async () => {
      await storage.createPost({ userId, content: 'Post 1', platforms: ['facebook'] });
      await storage.createPost({ userId, content: 'Post 2', platforms: ['twitter'] });
      await storage.createPost({ userId, content: 'Post 3', platforms: ['instagram'] });

      const posts = await storage.getUserPosts(userId);
      expect(posts).toHaveLength(3);
    });

    it('should filter posts by status', async () => {
      await storage.createPost({ userId, content: 'Draft', platforms: ['facebook'], status: 'draft' });
      await storage.createPost({ userId, content: 'Published', platforms: ['twitter'], status: 'published' });
      await storage.createPost({ userId, content: 'Scheduled', platforms: ['instagram'], status: 'scheduled' });

      const drafts = await storage.getUserPosts(userId, { status: 'draft' });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].content).toBe('Draft');

      const published = await storage.getUserPosts(userId, { status: 'published' });
      expect(published).toHaveLength(1);
      expect(published[0].content).toBe('Published');
    });

    it('should filter posts by platform', async () => {
      await storage.createPost({ userId, content: 'FB only', platforms: ['facebook'] });
      await storage.createPost({ userId, content: 'Multi', platforms: ['facebook', 'twitter'] });
      await storage.createPost({ userId, content: 'Twitter only', platforms: ['twitter'] });

      const facebookPosts = await storage.getUserPosts(userId, { platform: 'facebook' });
      expect(facebookPosts).toHaveLength(2);

      const twitterPosts = await storage.getUserPosts(userId, { platform: 'twitter' });
      expect(twitterPosts).toHaveLength(2);
    });

    it('should filter posts by date range', async () => {
      const past = new Date('2024-01-01');
      const future = new Date('2025-12-31');
      const middle = new Date('2025-06-15');

      await storage.createPost({
        userId,
        content: 'Past post',
        platforms: ['facebook'],
        scheduledAt: past,
      });
      await storage.createPost({
        userId,
        content: 'Future post',
        platforms: ['facebook'],
        scheduledAt: future,
      });
      await storage.createPost({
        userId,
        content: 'Middle post',
        platforms: ['facebook'],
        scheduledAt: middle,
      });

      const rangedPosts = await storage.getUserPosts(userId, {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-01'),
      });

      expect(rangedPosts).toHaveLength(1);
      expect(rangedPosts[0].content).toBe('Middle post');
    });

    it('should get scheduled posts due for publishing', async () => {
      const now = new Date();
      const pastScheduled = new Date(now.getTime() - 3600000); // 1 hour ago
      const futureScheduled = new Date(now.getTime() + 3600000); // 1 hour from now

      await storage.createPost({
        userId,
        content: 'Due now',
        platforms: ['facebook'],
        status: 'scheduled',
        scheduledAt: pastScheduled,
      });
      await storage.createPost({
        userId,
        content: 'Not due yet',
        platforms: ['facebook'],
        status: 'scheduled',
        scheduledAt: futureScheduled,
      });
      await storage.createPost({
        userId,
        content: 'Draft post',
        platforms: ['facebook'],
        status: 'draft',
        scheduledAt: pastScheduled,
      });

      const duePosts = await storage.getScheduledPostsDue();
      expect(duePosts).toHaveLength(1);
      expect(duePosts[0].content).toBe('Due now');
    });

    it('should update a post', async () => {
      const post = await storage.createPost({
        userId,
        content: 'Original content',
        platforms: ['facebook'],
        status: 'draft',
      });

      const updated = await storage.updatePost(post.id, {
        content: 'Updated content',
        status: 'published',
        publishedAt: new Date(),
      });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated content');
      expect(updated?.status).toBe('published');
      expect(updated?.publishedAt).toBeInstanceOf(Date);
    });

    it('should delete a post', async () => {
      const post = await storage.createPost({
        userId,
        content: 'Delete me',
        platforms: ['facebook'],
      });

      const deleted = await storage.deletePost(post.id);
      expect(deleted).toBe(true);

      const retrieved = await storage.getPost(post.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('AI Template Management', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'templateuser',
        email: 'template@example.com',
        password: 'password123',
      });
      userId = user.id;
    });

    it('should create a template', async () => {
      const template = await storage.createTemplate({
        userId,
        name: 'Marketing Template',
        prompt: 'Create engaging marketing content',
        tone: 'professional',
        category: 'marketing',
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Marketing Template');
      expect(template.usageCount).toBe(0);
      expect(template.isPublic).toBe(false);
    });

    it('should retrieve template by ID', async () => {
      const created = await storage.createTemplate({
        userId,
        name: 'Test Template',
        prompt: 'Test prompt',
        tone: 'casual',
      });

      const retrieved = await storage.getTemplate(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Template');
    });

    it('should get user templates including public ones', async () => {
      const otherUser = await storage.createUser({
        username: 'other',
        email: 'other@example.com',
        password: 'password',
      });

      await storage.createTemplate({
        userId,
        name: 'My Private',
        prompt: 'Private prompt',
        tone: 'professional',
        isPublic: false,
      });

      await storage.createTemplate({
        userId: otherUser.id,
        name: 'Public Template',
        prompt: 'Public prompt',
        tone: 'casual',
        isPublic: true,
      });

      const templates = await storage.getUserTemplates(userId);
      expect(templates).toHaveLength(2); // Own private + other's public
    });

    it('should update a template', async () => {
      const template = await storage.createTemplate({
        userId,
        name: 'Original',
        prompt: 'Original prompt',
        tone: 'professional',
      });

      const updated = await storage.updateTemplate(template.id, {
        name: 'Updated Template',
        tone: 'casual',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Template');
      expect(updated?.tone).toBe('casual');
      expect(updated?.prompt).toBe('Original prompt'); // Unchanged
    });

    it('should delete a template', async () => {
      const template = await storage.createTemplate({
        userId,
        name: 'To Delete',
        prompt: 'Prompt',
        tone: 'professional',
      });

      const deleted = await storage.deleteTemplate(template.id);
      expect(deleted).toBe(true);

      const retrieved = await storage.getTemplate(template.id);
      expect(retrieved).toBeUndefined();
    });

    it('should increment template usage count', async () => {
      const template = await storage.createTemplate({
        userId,
        name: 'Popular',
        prompt: 'Prompt',
        tone: 'professional',
      });

      expect(template.usageCount).toBe(0);

      await storage.incrementTemplateUsage(template.id);
      const updated1 = await storage.getTemplate(template.id);
      expect(updated1?.usageCount).toBe(1);

      await storage.incrementTemplateUsage(template.id);
      await storage.incrementTemplateUsage(template.id);
      const updated2 = await storage.getTemplate(template.id);
      expect(updated2?.usageCount).toBe(3);
    });
  });

  describe('Team Management', () => {
    let ownerId: string;
    let teamId: string;

    beforeEach(async () => {
      const owner = await storage.createUser({
        username: 'owner',
        email: 'owner@example.com',
        password: 'password123',
      });
      ownerId = owner.id;
      const team = await storage.getUserTeam(ownerId);
      teamId = team!.id;
    });

    it('should get team by ID', async () => {
      const team = await storage.getTeam(teamId);
      expect(team).toBeDefined();
      expect(team?.ownerId).toBe(ownerId);
    });

    it('should get user team', async () => {
      const team = await storage.getUserTeam(ownerId);
      expect(team).toBeDefined();
      expect(team?.ownerId).toBe(ownerId);
    });

    it('should create a team', async () => {
      const newOwner = await storage.createUser({
        username: 'newowner',
        email: 'new@example.com',
        password: 'password',
      });

      const team = await storage.createTeam({
        ownerId: newOwner.id,
        name: 'Custom Team',
      });

      expect(team.id).toBeDefined();
      expect(team.ownerId).toBe(newOwner.id);
      expect(team.name).toBe('Custom Team');
    });

    it('should add team member', async () => {
      const member = await storage.createUser({
        username: 'member',
        email: 'member@example.com',
        password: 'password',
      });

      const teamMember = await storage.addTeamMember({
        teamId,
        userId: member.id,
        role: 'member',
        invitedBy: ownerId,
      });

      expect(teamMember.id).toBeDefined();
      expect(teamMember.teamId).toBe(teamId);
      expect(teamMember.userId).toBe(member.id);
      expect(teamMember.role).toBe('member');
    });

    it('should get team members', async () => {
      const member1 = await storage.createUser({
        username: 'member1',
        email: 'member1@example.com',
        password: 'password',
      });
      const member2 = await storage.createUser({
        username: 'member2',
        email: 'member2@example.com',
        password: 'password',
      });

      await storage.addTeamMember({
        teamId,
        userId: member1.id,
        role: 'member',
        invitedBy: ownerId,
      });
      await storage.addTeamMember({
        teamId,
        userId: member2.id,
        role: 'admin',
        invitedBy: ownerId,
      });

      const members = await storage.getTeamMembers(teamId);
      expect(members.length).toBeGreaterThanOrEqual(3); // Owner + 2 new members
    });

    it('should update team member role', async () => {
      const member = await storage.createUser({
        username: 'updatemember',
        email: 'update@example.com',
        password: 'password',
      });

      const teamMember = await storage.addTeamMember({
        teamId,
        userId: member.id,
        role: 'member',
        invitedBy: ownerId,
      });

      const updated = await storage.updateTeamMemberRole(teamMember.id, 'admin');
      expect(updated).toBeDefined();
      expect(updated?.role).toBe('admin');
    });

    it('should remove team member', async () => {
      const member = await storage.createUser({
        username: 'removeme',
        email: 'remove@example.com',
        password: 'password',
      });

      const teamMember = await storage.addTeamMember({
        teamId,
        userId: member.id,
        role: 'member',
        invitedBy: ownerId,
      });

      const removed = await storage.removeTeamMember(teamMember.id);
      expect(removed).toBe(true);

      const retrieved = await storage.getTeamMember(teamMember.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Social Account Management', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'socialuser',
        email: 'social@example.com',
        password: 'password123',
      });
      userId = user.id;
    });

    it('should create a social account', async () => {
      const account = await storage.createSocialAccount({
        userId,
        platform: 'facebook',
        accountName: 'Test Facebook Page',
        accountId: 'fb_12345',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
      });

      expect(account.id).toBeDefined();
      expect(account.platform).toBe('facebook');
      expect(account.isActive).toBe(true);
      expect(account.accessToken).toBe('test_access_token');
    });

    it('should get social account by ID', async () => {
      const created = await storage.createSocialAccount({
        userId,
        platform: 'twitter',
        accountName: 'Twitter Account',
        accountId: 'tw_123',
        accessToken: 'token',
      });

      const retrieved = await storage.getSocialAccount(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.platform).toBe('twitter');
    });

    it('should get user social accounts', async () => {
      await storage.createSocialAccount({
        userId,
        platform: 'facebook',
        accountName: 'FB',
        accountId: 'fb1',
        accessToken: 'token1',
      });
      await storage.createSocialAccount({
        userId,
        platform: 'twitter',
        accountName: 'TW',
        accountId: 'tw1',
        accessToken: 'token2',
      });

      const accounts = await storage.getUserSocialAccounts(userId);
      expect(accounts).toHaveLength(2);
    });

    it('should get user social accounts by platform', async () => {
      await storage.createSocialAccount({
        userId,
        platform: 'facebook',
        accountName: 'FB1',
        accountId: 'fb1',
        accessToken: 'token1',
      });
      await storage.createSocialAccount({
        userId,
        platform: 'facebook',
        accountName: 'FB2',
        accountId: 'fb2',
        accessToken: 'token2',
      });
      await storage.createSocialAccount({
        userId,
        platform: 'twitter',
        accountName: 'TW',
        accountId: 'tw1',
        accessToken: 'token3',
      });

      const fbAccounts = await storage.getUserSocialAccountsByPlatform(userId, 'facebook');
      expect(fbAccounts).toHaveLength(2);

      const twAccounts = await storage.getUserSocialAccountsByPlatform(userId, 'twitter');
      expect(twAccounts).toHaveLength(1);
    });

    it('should update social account', async () => {
      const account = await storage.createSocialAccount({
        userId,
        platform: 'instagram',
        accountName: 'Original',
        accountId: 'ig_123',
        accessToken: 'old_token',
      });

      const updated = await storage.updateSocialAccount(account.id, {
        accountName: 'Updated Name',
        accessToken: 'new_token',
      });

      expect(updated).toBeDefined();
      expect(updated?.accountName).toBe('Updated Name');
      expect(updated?.accessToken).toBe('new_token');
    });

    it('should delete social account', async () => {
      const account = await storage.createSocialAccount({
        userId,
        platform: 'linkedin',
        accountName: 'LinkedIn',
        accountId: 'li_123',
        accessToken: 'token',
      });

      const deleted = await storage.deleteSocialAccount(account.id);
      expect(deleted).toBe(true);

      const retrieved = await storage.getSocialAccount(account.id);
      expect(retrieved).toBeUndefined();
    });

    it('should get accounts needing refresh', async () => {
      const now = new Date();
      const expiringIn12Hours = new Date(now.getTime() + 12 * 3600000);
      const expiringIn48Hours = new Date(now.getTime() + 48 * 3600000);

      await storage.createSocialAccount({
        userId,
        platform: 'facebook',
        accountName: 'Expiring Soon',
        accountId: 'fb_expiring',
        accessToken: 'token1',
        expiresAt: expiringIn12Hours,
      });

      await storage.createSocialAccount({
        userId,
        platform: 'twitter',
        accountName: 'Not Expiring',
        accountId: 'tw_ok',
        accessToken: 'token2',
        expiresAt: expiringIn48Hours,
      });

      const needsRefresh = await storage.getAccountsNeedingRefresh();
      expect(needsRefresh).toHaveLength(1);
      expect(needsRefresh[0].accountName).toBe('Expiring Soon');
    });
  });

  describe('User Preferences', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'prefsuser',
        email: 'prefs@example.com',
        password: 'password123',
      });
      userId = user.id;
    });

    it('should create user preferences', async () => {
      const prefs = await storage.upsertUserPreferences({
        userId,
        theme: 'dark',
        timezone: 'America/New_York',
        emailNotifications: true,
        pushNotifications: false,
      });

      expect(prefs.id).toBeDefined();
      expect(prefs.theme).toBe('dark');
      expect(prefs.emailNotifications).toBe(true);
    });

    it('should get user preferences', async () => {
      await storage.upsertUserPreferences({
        userId,
        theme: 'light',
      });

      const prefs = await storage.getUserPreferences(userId);
      expect(prefs).toBeDefined();
      expect(prefs?.theme).toBe('light');
    });

    it('should update existing preferences (upsert)', async () => {
      await storage.upsertUserPreferences({
        userId,
        theme: 'dark',
        timezone: 'UTC',
      });

      const updated = await storage.upsertUserPreferences({
        userId,
        theme: 'light',
        emailNotifications: true,
      });

      expect(updated.theme).toBe('light');
      expect(updated.emailNotifications).toBe(true);
    });
  });

  describe('Comment Management', () => {
    let userId: string;
    let postId: string;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'commentuser',
        email: 'comment@example.com',
        password: 'password123',
      });
      userId = user.id;

      const post = await storage.createPost({
        userId,
        content: 'Post for comments',
        platforms: ['facebook'],
      });
      postId = post.id;
    });

    it('should create a comment', async () => {
      const comment = await storage.createComment(postId, userId, 'Great post!');

      expect(comment.id).toBeDefined();
      expect(comment.postId).toBe(postId);
      expect(comment.userId).toBe(userId);
      expect(comment.comment).toBe('Great post!');
    });

    it('should get post comments', async () => {
      await storage.createComment(postId, userId, 'Comment 1');
      await storage.createComment(postId, userId, 'Comment 2');
      await storage.createComment(postId, userId, 'Comment 3');

      const comments = await storage.getPostComments(postId);
      expect(comments).toHaveLength(3);
    });

    it('should delete a comment', async () => {
      const comment = await storage.createComment(postId, userId, 'Delete me');

      const deleted = await storage.deleteComment(comment.id);
      expect(deleted).toBe(true);

      const comments = await storage.getPostComments(postId);
      expect(comments).toHaveLength(0);
    });

    it('should sort comments by creation time', async () => {
      // Create comments with slight delays to ensure different timestamps
      const c1 = await storage.createComment(postId, userId, 'First');
      await new Promise(resolve => setTimeout(resolve, 10));
      const c2 = await storage.createComment(postId, userId, 'Second');
      await new Promise(resolve => setTimeout(resolve, 10));
      const c3 = await storage.createComment(postId, userId, 'Third');

      const comments = await storage.getPostComments(postId);
      expect(comments[0].comment).toBe('First');
      expect(comments[1].comment).toBe('Second');
      expect(comments[2].comment).toBe('Third');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should return undefined for non-existent template', async () => {
      const template = await storage.getTemplate('nonexistent');
      expect(template).toBeUndefined();
    });

    it('should return undefined when updating non-existent post', async () => {
      const updated = await storage.updatePost('nonexistent', { content: 'New content' });
      expect(updated).toBeUndefined();
    });

    it('should return false when deleting non-existent post', async () => {
      const deleted = await storage.deletePost('nonexistent');
      expect(deleted).toBe(false);
    });

    it('should handle empty filter results', async () => {
      const user = await storage.createUser({
        username: 'emptyuser',
        email: 'empty@example.com',
        password: 'password',
      });

      const posts = await storage.getUserPosts(user.id, { status: 'published' });
      expect(posts).toHaveLength(0);
    });

    it('should handle posts with null optional fields', async () => {
      const user = await storage.createUser({
        username: 'nulluser',
        email: 'null@example.com',
        password: 'password',
      });

      const post = await storage.createPost({
        userId: user.id,
        content: 'Minimal post',
        platforms: ['facebook'],
      });

      expect(post.mediaUrls).toBeNull();
      expect(post.scheduledAt).toBeNull();
      expect(post.publishedAt).toBeNull();
      expect(post.tone).toBeNull();
      expect(post.hashtags).toBeNull();
    });
  });
});
