
'use server';

/**
 * @fileOverview An AI agent for providing market insights and selling advice for crops.
 * 
 * - marketInsights - A function that handles the market analysis process.
 * - MarketInsightsInput - The input type for the marketInsights function.
 * - MarketInsightsOutput - The return type for the marketInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketInsightsInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to analyze.'),
});

export type MarketInsightsInput = z.infer<typeof MarketInsightsInputSchema>;

const MarketPriceSchema = z.object({
    market: z.string().describe('The name of the agricultural market (mandi).'),
    price: z.string().describe('The plausible current price for the crop in that market (e.g., "₹2100 per quintal").'),
});

const MarketInsightsOutputSchema = z.object({
  bestMarket: z.string().describe('The name of the market with the best current price.'),
  currentPrice: z.string().describe('The best price found for the crop (e.g., "₹2150 per quintal").'),
  marketTrend: z.enum(['rising', 'stable', 'falling']).describe('The predicted short-term market trend.'),
  pricePrediction: z.string().describe('A brief, data-driven price prediction for the next 1-2 weeks.'),
  sellingAdvice: z.string().describe('Actionable advice on whether to sell now, hold, or consider other factors.'),
  allMarkets: z.array(MarketPriceSchema).describe('A list of prices from various major markets.'),
});

export type MarketInsightsOutput = z.infer<typeof MarketInsightsOutputSchema>;

export async function marketInsights(
  input: MarketInsightsInput
): Promise<MarketInsightsOutput> {
  return marketInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketInsightsPrompt',
  input: {schema: MarketInsightsInputSchema},
  output: {schema: MarketInsightsOutputSchema},
  prompt: `You are an expert agricultural market analyst for Indian markets.
  
  For the given crop, {{{cropName}}}, perform a detailed market analysis.
  
  1.  **Simulate Prices**: Generate plausible current prices for this crop from at least 5-7 major agricultural markets (mandis) in India relevant to this crop.
  2.  **Identify Best Market**: Based on your simulated prices, determine which market is currently offering the best price.
  3.  **Predict Trend**: Analyze recent (simulated) trends and predict whether the market price is 'rising', 'stable', or 'falling' in the short term.
  4.  **Price Prediction**: Provide a brief price prediction for the next 1-2 weeks (e.g., "Prices are expected to rise by 5-7% due to festival demand.").
  5.  **Selling Advice**: Based on all the above factors, provide clear, actionable advice to a farmer. (e.g., "Hold for another week as prices are rising," or "Sell now at Guntur market to capitalize on the current high price.").
  
  Provide the output in JSON format.`,
});

const marketInsightsFlow = ai.defineFlow(
  {
    name: 'marketInsightsFlow',
    inputSchema: MarketInsightsInputSchema,
    outputSchema: MarketInsightsOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempt ${i + 1} for marketInsightsFlow`);
            const {output} = await prompt(input);
            if (output) {
                return output;
            }
            console.warn(`Attempt ${i + 1} returned null output.`);
        } catch (error) {
            console.error(`Error in marketInsightsFlow on attempt ${i + 1}`, error);
            if (i === maxRetries - 1) {
                throw new Error('Failed to generate market insights after multiple attempts.');
            }
        }
    }
    throw new Error('Failed to generate market insights.');
  }
);
