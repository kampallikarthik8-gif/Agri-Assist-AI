
'use server';

/**
 * @fileOverview An AI agent for providing information about government schemes for farmers in India.
 * 
 * - governmentSchemes - A function that handles the scheme discovery process.
 * - GovernmentSchemesInput - The input type for the governmentSchemes function.
 * - GovernmentSchemesOutput - The return type for the governmentSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovernmentSchemesInputSchema = z.object({
  region: z.string().describe('The state or region in India to search for schemes (e.g., Punjab, Maharashtra, Southern India).'),
});

export type GovernmentSchemesInput = z.infer<typeof GovernmentSchemesInputSchema>;

const SchemeSchema = z.object({
    name: z.string().describe('The name of the government scheme.'),
    description: z.string().describe('A brief description of the scheme, including its benefits and eligibility criteria.'),
    link: z.string().url().describe('An official link for more information.'),
});

const GovernmentSchemesOutputSchema = z.object({
  schemes: z.array(SchemeSchema).describe('A list of relevant government schemes.'),
});

export type GovernmentSchemesOutput = z.infer<typeof GovernmentSchemesOutputSchema>;

export async function governmentSchemes(
  input: GovernmentSchemesInput
): Promise<GovernmentSchemesOutput> {
  return governmentSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'governmentSchemesPrompt',
  input: {schema: GovernmentSchemesInputSchema},
  output: {schema: GovernmentSchemesOutputSchema},
  prompt: `You are an expert on Indian agricultural policies and government support programs for farmers.
  
  Based on the user-provided state or region within India, find relevant government schemes (both central and state-level) available to farmers.
  
  For each scheme, provide:
  - The official name of the scheme.
  - A concise description covering its main benefits and eligibility requirements.
  - A valid, official URL where the user can find more information or apply.
  
  Region: {{{region}}}, India
  
  Provide a list of the most important and relevant schemes. Prioritize schemes directly related to subsidies, loans, and crop insurance.`,
});

const governmentSchemesFlow = ai.defineFlow(
  {
    name: 'governmentSchemesFlow',
    inputSchema: GovernmentSchemesInputSchema,
    outputSchema: GovernmentSchemesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in governmentSchemesFlow", error);
      return { schemes: [] };
    }
  }
);
