
'use server';

/**
 * @fileOverview A conversational AI assistant for farming-related questions.
 * 
 * - chatAssistant - A function that handles the conversational chat process.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s message or question.'),
});

export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s message.'),
});

export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(
  input: ChatAssistantInput
): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: {schema: ChatAssistantInputSchema},
  output: {schema: ChatAssistantOutputSchema},
  prompt: `You are Agri Assist Ai, a friendly and knowledgeable AI assistant for farmers. Your goal is to provide helpful, accurate, and concise answers to a wide range of agricultural questions.

User's question: {{{message}}}

Provide a helpful response.`,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('The AI model did not generate a response.');
      }
      return output;
    } catch (error) {
      console.error("Error in chatAssistantFlow:", error);
      // Provide a more user-friendly error message.
      throw new Error('I am currently unable to process your request. Please try again later.');
    }
  }
);
