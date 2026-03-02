
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Trophy, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Activity, 
  FileText,
  MousePointer2,
  Copy,
  CheckCircle2,
  ListTodo,
  HelpCircle,
  Type
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSessions, getAssessments } from "@/lib/storage"
import { StudentSession, Assessment } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

export default function AssessmentResultDetails() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

    const sessions = getSessions()
    const foundSession = sessions.find(s => s.assessmentId === params.id && s.studentId === user.id)
    
    if (foundSession) {
      setSession(foundSession)
      const assessments = getAssessments()
      const foundAssessment = assessments.find(a => a.id === foundSession.assessmentId)
      setAssessment(foundAssessment || null)
    }

    setIsMounted(true)
  }, [params.id, router])

  if (!isMounted) return null

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <FileText className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-bold">Results Not Found</h2>
        <p className="text-muted-foreground">We couldn't find the results for this assessment attempt.</p>
        <Button onClick={() => router.push('/student/history')}>Back to History</Button>
      </div>
    )
  }

  const scorePercentage = session.score !== undefined && session.totalPossiblePoints && session.totalPossiblePoints > 0
    ? Math.round((session.score / session.totalPossiblePoints) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/student/history')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">{session.assessmentTitle}</h2>
            <p className="text-muted-foreground">Detailed performance and integrity audit</p>
          </div>
        </div>
        <Badge variant="outline" className={cn(
          "font-bold uppercase tracking-widest px-4 py-1",
          session.status === 'Completed' ? "bg-green-50 text-green-700 border-green-200" : "bg-destructive/5 text-destructive border-destructive/10"
        )}>
          {session.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Final Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-headline font-bold text-primary">{session.score ?? 0}</span>
              <span className="text-xl text-muted-foreground font-medium">/ {session.totalPossiblePoints ?? 0}</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                <span>Score Progress</span>
                <span>{scorePercentage}%</span>
              </div>
              <Progress value={scorePercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Integrity Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-headline font-bold",
              session.riskScore === 'Normal' ? "text-green-600" : "text-destructive"
            )}>
              {session.riskScore}
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Based on behavioral biometrics, typing cadence, and focus patterns.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Session Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Typing Speed</span>
              <span className="font-bold">{session.typingSpeed} WPM</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tab Switches</span>
              <span className="font-bold">{session.tabSwitchCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Paste Events</span>
              <span className="font-bold">{session.pasteCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-primary" />
              Assessment Review
            </h3>
            <Badge variant="secondary" className="px-3 py-1 font-bold">
              {assessment?.questions?.length || 0} Items
            </Badge>
          </div>

          <div className="grid gap-4">
            {assessment?.questions?.map((q, index) => (
              <Card key={q.id} className="border-none ring-1 ring-slate-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-slate-100" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Q{index + 1}</span>
                          <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold">
                            {q.points} Points
                          </Badge>
                        </div>
                        <p className="text-slate-800 font-medium text-lg leading-snug">{q.text}</p>
                      </div>

                      {q.type === 'Multiple Choice' && q.choices && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {q.choices.map((choice, cIdx) => (
                            <div key={cIdx} className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border text-sm",
                              q.correctAnswer === (q.choiceType === 'Custom' ? choice : String.fromCharCode(65 + cIdx))
                                ? "bg-green-50 border-green-200 text-green-900" 
                                : "bg-slate-50 border-slate-100 text-slate-600"
                            )}>
                              <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold shrink-0">
                                {String.fromCharCode(65 + cIdx)}
                              </div>
                              {q.choiceType === 'Custom' ? choice : `Option ${String.fromCharCode(65 + cIdx)}`}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Correct Answer</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{q.correctAnswer}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                        {q.type === 'Text Area' ? <Type className="w-3 h-3" /> : q.type === 'Multiple Choice' ? <ListTodo className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                        {q.type}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200 bg-primary/[0.02]">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Integrity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("w-4 h-4", session.warningCount > 0 ? "text-destructive" : "text-slate-300")} />
                    <span className="text-xs font-bold text-slate-700">Warnings</span>
                  </div>
                  <span className="font-bold text-slate-900">{session.warningCount} / 3</span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Incident History</p>
                  {session.violations && session.violations.length > 0 ? (
                    session.violations.map((v, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-destructive/[0.02] rounded-lg border border-destructive/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                        <span className="text-xs text-slate-600 leading-tight">{v}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-green-50 p-3 rounded-lg border border-green-100">
                      No policy violations detected during this session.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Results are verified using AcademiaGuard behavioral fingerprinting. This report has been shared with your course instructor.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
