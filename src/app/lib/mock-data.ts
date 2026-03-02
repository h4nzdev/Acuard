export interface Assessment {
  id: string;
  title: string;
  description: string;
  policy: 'Not Allowed' | 'Allowed but Monitored' | 'Fully Allowed';
  durationMinutes: number;
}

export interface StudentSession {
  studentId: string;
  studentName: string;
  assessmentId: string;
  status: 'In Progress' | 'Completed' | 'Flagged' | 'Locked';
  riskScore: 'Normal' | 'Suspicious' | 'Highly Suspicious';
  warningCount: number;
  lastActive: Date;
}

// Data is now managed via localStorage in src/lib/storage.ts
// These empty exports prevent build errors while we migrate components
export const MOCK_ASSESSMENTS: Assessment[] = [];
export const MOCK_SESSIONS: StudentSession[] = [];
