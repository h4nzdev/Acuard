'use server';
/**
 * @fileOverview A Genkit flow for predicting academic integrity risk scores.
 *
 * - predictIntegrityRiskScore - A function that calculates an academic integrity risk score.
 * - PredictiveIntegrityRiskScoreInput - The input type for the predictIntegrityRiskScore function.
 * - PredictiveIntegrityRiskScoreOutput - The return type for the predictIntegrityRiskScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveIntegrityRiskScoreInputSchema = z.object({
  currentWritingSample: z
    .string()
    .describe(
      'The current written content submitted by the student for assessment.'
    ),
  baselineWritingFingerprint: z
    .string()
    .describe(
      'A representative writing sample from the student, establishing their typical writing style and patterns (e.g., typing speed, sentence length, vocabulary usage).'
    ),
  typingSpeed: z
    .number()
    .describe(
      'The average typing speed of the student during the current assessment, in words per minute (WPM).'
    ),
  pasteFrequency: z
    .number()
    .describe(
      'The number of paste events detected during the current assessment.'
    ),
  tabSwitchCount: z
    .number()
    .describe('The number of tab switches detected during the current assessment.'),
});
export type PredictiveIntegrityRiskScoreInput = z.infer<
  typeof PredictiveIntegrityRiskScoreInputSchema
>;

const PredictiveIntegrityRiskScoreOutputSchema = z.object({
  riskScore: z
    .enum(['Normal', 'Suspicious', 'Highly Suspicious'])
    .describe(
      'The academic integrity risk level: Normal, Suspicious, or Highly Suspicious.'
    ),
  explanation: z
    .string()
    .describe(
      'A brief explanation detailing the factors that led to the assigned risk score.'
    ),
});
export type PredictiveIntegrityRiskScoreOutput = z.infer<
  typeof PredictiveIntegrityRiskScoreOutputSchema
>;

export async function predictIntegrityRiskScore(
  input: PredictiveIntegrityRiskScoreInput
): Promise<PredictiveIntegrityRiskScoreOutput> {
  return predictiveIntegrityRiskScoreFlow(input);
}

const predictiveIntegrityRiskScorePrompt = ai.definePrompt({
  name: 'predictiveIntegrityRiskScorePrompt',
  input: { schema: PredictiveIntegrityRiskScoreInputSchema },
  output: { schema: PredictiveIntegrityRiskScoreOutputSchema },
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an academic integrity analysis system. Your task is to evaluate a student's current assessment behavior and writing style against their established baseline to determine a risk score for potential academic misconduct.

Analyze the following data carefully:

Student's Baseline Writing Fingerprint:
This text represents the student's typical writing style. Pay attention to patterns in sentence length, vocabulary, grammar, and overall tone.
\`\`\`
{{{baselineWritingFingerprint}}}
\`\`\`

Current Assessment Writing Sample:
This is the text the student submitted for the current assessment. Compare its writing style, vocabulary, and structural complexity against the baseline.
\`\`\`
{{{currentWritingSample}}}
\`\`\`

Real-time Behavioral Data:
- Typing Speed (WPM): {{{typingSpeed}}}
- Paste Events: {{{pasteFrequency}}}
- Tab Switches: {{{tabSwitchCount}}}

Consider these behavioral indicators:
- Significant deviations in typing speed (unusually high or low compared to typical human typing).
- High number of paste events, especially if the current writing sample includes verbatim pasted content not allowed by the assessment rules (assume a reasonable threshold for 'high' if not specified).
- Frequent tab switches, which might indicate looking up information externally or interacting with other applications.

Based on your analysis, determine if the academic integrity risk is 'Normal', 'Suspicious', or 'Highly Suspicious'. Provide a brief, concise explanation for your decision, highlighting the key factors from the writing comparison and behavioral data that influenced the risk score.`,
});

const predictiveIntegrityRiskScoreFlow = ai.defineFlow(
  {
    name: 'predictiveIntegrityRiskScoreFlow',
    inputSchema: PredictiveIntegrityRiskScoreInputSchema,
    outputSchema: PredictiveIntegrityRiskScoreOutputSchema,
  },
  async (input) => {
    const { output } = await predictiveIntegrityRiskScorePrompt(input);
    return output!;
  }
);
