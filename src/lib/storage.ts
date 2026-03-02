
import { Assessment, StudentSession, Student } from "@/app/lib/mock-data";

const STORAGE_KEYS = {
  ASSESSMENTS: 'ag_assessments',
  SESSIONS: 'ag_sessions',
  STUDENTS: 'ag_students',
  SETTINGS: 'ag_settings',
  BASELINES: 'ag_baselines',
};

export interface GlobalSettings {
  sensitivity: number;
  autoLockThreshold: number;
  notifyOnFlag: boolean;
  notifyOnLock: boolean;
  institutionName: string;
}

const INITIAL_ASSESSMENTS: Assessment[] = [];
const INITIAL_SESSIONS: StudentSession[] = [];
const INITIAL_STUDENTS: Student[] = [];
const DEFAULT_SETTINGS: GlobalSettings = {
  sensitivity: 70,
  autoLockThreshold: 3,
  notifyOnFlag: true,
  notifyOnLock: true,
  institutionName: "AcademiaGuard University",
};

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
  const exists = current.findIndex(s => s.studentId === session.studentId && s.assessmentId === session.assessmentId);
  let updated;
  if (exists >= 0) {
    updated = [...current];
    updated[exists] = session;
  } else {
    updated = [...current, session];
  }
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
};

export const updateSession = (updatedSession: StudentSession) => {
  const current = getSessions();
  const updated = current.map(s => 
    (s.studentId === updatedSession.studentId && s.assessmentId === updatedSession.assessmentId) 
      ? updatedSession 
      : s
  );
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
};

export const deleteSession = (studentId: string, assessmentId?: string) => {
  const current = getSessions();
  const updated = current.filter(s => {
    if (assessmentId) {
      return !(s.studentId === studentId && s.assessmentId === assessmentId);
    }
    return s.studentId !== studentId;
  });
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
};

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

export const getGlobalSettings = (): GlobalSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveGlobalSettings = (settings: GlobalSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Baseline Fingerprint Storage
export const getStudentBaseline = (studentId: string): any | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.BASELINES);
  if (!stored) return null;
  try {
    const baselines = JSON.parse(stored);
    return baselines[studentId] || null;
  } catch (e) {
    return null;
  }
};

export const saveStudentBaseline = (studentId: string, fingerprint: any) => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEYS.BASELINES);
  let baselines: Record<string, any> = {};
  if (stored) {
    try {
      baselines = JSON.parse(stored);
    } catch (e) {
      baselines = {};
    }
  }
  baselines[studentId] = fingerprint;
  localStorage.setItem(STORAGE_KEYS.BASELINES, JSON.stringify(baselines));
};
