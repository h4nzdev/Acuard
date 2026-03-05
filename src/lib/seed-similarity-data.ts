/**
 * Generate Mock Similarity Data for Demo
 * 
 * Use this to populate sample matches for your hackathon demo
 * Call this once to seed the data, then show it in the UI
 */

import { getSessions, getStudents, updateSession } from "@/lib/storage"
import { AnswerSimilarity } from "@/app/lib/mock-data"

export function seedMockSimilarityData(): void {
  const sessions = getSessions()
  const students = getStudents()
  
  if (sessions.length < 2 || students.length < 2) {
    console.warn("Not enough sessions/students for mock data")
    return
  }

  // Create mock similarity between first two students with same assessment
  const student1Session = sessions[0]
  const student2Session = sessions[1]
  
  if (student1Session.assessmentId !== student2Session.assessmentId) {
    console.warn("First two sessions are not for the same assessment")
    return
  }

  // Create similarity match
  const similarity: AnswerSimilarity = {
    id: `sim-demo-${Date.now()}`,
    matchedStudentId: student2Session.studentId,
    matchedStudentName: student2Session.studentName,
    similarityScore: 87,
    matchedQuestions: Object.keys(student1Session.submittedAnswers || {}).slice(0, 2),
    matchType: 'high-similarity',
    flaggedAt: new Date().toLocaleString(),
    details: `AI detected 87% similarity in answers with ${student2Session.studentName}. Matched patterns in sentence structure and key phrases.`
  }

  // Update student1's session
  const updatedSession1 = {
    ...student1Session,
    similarityMatches: [similarity],
    riskScore: 'Suspicious' as const
  }
  
  // Create reverse match for student2
  const reverseSimilarity: AnswerSimilarity = {
    ...similarity,
    matchedStudentId: student1Session.studentId,
    matchedStudentName: student1Session.studentName
  }
  
  const updatedSession2 = {
    ...student2Session,
    similarityMatches: [reverseSimilarity]
  }

  // Save to localStorage
  updateSession(updatedSession1)
  updateSession(updatedSession2)
  
  console.log("✅ Mock similarity data seeded successfully!")
  console.log(`- ${student1Session.studentName} ↔ ${student2Session.studentName}: 87% match`)
}

/**
 * Alternative: Create completely fake demo data
 * Use this if you have no real sessions yet
 */
export function createFakeDemoSimilarity(): void {
  const fakeMatches = [
    {
      student1: "Alex Chen",
      student2: "Jordan Smith",
      similarity: 94,
      type: 'exact' as const,
      questions: 3
    },
    {
      student1: "Sarah Johnson",
      student2: "Mike Brown",
      similarity: 82,
      type: 'high-similarity' as const,
      questions: 2
    }
  ]
  
  console.log("📊 Demo Similarity Report:")
  fakeMatches.forEach(match => {
    console.log(`⚠️ ${match.student1} ↔ ${match.student2}: ${match.similarity}% (${match.type})`)
  })
  
  return
}
