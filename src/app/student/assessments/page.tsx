
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Clock, ChevronRight, AlertCircle, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAssessments, getSessions } from "@/lib/storage"
import { Assessment, StudentSession } from "@/app/lib/mock-data"

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setStudentId(user.id)
    }
    
    setAssessments(getAssessments())
    setSessions(getSessions())
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">Available Assessments</h2>
        <p className="text-muted-foreground">Select an assessment to begin. Your behavior will be monitored for integrity.</p>
      </div>

      <div className="grid gap-6">
        {assessments.length > 0 ? (
          assessments.map((assessment) => {
            const studentSession = sessions.find(s => s.assessmentId === assessment.id && s.studentId === studentId)
            const isCompleted = studentSession?.status === 'Completed'
            const isLocked = studentSession?.status === 'Locked'
            
            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow duration-300 border-none ring-1 ring-slate-200">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="font-headline text-2xl">{assessment.title}</CardTitle>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="max-w-xl text-slate-600">
                      {assessment.description || "No specific instructions provided."}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] ${
                    assessment.policy === 'Not Allowed' ? 'border-destructive text-destructive' :
                    assessment.policy === 'Allowed but Monitored' ? 'border-primary text-primary' :
                    'border-green-600 text-green-600'
                  }`}>
                    {assessment.policy}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {assessment.durationMinutes} Minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      {assessment.questions?.length || 0} Questions
                    </div>
                  </div>
                  
                  {isLocked ? (
                    <Button variant="destructive" disabled className="gap-2">
                      Session Locked
                    </Button>
                  ) : isCompleted ? (
                    <Button variant="outline" asChild>
                      <Link href="/student/history">View Results</Link>
                    </Button>
                  ) : (
                    <Button asChild className="gap-2 bg-primary">
                      <Link href={`/student/assessments/${assessment.id}`}>
                        Begin Assessment
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
            <div className="p-6 bg-slate-50 rounded-full">
              <FileText className="w-12 h-12 text-slate-200" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-xl font-bold text-slate-900">No assessments found</h3>
              <p className="text-sm text-muted-foreground">Your instructor hasn't published any assessments for this course yet.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
        <h3 className="text-lg font-headline font-bold text-primary mb-2">Integrity Agreement</h3>
        <p className="text-sm text-muted-foreground mb-6">
          AcademiaGuard utilizes behavioral biometrics (typing cadence, focus patterns) to verify your identity and ensure academic honesty. By starting an assessment, you agree to the following:
        </p>
        <ul className="grid md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-tight text-slate-600">
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Stable Internet Connection
          </li>
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Verified Writing Baseline
          </li>
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Exclusive Focus on Tab
          </li>
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            No AI Assistance
          </li>
        </ul>
      </div>
    </div>
  )
}
