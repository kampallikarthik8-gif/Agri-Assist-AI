
'use server';

/**
 * @fileOverview An AI agent that provides alerts for potential pests and diseases.
 * 
 * - pestDiseaseAlert - A function that generates alerts based on location and weather.
 * - PestDiseaseAlertInput - The input type for the pestDiseaseAlert function.
 * - PestDiseaseAlertOutput - The return type for the pestDiseaseAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './weather-service';

const PestDiseaseAlertInputSchema = z.object({
  location: z.string().describe("The location for which to generate alerts."),
});
export type PestDiseaseAlertInput = z.infer<typeof PestDiseaseAlertInputSchema>;

const AlertSchema = z.object({
    name: z.string().describe("The common name of the pest or disease."),
    riskLevel: z.enum(['High', 'Medium', 'Low']).describe("The current risk level."),
});

const PestDiseaseAlertOutputSchema = z.object({
  alerts: z.array(AlertSchema).describe('A list of active pest and disease alerts.'),
});
export type PestDiseaseAlertOutput = z.infer<typeof PestDiseaseAlertOutputSchema>;

export async function pestDiseaseAlert(input: PestDiseaseAlertInput): Promise<PestDiseaseAlertOutput> {
  return pestDiseaseAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pestDiseaseAlertPrompt',
  input: { schema: PestDiseaseAlertInputSchema },
  output: { schema: PestDiseaseAlertOutputSchema },
  tools: [getWeather],
  prompt: `You are an expert agricultural entomologist and plant pathologist. 
  
  First, get the current weather for the user's location: {{{location}}}.
  
  Based on the location and the current weather conditions (temperature, humidity), identify the top 2-3 most likely pests or plant diseases that could be a threat right now. 
  
  For each potential threat, provide its common name and a risk level (High, Medium, or Low).

  If conditions are not favorable for any common pests or diseases, return an empty list of alerts.
  `,
});

const pestDiseaseAlertFlow = ai.defineFlow(
  {
    name: 'pestDiseaseAlertFlow',
    inputSchema: PestDiseaseAlertInputSchema,
    outputSchema: PestDiseaseAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
