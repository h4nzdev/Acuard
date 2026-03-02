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

export const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: '1',
    title: 'Modern European History Final',
    description: 'Final essay-based assessment on 20th century Europe.',
    policy: 'Not Allowed',
    durationMinutes: 60,
  },
  {
    id: '2',
    title: 'Intro to Algorithms - Midterm',
    description: 'Implementation and analysis of sorting algorithms.',
    policy: 'Allowed but Monitored',
    durationMinutes: 90,
  },
];

export const MOCK_SESSIONS: StudentSession[] = [
  {
    studentId: 's1',
    studentName: 'Alex Rivera',
    assessmentId: '1',
    status: 'In Progress',
    riskScore: 'Normal',
    warningCount: 0,
    lastActive: new Date(),
  },
  {
    studentId: 's2',
    studentName: 'Jordan Smith',
    assessmentId: '1',
    status: 'Flagged',
    riskScore: 'Suspicious',
    warningCount: 2,
    lastActive: new Date(),
  },
  {
    studentId: 's3',
    studentName: 'Sam Taylor',
    assessmentId: '1',
    status: 'Locked',
    riskScore: 'Highly Suspicious',
    warningCount: 3,
    lastActive: new Date(),
  },
];
