
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { FileText, Save, Send, AlertCircle, Clock, Info, ListTodo, CheckCircle2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MonitoringEngine } from "@/components/assessments/monitoring-engine"
import { getAssessments, saveSession, getSessions, updateSession, getStudents, updateStudent } from "@/lib/storage"
import { Assessment, StudentSession } from "@/app/lib/mock-data"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ActiveAssessment() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [finalScore, setFinalScore] = useState<{ earned: number, total: number } | null>(null)
  const [warningCount, setWarningCount] = useState(0)
  const [riskScore, setRiskScore] = useState("Normal")
  const [isMounted, setIsMounted] = useState(false)
  const [studentId, setStudentId] = useState<string>("")
  const [studentName, setStudentName] = useState<string>("")

  const fullContent = Object.values(answers).join("\n\n")

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    setStudentId(user.id)
    setStudentName(user.name)

    const data = getAssessments()
    const found = data.find(a => a.id === params.id)
    
    if (!found) {
      toast({
        title: "Error",
        description: "Assessment not found.",
        variant: "destructive"
      })
      router.push('/student/assessments')
      return
    }
    
    setAssessment(found)

    const sessions = getSessions()
    const existing = sessions.find(s => s.assessmentId === found.id && s.studentId === user.id)
    
    if (!existing) {
      const newSession: StudentSession = {
        studentId: user.id,
        studentName: user.name,
        assessmentId: found.id,
        assessmentTitle: found.title,
        status: 'In Progress',
        riskScore: 'Normal',
        warningCount: 0,
        lastActive: new Date().toLocaleTimeString(),
        typingSpeed: 0,
        pasteCount: 0,
        tabSwitchCount: 0,
        violations: []
      }
      saveSession(newSession)
    } else if (existing.status === 'Locked') {
      setWarningCount(3)
    } else if (existing.status === 'Completed') {
      setIsSubmitted(true)
      if (existing.score !== undefined) {
        setFinalScore({ earned: existing.score, total: existing.totalPossiblePoints || 0 })
      }
    } else {
      setWarningCount(existing.warningCount)
      setRiskScore(existing.riskScore)
    }

    setIsMounted(true)
  }, [params.id, router])

  if (!isMounted || !assessment) return null

  const handleUpdateAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    
    let earned = 0
    let total = 0
    
    const questions = assessment.questions || []
    questions.forEach(q => {
      total += q.points
      const studentAnswer = (answers[q.id] || "").trim().toLowerCase()
      const correctAnswer = (q.correctAnswer || "").trim().toLowerCase()
      
      if (studentAnswer === correctAnswer && studentAnswer !== "") {
        earned += q.points
      }
    })

    // Safety fallback for total points
    if (total === 0 && questions.length > 0) {
      total = questions.length * 10
    }

    const sessions = getSessions()
    const current = sessions.find(s => s.assessmentId === assessment.id && s.studentId === studentId)
    if (current) {
      updateSession({
        ...current,
        status: 'Completed',
        lastActive: new Date().toLocaleTimeString(),
        score: earned,
        totalPossiblePoints: total
      })
    }

    // Update Student Streak and Honesty Score on "Clean" completion
    const students = getStudents()
    const student = students.find(s => s.id === studentId)
    if (student) {
      const hadNoWarnings = (current?.warningCount || 0) === 0
      updateStudent({
        ...student,
        honestStreak: hadNoWarnings ? (student.honestStreak || 0) + 1 : 0,
        honestyScore: hadNoWarnings ? Math.min(100, student.honestyScore + 2) : student.honestyScore,
        totalAssessments: (student.totalAssessments || 0) + 1
      })
    }

    setTimeout(() => {
      setFinalScore({ earned, total })
      setIsSubmitted(true)
      setIsSubmitting(false)
      toast({
        title: "Assessment Submitted",
        description: "Your work has been securely uploaded and graded."
      })
    }, 1500)
  }

  if (isSubmitted && finalScore) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
        <Card className="max-w-md w-full text-center shadow-2xl border-green-200">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <Trophy className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">Assessment Complete</CardTitle>
            <CardDescription className="text-base">
              Your submission has been verified and recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Your Final Score</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-headline font-bold text-primary">{finalScore.earned}</span>
                <span className="text-xl text-muted-foreground">/ {finalScore.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {finalScore.total > 0 ? Math.round((finalScore.earned / finalScore.total) * 100) : 0}% Grade Achieved
              </p>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full h-12 font-bold bg-primary shadow-lg" asChild>
                <Link href={`/student/history/${assessment.id}`}>View Detailed Results</Link>
              </Button>
              <Button variant="ghost" className="w-full h-11 text-slate-600" asChild>
                <Link href="/student/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (warningCount >= 3) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <Card className="max-w-md w-full text-center border-destructive shadow-2xl ring-4 ring-destructive/10">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-destructive">Assessment Locked</CardTitle>
            <CardDescription className="text-base">
              This session has been automatically terminated due to multiple policy violations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed">
              Your proctor has been notified. Any work completed up to this point has been saved for instructor review.
            </div>
            <Button variant="outline" className="w-full h-11 font-bold" onClick={() => router.push('/student/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-4">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border sticky top-4 z-40">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-slate-900">{assessment.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">
                {assessment.policy} Policy
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Live Proctoring Active
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="gap-2 font-bold text-slate-600">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button className="gap-2 bg-accent hover:bg-accent/90 shadow-md font-bold" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <span className="animate-pulse">Uploading...</span> : <><Send className="w-4 h-4" /> Submit</>}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {assessment.description && (
          <Card className="bg-slate-50/50 border-none ring-1 ring-slate-200">
            <CardContent className="p-6 flex gap-4">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed italic">{assessment.description}</p>
            </CardContent>
          </Card>
        )}

        {assessment.questions && assessment.questions.length > 0 ? (
          assessment.questions.map((q, index) => (
            <Card key={q.id} className="shadow-lg border-none ring-1 ring-slate-200 overflow-hidden">
              <div className="h-1 bg-primary/20" />
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Question {index + 1}</span>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase">{q.points} Points</Badge>
                </div>
                <CardTitle className="text-lg font-headline font-bold text-slate-800 leading-snug">
                  {q.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {q.type === 'Multiple Choice' ? (
                  <RadioGroup 
                    value={answers[q.id] || ""} 
                    onValueChange={(val) => handleUpdateAnswer(q.id, val)}
                    className="space-y-3"
                  >
                    {q.choiceType === 'True/False' ? (
                      <>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                          <RadioGroupItem value="True" id={`q-${q.id}-choice-true`} />
                          <Label htmlFor={`q-${q.id}-choice-true`} className="flex-1 font-medium cursor-pointer">True</Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                          <RadioGroupItem value="False" id={`q-${q.id}-choice-false`} />
                          <Label htmlFor={`q-${q.id}-choice-false`} className="flex-1 font-medium cursor-pointer">False</Label>
                        </div>
                      </>
                    ) : (
                      (q.choices || ["", "", "", ""]).map((choice, idx) => {
                        const choiceLabel = String.fromCharCode(65 + idx)
                        return (
                          <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                            <RadioGroupItem value={choice} id={`q-${q.id}-choice-${idx}`} disabled={!choice} />
                            <Label htmlFor={`q-${q.id}-choice-${idx}`} className="flex-1 font-medium cursor-pointer">
                              <span className="text-primary mr-2 font-bold">{choiceLabel}.</span>
                              {choice}
                            </Label>
                          </div>
                        )
                      })
                    )}
                  </RadioGroup>
                ) : (
                  <Textarea 
                    placeholder="Enter your response here..."
                    className="min-h-[200px] text-base leading-relaxed focus-visible:ring-accent"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                    onContextMenu={(e) => !q.allowCopyPaste && e.preventDefault()}
                    onPaste={(e) => !q.allowCopyPaste && e.preventDefault()}
                  />
                )}
                
                {!q.allowCopyPaste && q.type !== 'Multiple Choice' && (
                  <p className="text-[10px] text-destructive font-black uppercase mt-3 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Copy-Paste is strictly disabled for this item.
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <p className="text-muted-foreground italic">No questions found in this assessment.</p>
          </div>
        )}
      </div>

      <MonitoringEngine 
        currentWriting={fullContent}
        onRiskUpdate={setRiskScore}
        onWarning={setWarningCount}
        assessmentId={assessment.id}
        studentId={studentId}
        durationMinutes={assessment.durationMinutes}
      />
    </div>
  )
}
