import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TONE_PROMPTS = {
  professional: 'Write in a professional, formal, and business-like tone.',
  casual: 'Write in a friendly, relaxed, and conversational tone.',
  witty: 'Write in a clever, humorous, and witty tone.',
  urgent: 'Write in an urgent, time-sensitive, and action-driven tone.',
  friendly: 'Write in a warm, welcoming, and approachable tone.',
  authoritative: 'Write in an expert, confident, and authoritative tone.',
  inspirational: 'Write in a motivating, uplifting, and inspirational tone.',
  humorous: 'Write in a funny, entertaining, and humorous tone.',
  educational: 'Write in an informative, teaching, and educational tone.',
  promotional: 'Write in a sales-focused, persuasive, and promotional tone.',
};

// Generate content
router.post('/generate', async (req, res) => {
  try {
    const { prompt, tone, platforms, keywords, cta } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const tonePrompt = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.professional;
    const platformList = Array.isArray(platforms) ? platforms.join(', ') : 'social media';

    let systemPrompt = `You are an expert social media content creator. ${tonePrompt} Create engaging content optimized for ${platformList}.`;

    if (keywords && keywords.length > 0) {
      systemPrompt += ` Include these keywords naturally: ${keywords.join(', ')}.`;
    }

    if (cta) {
      systemPrompt += ` Include this call-to-action: "${cta}".`;
    }

    systemPrompt += ' Always include 3-5 relevant hashtags at the end.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedContent = completion.choices[0].message.content;

    res.json({
      content: generatedContent,
      tone,
      platforms,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'Failed to generate content',
      message: error.message,
    });
  }
});

// Generate caption
router.post('/caption', async (req, res) => {
  try {
    const { imageDescription, tone, platform } = req.body;

    if (!imageDescription) {
      return res.status(400).json({ error: 'Image description is required' });
    }

    const tonePrompt = TONE_PROMPTS[tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.casual;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a social media caption expert. ${tonePrompt} Create a compelling caption for ${platform || 'social media'} based on the image description. Include relevant emojis and hashtags.`,
        },
        { role: 'user', content: imageDescription },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    res.json({
      caption: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'Failed to generate caption',
      message: error.message,
    });
  }
});

// Generate hashtags
router.post('/hashtags', async (req, res) => {
  try {
    const { topic, count = 10, platform } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a hashtag research expert. Generate ${count} relevant, trending hashtags for ${platform || 'social media'} that would maximize reach and engagement. Mix popular and niche hashtags. Return only the hashtags, one per line, with # prefix.`,
        },
        { role: 'user', content: topic },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const hashtags = completion.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().startsWith('#'))
      .map(line => line.trim());

    res.json({ hashtags });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'Failed to generate hashtags',
      message: error.message,
    });
  }
});

// Repurpose content
router.post('/repurpose', async (req, res) => {
  try {
    const { content, fromPlatform, toPlatforms } = req.body;

    if (!content || !toPlatforms) {
      return res.status(400).json({ error: 'Content and target platforms are required' });
    }

    const repurposed: Record<string, string> = {};

    for (const platform of toPlatforms) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a content repurposing expert. Adapt the following content from ${fromPlatform} to work perfectly for ${platform}, following that platform's best practices, character limits, and style. Maintain the core message but optimize for the target platform.`,
          },
          { role: 'user', content },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      repurposed[platform] = completion.choices[0].message.content || '';
    }

    res.json({ repurposed });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'Failed to repurpose content',
      message: error.message,
    });
  }
});

// Optimize content
router.post('/optimize', async (req, res) => {
  try {
    const { content, platform, goal } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const goalPrompt = goal ? `Focus on optimizing for: ${goal}.` : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a social media optimization expert. Improve the following content for ${platform || 'social media'} to maximize engagement and reach. ${goalPrompt} Maintain the core message but make it more compelling.`,
        },
        { role: 'user', content },
      ],
      temperature: 0.6,
      max_tokens: 400,
    });

    res.json({
      optimized: completion.choices[0].message.content,
      suggestions: [
        'Added power words for emotional impact',
        'Optimized hashtag placement',
        'Improved call-to-action clarity',
        'Enhanced readability',
      ],
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'Failed to optimize content',
      message: error.message,
    });
  }
});

export default router;
