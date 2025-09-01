
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


const rationalePrompt = ai.definePrompt({
  name: 'pestSprayingRationalePrompt',
  input: { schema: z.object({
      recommendation: z.string(),
      weather: z.object({
          description: z.string(),
          temperature: z.number(),
          windSpeed: z.number(),
          humidity: z.number(),
          chanceOfRain: z.enum(['Low', 'Medium', 'High']),
        }),
  })},
  output: { schema: z.object({ rationale: z.string() }) },
  prompt: `You are an expert agricultural advisor. Based on the following weather data and a pre-determined recommendation, provide a concise, helpful rationale (1-2 sentences) explaining *why* the recommendation was made.
  
  Weather:
  - Condition: {{weather.description}}
  - Temperature: {{weather.temperature}}°F
  - Wind Speed: {{weather.windSpeed}} mph
  - Humidity: {{weather.humidity}}%
  - Chance of Rain: {{weather.chanceOfRain}}
  
  Recommendation: {{recommendation}}
  
  Explain the reasoning. For example, if the recommendation is 'Bad' due to high wind, explain that high wind can cause spray drift. If it's 'Bad' due to rain, explain that rain can wash away the pesticide.`,
});


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
        
        // 2. Determine recommendation and infer chance of rain based on logic.
        let recommendation: 'Good' | 'Caution' | 'Bad' = 'Good';
        let chanceOfRain: 'Low' | 'Medium' | 'High' = 'Low';

        const hasRain = /rain|drizzle|thunderstorm/i.test(weather.description);

        if (hasRain) {
            chanceOfRain = 'High';
            recommendation = 'Bad';
        }

        if (weather.windSpeed > 10) {
            recommendation = 'Bad';
        } else if (weather.windSpeed > 7) {
            // If it's not already bad due to rain, set to caution for wind.
            if (recommendation !== 'Bad') {
                recommendation = 'Caution';
            }
        }

        // 3. Call the rationale prompt with the complete, consistent weather data.
        const { output } = await rationalePrompt({
            recommendation,
            weather: { 
                description: weather.description,
                temperature: weather.temperature,
                windSpeed: weather.windSpeed,
                humidity: weather.humidity,
                chanceOfRain 
            }, 
        });

        if (!output?.rationale) {
            throw new Error('Failed to generate a rationale from the AI model.');
        }

        // 4. Return the final, complete output.
        return {
            recommendation,
            rationale: output.rationale,
            windSpeed: weather.windSpeed,
            chanceOfRain,
        };

    } catch (error) {
        console.error(`Error in pestSprayingAdvisorFlow:`, error);
        throw new Error('Failed to generate pest spraying advice. Please try again.');
    }
  }
);
