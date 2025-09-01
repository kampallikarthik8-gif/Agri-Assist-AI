
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

const FertilizerProductSchema = z.object({
    productName: z.string().describe('The name of the fertilizer product (e.g., Urea, DAP).'),
    npkRatio: z.string().describe('The N-P-K ratio of the product (e.g., "46-0-0").'),
    quantity: z.number().describe('The recommended quantity of this product in kg.'),
});

const FertilizerCalculatorOutputSchema = z.object({
  fertilizerAmounts: z.object({
    nitrogen: z.number().describe('The recommended amount of nitrogen fertilizer in kg.'),
    phosphorus: z.number().describe('The recommended amount of phosphorus fertilizer in kg.'),
    potassium: z.number().describe('The recommended amount of potassium fertilizer in kg.'),
  }),
  unit: z.string().describe('The unit for the fertilizer amounts, which must be "kg".'),
  recommendation: z.string().describe('A detailed explanation of the recommendation, including application timing and methods.'),
  fertilizerProducts: z.array(FertilizerProductSchema).describe('A list of common fertilizer products and the quantities needed to achieve the recommended nutrient levels.'),
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
    farmAreaAcres: z.number(),
});

const IdealNutrientsSchema = z.object({
    idealNitrogen: z.number().describe('The ideal amount of nitrogen (N) in kg per acre for the crop.'),
    idealPhosphorus: z.number().describe('The ideal amount of phosphorus (P2O5) in kg per acre for the crop.'),
    idealPotassium: z.number().describe('The ideal amount of potassium (K2O) in kg per acre for the crop.'),
    rationale: z.string().describe('A brief rationale for these recommendations and advice on application timing.'),
});

const getIdealNutrientsPrompt = ai.definePrompt({
  name: 'idealNutrientFinderPrompt',
  input: {schema: z.object({ cropType: z.string(), soilNitrogen: z.number(), soilPhosphorus: z.number(), soilPotassium: z.number()})},
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

const getProductRecommendationsPrompt = ai.definePrompt({
    name: 'fertilizerProductRecommendationPrompt',
    input: { schema: z.object({ totalN: z.number(), totalP: z.number(), totalK: z.number(), farmAreaAcres: z.number(), cropType: z.string() }) },
    output: { schema: z.object({ fertilizerProducts: z.array(FertilizerProductSchema) }) },
    prompt: `You are an agronomist providing practical fertilizer recommendations.
    
Based on the total required nutrients (in kg) for a farm, suggest a combination of common fertilizers (like Urea, DAP, MOP, SSP) to meet these needs. Calculate the amount of each product required in kg.

Total Required Nitrogen (N): {{totalN}} kg
Total Required Phosphorus (P2O5): {{totalP}} kg
Total Required Potassium (K2O): {{totalK}} kg
Farm Area: {{farmAreaAcres}} acres
Crop: {{cropType}}

Provide a list of fertilizer products and their quantities. The goal is to get as close as possible to the required N, P, and K values using standard, widely available fertilizers.`,
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
        const { output: idealNutrients } = await getIdealNutrientsPrompt({
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
        const availableN = input.soilNitrogen * 0.8;
        const availableP = input.soilPhosphorus * 0.8; 
        const availableK = input.soilPotassium * 0.8; 

        // Recommended fertilizer = (Ideal for crop - Already available in soil)
        const requiredN_perAcre = Math.max(0, idealNutrients.idealNitrogen - availableN);
        const requiredP_perAcre = Math.max(0, idealNutrients.idealPhosphorus - availableP);
        const requiredK_perAcre = Math.max(0, idealNutrients.idealPotassium - availableK);

        // 4. Calculate total amount for the entire farm area
        const totalN = requiredN_perAcre * areaInAcres;
        const totalP = requiredP_perAcre * areaInAcres;
        const totalK = requiredK_perAcre * areaInAcres;

        // 5. Get product recommendations from AI
        const { output: productRecommendations } = await getProductRecommendationsPrompt({
            totalN,
            totalP,
            totalK,
            farmAreaAcres: areaInAcres,
            cropType: input.cropType,
        });

        if (!productRecommendations) {
             throw new Error('Failed to determine fertilizer product recommendations from AI model.');
        }

        const fullRecommendation = `Based on an ideal requirement of ${idealNutrients.idealNitrogen}kg N, ${idealNutrients.idealPhosphorus}kg P, and ${idealNutrients.idealPotassium}kg K per acre for ${input.cropType}, and considering your soil's current nutrient levels, the following amounts are recommended for your ${input.farmArea} ${input.areaUnit} farm.\n\n${idealNutrients.rationale}`;

        return {
            fertilizerAmounts: {
                nitrogen: totalN,
                phosphorus: totalP,
                potassium: totalK,
            },
            unit: 'kg',
            recommendation: fullRecommendation,
            fertilizerProducts: productRecommendations.fertilizerProducts,
        };
    } catch (error) {
      console.error("Error in fertilizerCalculatorFlow", error);
      throw new Error('Failed to calculate fertilizer needs.');
    }
  }
);
