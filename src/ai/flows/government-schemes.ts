
'use server';

/**
 * @fileOverview An AI agent for providing information about government schemes for farmers.
 * 
 * - governmentSchemes - A function that handles the scheme discovery process.
 * - GovernmentSchemesInput - The input type for the governmentSchemes function.
 * - GovernmentSchemesOutput - The return type for the governmentSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovernmentSchemesInputSchema = z.object({
  region: z.string().describe('The geographical region to search for schemes (e.g., California, Midwest, India).'),
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
  prompt: `You are an expert on agricultural policies and government support programs for farmers.
  
  Based on the user-provided region, find relevant government schemes available to farmers.
  
  For each scheme, provide:
  - The official name of the scheme.
  - A concise description covering its main benefits and eligibility requirements.
  - A valid, official URL where the user can find more information or apply.
  
  Region: {{{region}}}
  
  Provide a list of the most important schemes.`,
});

const governmentSchemesFlow = ai.defineFlow(
  {
    name: 'governmentSchemesFlow',
    inputSchema: GovernmentSchemesInputSchema,
    outputSchema: GovernmentSchemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
