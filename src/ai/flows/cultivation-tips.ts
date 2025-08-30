
'use server';

/**
 * @fileOverview An AI agent for providing cultivation tips for various crops.
 * 
 * - cultivationTips - A function that handles the tip generation process.
 * - CultivationTipsInput - The input type for the cultivationTips function.
 * - CultivationTipsOutput - The return type for the cultivationTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CultivationTipsInputSchema = z.object({
  cropName: z.string().describe('The name of the crop for which to generate cultivation tips.'),
});

export type CultivationTipsInput = z.infer<typeof CultivationTipsInputSchema>;

const CultivationTipsOutputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
  tips: z.object({
    sowing: z.string().describe('Tips for sowing the crop, including ideal season, seed treatment, and spacing.'),
    irrigation: z.string().describe('Detailed irrigation schedule and water requirements.'),
    fertilization: z.string().describe('Fertilizer requirements and application schedule (N, P, K).'),
    harvesting: z.string().describe('Information on when and how to harvest the crop for optimal yield.'),
    postHarvest: z.string().describe('Tips for post-harvest management, including storage and processing.'),
  }),
});

export type CultivationTipsOutput = z.infer<typeof CultivationTipsOutputSchema>;

export async function cultivationTips(
  input: CultivationTipsInput
): Promise<CultivationTipsOutput> {
  return cultivationTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cultivationTipsPrompt',
  input: {schema: CultivationTipsInputSchema},
  output: {schema: CultivationTipsOutputSchema},
  prompt: `You are an expert agriculturalist providing detailed cultivation advice for Indian farmers.

Generate a set of cultivation tips for the following crop: {{{cropName}}}

Provide detailed, actionable advice for each of the following stages:
- Sowing: Best season, seed treatment, soil preparation, and planting distance.
- Irrigation: Water requirements, frequency, and critical stages for watering.
- Fertilization: Recommended NPK (Nitrogen, Phosphorus, Potassium) dosage and application schedule.
- Harvesting: Key indicators for maturity, best time to harvest, and expected yield.
- Post-Harvest: Advice on proper storage, drying, and initial processing.

Keep the language clear and concise. Return the output in JSON format.`,
});

const cultivationTipsFlow = ai.defineFlow(
  {
    name: 'cultivationTipsFlow',
    inputSchema: CultivationTipsInputSchema,
    outputSchema: CultivationTipsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in cultivationTipsFlow", error);
      throw new Error('Failed to generate cultivation tips.');
    }
  }
);
