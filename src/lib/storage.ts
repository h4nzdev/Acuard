import { Assessment, StudentSession } from "@/app/lib/mock-data";

const STORAGE_KEYS = {
  ASSESSMENTS: 'ag_assessments',
  SESSIONS: 'ag_sessions',
};

const INITIAL_ASSESSMENTS: Assessment[] = [
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

const INITIAL_SESSIONS: StudentSession[] = [
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

export const getAssessments = (): Assessment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    return INITIAL_ASSESSMENTS;
  }
  return JSON.parse(stored);
};

export const saveAssessment = (assessment: Assessment) => {
  const current = getAssessments();
  const updated = [...current, assessment];
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(updated));
};

export const getSessions = (): StudentSession[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }
  return JSON.parse(stored);
};

export const saveSession = (session: StudentSession) => {
  const current = getSessions();
  const updated = [...current, session];
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
};

export const updateSession = (updatedSession: StudentSession) => {
  const current = getSessions();
  const updated = current.map(s => s.studentId === updatedSession.studentId ? updatedSession : s);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
};
