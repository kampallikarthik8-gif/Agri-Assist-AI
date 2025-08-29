
'use server';

/**
 * @fileOverview An AI agent for analyzing soil health using simulated satellite data.
 * 
 * - soilHealthAnalyzer - A function that handles the soil health analysis process.
 * - SoilHealthAnalyzerInput - The input type for the soilHealthAnalyzer function.
 * - SoilHealthAnalyzerOutput - The return type for the soilHealthAnalyzer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './weather-service';

const SoilHealthAnalyzerInputSchema = z.object({
  location: z.string().describe('Geographic location for the farm (e.g., "Napa Valley, CA").'),
  lat: z.number().optional().describe('The latitude.'),
  lon: z.number().optional().describe('The longitude.'),
});

export type SoilHealthAnalyzerInput = z.infer<typeof SoilHealthAnalyzerInputSchema>;

const SoilHealthAnalyzerOutputSchema = z.object({
    report: z.object({
        organicMatter: z.string().describe('The estimated percentage of soil organic matter (e.g., "2.5%").'),
        nitrogen: z.string().describe('The estimated nitrogen (N) level (e.g., "Medium", "25 ppm").'),
        phosphorus: z.string().describe('The estimated phosphorus (P) level (e.g., "High", "50 ppm").'),
        potassium: z.string().describe('The estimated potassium (K) level (e.g., "Low", "80 ppm").'),
        ph: z.number().describe('The estimated soil pH level (e.g., 6.8).'),
        moisture: z.string().describe('The estimated soil moisture content (e.g., "Optimal", "22%").'),
    }),
    summary: z.string().describe('A summary of the soil health findings and general recommendations.'),
});

export type SoilHealthAnalyzerOutput = z.infer<typeof SoilHealthAnalyzerOutputSchema>;

export async function soilHealthAnalyzer(
  input: SoilHealthAnalyzerInput
): Promise<SoilHealthAnalyzerOutput> {
  return soilHealthAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'soilHealthAnalyzerPrompt',
  input: {schema: SoilHealthAnalyzerInputSchema},
  output: {schema: SoilHealthAnalyzerOutputSchema},
  tools: [getWeather],
  prompt: `You are an expert in remote sensing and soil science.
  
  Your task is to simulate a soil health analysis based on satellite imagery for a given location.
  
  First, get the current weather for the user's location (using lat/lon if provided) to understand the recent environmental conditions.
  
  Then, based on the provided location and typical geological and environmental factors for that area, generate a plausible soil health report. This should simulate an analysis derived from multispectral satellite data (like Landsat or Sentinel-2).
  
  The report must include estimated values for:
  - Soil Organic Matter (%)
  - Nitrogen (N) level (provide a qualitative assessment like High/Medium/Low and an approximate ppm value)
  - Phosphorus (P) level
  - Potassium (K) level
  - Soil pH
  - Soil Moisture (%)
  
  Finally, provide a concise summary of the findings and general recommendations for soil management based on this simulated analysis.
  
  Location: {{{location}}}
  
  Provide the output in JSON format.`,
});

const soilHealthAnalyzerFlow = ai.defineFlow(
  {
    name: 'soilHealthAnalyzerFlow',
    inputSchema: SoilHealthAnalyzerInputSchema,
    outputSchema: SoilHealthAnalyzerOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} for soilHealthAnalyzerFlow`);
            const {output} = await prompt(input);
            if (output) {
                return output;
            }
            console.warn(`Attempt ${i + 1} returned null output.`);
        } catch (error) {
            console.error(`Error in soilHealthAnalyzerFlow on attempt ${i + 1}`, error);
            if (i === maxRetries - 1) {
                // If it's the last retry, rethrow the error
                throw new Error('Failed to analyze soil health after multiple attempts.');
            }
        }
    }
     throw new Error('Failed to analyze soil health.');
  }
);

