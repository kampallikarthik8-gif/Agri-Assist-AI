import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for required API key
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work properly.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy-key-for-development',
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
});
