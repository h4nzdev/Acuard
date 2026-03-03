"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Trophy, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  Clock, 
  Activity, 
  FileText,
  MousePointer2,
  Copy,
  CheckCircle2,
  ListTodo,
  HelpCircle,
  Type,
  BrainCircuit
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSessions, getAssessments, getStudentBaseline } from "@/lib/storage"
import { StudentSession, Assessment, TypingVector } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

export default function AssessmentResultDetails() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [baseline, setBaseline] = useState<TypingVector | null>(null)
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
      
      const studentBaseline = getStudentBaseline(user.id)
      setBaseline(studentBaseline)
    }

    setIsMounted(true)
  }, [params.id, router])

  const analytics = useMemo(() => {
    if (!session || !baseline || !session.currentVector) return null;

    const curr = session.currentVector;
    const base = baseline;

    // BIOMETRIC DIFFERENTIAL ALGORITHM
    let totalScore = 100;

    // 1. WPM Variance
    const wpmVariance = Math.abs(curr.wpm - base.wpm) / (base.wpm || 1);
    if (wpmVariance > 0.4) totalScore -= (wpmVariance * 40);

    // 2. Syntactic Variance (Sentence Length)
    const sentenceVariance = Math.abs(curr.avgSentenceLength - base.avgSentenceLength) / (base.avgSentenceLength || 1);
    if (sentenceVariance > 0.5) totalScore -= (sentenceVariance * 30);

    // 3. Vocab Complexity (Unique word ratio)
    const vocabVariance = Math.abs(curr.vocabComplexity - base.vocabComplexity);
    if (vocabVariance > 2) totalScore -= (vocabVariance * 15);

    // 4. Correction Frequency
    const backspaceDiff = Math.abs(curr.backspaceRate - base.backspaceRate);
    if (backspaceDiff > 5) totalScore -= 10;

    // 5. Environmental Penalties
    totalScore -= (session.tabSwitchCount * 15);
    totalScore -= (session.pasteCount * 20);

    // If gibberish was in baseline but normal text is here, or vice versa
    if ((curr.vocabComplexity < 3 && base.vocabComplexity > 5) || (curr.vocabComplexity > 5 && base.vocabComplexity < 3)) {
      totalScore -= 60;
    }

    const finalMatch = Math.max(0, Math.min(100, Math.round(totalScore)));

    return {
      matchPercentage: finalMatch,
      rhythmVariance: (wpmVariance * 100).toFixed(1),
      syntacticVariance: (sentenceVariance * 100).toFixed(1),
      vocabVariance: vocabVariance.toFixed(1)
    };
  }, [session, baseline]);

  if (!isMounted) return null

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <FileText className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-bold">Results Not Found</h2>
        <Button onClick={() => router.push('/student/history')}>Back to History</Button>
      </div>
    )
  }

  const scorePercentage = session.score !== undefined && session.totalPossiblePoints && session.totalPossiblePoints > 0
    ? Math.round((session.score / session.totalPossiblePoints) * 100)
    : 0

  const hasTextQuestions = assessment?.questions?.some(q => q.type === 'Questionnaire' || q.type === 'Text Area' || q.type === 'Essay') ?? false
  const matchPercentage = analytics?.matchPercentage ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/student/history')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">{session.assessmentTitle}</h2>
            <p className="text-muted-foreground">Biometric Authenticity Audit</p>
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
              Integrity Status
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
              Based on live vector comparison against your unique writing fingerprint.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Captured Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Avg Speed</span>
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

      {hasTextQuestions && (
        <Card className="border-none shadow-xl ring-1 ring-slate-200 bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8 border-r bg-slate-50/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-headline font-bold text-xl">Behavioral Analysis</h3>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The system compared your typing dynamics, vocabulary density, and syntactic patterns against your baseline signature.
                  </p>
                  
                  {!analytics && (
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <p className="text-xs text-yellow-700 font-medium">Insufficient vector data captured for analysis.</p>
                    </div>
                  )}

                  {analytics && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Biometric Vector</span>
                        <span>Variance</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span>Keystroke Rhythm</span>
                        <span className={cn("font-bold", parseFloat(analytics.rhythmVariance) < 30 ? "text-green-600" : "text-destructive")}>
                          {analytics.rhythmVariance}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span>Syntactic Structure</span>
                        <span className={cn("font-bold", parseFloat(analytics.syntacticVariance) < 40 ? "text-green-600" : "text-destructive")}>
                          {analytics.syntacticVariance}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span>Vocab Density</span>
                        <span className={cn("font-bold", parseFloat(analytics.vocabVariance) < 3 ? "text-green-600" : "text-destructive")}>
                          {analytics.vocabVariance} Scale
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-100 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={cn(
                        "stroke-current transition-all duration-1000 ease-out",
                        matchPercentage > 75 ? "text-primary" : 
                        matchPercentage > 40 ? "text-yellow-500" : "text-destructive"
                      )}
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * matchPercentage) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-headline font-bold text-slate-900">{matchPercentage}%</span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Match</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">Human Ownership Probability</p>
                  <p className="text-xs text-muted-foreground">Differential analysis vs writing signature</p>
                </div>
                
                {matchPercentage < 30 && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-destructive font-black text-xs uppercase tracking-tighter text-center flex flex-col items-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Wait... is that really you? 🤨</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-headline font-bold text-slate-900">Submission Review</h3>
          <div className="grid gap-4">
            {assessment?.questions?.map((q, index) => (
              <Card key={q.id} className="border-none ring-1 ring-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Q{index + 1}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase">{q.type}</Badge>
                    </div>
                    <p className="text-slate-800 font-medium leading-snug">{q.text}</p>
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
                Audit Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {session.violations && session.violations.length > 0 ? (
                  session.violations.map((v, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-destructive/[0.02] rounded-lg border border-destructive/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      <span className="text-xs text-slate-600 leading-tight">{v}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic bg-green-50 p-3 rounded-lg border border-green-100">
                    No policy violations recorded.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
