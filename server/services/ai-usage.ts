import { db } from '../db';
import { aiGenerations, users } from '../../shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// Re-export types for consumers
export type AiGenerationType = 'post' | 'caption' | 'hashtags';

export interface InsertAiGeneration {
  userId: string;
  type: AiGenerationType;
  prompt?: string;
  result?: string;
  tokensUsed?: number;
  model?: string;
  platform?: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  isOverLimit: boolean;
}

export interface UsageCheckResult {
  canGenerate: boolean;
  usage: UsageStats;
  message?: string;
}

// Monthly limit per subscription tier
const TIER_LIMITS: Record<string, number> = {
  starter: 50,
  growth: 200,
  agency: 1000,
  enterprise: -1, // unlimited
};

/**
 * Check if a user can perform AI generation based on their tier and monthly usage
 */
export async function checkAIUsageLimit(userId: string): Promise<UsageCheckResult> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRows[0]) throw new Error('User not found');

  const tier = userRows[0].subscriptionTier ?? 'starter';
  const limit = TIER_LIMITS[tier] ?? 50;

  const monthlyRows = await db
    .select()
    .from(aiGenerations)
    .where(
      and(
        eq(aiGenerations.userId, userId),
        gte(aiGenerations.createdAt, monthStart)
      )
    );

  const used = monthlyRows.length;
  const remaining = limit === -1 ? Infinity : Math.max(0, limit - used);
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const isOverLimit = limit !== -1 && used >= limit;

  const usageStats: UsageStats = {
    used,
    limit,
    remaining: remaining === Infinity ? 999999 : remaining,
    resetDate,
    isOverLimit,
  };

  return {
    canGenerate: !isOverLimit,
    usage: usageStats,
    message: isOverLimit
      ? `AI generation limit reached. You've used ${used}/${limit} generations this month. Upgrade your plan for more.`
      : undefined,
  };
}

/**
 * Record an AI generation event
 */
export async function recordAIGeneration(data: InsertAiGeneration): Promise<void> {
  await db.insert(aiGenerations).values({
    userId: data.userId,
    type: data.type,
    prompt: data.prompt,
    result: data.result,
    tokensUsed: data.tokensUsed ?? 0,
    model: data.model ?? 'gpt-4o-mini',
    platform: data.platform,
    createdAt: new Date(),
  });
}

/**
 * Get detailed usage stats for a user including breakdown by type
 */
export async function getUsageStats(userId: string): Promise<UsageStats & {
  recentGenerations: typeof aiGenerations.$inferSelect[];
  generationsByType: Record<string, number>;
}> {
  const usageCheck = await checkAIUsageLimit(userId);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const recentGenerations = await db
    .select()
    .from(aiGenerations)
    .where(
      and(
        eq(aiGenerations.userId, userId),
        gte(aiGenerations.createdAt, monthStart)
      )
    )
    .orderBy(aiGenerations.createdAt);

  const generationsByType = recentGenerations.reduce((acc, gen) => {
    acc[gen.type] = (acc[gen.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    ...usageCheck.usage,
    recentGenerations,
    generationsByType,
  };
}

/**
 * Validate AI generation request parameters
 */
export function validateGenerationRequest(
  type: string,
  data: any
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!['post', 'caption', 'hashtags'].includes(type)) {
    errors.push('Invalid generation type. Must be: post, caption, or hashtags');
  }

  switch (type) {
    case 'post':
      if (!data.topic) errors.push('Topic is required for post generation');
      if (!data.platform) errors.push('Platform is required for post generation');
      if (!data.tone) errors.push('Tone is required for post generation');
      break;
    case 'caption':
      if (!data.description) errors.push('Description is required for caption generation');
      if (!data.platform) errors.push('Platform is required for caption generation');
      break;
    case 'hashtags':
      if (!data.topic) errors.push('Topic is required for hashtag generation');
      if (!data.count || data.count < 1 || data.count > 30) {
        errors.push('Count must be between 1 and 30 for hashtag generation');
      }
      break;
  }

  return { isValid: errors.length === 0, errors };
}
