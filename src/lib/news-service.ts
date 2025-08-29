
'use server';

import { z } from 'zod';

const NewsArticleSchema = z.object({
    source: z.object({
        id: z.string().nullable(),
        name: z.string(),
    }),
    author: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    url: z.string().url(),
    urlToImage: z.string().url().nullable(),
    publishedAt: z.string(),
    content: z.string().nullable(),
});

const NewsApiResponseSchema = z.object({
    status: z.string(),
    totalResults: z.number(),
    articles: z.array(NewsArticleSchema),
});

const NewsApiErrorSchema = z.object({
    status: z.string(),
    code: z.string(),
    message: z.string(),
})

export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export async function fetchNews(query: string): Promise<{ articles?: NewsArticle[], error?: string }> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.error('NEWS_API_KEY is not set in the environment variables.');
        return { error: 'News service is not configured. Please contact support.' };
    }

    // Using the top-headlines endpoint for better quality, targeting India, and then filtering by query.
    const url = `https://newsapi.org/v2/top-headlines?country=in&category=business&q=agriculture%20AND%20(${encodeURIComponent(query)})&sortBy=publishedAt&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            const errorData = NewsApiErrorSchema.safeParse(data);
            if (errorData.success) {
                 console.error(`NewsAPI Error: ${errorData.data.message}`);
                 if (errorData.data.code === 'apiKeyMissing' || errorData.data.code === 'apiKeyInvalid') {
                    return { error: 'The news service API key is invalid or missing.' };
                 }
                 return { error: `Failed to fetch news: ${errorData.data.message}` };
            }
            return { error: 'An unknown error occurred while fetching news.' };
        }
        
        const parsedData = NewsApiResponseSchema.safeParse(data);
        if (parsedData.success) {
            // Filter out articles that have been removed or have no title/description
            const validArticles = parsedData.data.articles.filter(article => 
                article.title && 
                article.title !== "[Removed]" && 
                article.description && 
                article.description !== "[Removed]"
            );
            return { articles: validArticles };
        } else {
            console.error("Failed to parse NewsAPI response:", parsedData.error);
            return { error: 'Failed to parse news data.' };
        }

    } catch (error) {
        console.error('Error fetching news:', error);
        return { error: 'Could not connect to the news service.' };
    }
}
