
'use server';

/**
 * @fileOverview An AI agent that analyzes weather forecasts to provide rainfall alerts.
 * 
 * - rainfallAlert - A function that generates alerts for storms or drought.
 * - RainfallAlertInput - The input type for the rainfallAlert function.
 * - RainfallAlertOutput - The return type for the rainfallAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { weatherForecast } from './weather-forecast';

const RainfallAlertInputSchema = z.object({
  location: z.string().describe("The location for which to generate alerts (e.g., 'San Francisco, CA')."),
});
export type RainfallAlertInput = z.infer<typeof RainfallAlertInputSchema>;

const AlertSchema = z.object({
    type: z.enum(['storm', 'drought', 'none']).describe("The type of alert: 'storm' for heavy rain, 'drought' for lack of rain, or 'none'."),
    title: z.string().describe("The title of the alert."),
    message: z.string().describe("A descriptive message for the alert."),
    severity: z.enum(['Low', 'Medium', 'High', 'None']).describe("The severity of the alert."),
});

const RainfallAlertOutputSchema = z.object({
  alerts: z.array(AlertSchema).describe('A list of weather alerts.'),
});
export type RainfallAlertOutput = z.infer<typeof RainfallAlertOutputSchema>;

export async function rainfallAlert(input: RainfallAlertInput): Promise<RainfallAlertOutput> {
  const forecastData = await weatherForecast(input);
  if (!forecastData || !forecastData.forecast || forecastData.forecast.length === 0) {
    console.warn("Could not retrieve weather forecast to generate alerts. Returning empty alerts.");
    return { alerts: [] };
  }
  return rainfallAlertFlow({ location: input.location, forecast: forecastData.forecast });
}

const prompt = ai.definePrompt({
  name: 'rainfallAlertPrompt',
  input: { schema: z.object({ location: z.string(), forecast: z.any() }) },
  output: { schema: RainfallAlertOutputSchema },
  prompt: `You are an expert agricultural meteorologist. Analyze the following 7-day weather forecast for {{{location}}}.

Your task is to identify potential risks for farmers related to rainfall. Generate alerts for the following conditions:
1.  **Storm Alert**: If there is a high probability of heavy rain or thunderstorms (e.g., condition is 'Rain', 'Thunderstorm' or similar with significant precipitation expected).
2.  **Drought Alert**: If there is a prolonged period (e.g., 5 or more consecutive days) with no rain.

If conditions are normal, return an alert with type 'none'.

Forecast:
{{#each forecast}}
- {{day}}: High {{high}}°F, Low {{low}}°F, Condition: {{condition}}
{{/each}}

Provide a list of alerts in JSON format.`,
});

const rainfallAlertFlow = ai.defineFlow(
  {
    name: 'rainfallAlertFlow',
    inputSchema: z.object({ location: z.string(), forecast: z.any() }),
    outputSchema: RainfallAlertOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        return { alerts: [] };
      }
      return output;
    } catch (error) {
      console.error("Error in rainfallAlertFlow", error);
      // Fail-safe: don't throw; return no alerts so the UI can continue
      return { alerts: [] };
    }
  }
);
