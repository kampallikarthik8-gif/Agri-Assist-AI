
'use server';

/**
 * @fileOverview A simulated document locker service.
 * In a real app, this would integrate with secure cloud storage like Firebase Storage.
 *
 * - uploadDocument - Simulates uploading a document.
 * - UploadDocumentInput - Input for uploading.
 * - UploadDocumentOutput - Output after uploading.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UploadDocumentInputSchema = z.object({
  fileName: z.string().describe('The name of the document.'),
  fileDataUri: z.string().describe('The document content as a data URI.'),
  fileType: z.string().describe('The MIME type of the file.'),
});
export type UploadDocumentInput = z.infer<typeof UploadDocumentInputSchema>;

const UploadDocumentOutputSchema = z.object({
  documentId: z.string().describe('A unique ID for the uploaded document.'),
  storagePath: z.string().describe('The simulated storage path.'),
  message: z.string().describe('A confirmation message.'),
});
export type UploadDocumentOutput = z.infer<typeof UploadDocumentOutputSchema>;

export async function uploadDocument(
  input: UploadDocumentInput
): Promise<UploadDocumentOutput> {
  return uploadDocumentFlow(input);
}

const uploadDocumentFlow = ai.defineFlow(
  {
    name: 'uploadDocumentFlow',
    inputSchema: UploadDocumentInputSchema,
    outputSchema: UploadDocumentOutputSchema,
  },
  async ({fileName, fileType}) => {
    console.log(`Simulating upload for file: ${fileName} (${fileType})`);

    // Simulate an async upload process.
    await new Promise(resolve => setTimeout(resolve, 1000));

    const documentId = `doc_${crypto.randomUUID()}`;
    const storagePath = `user-documents/${documentId}/${fileName}`;

    return {
      documentId,
      storagePath,
      message: `Successfully simulated upload of '${fileName}'.`,
    };
  }
);
