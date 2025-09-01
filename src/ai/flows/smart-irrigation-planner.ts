
'use server';

/**
 * @fileOverview A smart irrigation planner AI agent.
 *
 * - smartIrrigationPlanner - A function that handles the irrigation planning process.
 * - SmartIrrigationPlannerInput - The input type for the smartIrrigationPlanner function.
 * - SmartIrrigationPlannerOutput - The return type for the smartIrrigationPlanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather, type WeatherOutput } from './weather-service';

const SmartIrrigationPlannerInputSchema = z.object({
  location: z.string().describe("The location of the field (e.g. 'San Francisco, CA')."),
  cropType: z.string().describe('The type of crop being grown.'),
});
export type SmartIrrigationPlannerInput = z.infer<typeof SmartIrrigationPlannerInputSchema>;

const SmartIrrigationPlannerOutputSchema = z.object({
  irrigationPlan: z.string().describe('A customized irrigation plan.'),
});
export type SmartIrrigationPlannerOutput = z.infer<typeof SmartIrrigationPlannerOutputSchema>;

export async function smartIrrigationPlanner(input: SmartIrrigationPlannerInput): Promise<SmartIrrigationPlannerOutput> {
  return smartIrrigationPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartIrrigationPlannerPrompt',
  input: {schema: z.object({
    location: z.string(),
    cropType: z.string(),
    weather: z.any(),
  })},
  output: {schema: SmartIrrigationPlannerOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in irrigation planning.

  Based on the field's location: {{{location}}}, the type of crop being grown: {{{cropType}}}, and the following real-time weather data, generate a customized irrigation plan that optimizes water usage and crop yield. 
  
  The plan should include frequency, duration, and amount of water needed. Output the plan in a clear and concise manner.
  
  Current Weather:
  - Temperature: {{weather.temperature}}°F
  - Condition: {{weather.description}}
  - Humidity: {{weather.humidity}}%
  - Wind Speed: {{weather.windSpeed}} mph
  `,
});

const smartIrrigationPlannerFlow = ai.defineFlow(
  {
    name: 'smartIrrigationPlannerFlow',
    inputSchema: SmartIrrigationPlannerInputSchema,
    outputSchema: SmartIrrigationPlannerOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Attempt ${i + 1} for smartIrrigationPlannerFlow`);
        
        // Step 1: Fetch weather data first
        const weather = await getWeather(input);

        // Step 2: Call the prompt with the weather data included
        const {output} = await prompt({ ...input, weather });

        if (output) {
            return output;
        }
        console.warn(`Attempt ${i + 1} returned null output.`);
      } catch (error) {
        console.error(`Error in smartIrrigationPlannerFlow on attempt ${i + 1}`, error);
        if (i === maxRetries - 1) {
            // If it's the last retry, re-throw a more specific error
            throw new Error('Failed to generate an irrigation plan after multiple attempts.');
        }
      }
    }
    // If all retries fail to produce an output
    throw new Error('Failed to generate an irrigation plan.');
  }
);
