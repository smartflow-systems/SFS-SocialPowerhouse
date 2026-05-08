// Ported from SocialScaleBooster — platform-specific caption/hashtag/post generators
// with per-call token tracking. The existing route-level OpenAI client in
// server/api/ai.ts handles the request/response layer; these helpers are for
// direct service-layer use (e.g. scheduled automation, AI usage metering).

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GeneratePostOptions {
  topic: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  tone: 'professional' | 'friendly' | 'playful' | 'luxury';
  industry?: string;
  targetAudience?: string;
}

export interface GenerateCaptionOptions {
  description: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  tone?: 'professional' | 'friendly' | 'playful' | 'luxury';
  maxLength?: number;
}

export interface GenerateHashtagsOptions {
  topic: string;
  count: number;
  platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  industry?: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

const PLATFORM_LIMITS = {
  instagram: { maxLength: 2200, hashtagLimit: 30 },
  facebook: { maxLength: 63206, hashtagLimit: 20 },
  twitter: { maxLength: 280, hashtagLimit: 10 },
  linkedin: { maxLength: 3000, hashtagLimit: 15 },
  tiktok: { maxLength: 2200, hashtagLimit: 20 }
};

const TONE_PROMPTS = {
  professional: "Write in a professional, authoritative tone suitable for business communications.",
  friendly: "Write in a warm, conversational, and approachable tone.",
  playful: "Write in an energetic, fun, and creative tone that engages the audience.",
  luxury: "Write in an elegant, sophisticated tone that conveys premium quality and exclusivity."
};

export async function generatePost(options: GeneratePostOptions): Promise<AIResponse> {
  const { topic, platform, tone, industry, targetAudience } = options;
  const limits = PLATFORM_LIMITS[platform];
  const toneInstruction = TONE_PROMPTS[tone];

  const systemPrompt = `You are an expert social media content creator. Create engaging, platform-optimized posts that drive engagement and conversions.

Platform: ${platform}
Character limit: ${limits.maxLength}
Hashtag limit: ${limits.hashtagLimit}

Guidelines:
- ${toneInstruction}
- Include relevant hashtags (but don't exceed the platform limit)
- Make the content engaging and actionable
- Include a clear call-to-action when appropriate
- Keep within the character limit
${industry ? `- Tailor content for the ${industry} industry` : ''}
${targetAudience ? `- Target audience: ${targetAudience}` : ''}

Format the response as a complete social media post ready to publish.`;

  const userPrompt = `Create a ${platform} post about: ${topic}

Make it engaging, relevant, and optimized for ${platform}. Include hashtags.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return { content, tokensUsed, model: 'gpt-4o-mini' };
  } catch (error: any) {
    console.error('OpenAI generatePost error:', error);
    throw new Error(`Failed to generate post content: ${error.message}`);
  }
}

export async function generateCaption(options: GenerateCaptionOptions): Promise<AIResponse> {
  const { description, platform, tone = 'friendly', maxLength } = options;
  const limits = PLATFORM_LIMITS[platform];
  const toneInstruction = TONE_PROMPTS[tone];
  const effectiveMaxLength = maxLength || limits.maxLength;

  const systemPrompt = `You are an expert social media caption writer. Create compelling captions that drive engagement.

Platform: ${platform}
Maximum length: ${effectiveMaxLength} characters
${toneInstruction}

Guidelines:
- Make the caption engaging and relatable
- Include relevant emojis where appropriate
- Ask engaging questions or include call-to-actions
- Keep within the character limit
- Don't include hashtags (they will be added separately)

Format the response as a clean caption ready to use.`;

  const userPrompt = `Write a caption for this content: ${description}

Make it ${tone} and engaging for ${platform}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return { content, tokensUsed, model: 'gpt-4o-mini' };
  } catch (error: any) {
    console.error('OpenAI generateCaption error:', error);
    throw new Error(`Failed to generate caption: ${error.message}`);
  }
}

export async function generateHashtags(options: GenerateHashtagsOptions): Promise<AIResponse> {
  const { topic, count, platform = 'instagram', industry } = options;
  const limits = PLATFORM_LIMITS[platform];
  const maxHashtags = Math.min(count, limits.hashtagLimit);

  const systemPrompt = `You are a social media hashtag expert. Generate relevant, trending hashtags that will maximize reach and engagement.

Platform: ${platform}
Requested count: ${maxHashtags}
${industry ? `Industry: ${industry}` : ''}

Guidelines:
- Mix popular and niche hashtags for optimal reach
- Include industry-specific hashtags when relevant
- Ensure hashtags are currently relevant and trending
- Format as a clean list of hashtags with # symbols
- Return exactly ${maxHashtags} hashtags
${industry ? `- Focus on hashtags relevant to the ${industry} industry` : ''}

Example format:
#hashtag1 #hashtag2 #hashtag3`;

  const userPrompt = `Generate ${maxHashtags} relevant hashtags for: ${topic}

Focus on hashtags that will help reach the target audience on ${platform}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return { content, tokensUsed, model: 'gpt-4o-mini' };
  } catch (error: any) {
    console.error('OpenAI generateHashtags error:', error);
    throw new Error(`Failed to generate hashtags: ${error.message}`);
  }
}
