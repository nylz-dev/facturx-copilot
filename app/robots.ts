import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Search engines and AI assistants (GEO) are explicitly welcome on public pages.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'MistralAI-User'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/success'] },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/api/'] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
