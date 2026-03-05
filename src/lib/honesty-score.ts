/**
 * Honesty Score Calculation Utility
 * 
 * Calculates student honesty score based on:
 * - Tab switches (weight: 30%)
 * - Paste violations (weight: 25%)
 * - Warning count (weight: 25%)
 * - Risk level (weight: 20%)
 * 
 * Score ranges from 0-100
 */

import { StudentSession, Student } from "@/app/lib/mock-data"
import { getSessions, getStudents, updateStudent } from "@/lib/storage"

interface HonestyFactors {
  tabSwitchCount: number
  pasteCount: number
  warningCount: number
  riskScore: 'Normal' | 'Suspicious' | 'Highly Suspicious'
  violations: string[]
}

/**
 * Calculate honesty score for a single session
 * Returns score from 0-100
 */
export function calculateSessionHonesty(session: StudentSession): number {
  const factors: HonestyFactors = {
    tabSwitchCount: session.tabSwitchCount || 0,
    pasteCount: session.pasteCount || 0,
    warningCount: session.warningCount || 0,
    riskScore: session.riskScore || 'Normal',
    violations: session.violations || []
  }

  let score = 100

  // Tab Switch Penalty (max -30 points)
  // Each tab switch = -10 points
  const tabSwitchPenalty = Math.min(30, factors.tabSwitchCount * 10)
  score -= tabSwitchPenalty

  // Paste Violation Penalty (max -25 points)
  // Each paste = -12 points
  const pastePenalty = Math.min(25, factors.pasteCount * 12)
  score -= pastePenalty

  // Warning Count Penalty (max -25 points)
  // Each warning = -8 points
  const warningPenalty = Math.min(25, factors.warningCount * 8)
  score -= warningPenalty

  // Risk Score Penalty (max -20 points)
  if (factors.riskScore === 'Suspicious') {
    score -= 10
  } else if (factors.riskScore === 'Highly Suspicious') {
    score -= 20
  }

  // Additional violation penalty
  const violationPenalty = Math.min(20, factors.violations.length * 5)
  score -= violationPenalty

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate overall honesty score based on all student sessions
 * Returns weighted average (recent sessions have more weight)
 */
export function calculateOverallHonestyScore(sessions: StudentSession[]): number {
  if (sessions.length === 0) return 100

  let totalScore = 0
  let totalWeight = 0

  sessions.forEach((session, index) => {
    // Recent sessions have higher weight
    const weight = 1 + (index / sessions.length)
    const sessionScore = calculateSessionHonesty(session)
    
    totalScore += sessionScore * weight
    totalWeight += weight
  })

  return Math.round(totalScore / totalWeight)
}

/**
 * Update student honesty score based on session performance
 * Called when session is completed
 */
export function updateStudentHonestyScore(
  student: Student,
  session: StudentSession
): Student {
  const sessionScore = calculateSessionHonesty(session)
  
  // Calculate how much the score should change
  const currentScore = student.honestyScore || 100
  
  // Weight the new session score (30% new, 70% historical)
  const newScore = Math.round((currentScore * 0.7) + (sessionScore * 0.3))
  
  // Update honest streak
  let newStreak = student.honestStreak || 0
  if (sessionScore >= 90) {
    newStreak += 1
  } else if (sessionScore < 70) {
    newStreak = 0
  }

  return {
    ...student,
    honestyScore: newScore,
    honestStreak: newStreak,
    totalAssessments: (student.totalAssessments || 0) + 1,
    flaggedSessions: sessionScore < 70 ? (student.flaggedSessions || 0) + 1 : student.flaggedSessions
  }
}

/**
 * Recalculate all student honesty scores from session history
 * Call this to fix existing data
 */
export function recalculateAllHonestyScores(): void {
  const students = getStudents()
  const sessions = getSessions()
  
  students.forEach(student => {
    const studentSessions = sessions.filter(s => s.studentId === student.id)
    
    if (studentSessions.length > 0) {
      const newScore = calculateOverallHonestyScore(studentSessions)
      const flaggedCount = studentSessions.filter(s => calculateSessionHonesty(s) < 70).length
      
      updateStudent({
        ...student,
        honestyScore: newScore,
        flaggedSessions: flaggedCount,
        totalAssessments: studentSessions.length,
        honestStreak: 0 // Reset streak on recalculation
      })
    }
  })
}

/**
 * Get honesty score label based on score
 */
export function getHonestyScoreLabel(score: number): string {
  if (score >= 90) return "High Integrity"
  if (score >= 70) return "Fair"
  if (score >= 50) return "Requires Review"
  return "At Risk"
}

/**
 * Get honesty score color class
 */
export function getHonestyScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
  if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
  if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200"
  return "text-red-600 bg-red-50 border-red-200"
}
