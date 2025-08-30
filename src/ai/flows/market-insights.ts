
'use server';

/**
 * @fileOverview An AI agent for providing agricultural market insights.
 * 
 * - marketInsights - A function that handles the market analysis process.
 * - MarketInsightsInput - The input type for the marketInsights function.
 * - MarketInsightsOutput - The return type for the marketInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Mock function to simulate fetching crop prices.
// In a real application, this would fetch data from a live market data API.
async function fetchCropPrice(cropName: string, region: string): Promise<string> {
    const prices: {[key: string]: number} = {
        'corn': 220.50,
        'wheat': 280.00,
        'soybeans': 550.75,
        'tomatoes': 1500.00,
        'almonds': 4000.00,
    };
    const basePricePerTon = prices[cropName.toLowerCase()] || 300;
    // Add some random variation to simulate market fluctuations
    const randomFactor = (Math.random() - 0.5) * 0.1; // +/- 5%
    const finalPricePerTon = basePricePerTon * (1 + randomFactor);
    const finalPricePerKg = finalPricePerTon / 1000;
    return `$${finalPricePerKg.toFixed(2)} / kg`;
}


const getCropPrice = ai.defineTool(
    {
        name: 'getCropPrice',
        description: 'Gets the current market price for a specific crop in a given region.',
        inputSchema: z.object({
            cropName: z.string().describe('The name of the crop.'),
            region: z.string().describe('The region to check the price in.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => fetchCropPrice(input.cropName, input.region)
);


const MarketInsightsInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to analyze.'),
  region: z.string().describe('The geographical region for the market analysis (e.g., California, Midwest).'),
});

export type MarketInsightsInput = z.infer<typeof MarketInsightsInputSchema>;

const MarketInsightsOutputSchema = z.object({
  currentPrice: z.string().describe('The current market price of the crop.'),
  marketTrend: z.string().describe('The current market trend (e.g., Bullish, Bearish, Stable).'),
  pricePrediction: z.string().describe('A short-term price prediction (e.g., Likely to increase in the next quarter).'),
  sellingAdvice: z.string().describe('Strategic advice on when to sell the crop for maximum profitability.'),
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
  tools: [getCropPrice],
  prompt: `You are an expert agricultural market analyst.
  
  First, get the current price for the user's crop: {{{cropName}}} in the specified region: {{{region}}}.
  
  Then, based on the current price and general market knowledge, provide a concise market analysis.
  
  The analysis should include:
  - The current market trend.
  - A short-term price prediction.
  - Actionable advice on the best time to sell.
  
  Keep the analysis brief and to the point.`,
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
                // If it's the last retry, re-throw a more specific error
                 throw new Error('Failed to get market insights after multiple attempts. Please check your connection and try again.');
            }
        }
    }
    // If all retries fail to produce an output
    throw new Error('Failed to get market insights. The AI model did not produce an output.');
  }
);
