
'use server';

/**
 * @fileOverview An AI-powered weather forecaster.
 * 
 * - weatherForecast - A function that generates a 7-day weather forecast.
 * - WeatherForecastInput - The input type for the weatherForecast function.
 * - WeatherForecastOutput - The return type for the weatherForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWeather } from './weather-service';

const WeatherForecastInputSchema = z.object({
  location: z.string().describe("The location for which to generate a forecast (e.g., 'San Francisco, CA')."),
});
export type WeatherForecastInput = z.infer<typeof WeatherForecastInputSchema>;


const ForecastSchema = z.object({
    day: z.string().describe("Day of the week (e.g., 'Monday')."),
    high: z.number().describe("The predicted high temperature in Fahrenheit."),
    low: z.number().describe("The predicted low temperature in Fahrenheit."),
    condition: z.string().describe("The predicted weather condition (e.g., 'Sunny', 'Cloudy', 'Rain')."),
});

const WeatherForecastOutputSchema = z.object({
  forecast: z.array(ForecastSchema).describe('A 7-day weather forecast. If a forecast cannot be determined, return an empty array.'),
});
export type WeatherForecastOutput = z.infer<typeof WeatherForecastOutputSchema>;

export async function weatherForecast(input: WeatherForecastInput): Promise<WeatherForecastOutput> {
  return weatherForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weatherForecastPrompt',
  input: {schema: WeatherForecastInputSchema},
  output: {schema: WeatherForecastOutputSchema},
  tools: [getWeather],
  prompt: `You are a weather forecasting AI.
  
  First, get the current weather for the user's location: {{{location}}}.
  
  Then, using the current weather conditions as a starting point, generate a plausible 7-day weather forecast.
  
  For each day, provide:
  - The day of the week.
  - The predicted high temperature in Fahrenheit.
  - The predicted low temperature in Fahrenheit.
  - A brief, one-or-two-word description of the weather condition (e.g., 'Sunny', 'Partly Cloudy', 'Rain', 'Snow').
  
  If for any reason you cannot generate a forecast, return a response with an empty "forecast" array.
  
  Provide the output as a structured 7-day forecast.`,
});

const weatherForecastFlow = ai.defineFlow(
  {
    name: 'weatherForecastFlow',
    inputSchema: WeatherForecastInputSchema,
    outputSchema: WeatherForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // If the model fails to return anything, return a valid object with an empty forecast.
      return { forecast: [] };
    }
    return output;
  }
);
