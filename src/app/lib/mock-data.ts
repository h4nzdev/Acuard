export interface TypingVector {
  wpm: number;
  consistency: number; // variance in wpm
  backspaceRate: number; // count per 100 chars
  pauseCount: number; // pauses > 2s
  avgSentenceLength: number;
  vocabComplexity: number; // scale 1-10 (unique word ratio)
  pasteCount: number;
  baselineText?: string; // Original text for AI reference
}

export interface Question {
  id: string;
  text: string;
  points: number;
  type: 'Questionnaire' | 'Text Area' | 'Multiple Choice' | 'Essay';
  allowCopyPaste: boolean;
  correctAnswer: string;
  choices?: string[];
  choiceType?: 'True/False' | 'Custom';
  minWords?: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  policy: 'Not Allowed' | 'Allowed but Monitored' | 'Fully Allowed';
  durationMinutes: number;
  questions: Question[];
  isPublished: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  enrolledDate: string;
  honestyScore: number;
  totalAssessments: number;
  flaggedSessions: number;
  honestStreak: number;
  idPhotoUrl?: string;
  typingBaseline?: TypingVector;
}

export interface StudentSession {
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  status: 'In Progress' | 'Completed' | 'Flagged' | 'Locked';
  riskScore: 'Normal' | 'Suspicious' | 'Highly Suspicious';
  warningCount: number;
  lastActive: string;
  typingSpeed: number;
  pasteCount: number;
  tabSwitchCount: number;
  violations: string[];
  score?: number;
  totalPossiblePoints?: number;
  currentVector?: TypingVector;
  integrityPoints?: number; 
}

export const MOCK_ASSESSMENTS: Assessment[] = [];
export const MOCK_SESSIONS: StudentSession[] = [];
