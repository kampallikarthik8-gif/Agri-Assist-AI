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

const CropRecommendationEngineInputSchema = z.object({
  soilAnalysis: z
    .string()
    .describe('Detailed soil analysis data, including pH, nitrogen, phosphorus, potassium, and micronutrient levels.'),
  locationData: z
    .string()
    .describe('Geographic location data, including latitude, longitude, and altitude.'),
  climateData: z
    .string()
    .describe('Climate data for the location, including average rainfall, temperature ranges, and growing season length.'),
  marketDemand: z
    .string()
    .describe('Information on current market demand for various crops in the region.'),
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
    .describe('A detailed explanation of why the crops were recommended, considering soil analysis, climate data, and market demand.'),
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
  prompt: `You are an expert agricultural advisor. Based on the provided soil analysis, location data, climate data, and market demand, recommend the most suitable crops to plant.

Soil Analysis: {{{soilAnalysis}}}
Location Data: {{{locationData}}}
Climate Data: {{{climateData}}}
Market Demand: {{{marketDemand}}}

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
    const {output} = await prompt(input);
    return output!;
  }
);
