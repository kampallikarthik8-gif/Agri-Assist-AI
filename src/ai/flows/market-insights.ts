'use server';

/**
 * @fileOverview An AI agent for providing agricultural market insights, including the best place to sell.
 * 
 * - marketInsights - A function that handles the market analysis process.
 * - MarketInsightsInput - The input type for the marketInsights function.
 * - MarketInsightsOutput - The return type for the marketInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Mock function to simulate fetching crop prices from multiple markets.
// In a real application, this would fetch data from live market data APIs.
async function findBestMarketForCrop(cropName: string): Promise<{ bestMarket: string; bestPrice: string; allMarkets: { market: string, price: string }[] }> {
    // Prices are now in INR per Quintal (100kg)
    const basePrices: {[key: string]: number} = {
        'corn': 2100,
        'wheat': 2275,
        'soybeans': 4500,
        'tomatoes': 2500,
        'almonds': 60000,
        'cotton': 7000,
        'sugarcane': 350,
        'paddy (rice)': 2200,
    };
    const basePricePerQuintal = basePrices[cropName.toLowerCase()] || 3000;
    
    // Simulate a few local markets with price variations
    const markets = [
        { name: "Main City Mandi", variation: 1.05 },
        { name: "Regional Hub", variation: 1.02 },
        { name: "Local Town Market", variation: 0.98 },
        { name: "Cross-State Exchange", variation: 1.12 },
    ];

    let bestMarket = '';
    let bestPrice = 0;

    const allMarkets = markets.map(market => {
        const marketPrice = basePricePerQuintal * market.variation * (1 + (Math.random() - 0.5) * 0.1);
        if (marketPrice > bestPrice) {
            bestPrice = marketPrice;
            bestMarket = market.name;
        }
        return {
            market: market.name,
            price: `₹${marketPrice.toFixed(2)} / quintal`
        };
    });

    return {
        bestMarket,
        bestPrice: `₹${bestPrice.toFixed(2)} / quintal`,
        allMarkets,
    };
}


const findBestMarket = ai.defineTool(
    {
        name: 'findBestMarket',
        description: 'Finds the best market to sell a specific crop by comparing prices across multiple local markets.',
        inputSchema: z.object({
            cropName: z.string().describe('The name of the crop.'),
        }),
        outputSchema: z.object({
            bestMarket: z.string().describe("The name of the market with the highest price."),
            bestPrice: z.string().describe("The highest price found for the crop."),
        }),
    },
    async (input) => {
        const { bestMarket, bestPrice } = await findBestMarketForCrop(input.cropName);
        return { bestMarket, bestPrice };
    }
);


const MarketInsightsInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to analyze.'),
});

export type MarketInsightsInput = z.infer<typeof MarketInsightsInputSchema>;

const MarketInsightsOutputSchema = z.object({
  bestMarket: z.string().describe("The name of the market with the best price."),
  currentPrice: z.string().describe('The current market price of the crop in the best market.'),
  marketTrend: z.string().describe('The current market trend (e.g., Bullish, Bearish, Stable).'),
  pricePrediction: z.string().describe('A short-term price prediction (e.g., Likely to increase in the next quarter).'),
  sellingAdvice: z.string().describe('Strategic advice on when and where to sell the crop for maximum profitability.'),
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
  tools: [findBestMarket],
  prompt: `You are an expert agricultural market analyst for the Indian market. Your goal is to help farmers sell at the right time and at the right place.
  
  First, find the best market to sell the user's crop: {{{cropName}}}. This involves checking prices across several local markets.
  
  Then, based on the best price you found and general market knowledge for India, provide a concise market analysis.
  
  The analysis should include:
  - The name of the best market and the current price there (in Rupees).
  - The current overall market trend.
  - A short-term price prediction.
  - Actionable advice on the best time and place to sell, explicitly mentioning why the recommended market is the best choice.
  
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
