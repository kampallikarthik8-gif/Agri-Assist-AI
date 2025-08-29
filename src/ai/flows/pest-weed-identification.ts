
'use server';

/**
 * @fileOverview A pest and weed identification AI agent.
 *
 * - pestWeedIdentification - A function that handles the pest/weed identification process.
 * - PestWeedIdentificationInput - The input type for the pestWeedIdentification function.
 * - PestWeedIdentificationOutput - The return type for the pestWeedIdentification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PestWeedIdentificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a pest or weed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PestWeedIdentificationInput = z.infer<typeof PestWeedIdentificationInputSchema>;

const PestWeedIdentificationOutputSchema = z.object({
    identification: z.object({
        type: z.enum(['pest', 'weed', 'unknown']).describe('Whether the image is a pest, a weed, or something else.'),
        commonName: z.string().describe('The common name of the identified pest or weed.'),
        scientificName: z.string().describe('The scientific name of the identified pest or weed.'),
        description: z.string().describe('A brief description of the pest or weed.'),
    }),
    controlMethods: z.object({
        chemical: z.array(z.string()).describe('List of chemical control methods.'),
        biological: z.array(z.string()).describe('List of biological control methods.'),
        cultural: z.array(z.string()).describe('List of cultural control methods.'),
    }),
});
export type PestWeedIdentificationOutput = z.infer<typeof PestWeedIdentificationOutputSchema>;

export async function pestWeedIdentification(
  input: PestWeedIdentificationInput
): Promise<PestWeedIdentificationOutput> {
  return pestWeedIdentificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pestWeedIdentificationPrompt',
  input: {schema: PestWeedIdentificationInputSchema},
  output: {schema: PestWeedIdentificationOutputSchema},
  prompt: `You are an expert in entomology and botany, specializing in identifying agricultural pests and weeds.

You will analyze the provided photo to identify if it is a pest or a weed. Provide its common and scientific names, a brief description, and various control methods (chemical, biological, and cultural).

If the image is not clearly a pest or weed, identify it as 'unknown'.

Photo: {{media url=photoDataUri}}

Provide the output in JSON format.`,
});

const pestWeedIdentificationFlow = ai.defineFlow(
  {
    name: 'pestWeedIdentificationFlow',
    inputSchema: PestWeedIdentificationInputSchema,
    outputSchema: PestWeedIdentificationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in pestWeedIdentificationFlow", error);
      throw new Error('Failed to identify pest or weed.');
    }
  }
);
