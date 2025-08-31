
'use server';

/**
 * @fileOverview An AI agent for advising on optimal pest spraying conditions.
 *
 * - pestSprayingAdvisor - A function that provides a recommendation for pest spraying.
 * - PestSprayingAdvisorInput - The input type for the pestSprayingAdvisor function.
 * - PestSprayingAdvisorOutput - The return type for the pestSprayingAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './weather-service';

const PestSprayingAdvisorInputSchema = z.object({
  location: z.string().describe('The location of the field to check conditions for.'),
});

export type PestSprayingAdvisorInput = z.infer<typeof PestSprayingAdvisorInputSchema>;

const PestSprayingAdvisorOutputSchema = z.object({
    recommendation: z.enum(['Good', 'Caution', 'Bad']).describe('The overall recommendation for spraying.'),
    rationale: z.string().describe('A detailed explanation for the recommendation, considering weather factors.'),
    windSpeed: z.number().describe('The current wind speed in mph.'),
    chanceOfRain: z.string().describe('The likelihood of rain in the next few hours (e.g., "Low", "Medium", "High").'),
});

export type PestSprayingAdvisorOutput = z.infer<typeof PestSprayingAdvisorOutputSchema>;

export async function pestSprayingAdvisor(
  input: PestSprayingAdvisorInput
): Promise<PestSprayingAdvisorOutput> {
  return pestSprayingAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pestSprayingAdvisorPrompt',
  input: {schema: PestSprayingAdvisorInputSchema},
  output: {schema: PestSprayingAdvisorOutputSchema},
  tools: [getWeather],
  prompt: `You are an expert agricultural advisor specializing in pesticide application.

  First, get the current weather for the user's location: {{{location}}}.

  The weather tool will provide you with data including wind speed and a description of precipitation. Use this data to determine if conditions are suitable for spraying pesticides.
  - Wind speed: Avoid spraying if wind is too high (e.g., above 10 mph) to prevent drift.
  - Precipitation: Avoid spraying if rain is imminent, as it will wash the pesticide off. Determine a 'Low', 'Medium', or 'High' chance of rain from the weather description.
  - Temperature: Consider extreme temperatures that might affect pesticide efficacy or plant stress.

  Based on your analysis, provide a clear recommendation ('Good', 'Caution', or 'Bad') and a concise rationale. 
  
  Crucially, you must return a numeric value for the current wind speed in the 'windSpeed' field.
  You must also return a qualitative chance of rain (a string: 'Low', 'Medium', or 'High') in the 'chanceOfRain' field.

  Location: {{{location}}}
  `,
});

const pestSprayingAdvisorFlow = ai.defineFlow(
  {
    name: 'pestSprayingAdvisorFlow',
    inputSchema: PestSprayingAdvisorInputSchema,
    outputSchema: PestSprayingAdvisorOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} for pestSprayingAdvisorFlow`);
            const {output} = await prompt(input);
            if (output) {
                return output;
            }
            console.warn(`Attempt ${i + 1} returned null output.`);
        } catch (error) {
            console.error(`Error in pestSprayingAdvisorFlow on attempt ${i + 1}`, error);
            if (i === maxRetries - 1) {
                // If it's the last retry, rethrow the error
                throw new Error('Failed to generate a response from the AI model after multiple attempts.');
            }
        }
    }
    // If all retries fail to produce an output
    throw new Error('Failed to generate a response from the AI model after multiple attempts.');
  }
);
