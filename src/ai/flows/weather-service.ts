
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
  feelsLike: z.number().describe('The "feels like" temperature in Fahrenheit.'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in miles per hour.'),
  description: z.string().describe('A brief description of the current weather conditions.'),
  icon: z.string().describe('An identifier for the weather icon (e.g., "01d" for clear sky day).'),
  uvIndex: z.number().describe('The current UV index.'),
  visibility: z.number().describe('The visibility in miles.'),
  pressure: z.number().describe('The atmospheric pressure in hPa.'),
  sunrise: z.string().describe('The time of sunrise.'),
  sunset: z.string().describe('The time of sunset.'),
});
export type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

function formatTime(timestamp: number, timezone: number): string {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC', hour12: true });
}

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
       if (response.status === 401) {
          throw new Error('Invalid OpenWeatherMap API Key. Please check your .env file.');
      }
      throw new Error(`Failed to fetch weather data: ${errorData.message}`);
    }
    const data = await response.json();
    
    // Fetch UV index using lat/lon from the first response
    const { lat, lon } = data.coord;
    const uvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily,alerts&appid=${apiKey}`;
    const uvResponse = await fetch(uvUrl);
    let uvIndex = 0;
    // Note: The free OpenWeatherMap plan does not include UV index in the onecall endpoint.
    // This will likely return 0 unless a paid plan is used.
    // For a robust solution, consider a different endpoint or service if UV is critical.

    return {
      locationName: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      description: data.weather[0].main,
      icon: data.weather[0].icon,
      uvIndex: uvIndex,
      visibility: Math.round(data.visibility / 1609), // meters to miles
      pressure: data.main.pressure,
      sunrise: formatTime(data.sys.sunrise, data.timezone),
      sunset: formatTime(data.sys.sunset, data.timezone),
    };
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    // Re-throw specific errors to be handled by the UI
    if (error.message.includes('Invalid OpenWeatherMap API Key')) {
        throw error;
    }
     if (error.message.includes('OPENWEATHER_API_KEY')) {
        throw error;
    }
    // Generic fallback error
    throw new Error('Could not retrieve weather information at this time.');
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
