
'use server';

/**
 * @fileOverview An AI agent for calculating fertilizer needs.
 *
 * - fertilizerCalculator - A function that handles the fertilizer calculation process.
 * - FertilizerCalculatorInput - The input type for the fertilizerCalculator function.
 * - FertilizerCalculatorOutput - The return type for the fertilizerCalculator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FertilizerCalculatorInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  soilNitrogen: z.number().describe('The current nitrogen level in the soil, in parts-per-million (ppm).'),
  soilPhosphorus: z.number().describe('The current phosphorus level in the soil, in parts-per-million (ppm).'),
  soilPotassium: z.number().describe('The current potassium level in the soil, in parts-per-million (ppm).'),
  farmArea: z.number().describe('The size of the farm area to be fertilized.'),
  areaUnit: z.enum(['acres', 'hectares']).describe('The unit for the farm area.'),
});
export type FertilizerCalculatorInput = z.infer<typeof FertilizerCalculatorInputSchema>;

const FertilizerCalculatorOutputSchema = z.object({
  fertilizerAmounts: z.object({
    nitrogen: z.number().describe('The recommended amount of nitrogen fertilizer.'),
    phosphorus: z.number().describe('The recommended amount of phosphorus fertilizer.'),
    potassium: z.number().describe('The recommended amount of potassium fertilizer.'),
  }),
  unit: z.string().describe('The unit for the fertilizer amounts (e.g., kg or lbs).'),
  recommendation: z.string().describe('A detailed explanation of the recommendation, including application timing and methods.'),
});
export type FertilizerCalculatorOutput = z.infer<typeof FertilizerCalculatorOutputSchema>;

export async function fertilizerCalculator(
  input: FertilizerCalculatorInput
): Promise<FertilizerCalculatorOutput> {
  return fertilizerCalculatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fertilizerCalculatorPrompt',
  input: {schema: FertilizerCalculatorInputSchema},
  output: {schema: FertilizerCalculatorOutputSchema},
  prompt: `You are an expert agronomist specializing in soil science and crop nutrition.

Based on the provided soil analysis, crop type, and farm area, calculate the required amounts of Nitrogen (N), Phosphorus (P), and Potassium (K) fertilizer.

- Crop Type: {{{cropType}}}
- Soil Nitrogen: {{{soilNitrogen}}} ppm
- Soil Phosphorus: {{{soilPhosphorus}}} ppm
- Soil Potassium: {{{soilPotassium}}} ppm
- Farm Area: {{{farmArea}}} {{{areaUnit}}}

Consider the ideal nutrient requirements for the specified crop. The calculated amounts should compensate for the deficiencies in the soil to reach optimal levels for the crop's growth stage.

Provide the total required amounts for N, P, and K. Also, provide a detailed recommendation that explains the calculation and suggests the best time and method for application (e.g., split application, pre-planting). The units for the fertilizer amounts should be appropriate for the area unit provided (e.g., lbs for acres, kg for hectares).

Provide the output in JSON format.`,
});

const fertilizerCalculatorFlow = ai.defineFlow(
  {
    name: 'fertilizerCalculatorFlow',
    inputSchema: FertilizerCalculatorInputSchema,
    outputSchema: FertilizerCalculatorOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in fertilizerCalculatorFlow", error);
      throw new Error('Failed to calculate fertilizer needs.');
    }
  }
);
