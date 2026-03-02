export interface Question {
  id: string;
  text: string;
  points: number;
  type: 'Questionnaire' | 'Text Area' | 'Multiple Choice';
  allowCopyPaste: boolean;
  correctAnswer: string;
  choices?: string[];
  choiceType?: 'True/False' | 'Custom';
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  policy: 'Not Allowed' | 'Allowed but Monitored' | 'Fully Allowed';
  durationMinutes: number;
  questions: Question[];
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
}

export const MOCK_ASSESSMENTS: Assessment[] = [];
export const MOCK_SESSIONS: StudentSession[] = [];
