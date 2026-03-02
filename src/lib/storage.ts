import { Assessment, StudentSession, Student } from "@/app/lib/mock-data";

const STORAGE_KEYS = {
  ASSESSMENTS: 'ag_assessments',
  SESSIONS: 'ag_sessions',
  STUDENTS: 'ag_students',
};

const INITIAL_ASSESSMENTS: Assessment[] = [];
const INITIAL_SESSIONS: StudentSession[] = [];
const INITIAL_STUDENTS: Student[] = [];

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

// Student Storage
export const getStudents = (): Student[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const saveStudent = (student: Student) => {
  const current = getStudents();
  const updated = [...current, student];
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
};

export const deleteStudent = (id: string) => {
  const current = getStudents();
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
};
