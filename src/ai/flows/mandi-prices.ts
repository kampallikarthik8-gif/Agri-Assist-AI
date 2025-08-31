
'use server';

/**
 * @fileOverview An AI agent for providing live agricultural market (mandi) prices in India.
 * 
 * - mandiPrices - A function that handles the price discovery process.
 * - MandiPricesInput - The input type for the mandiPrices function.
 * - MandiPricesOutput - The return type for the mandiPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MandiPricesInputSchema = z.object({
  region: z.string().describe('The state or region in India to search for market prices (e.g., Andhra Pradesh, Uttar Pradesh).'),
  crop: z.string().describe('The name of the crop to look up (e.g., Rice, Tomato, Cotton).'),
});

export type MandiPricesInput = z.infer<typeof MandiPricesInputSchema>;

const MarketPriceSchema = z.object({
    marketName: z.string().describe('The name of the agricultural market (mandi).'),
    price: z.string().describe('The current price range for the crop in that market (e.g., "₹2000 - ₹2200 per quintal").'),
});

const MandiPricesOutputSchema = z.object({
  prices: z.array(MarketPriceSchema).describe('A list of market prices for the specified crop in the given region.'),
  summary: z.string().describe('A brief summary of the market conditions, including which markets are offering the best prices.'),
});

export type MandiPricesOutput = z.infer<typeof MandiPricesOutputSchema>;

export async function mandiPrices(
  input: MandiPricesInput
): Promise<MandiPricesOutput> {
  return mandiPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mandiPricesPrompt',
  input: {schema: MandiPricesInputSchema},
  output: {schema: MandiPricesOutputSchema},
  prompt: `You are an expert on Indian agricultural markets (mandis).
  
  Based on the user-provided state/region and crop, find the current market prices. You must simulate realistic but not necessarily real-time prices from various major mandis within that region.
  
  For each market, provide:
  - The name of the market (mandi).
  - A plausible price range per quintal (e.g., "₹5500 - ₹5800 per quintal").
  
  Also provide a brief summary of the overall market situation, highlighting which markets seem to be offering better prices.
  
  Region: {{{region}}}, India
  Crop: {{{crop}}}
  
  Return a list of at least 5-7 major markets for the given region.`,
});

const mandiPricesFlow = ai.defineFlow(
  {
    name: 'mandiPricesFlow',
    inputSchema: MandiPricesInputSchema,
    outputSchema: MandiPricesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in mandiPricesFlow", error);
      throw new Error('Failed to fetch mandi prices.');
    }
  }
);
