
'use server';

/**
 * @fileOverview An AI agent for providing information about crop insurance schemes in India.
 * 
 * - cropInsuranceInfo - A function that handles the insurance discovery process.
 * - CropInsuranceInfoInput - The input type for the cropInsuranceInfo function.
 * - CropInsuranceInfoOutput - The return type for the cropInsuranceInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropInsuranceInfoInputSchema = z.object({
  region: z.string().describe('The state or region in India to search for schemes (e.g., Punjab, Maharashtra).'),
  crop: z.string().describe('The type of crop to be insured (e.g., Rice, Wheat).'),
});

export type CropInsuranceInfoInput = z.infer<typeof CropInsuranceInfoInputSchema>;

const InsuranceSchemeSchema = z.object({
    name: z.string().describe('The name of the crop insurance scheme.'),
    description: z.string().describe('A brief description of the scheme, including its key benefits, coverage, and eligibility criteria.'),
    link: z.string().url().describe('An official link for more information or to apply.'),
});

const CropInsuranceInfoOutputSchema = z.object({
  schemes: z.array(InsuranceSchemeSchema).describe('A list of relevant crop insurance schemes.'),
});

export type CropInsuranceInfoOutput = z.infer<typeof CropInsuranceInfoOutputSchema>;

export async function cropInsuranceInfo(
  input: CropInsuranceInfoInput
): Promise<CropInsuranceInfoOutput> {
  return cropInsuranceInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropInsuranceInfoPrompt',
  input: {schema: CropInsuranceInfoInputSchema},
  output: {schema: CropInsuranceInfoOutputSchema},
  prompt: `You are an expert on Indian agricultural policies and crop insurance programs.
  
  Based on the user-provided state/region and crop type, find relevant crop insurance schemes available to farmers in India. A key scheme to consider is the Pradhan Mantri Fasal Bima Yojana (PMFBY), but also include any state-specific schemes.
  
  For each scheme, provide:
  - The official name of the scheme.
  - A concise description covering its main benefits, what it covers (e.g., yield loss, weather events), and general eligibility.
  - A valid, official URL where the user can find more detailed information or apply.
  
  Region: {{{region}}}, India
  Crop: {{{crop}}}
  
  Provide a list of the most important and relevant schemes.`,
});

const cropInsuranceInfoFlow = ai.defineFlow(
  {
    name: 'cropInsuranceInfoFlow',
    inputSchema: CropInsuranceInfoInputSchema,
    outputSchema: CropInsuranceInfoOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in cropInsuranceInfoFlow", error);
      throw new Error('Failed to fetch crop insurance information.');
    }
  }
);
