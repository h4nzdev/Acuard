import { Assessment, StudentSession } from "@/app/lib/mock-data";

const STORAGE_KEYS = {
  ASSESSMENTS: 'ag_assessments',
  SESSIONS: 'ag_sessions',
};

// Explicitly start with empty arrays for a fresh experience
const INITIAL_ASSESSMENTS: Assessment[] = [];
const INITIAL_SESSIONS: StudentSession[] = [];

export const getAssessments = (): Assessment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    return INITIAL_ASSESSMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse assessments from storage", e);
    return [];
  }
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
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse sessions from storage", e);
    return [];
  }
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

export const deleteSession = (studentId: string) => {
  const current = getSessions();
  const updated = current.filter(s => s.studentId !== studentId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
};
