'use server';
/**
 * @fileOverview A Genkit flow for extracting academic questions from an image.
 *
 * - extractQuestionsFromImage - A function that processes an image and returns structured questions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  text: z.string().describe('The text of the question.'),
  points: z.number().describe('The recommended points for this question based on complexity.'),
});

const OCRQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The list of questions extracted from the image.'),
});
export type OCRQuestionsOutput = z.infer<typeof OCRQuestionsOutputSchema>;

const OCRQuestionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question paper or assessment, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  apiKey: z.string().optional().describe('Optional Gemini API Key provided by the user.'),
});
export type OCRQuestionsInput = z.infer<typeof OCRQuestionsInputSchema>;

export async function extractQuestionsFromImage(
  input: OCRQuestionsInput
): Promise<OCRQuestionsOutput> {
  if (input.apiKey) {
    process.env.GOOGLE_GENAI_API_KEY = input.apiKey;
    process.env.GOOGLE_API_KEY = input.apiKey;
  }

  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
    throw new Error('Gemini API Key is missing. Please set it in Instructor -> Policies.');
  }

  return ocrQuestionsFlow(input);
}

const ocrQuestionsPrompt = ai.definePrompt({
  name: 'ocrQuestionsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: OCRQuestionsInputSchema },
  output: { schema: OCRQuestionsOutputSchema },
  prompt: `You are an expert academic assistant. Analyze the provided image of a question paper or handwritten assessment.
  
  Extract all clear questions you find. For each question:
  1. Capture the exact text of the question.
  2. Assign a reasonable point value (e.g., 5 for simple, 10 for medium, 20 for essay-style) if not explicitly mentioned.
  
  Image Content: {{media url=photoDataUri}}`,
});

const ocrQuestionsFlow = ai.defineFlow(
  {
    name: 'ocrQuestionsFlow',
    inputSchema: OCRQuestionsInputSchema,
    outputSchema: OCRQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await ocrQuestionsPrompt(input);
    if (!output) throw new Error("Failed to extract questions from image.");
    return output;
  }
);
