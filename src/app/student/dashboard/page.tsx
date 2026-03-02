
"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle, ShieldCheck, Clock, TrendingUp, BookOpen, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSessions, getStudents } from "@/lib/storage"
import { StudentSession, Student } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

export default function StudentDashboard() {
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Get current user from login session
    const currentUserStr = localStorage.getItem('ag_current_user')
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
    
    if (!currentUser) {
      // If no user is logged in, this should ideally redirect to login
      setIsMounted(true)
      return
    }

    const allSessions = getSessions()
    const studentSessions = allSessions.filter(s => s.studentId === currentUser.id)
    setSessions(studentSessions)

    const allStudents = getStudents()
    const currentStudent = allStudents.find(s => s.id === currentUser.id)
    setStudent(currentStudent || null)
    
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-bold">Profile not found</h2>
        <p className="text-muted-foreground">Please log in again to sync your profile data.</p>
        <Button asChild><Link href="/login">Back to Login</Link></Button>
      </div>
    )
  }

  const activeWarnings = sessions.reduce((acc, s) => acc + s.warningCount, 0)
  const honestyScore = student.honestyScore

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Welcome back, {student.name}!</h2>
          <p className="text-muted-foreground">Monitor your personal integrity score and assessment history.</p>
        </div>
        <Button asChild className="bg-primary">
          <Link href="/student/assessments">View All Assessments</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-md border-none ring-1 ring-slate-200 bg-white/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Honesty Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold text-primary mb-2">{honestyScore}%</div>
            <Progress value={honestyScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Based on your assessment behavior</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none ring-1 ring-slate-200 bg-white/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Total Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-4xl font-headline font-bold mb-2", activeWarnings > 0 ? "text-destructive" : "text-slate-800")}>
              {activeWarnings}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Accumulated warnings across all sessions</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none ring-1 ring-slate-200 bg-white/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Assessments Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold text-accent mb-2">
              {sessions.filter(s => s.status === 'Completed').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Successfully verified sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.length > 0 ? (
              sessions.slice(0, 5).map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      session.status === 'Completed' ? "bg-green-100 text-green-600" : 
                      session.status === 'Locked' ? "bg-destructive/10 text-destructive" : "bg-yellow-100 text-yellow-600"
                    )}>
                      {session.status === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{session.assessmentTitle}</p>
                      <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-black text-xs uppercase tracking-widest",
                      session.riskScore === 'Normal' ? "text-primary" : "text-destructive"
                    )}>
                      {session.riskScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">Integrity Risk</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50/50 border-2 border-dashed rounded-2xl flex flex-col items-center gap-4">
                <BookOpen className="w-12 h-12 text-slate-200" />
                <p className="text-sm text-muted-foreground italic">No assessment activity recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Integrity Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground font-medium">
              AcademiaGuard works best when you focus on your work. Remember these core principles:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-slate-700">Minimize tab switching. AcademiaGuard logs every time you leave the assessment window.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-slate-700">Avoid copy-pasting content from external sources. Patterns are compared against your baseline.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-slate-700">Maintain a steady typing pace. Drastic changes in cadence can trigger AI analysis.</span>
              </li>
            </ul>
            
            <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl mt-6">
              <div className="flex items-center gap-2 mb-2 text-accent">
                <AlertCircle className="w-4 h-4" />
                <p className="font-bold text-xs uppercase tracking-tight">Proctor Note</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Multiple integrity warnings within a single session will result in an automatic account lock.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
