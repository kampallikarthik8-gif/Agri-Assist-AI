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
import { getWeather } from './weather-service';

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
  input: {schema: SmartIrrigationPlannerInputSchema},
  output: {schema: SmartIrrigationPlannerOutputSchema},
  tools: [getWeather],
  prompt: `You are an expert agricultural advisor specializing in irrigation planning.

  First, get the current weather for the user's location.
  
  Then, based on the field's location: {{{location}}}, the type of crop being grown: {{{cropType}}}, and the real-time weather data you fetched, generate a customized irrigation plan that optimizes water usage and crop yield. Consider current and future weather conditions in your plan.
  The plan should include frequency, duration, and amount of water needed. Output the plan in a clear and concise manner.
  `,
});

const smartIrrigationPlannerFlow = ai.defineFlow(
  {
    name: 'smartIrrigationPlannerFlow',
    inputSchema: SmartIrrigationPlannerInputSchema,
    outputSchema: SmartIrrigationPlannerOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in smartIrrigationPlannerFlow", error);
      throw error;
    }
  }
);
