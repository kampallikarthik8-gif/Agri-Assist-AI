
'use server';

/**
 * @fileOverview An AI agent for predicting crop yield.
 * 
 * - yieldPrediction - A function that generates a 6-month yield forecast.
 * - YieldPredictionInput - The input type for the yieldPrediction function.
 * - YieldPredictionOutput - The return type for the yieldPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './weather-service';

const YieldPredictionInputSchema = z.object({
  location: z.string().describe("The location for the yield prediction."),
  cropType: z.string().describe("The primary crop type being grown."),
});
export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const MonthlyYieldSchema = z.object({
    month: z.string().describe("The month for the forecast (e.g., 'July')."),
    yield: z.number().describe("The predicted yield in tons per unit area."),
});

const YieldPredictionOutputSchema = z.object({
  forecast: z.array(MonthlyYieldSchema).describe('A 6-month yield forecast.'),
});
export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;

export async function yieldPrediction(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
  return yieldPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yieldPredictionPrompt',
  input: {schema: YieldPredictionInputSchema},
  output: {schema: YieldPredictionOutputSchema},
  tools: [getWeather],
  prompt: `You are an expert agricultural AI specializing in yield prediction.

  First, get the current weather for the user's location to understand the climate: {{{location}}}.
  
  Based on the location, crop type ({{{cropType}}}), and the current weather conditions, generate a plausible 6-month yield forecast. 
  
  Assume standard farming practices. The yield should be in tons per unit area (e.g., tons/acre or tons/hectare, be consistent).
  
  Provide a list of 6 monthly forecasts, starting from the next full month.`,
});

const yieldPredictionFlow = ai.defineFlow(
  {
    name: 'yieldPredictionFlow',
    inputSchema: YieldPredictionInputSchema,
    outputSchema: YieldPredictionOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in yieldPredictionFlow", error);
      throw new Error('Failed to generate yield prediction.');
    }
  }
);
