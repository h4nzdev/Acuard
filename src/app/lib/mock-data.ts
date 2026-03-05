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
  submittedAnswers?: Record<string, string>; // Store submitted answers for AI analysis
  similarityMatches?: AnswerSimilarity[]; // AI-detected matches with other students
}

export interface AnswerSimilarity {
  id: string;
  matchedStudentId: string;
  matchedStudentName: string;
  similarityScore: number; // 0-100
  matchedQuestions: string[]; // Question IDs with matches
  matchType: 'exact' | 'high-similarity' | 'paraphrased';
  flaggedAt: string;
  details: string;
}

export interface CollaboratorDetection {
  id: string;
  screenshot: string;
  studentName: string;
  studentId: string;
  reason: string;
  timestamp: string;
  confidence: number;
  type: 'multiple-faces' | 'looking-off-screen' | 'phone-detected';
}

export const MOCK_ASSESSMENTS: Assessment[] = [];
export const MOCK_SESSIONS: StudentSession[] = [];

// Mock collaborator detections for demo
export const MOCK_COLLABORATOR_DETECTIONS: CollaboratorDetection[] = [
  {
    id: 'cd-001',
    screenshot: 'https://placehold.co/400x300/1e293b/ffffff?text=Multiple+Faces+Detected',
    studentName: 'Alex Chen',
    studentId: 'student-001',
    reason: 'Multiple faces detected in frame',
    timestamp: '2026-03-05 10:23:45',
    confidence: 94,
    type: 'multiple-faces'
  },
  {
    id: 'cd-002',
    screenshot: 'https://placehold.co/400x300/1e293b/ffffff?text=Looking+Off-Screen',
    studentName: 'Alex Chen',
    studentId: 'student-001',
    reason: 'Student looking off-screen for extended period',
    timestamp: '2026-03-05 10:25:12',
    confidence: 87,
    type: 'looking-off-screen'
  },
  {
    id: 'cd-003',
    screenshot: 'https://placehold.co/400x300/1e293b/ffffff?text=Phone+Detected',
    studentName: 'Alex Chen',
    studentId: 'student-001',
    reason: 'Mobile phone detected in hand',
    timestamp: '2026-03-05 10:28:33',
    confidence: 91,
    type: 'phone-detected'
  }
];
