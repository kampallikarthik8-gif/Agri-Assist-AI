'use server';

/**
 * @fileOverview A plant health diagnostics AI agent.
 *
 * - plantHealthDiagnostics - A function that handles the plant diagnosis process.
 * - PlantHealthDiagnosticsInput - The input type for the plantHealthDiagnostics function.
 * - PlantHealthDiagnosticsOutput - The return type for the plantHealthDiagnostics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlantHealthDiagnosticsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('A detailed description of the plant\'s symptoms (e.g., yellowing leaves, wilting).'),
});
export type PlantHealthDiagnosticsInput = z.infer<typeof PlantHealthDiagnosticsInputSchema>;

const PlantHealthDiagnosticsOutputSchema = z.object({
  diagnosis: z.object({
    diseases: z.array(z.string()).describe('List of diseases identified in the plant.'),
    pests: z.array(z.string()).describe('List of pests identified on the plant.'),
    nutrientDeficiencies: z
      .array(z.string())
      .describe('List of nutrient deficiencies observed in the plant.'),
    remedies: z
      .array(z.string())
      .describe('Potential remedies for the identified issues.'),
  }),
});
export type PlantHealthDiagnosticsOutput = z.infer<typeof PlantHealthDiagnosticsOutputSchema>;

export async function plantHealthDiagnostics(
  input: PlantHealthDiagnosticsInput
): Promise<PlantHealthDiagnosticsOutput> {
  return plantHealthDiagnosticsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantHealthDiagnosticsPrompt',
  input: {schema: PlantHealthDiagnosticsInputSchema},
  output: {schema: PlantHealthDiagnosticsOutputSchema},
  prompt: `You are an expert in plant health diagnostics.

You will analyze the provided information about the plant to identify potential diseases, pests, and nutrient deficiencies. Based on your analysis, you will also suggest potential remedies.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}

Provide the output in JSON format.`,
});

const plantHealthDiagnosticsFlow = ai.defineFlow(
  {
    name: 'plantHealthDiagnosticsFlow',
    inputSchema: PlantHealthDiagnosticsInputSchema,
    outputSchema: PlantHealthDiagnosticsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a response from the AI model.');
    }
    return output;
  }
);
