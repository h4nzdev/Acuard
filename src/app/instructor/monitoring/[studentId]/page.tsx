"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  ShieldAlert, 
  Activity, 
  MousePointer2, 
  Copy, 
  Clock, 
  AlertTriangle,
  User,
  FileText,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSessions } from "@/lib/storage"
import { StudentSession } from "@/app/lib/mock-data"

export default function StudentSessionAnalytics() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<StudentSession | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const sessions = getSessions()
    const found = sessions.find(s => s.studentId === params.studentId)
    setSession(found || null)
    setIsMounted(true)
  }, [params.studentId])

  if (!isMounted) return null

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-slate-100 rounded-full">
          <User className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold">Session Not Found</h2>
        <p className="text-muted-foreground">The requested session analytics are unavailable.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-headline font-bold">{session.studentName}</h2>
              <Badge variant={session.status === 'Locked' ? 'destructive' : 'secondary'} className="font-bold">
                {session.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Session Analytics for {session.assessmentTitle}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            Force Lock Session
          </Button>
          <Button className="bg-primary">
            Contact Student
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Integrity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-headline font-bold ${
                session.riskScore === 'Highly Suspicious' ? 'text-destructive' : 
                session.riskScore === 'Suspicious' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {session.riskScore}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on behavioral biometrics</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Warnings Triggered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold">{session.warningCount} / 3</div>
            <Progress value={(session.warningCount / 3) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Auto-lock at 3 warnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Typing Cadence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold">{session.typingSpeed} <span className="text-sm">WPM</span></div>
            <p className="text-xs text-muted-foreground mt-2">Comparing against 42 WPM baseline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>Behavioral Patterns</CardTitle>
            </div>
            <CardDescription>Detailed metrics captured during the active session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Copy className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Paste Frequency</span>
                  </div>
                  <span className="text-lg font-bold">{session.pasteCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MousePointer2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Tab Switches</span>
                  </div>
                  <span className="text-lg font-bold">{session.tabSwitchCount}</span>
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Analysis Summary</h4>
                <p className="text-sm leading-relaxed">
                  {session.riskScore === 'Normal' 
                    ? "The student's behavior aligns with established writing baselines. No significant deviations in typing cadence or peripheral activity detected."
                    : "Multiple behavioral red flags detected. Typing speed fluctuates significantly, and frequent tab switching suggests external research during a restricted module."}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <h4 className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Incident Timeline
              </h4>
              <div className="space-y-4">
                {session.violations && session.violations.length > 0 ? (
                  session.violations.map((v, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{v}</p>
                        <p className="text-xs text-muted-foreground">Logged at {session.lastActive}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific violations logged yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 bg-primary/[0.02]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Policy Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-xl border space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase font-bold">Paste Policy</span>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 uppercase text-[10px]">Strictly Blocked</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase font-bold">Tab Monitoring</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 uppercase text-[10px]">Active</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase font-bold">Biometric Match</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase text-[10px]">Required</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This activity is running under **High Integrity** mode. Acuard automatically flags any browser focus loss or non-human typing speed.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 bg-accent rounded-2xl text-accent-foreground shadow-xl">
            <h4 className="font-headline font-bold text-lg mb-2">Proctor Advice</h4>
            <p className="text-sm opacity-90 leading-relaxed">
              If risk score remains **Highly Suspicious**, we recommend reviewing the student's keystroke playback for specific copy-paste anomalies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
