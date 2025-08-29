
'use server';

/**
 * @fileOverview An AI agent for estimating crop profitability.
 *
 * - fieldProfitEstimator - A function that handles the profit estimation process.
 * - FieldProfitEstimatorInput - The input type for the fieldProfitEstimator function.
 * - FieldProfitEstimatorOutput - The return type for the fieldProfitEstimator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FieldProfitEstimatorInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  area: z.number().describe('The size of the field.'),
  areaUnit: z.enum(['acres', 'gunts', 'cents']).describe('The unit for the field area.'),
  yieldPerUnit: z.number().describe('The expected yield per unit of area (e.g., tons per acre).'),
  yieldUnit: z.enum(['tons', 'quintals', 'kgs']).describe('The unit for the yield (e.g., tons, quintals).'),
  marketPricePerUnit: z.number().describe('The expected market price per unit of yield (e.g., price per ton).'),
  totalCosts: z.number().describe('Total estimated costs for cultivation (seeds, fertilizer, labor, etc.).'),
});
export type FieldProfitEstimatorInput = z.infer<typeof FieldProfitEstimatorInputSchema>;

const FieldProfitEstimatorOutputSchema = z.object({
    totalRevenue: z.number().describe('The calculated total revenue from the crop.'),
    totalProfit: z.number().describe('The calculated total profit (revenue - costs).'),
    profitMargin: z.number().describe('The calculated profit margin as a percentage.'),
    insights: z.string().describe('Actionable insights and advice based on the profit analysis, including potential risks and opportunities.'),
});
export type FieldProfitEstimatorOutput = z.infer<typeof FieldProfitEstimatorOutputSchema>;

export async function fieldProfitEstimator(
  input: FieldProfitEstimatorInput
): Promise<FieldProfitEstimatorOutput> {
  return fieldProfitEstimatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fieldProfitEstimatorPrompt',
  input: {schema: FieldProfitEstimatorInputSchema},
  output: {schema: FieldProfitEstimatorOutputSchema},
  prompt: `You are an expert agricultural economist.

Analyze the following data to calculate the estimated profit for a farmer.

- Crop Type: {{{cropType}}}
- Field Size: {{{area}}} {{{areaUnit}}}
- Expected Yield: {{{yieldPerUnit}}} {{{yieldUnit}}} per {{{areaUnit}}}
- Market Price: {{{marketPricePerUnit}}} per {{{yieldUnit}}}
- Total Costs: {{{totalCosts}}}

First, calculate the total yield. Then calculate the total revenue based on the total yield and market price.
Then, calculate the total profit by subtracting the total costs from the total revenue.
Calculate the profit margin percentage.

Finally, provide some brief, actionable insights based on the calculated profit. Consider factors like price volatility for the specified crop, cost-management, and potential risks or opportunities.

Provide the output in JSON format.`,
});

const fieldProfitEstimatorFlow = ai.defineFlow(
  {
    name: 'fieldProfitEstimatorFlow',
    inputSchema: FieldProfitEstimatorInputSchema,
    outputSchema: FieldProfitEstimatorOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in fieldProfitEstimatorFlow", error);
      throw new Error('Failed to estimate profit.');
    }
  }
);
