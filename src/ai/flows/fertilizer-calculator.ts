
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
  areaUnit: z.enum(['acres', 'gunts', 'cents']).describe('The unit for the farm area.'),
});
export type FertilizerCalculatorInput = z.infer<typeof FertilizerCalculatorInputSchema>;

const FertilizerCalculatorOutputSchema = z.object({
  fertilizerAmounts: z.object({
    nitrogen: z.number().describe('The recommended amount of nitrogen fertilizer in kg.'),
    phosphorus: z.number().describe('The recommended amount of phosphorus fertilizer in kg.'),
    potassium: z.number().describe('The recommended amount of potassium fertilizer in kg.'),
  }),
  unit: z.string().describe('The unit for the fertilizer amounts, which must be "kg".'),
  recommendation: z.string().describe('A detailed explanation of the recommendation, including application timing and methods.'),
});
export type FertilizerCalculatorOutput = z.infer<typeof FertilizerCalculatorOutputSchema>;

export async function fertilizerCalculator(
  input: FertilizerCalculatorInput
): Promise<FertilizerCalculatorOutput> {
  return fertilizerCalculatorFlow(input);
}

// Internal schema for the AI prompt, which works with standardized units (acres).
const StandardizedInputSchema = z.object({
    cropType: z.string(),
    soilNitrogen: z.number(),
    soilPhosphorus: z.number(),
    soilPotassium: z.number(),
});

const IdealNutrientsSchema = z.object({
    idealNitrogen: z.number().describe('The ideal amount of nitrogen (N) in kg per acre for the crop.'),
    idealPhosphorus: z.number().describe('The ideal amount of phosphorus (P2O5) in kg per acre for the crop.'),
    idealPotassium: z.number().describe('The ideal amount of potassium (K2O) in kg per acre for the crop.'),
    rationale: z.string().describe('A brief rationale for these recommendations and advice on application timing.'),
});

const prompt = ai.definePrompt({
  name: 'idealNutrientFinderPrompt',
  input: {schema: StandardizedInputSchema},
  output: {schema: IdealNutrientsSchema},
  prompt: `You are an expert agronomist specializing in crop nutrition for Indian agriculture.

Based on the provided crop type and soil nutrient levels, determine the IDEAL total amount of Nitrogen (N), Phosphorus (as P2O5), and Potassium (as K2O) required in **kg per acre** for a healthy harvest.

- Crop Type: {{{cropType}}}
- Soil Nitrogen: {{{soilNitrogen}}} ppm
- Soil Phosphorus: {{{soilPhosphorus}}} ppm
- Soil Potassium: {{{soilPotassium}}} ppm

Do not consider the provided soil levels in your calculation for the ideal amounts, but use them to inform your rationale. Your primary task is to provide the standard, recommended nutrient dosage per acre for the specified crop.

Also provide a concise rationale explaining why these amounts are recommended and general advice on application timing (e.g., basal dose, top dressing).`,
});

// Conversion factors to acres
const ACRES_PER_GUNT = 0.025;
const ACRES_PER_CENT = 0.01;

const fertilizerCalculatorFlow = ai.defineFlow(
  {
    name: 'fertilizerCalculatorFlow',
    inputSchema: FertilizerCalculatorInputSchema,
    outputSchema: FertilizerCalculatorOutputSchema,
  },
  async (input) => {
    try {
        // 1. Standardize farm area to acres
        let areaInAcres = input.farmArea;
        if (input.areaUnit === 'gunts') {
            areaInAcres = input.farmArea * ACRES_PER_GUNT;
        } else if (input.areaUnit === 'cents') {
            areaInAcres = input.farmArea * ACRES_PER_CENT;
        }
        
        // 2. Get ideal nutrient requirements per acre from the AI
        const { output: idealNutrients } = await prompt({
            cropType: input.cropType,
            soilNitrogen: input.soilNitrogen,
            soilPhosphorus: input.soilPhosphorus,
            soilPotassium: input.soilPotassium,
        });

        if (!idealNutrients) {
            throw new Error('Failed to determine ideal nutrient levels from AI model.');
        }

        // 3. Perform calculations in code for accuracy
        // Conversion from ppm to kg/acre is approx. `ppm * 0.8`. This is a simplification.
        // A more accurate model would involve soil depth and bulk density.
        const availableN = input.soilNitrogen * 0.8;
        const availableP = input.soilPhosphorus * 0.8; // Assuming P ppm is available P
        const availableK = input.soilPotassium * 0.8; // Assuming K ppm is available K

        // Recommended fertilizer = (Ideal for crop - Already available in soil)
        const requiredN = Math.max(0, idealNutrients.idealNitrogen - availableN);
        const requiredP = Math.max(0, idealNutrients.idealPhosphorus - availableP);
        const requiredK = Math.max(0, idealNutrients.idealPotassium - availableK);

        // 4. Calculate total amount for the entire farm area
        const totalN = requiredN * areaInAcres;
        const totalP = requiredP * areaInAcres;
        const totalK = requiredK * areaInAcres;

        const fullRecommendation = `Based on an ideal requirement of ${idealNutrients.idealNitrogen}kg N, ${idealNutrients.idealPhosphorus}kg P, and ${idealNutrients.idealPotassium}kg K per acre for ${input.cropType}, and considering your soil's current nutrient levels, the following amounts are recommended for your ${input.farmArea} ${input.areaUnit} farm.\n\n${idealNutrients.rationale}`;

        return {
            fertilizerAmounts: {
                nitrogen: totalN,
                phosphorus: totalP,
                potassium: totalK,
            },
            unit: 'kg',
            recommendation: fullRecommendation,
        };
    } catch (error) {
      console.error("Error in fertilizerCalculatorFlow", error);
      throw new Error('Failed to calculate fertilizer needs.');
    }
  }
);
