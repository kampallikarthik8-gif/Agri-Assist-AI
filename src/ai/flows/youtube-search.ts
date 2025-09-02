
'use server';

/**
 * @fileOverview An AI agent for searching agricultural videos on YouTube.
 * 
 * - youtubeSearch - A function that searches YouTube for videos.
 * - YouTubeSearchInput - The input type for the youtubeSearch function.
 * - YouTubeSearchOutput - The return type for the youtubeSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const YouTubeSearchInputSchema = z.object({
  query: z.string().describe('The search query for YouTube.'),
});

export type YouTubeSearchInput = z.infer<typeof YouTubeSearchInputSchema>;

const VideoSchema = z.object({
    videoId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnailUrl: z.string().url(),
    channelTitle: z.string(),
});

const YouTubeSearchOutputSchema = z.object({
  videos: z.array(VideoSchema).describe('A list of relevant YouTube videos.'),
});

export type YouTubeSearchOutput = z.infer<typeof YouTubeSearchOutputSchema>;

export async function youtubeSearch(
  input: YouTubeSearchInput
): Promise<YouTubeSearchOutput> {
  return youtubeSearchFlow(input);
}

const youtubeSearchFlow = ai.defineFlow(
  {
    name: 'youtubeSearchFlow',
    inputSchema: YouTubeSearchInputSchema,
    outputSchema: YouTubeSearchOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not set in the environment variables.');
    }

    const finalQuery = `${query} agriculture`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(finalQuery)}&maxResults=12&type=video&relevanceLanguage=te&regionCode=IN&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("YouTube API Error:", data);
            const errorMessage = data?.error?.message || `Failed to fetch YouTube videos with status: ${response.status}`;
            
            if (errorMessage.includes('API_NOT_ACTIVATED') || errorMessage.includes('are blocked')) {
                throw new Error('The YouTube Data API v3 is not enabled for your project. Please enable it in your Google Cloud console.');
            }
            throw new Error(`YouTube API Error: ${errorMessage}`);
        }

        const videos = data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
        }));

        return { videos };

    } catch (error: any) {
        console.error("Error in youtubeSearchFlow", error);
        // Re-throw the error to be caught by the client
        throw error;
    }
  }
);
