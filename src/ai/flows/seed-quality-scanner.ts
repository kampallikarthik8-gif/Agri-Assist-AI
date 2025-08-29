
'use server';

/**
 * @fileOverview An AI agent for assessing seed quality from an image.
 *
 * - seedQualityScanner - A function that handles the seed quality analysis process.
 * - SeedQualityScannerInput - The input type for the seedQualityScanner function.
 * - SeedQualityScannerOutput - The return type for the seedQualityScanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeedQualityScannerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A close-up photo of seeds, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SeedQualityScannerInput = z.infer<typeof SeedQualityScannerInputSchema>;

const SeedQualityScannerOutputSchema = z.object({
    overallQuality: z.enum(['High', 'Medium', 'Low', 'Unknown']).describe('The overall assessed quality of the seeds.'),
    purity: z.string().describe('The estimated purity of the seed sample as a percentage (e.g., "98%"). Includes assessment of foreign matter.'),
    uniformity: z.enum(['Good', 'Fair', 'Poor']).describe('The uniformity of seed size and shape.'),
    damageAnalysis: z.array(z.string()).describe('A list of observed damages or defects (e.g., "Cracked seed coats", "Signs of insect damage").'),
    recommendation: z.string().describe('A clear recommendation on whether the seeds are suitable for planting.'),
});
export type SeedQualityScannerOutput = z.infer<typeof SeedQualityScannerOutputSchema>;

export async function seedQualityScanner(
  input: SeedQualityScannerInput
): Promise<SeedQualityScannerOutput> {
  return seedQualityScannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seedQualityScannerPrompt',
  input: {schema: SeedQualityScannerInputSchema},
  output: {schema: SeedQualityScannerOutputSchema},
  prompt: `You are an expert in seed technology and quality assessment.

Analyze the provided close-up photo of a seed sample. Based on the visual evidence, assess the following qualities:
- **Overall Quality**: Categorize as High, Medium, Low, or Unknown.
- **Purity**: Estimate the percentage of pure seeds vs. foreign materials (dirt, chaff, other seeds).
- **Uniformity**: Judge the consistency of seed size and shape (Good, Fair, Poor).
- **Damage Analysis**: Identify and list any visible defects like cracks, discoloration, mold, or insect damage.
- **Recommendation**: Provide a concise recommendation for planting (e.g., "Recommended for planting," "Use with caution due to observed defects," "Not recommended for planting.").

Photo: {{media url=photoDataUri}}

Provide the output in JSON format.`,
});

const seedQualityScannerFlow = ai.defineFlow(
  {
    name: 'seedQualityScannerFlow',
    inputSchema: SeedQualityScannerInputSchema,
    outputSchema: SeedQualityScannerOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Failed to generate a response from the AI model.');
      }
      return output;
    } catch (error) {
      console.error("Error in seedQualityScannerFlow", error);
      throw new Error('Failed to analyze seed quality.');
    }
  }
);

