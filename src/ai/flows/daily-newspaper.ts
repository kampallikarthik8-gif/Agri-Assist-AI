
'use server';

/**
 * @fileOverview An AI agent for generating a daily agricultural newspaper.
 * 
 * - dailyNewspaper - A function that handles the newspaper generation process.
 * - DailyNewspaperInput - The input type for the dailyNewspaper function.
 * - DailyNewspaperOutput - The return type for the dailyNewspaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyNewspaperInputSchema = z.object({
  region: z.string().describe('The state or region in India to generate the newspaper for (e.g., Punjab, Andhra Pradesh).'),
});

export type DailyNewspaperInput = z.infer<typeof DailyNewspaperInputSchema>;

const ArticleSchema = z.object({
    headline: z.string().describe('A compelling headline for the news article.'),
    content: z.string().describe('The full content of the news article, written in a journalistic style. Should be a few paragraphs long.'),
});

const DailyNewspaperOutputSchema = z.object({
  newspaperTitle: z.string().describe('A creative and fitting title for the newspaper, like "The Agri Times" or "Kisan Today".'),
  articles: z.array(ArticleSchema).describe('A list of 2-3 relevant news articles.'),
});

export type DailyNewspaperOutput = z.infer<typeof DailyNewspaperOutputSchema>;

export async function dailyNewspaper(
  input: DailyNewspaperInput
): Promise<DailyNewspaperOutput> {
  return dailyNewspaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyNewspaperPrompt',
  input: {schema: DailyNewspaperInputSchema},
  output: {schema: DailyNewspaperOutputSchema},
  prompt: `You are an expert agricultural journalist compiling a daily newspaper for farmers in India.
  
  Your task is to generate a short newspaper focused on the most relevant and recent agricultural news for the specified region: {{{region}}}.
  
  The newspaper should contain:
  1. A creative title for the newspaper itself (e.g., "The Farmer's Chronicle," "Krishi Jagran Daily").
  2. 2-3 well-written articles, each with a clear headline and detailed content.
  
  Topics for articles should be timely and relevant to farmers, such as:
  - Updates on government schemes (like PM-KISAN).
  - Market price fluctuations for major crops in the region.
  - Weather advisories (e.g., monsoon forecasts, heatwave warnings).
  - New farming techniques or technologies.
  - Pest or disease outbreak warnings.
  
  Write in a clear, journalistic style that is easy for a farmer to understand.
  
  Region: {{{region}}}, India
  
  Provide the output in the specified JSON format.`,
});

const dailyNewspaperFlow = ai.defineFlow(
  {
    name: 'dailyNewspaperFlow',
    inputSchema: DailyNewspaperInputSchema,
    outputSchema: DailyNewspaperOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in dailyNewspaperFlow", error);
      throw new Error('Failed to generate the daily newspaper.');
    }
  }
);
