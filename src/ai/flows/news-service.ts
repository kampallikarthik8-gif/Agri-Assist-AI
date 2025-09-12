
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Parser from 'rss-parser';

const NewsServiceInputSchema = z.object({
  query: z.string().describe("The search query for news articles (e.g., 'agriculture subsidies' or 'Andhra Pradesh')."),
});

const NewsArticleSchema = z.object({
    source: z.object({
        id: z.string().nullable(),
        name: z.string(),
    }),
    title: z.string(),
    description: z.string().nullable(),
    url: z.string().url(),
    urlToImage: z.string().url().nullable(),
    publishedAt: z.string(),
});

const NewsServiceOutputSchema = z.object({
    articles: z.array(NewsArticleSchema).describe("A list of relevant news articles."),
});


// A simple regex to extract the image URL from the description's img tag
const extractImageFromDescription = (description: string): string | null => {
    const match = description.match(/<img src="([^"]+)"/);
    return match ? match[1] : null;
};

// We define the logic outside the flow so we can call it from server components too.
export async function fetchAndParseNews(query: string): Promise<{ articles?: z.infer<typeof NewsArticleSchema>[], error?: string }> {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)} agriculture&hl=en-IN&gl=IN&ceid=IN:en`;
    const parser = new Parser();

    try {
        const feed = await parser.parseURL(url);
        
        if (!feed.items) {
            return { articles: [] };
        }

        const articles = feed.items.map(item => ({
            source: {
                id: item.source?.url || null,
                name: item.source?.value || item.creator || 'Google News',
            },
            title: item.title || 'No title',
            description: item.contentSnippet || null,
            url: item.link || '',
            urlToImage: extractImageFromDescription(item.content || ''),
            publishedAt: item.isoDate || new Date().toISOString(),
        })).filter(article => article.title && article.title !== 'No title' && article.url && article.description);
        
        return { articles };

    } catch (error: any) {
        console.error('Error fetching or parsing RSS feed:', error);
        return { error: `Could not connect to the news service. Details: ${error.message}` };
    }
}

const newsServiceFlow = ai.defineFlow(
  {
    name: 'newsServiceFlow',
    inputSchema: NewsServiceInputSchema,
    outputSchema: NewsServiceOutputSchema,
  },
  async ({ query }) => {
      const result = await fetchAndParseNews(query);
      if (result.error) {
          throw new Error(result.error);
      }
      return { articles: result.articles || [] };
  }
);
