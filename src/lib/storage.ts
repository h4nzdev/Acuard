import { Assessment, StudentSession } from "@/app/lib/mock-data";

const STORAGE_KEYS = {
  ASSESSMENTS: 'ag_assessments',
  SESSIONS: 'ag_sessions',
};

// Start at 0: No initial mock data
const INITIAL_ASSESSMENTS: Assessment[] = [];
const INITIAL_SESSIONS: StudentSession[] = [];

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

export const deleteAssessment = (id: string) => {
  const current = getAssessments();
  const updated = current.filter(a => a.id !== id);
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
