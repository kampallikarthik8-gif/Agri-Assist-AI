
'use server';

/**
 * @fileOverview A service to simulate sending notifications.
 * 
 * - sendNotification - A function that simulates sending a notification via SMS or WhatsApp.
 * - SendNotificationInput - The input type for the sendNotification function.
 * - SendNotificationOutput - The return type for the sendNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PNF, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

const SendNotificationInputSchema = z.object({
  phoneNumber: z.string().transform((arg, ctx) => {
    try {
      const number = phoneUtil.parseAndKeepRawInput(arg, 'IN'); // Assuming IN for India
      if (!phoneUtil.isValidNumber(number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number.',
        });
        return z.NEVER;
      }
      return phoneUtil.format(number, PNF.E164);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number format.',
      });
      return z.NEVER;
    }
  }),
  message: z.string().describe('The message content to be sent.'),
  method: z.enum(['SMS', 'WhatsApp']).describe('The notification delivery method.'),
});

export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

const SendNotificationOutputSchema = z.object({
  status: z.string().describe('The status of the notification (e.g., "Sent").'),
  confirmationId: z.string().describe('A unique confirmation ID for the sent message.'),
  deliveryMethod: z.string().describe('The method used for delivery.'),
});

export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;

export async function sendNotification(
  input: SendNotificationInput
): Promise<SendNotificationOutput> {
  return sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ phoneNumber, message, method }) => {
    console.log(`Simulating sending ${method} to ${phoneNumber}: "${message}"`);
    
    // In a real application, you would integrate with a service like Twilio here.
    // For this simulation, we'll just return a success message.
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const confirmationId = ` AgriAssistAi-${method.toLowerCase()}-${Date.now()}`;

    return {
      status: `Message successfully queued for sending via ${method}.`,
      confirmationId: confirmationId,
      deliveryMethod: method,
    };
  }
);
