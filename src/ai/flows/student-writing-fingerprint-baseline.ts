'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a student's writing fingerprint baseline.
 *
 * - studentWritingFingerprintBaseline - A function that processes a student's baseline writing sample
 *   and typing data to generate a unique writing fingerprint.
 * - StudentWritingFingerprintBaselineInput - The input type for the flow.
 * - StudentWritingFingerprintBaselineOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const StudentWritingFingerprintBaselineInputSchema = z.object({
  writingSample: z
    .string()
    .describe('The student\'s baseline writing assessment essay.'),
  typingSpeedWpm: z
    .number()
    .describe('The student\'s average typing speed in words per minute during the assessment.'),
  apiKey: z.string().optional().describe('Optional Gemini API Key provided by the user.'),
});
export type StudentWritingFingerprintBaselineInput = z.infer<
  typeof StudentWritingFingerprintBaselineInputSchema
>;

// Output Schema
const StudentWritingFingerprintBaselineOutputSchema = z.object({
  typingSpeedWpm: z
    .number()
    .describe('The student\'s average typing speed in words per minute.'),
  writingStyleSummary: z
    .string()
    .describe(
      'A summary of the student\'s unique writing style, including observations on tone, voice, and overall expression.'
    ),
  vocabularyAnalysis: z
    .string()
    .describe(
      'An analysis of the student\'s vocabulary usage, including complexity, diversity, and common word choices.'
    ),
  sentenceStructureAnalysis: z
    .string()
    .describe(
      'An analysis of the student\'s sentence structure patterns, such as average length, variety, and common constructions.'
    ),
  sentimentAnalysis: z
    .string()
    .describe('An analysis of the predominant sentiment and emotional tone in the writing sample.'),
  potentialAIIndicators: z
    .array(z.string())
    .describe(
      'A list of any subtle indicators that might suggest AI generation, such as overly formal language, lack of typical human errors, or unusual phrasing.'
    ),
});
export type StudentWritingFingerprintBaselineOutput = z.infer<
  typeof StudentWritingFingerprintBaselineOutputSchema
>;

export async function studentWritingFingerprintBaseline(
  input: StudentWritingFingerprintBaselineInput
): Promise<StudentWritingFingerprintBaselineOutput> {
  if (input.apiKey) {
    process.env.GOOGLE_GENAI_API_KEY = input.apiKey;
  }
  return studentWritingFingerprintBaselineFlow(input);
}

const fingerprintPrompt = ai.definePrompt({
  name: 'studentWritingFingerprintBaselinePrompt',
  input: {schema: StudentWritingFingerprintBaselineInputSchema},
  output: {schema: StudentWritingFingerprintBaselineOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an expert academic writing analyst. Your task is to analyze a student's baseline writing assessment to create a unique 'writing fingerprint'.
This fingerprint will be used to compare against future academic work to detect potential academic integrity issues.

Analyze the provided writing sample and the student's typing speed, then output a detailed analysis in the specified JSON format.

Writing Sample:
---
{{{writingSample}}}
---

Typing Speed (Words Per Minute): {{{typingSpeedWpm}}}

When analyzing, consider:
- **Writing Style Summary**: Describe the overall style, tone, voice, and common rhetorical devices.
- **Vocabulary Analysis**: Comment on vocabulary richness, complexity, commonality of words, and any unique word choices.
- **Sentence Structure Analysis**: Describe typical sentence lengths, complexity, variety, and common grammatical constructions.
- **Sentiment Analysis**: Identify the prevailing emotional tone or sentiment expressed in the writing.
- **Potential AI Indicators**: List any subtle aspects of the writing that *might* suggest AI generation, such as unnaturally perfect grammar, lack of human-like errors, overly formal or generic phrasing, or a highly consistent but bland style.

Ensure the output strictly adheres to the JSON schema provided.
`,
});

const studentWritingFingerprintBaselineFlow = ai.defineFlow(
  {
    name: 'studentWritingFingerprintBaselineFlow',
    inputSchema: StudentWritingFingerprintBaselineInputSchema,
    outputSchema: StudentWritingFingerprintBaselineOutputSchema,
  },
  async input => {
    const {output} = await fingerprintPrompt(input);
    if (!output) {
      throw new Error('Failed to generate writing fingerprint.');
    }
    return output;
  }
);
