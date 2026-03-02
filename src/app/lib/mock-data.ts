export interface Question {
  id: string;
  text: string;
  points: number;
  type: 'Questionnaire' | 'Text Area';
  allowCopyPaste: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  policy: 'Not Allowed' | 'Allowed but Monitored' | 'Fully Allowed';
  durationMinutes: number;
  questions: Question[];
}

export const MOCK_ASSESSMENTS: Assessment[] = [];
export const MOCK_SESSIONS: StudentSession[] = [];

export interface StudentSession {
  studentId: string;
  studentName: string;
  assessmentId: string;
  status: 'In Progress' | 'Completed' | 'Flagged' | 'Locked';
  riskScore: 'Normal' | 'Suspicious' | 'Highly Suspicious';
  warningCount: number;
  lastActive: Date;
}
