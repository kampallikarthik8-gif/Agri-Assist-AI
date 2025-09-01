
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
    chanceOfRain: z.enum(['Low', 'Medium', 'High']).describe('The likelihood of rain in the next few hours (e.g., "Low", "Medium", "High").'),
});


export type PestSprayingAdvisorOutput = z.infer<typeof PestSprayingAdvisorOutputSchema>;

export async function pestSprayingAdvisor(
  input: PestSprayingAdvisorInput
): Promise<PestSprayingAdvisorOutput> {
  return pestSprayingAdvisorFlow(input);
}

const pestSprayingAdvisorFlow = ai.defineFlow(
  {
    name: 'pestSprayingAdvisorFlow',
    inputSchema: PestSprayingAdvisorInputSchema,
    outputSchema: PestSprayingAdvisorOutputSchema,
  },
  async ({ location }) => {
    try {
        // 1. Get the real weather data.
        const weather = await getWeather( { location });
        
        // 2. Determine recommendation, rationale, and chance of rain based on deterministic logic.
        let recommendation: 'Good' | 'Caution' | 'Bad' = 'Good';
        let rationale: string = '';
        let chanceOfRain: 'Low' | 'Medium' | 'High' = 'Low';

        const hasRain = /rain|drizzle|thunderstorm/i.test(weather.description);
        const highWind = weather.windSpeed > 10;
        const moderateWind = weather.windSpeed > 7;

        if (hasRain && highWind) {
            recommendation = 'Bad';
            rationale = 'Conditions are poor. High winds will cause spray drift, and rain will wash away the pesticide.';
            chanceOfRain = 'High';
        } else if (hasRain) {
            recommendation = 'Bad';
            rationale = 'Conditions are poor. Upcoming rain will likely wash away the pesticide before it can be effective.';
            chanceOfRain = 'High';
        } else if (highWind) {
            recommendation = 'Bad';
            rationale = 'Conditions are poor. Wind speeds are too high, which can cause significant spray drift and uneven application.';
        } else if (moderateWind) {
            recommendation = 'Caution';
            rationale = 'Use caution. Moderate winds may cause some spray drift. Spraying is possible but not ideal.';
        } else {
            recommendation = 'Good';
            rationale = 'Conditions are good for spraying. Winds are calm and there is no rain expected.';
        }

        // 3. Return the final, complete output.
        return {
            recommendation,
            rationale,
            windSpeed: weather.windSpeed,
            chanceOfRain,
        };

    } catch (error) {
        console.error(`Error in pestSprayingAdvisorFlow:`, error);
        throw new Error('Failed to generate pest spraying advice. Please try again.');
    }
  }
);
