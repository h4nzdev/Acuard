/**
 * AI-Powered Answer Similarity Detection
 * 
 * Analyzes student submissions to detect matching answers
 * Uses text similarity algorithms to flag potential cheating
 * 
 * Features:
 * - Exact match detection
 * - High similarity (paraphrasing detection)
 * - Pattern matching for short answers
 */

import { StudentSession, AnswerSimilarity, Question } from "@/app/lib/mock-data"
import { getSessions, getStudents } from "@/lib/storage"

/**
 * Calculate text similarity using Levenshtein distance
 * Returns similarity percentage (0-100)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const s1 = text1.toLowerCase().trim()
  const s2 = text2.toLowerCase().trim()
  
  // Exact match
  if (s1 === s2) return 100
  
  // Empty answers
  if (!s1 || !s2) return 0
  
  // For short answers, use exact word matching
  if (s1.length < 50 || s2.length < 50) {
    const words1 = s1.split(/\s+/)
    const words2 = s2.split(/\s+/)
    const commonWords = words1.filter(w => words2.includes(w))
    return Math.round((commonWords.length / Math.max(words1.length, words2.length)) * 100)
  }
  
  // For longer answers, use Levenshtein distance
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  return Math.round(((maxLength - distance) / maxLength) * 100)
}

/**
 * Detect answer similarity between two students
 */
function detectSimilarity(
  student1: StudentSession,
  student2: StudentSession,
  questions: Question[]
): AnswerSimilarity | null {
  if (!student1.submittedAnswers || !student2.submittedAnswers) return null
  
  const matches: { questionId: string; similarity: number }[] = []
  let totalSimilarity = 0
  let comparedCount = 0
  
  // Compare answers for each question
  Object.entries(student1.submittedAnswers).forEach(([qId, answer1]) => {
    const answer2 = student2.submittedAnswers[qId]
    if (answer2 !== undefined) {
      const similarity = calculateTextSimilarity(answer1, answer2)
      if (similarity >= 70) { // Only track significant matches
        matches.push({ questionId: qId, similarity })
        totalSimilarity += similarity
        comparedCount++
      }
    }
  })
  
  if (matches.length === 0) return null
  
  const avgSimilarity = Math.round(totalSimilarity / matches.length)
  
  // Determine match type
  let matchType: AnswerSimilarity['matchType'] = 'paraphrased'
  if (avgSimilarity >= 95) matchType = 'exact'
  else if (avgSimilarity >= 80) matchType = 'high-similarity'
  
  // Generate details
  const questionTexts = matches.map(m => {
    const q = questions.find(q => q.id === m.questionId)
    return q ? `Q${questions.indexOf(q) + 1}: ${m.similarity}%` : ''
  }).filter(Boolean)
  
  return {
    id: `sim-${student1.studentId}-${student2.studentId}-${Date.now()}`,
    matchedStudentId: student2.studentId,
    matchedStudentName: student2.studentName,
    similarityScore: avgSimilarity,
    matchedQuestions: matches.map(m => m.questionId),
    matchType,
    flaggedAt: new Date().toLocaleString(),
    details: `Matched ${matches.length} questions with ${student2.studentName}. Similarity scores: ${questionTexts.join(', ')}`
  }
}

/**
 * Analyze all submissions for an assessment and detect similarities
 * Returns sessions updated with similarity matches
 */
export function analyzeAssessmentSimilarities(assessmentId: string, questions: Question[]): StudentSession[] {
  const sessions = getSessions()
  const assessmentSessions = sessions.filter(
    s => s.assessmentId === assessmentId && s.status === 'Completed' && s.submittedAnswers
  )
  
  if (assessmentSessions.length < 2) return assessmentSessions
  
  // Compare each pair of students
  for (let i = 0; i < assessmentSessions.length; i++) {
    const student1 = assessmentSessions[i]
    const similarities: AnswerSimilarity[] = []
    
    for (let j = i + 1; j < assessmentSessions.length; j++) {
      const student2 = assessmentSessions[j]
      const similarity = detectSimilarity(student1, student2, questions)
      
      if (similarity && similarity.similarityScore >= 70) {
        similarities.push(similarity)
        
        // Also add reverse match to student2
        if (!student2.similarityMatches) student2.similarityMatches = []
        student2.similarityMatches.push({
          ...similarity,
          matchedStudentId: student1.studentId,
          matchedStudentName: student1.studentName
        })
      }
    }
    
    if (similarities.length > 0) {
      student1.similarityMatches = similarities
      // Flag session if high similarity found
      const maxSimilarity = Math.max(...similarities.map(s => s.similarityScore))
      if (maxSimilarity >= 80 && student1.riskScore === 'Normal') {
        student1.riskScore = 'Suspicious'
      }
    }
  }
  
  return assessmentSessions
}

/**
 * Get similarity report for an assessment
 */
export function getSimilarityReport(assessmentId: string): {
  totalSubmissions: number
  flaggedPairs: number
  highRiskMatches: Array<{
    student1: string
    student2: string
    similarity: number
    questions: number
  }>
} {
  const sessions = getSessions()
  const assessmentSessions = sessions.filter(
    s => s.assessmentId === assessmentId && s.status === 'Completed'
  )
  
  const flaggedPairs = new Set<string>()
  const highRiskMatches: Array<{
    student1: string
    student2: string
    similarity: number
    questions: number
  }> = []
  
  assessmentSessions.forEach(session => {
    if (session.similarityMatches && session.similarityMatches.length > 0) {
      session.similarityMatches.forEach(match => {
        const pairKey = [session.studentId, match.matchedStudentId].sort().join('-')
        if (!flaggedPairs.has(pairKey)) {
          flaggedPairs.add(pairKey)
          
          if (match.similarityScore >= 80) {
            highRiskMatches.push({
              student1: session.studentName,
              student2: match.matchedStudentName,
              similarity: match.similarityScore,
              questions: match.matchedQuestions.length
            })
          }
        }
      })
    }
  })
  
  return {
    totalSubmissions: assessmentSessions.length,
    flaggedPairs: flaggedPairs.size,
    highRiskMatches
  }
}

/**
 * Get students who finished an assessment (for live monitoring)
 */
export function getCompletedStudents(assessmentId: string): StudentSession[] {
  const sessions = getSessions()
  return sessions.filter(
    s => s.assessmentId === assessmentId && s.status === 'Completed'
  ).sort((a, b) => {
    // Sort by submission time (most recent first)
    return b.lastActive.localeCompare(a.lastActive)
  })
}
