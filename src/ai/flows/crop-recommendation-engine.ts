
'use server';

/**
 * @fileOverview A crop recommendation AI agent.
 * 
 * - cropRecommendationEngine - A function that handles the crop recommendation process.
 * - CropRecommendationEngineInput - The input type for the cropRecommendationEngine function.
 * - CropRecommendationEngineOutput - The return type for the cropRecommendationEngine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './weather-service';

const CropRecommendationEngineInputSchema = z.object({
  location: z
    .string()
    .describe('Geographic location for the farm (e.g., "Napa Valley, CA").'),
  lat: z.number().optional().describe('The latitude.'),
  lon: z.number().optional().describe('The longitude.'),
});

export type CropRecommendationEngineInput = z.infer<
  typeof CropRecommendationEngineInputSchema
>;

const CropRecommendationEngineOutputSchema = z.object({
  recommendedCrops: z
    .array(z.string())
    .describe('A list of recommended crops based on the input data.'),
  rationale: z
    .string()
    .describe('A detailed explanation of why the crops were recommended, considering inferred soil analysis, climate data, and market demand.'),
});

export type CropRecommendationEngineOutput = z.infer<
  typeof CropRecommendationEngineOutputSchema
>;

export async function cropRecommendationEngine(
  input: CropRecommendationEngineInput
): Promise<CropRecommendationEngineOutput> {
  return cropRecommendationEngineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationEnginePrompt',
  input: {schema: CropRecommendationEngineInputSchema},
  output: {schema: CropRecommendationEngineOutputSchema},
  tools: [getWeather],
  prompt: `You are an expert agricultural advisor. 
  
First, get the current weather for the user's location.
If lat/lon are provided, use them. Otherwise, use the location name.

Then, based on the provided location, infer the typical soil composition for that area.

Based on your inferred soil analysis and the weather data you fetched, recommend the most suitable crops to plant. Also consider general market demand for commodity crops in your recommendation.

Location: {{{location}}}

Consider all factors to provide a well-reasoned recommendation.

Output the response in JSON format, with keys for "recommendedCrops" (a list of crop names) and "rationale" (an explanation).`,
});

const cropRecommendationEngineFlow = ai.defineFlow(
  {
    name: 'cropRecommendationEngineFlow',
    inputSchema: CropRecommendationEngineInputSchema,
    outputSchema: CropRecommendationEngineOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} for cropRecommendationEngineFlow`);
            const {output} = await prompt(input);
            if (output) {
                return output;
            }
            console.warn(`Attempt ${i + 1} returned null output.`);
        } catch (error) {
            console.error(`Error in cropRecommendationEngineFlow on attempt ${i + 1}`, error);
            if (i === maxRetries - 1) {
                // If it's the last retry, re-throw a more specific error
                 throw new Error('Failed to get crop recommendations after multiple attempts.');
            }
        }
    }
    // If all retries fail to produce an output
    throw new Error('Failed to get crop recommendations.');
  }
);
