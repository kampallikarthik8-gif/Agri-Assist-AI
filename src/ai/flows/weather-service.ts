'use server';

/**
 * @fileOverview A weather service that fetches real-time weather data.
 *
 * - getWeather - A function that fetches weather data for a given location.
 * - WeatherInput - The input type for the getWeather function.
 * - WeatherOutput - The return type for the getWeather function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeatherInputSchema = z.object({
  location: z.string().optional().describe('The location to fetch weather data for (e.g., "Sunnyvale, CA").'),
  lat: z.number().optional().describe('The latitude.'),
  lon: z.number().optional().describe('The longitude.'),
});
export type WeatherInput = z.infer<typeof WeatherInputSchema>;

const WeatherOutputSchema = z.object({
  locationName: z.string().describe('The name of the location.'),
  temperature: z.number().describe('The current temperature in Fahrenheit.'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in miles per hour.'),
  description: z.string().describe('A brief description of the current weather conditions.'),
  icon: z.string().describe('An identifier for the weather icon (e.g., "01d" for clear sky day).'),
});
export type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

async function fetchWeatherData(input: WeatherInput): Promise<WeatherOutput> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not set in the environment variables.');
  }

  let url = 'https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=' + apiKey;
  if (input.lat && input.lon) {
    url += `&lat=${input.lat}&lon=${input.lon}`;
  } else if (input.location) {
    url += `&q=${encodeURIComponent(input.location)}`;
  } else {
    throw new Error('Either location or lat/lon must be provided.');
  }


  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch weather data: ${errorData.message}`);
    }
    const data = await response.json();

    return {
      locationName: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      description: data.weather[0].main,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Could not retrieve weather information.');
  }
}

export const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Get the current weather conditions for a specified location.',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherOutputSchema,
  },
  async (input) => {
    return await fetchWeatherData(input);
  }
);


ai.defineFlow(
    {
        name: 'weatherServiceFlow',
        inputSchema: WeatherInputSchema,
        outputSchema: WeatherOutputSchema,
    },
    async (input) => {
        return await fetchWeatherData(input);
    }
)
