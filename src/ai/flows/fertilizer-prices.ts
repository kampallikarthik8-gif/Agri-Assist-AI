
'use server';

/**
 * @fileOverview An AI agent for providing simulated prices for common fertilizers at local shops.
 *
 * - getFertilizerPrices - A function that fetches simulated fertilizer prices.
 * - FertilizerPricesInput - The input type for the getFertilizerPrices function.
 * - FertilizerPricesOutput - The return type for the getFertilizerPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FertilizerPriceSchema = z.object({
  name: z.string().describe('The name of the fertilizer (e.g., Urea, DAP).'),
  price: z.string().describe('The simulated price for a standard bag (e.g., "₹266.50 per 45kg bag").'),
});

const FertilizerPricesInputSchema = z.object({
  location: z.string().describe('The location of the shop for which to generate prices.'),
  fertilizers: z.array(z.string()).describe('A list of common fertilizer names to get prices for.'),
});
export type FertilizerPricesInput = z.infer<typeof FertilizerPricesInputSchema>;

const FertilizerPricesOutputSchema = z.object({
  prices: z.array(FertilizerPriceSchema).describe('A list of fertilizers and their simulated prices.'),
});
export type FertilizerPricesOutput = z.infer<typeof FertilizerPricesOutputSchema>;

export async function getFertilizerPrices(
  input: FertilizerPricesInput
): Promise<FertilizerPricesOutput> {
  return getFertilizerPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fertilizerPricesPrompt',
  input: {schema: FertilizerPricesInputSchema},
  output: {schema: FertilizerPricesOutputSchema},
  prompt: `You are an expert on Indian agricultural supply markets.

  Based on the provided shop location, generate a realistic but simulated list of prices for the following common fertilizers: {{{fertilizers}}}.

  The prices should be for a standard bag size (e.g., 45kg or 50kg) and in Indian Rupees (₹).
  The location is: {{{location}}}.

  Return a list of fertilizer names and their corresponding prices. Ensure the prices are plausible for the Indian market.
  `,
});

const getFertilizerPricesFlow = ai.defineFlow(
  {
    name: 'getFertilizerPricesFlow',
    inputSchema: FertilizerPricesInputSchema,
    outputSchema: FertilizerPricesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate fertilizer prices from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in getFertilizerPricesFlow", error);
      throw new Error('Failed to fetch fertilizer prices.');
    }
  }
);
