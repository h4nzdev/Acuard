"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  History,
  Mail,
  Calendar,
  User,
  ExternalLink,
  ShieldAlert,
  Fingerprint
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getStudents, getSessions } from "@/lib/storage"
import { Student, StudentSession } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function StudentProfile() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const students = getStudents()
    const allSessions = getSessions()
    const found = students.find(s => s.id === params.id)
    setStudent(found || null)
    setSessions(allSessions.filter(s => s.studentId === params.id))
    setIsMounted(true)
  }, [params.id])

  if (!isMounted) return null

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <User className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-bold">Student Not Found</h2>
        <Button onClick={() => router.back()}>Back to Students</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-headline font-bold text-slate-900">{student.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {student.email}</span>
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-tighter text-[10px]">ID: {student.id}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            Request Baseline Reset
          </Button>
          <Button className="bg-primary">
            Send Message
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardContent className="pt-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Honesty Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-headline font-bold text-primary">{student.honestyScore}%</span>
            </div>
            <Progress value={student.honestyScore} className="h-2 mt-4" />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardContent className="pt-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Flagged Sessions</p>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-4xl font-headline font-bold", student.flaggedSessions > 0 ? "text-destructive" : "text-slate-800")}>
                {student.flaggedSessions}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">Out of {sessions.length} total attempts</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardContent className="pt-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Baseline Status</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-xl font-bold text-slate-800">Verified</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Established {student.enrolledDate}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200 bg-accent/[0.03]">
          <CardContent className="pt-6">
            <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Integrity Status</p>
            <Badge className={student.honestyScore > 90 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
              {student.honestyScore > 90 ? "High Integrity" : "Requires Review"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Assessment History
                </CardTitle>
                <CardDescription>Review performance and integrity logs for each activity.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl hover:bg-white transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-2 h-10 rounded-full",
                          session.status === 'Locked' ? 'bg-destructive' : 
                          session.status === 'Flagged' ? 'bg-yellow-500' : 'bg-green-500'
                        )} />
                        <div>
                          <p className="font-bold text-slate-800">{session.assessmentTitle}</p>
                          <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest">
                            {session.riskScore}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{session.warningCount} warnings</p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/instructor/monitoring/${student.id}`}>
                            <ExternalLink className="w-4 h-4 text-primary" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed rounded-2xl">
                  <p className="text-muted-foreground italic">No assessment sessions recorded for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-primary" />
                Behavioral Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Baseline Matching</span>
                  <span>96%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '96%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Typing Consistency</span>
                  <span>88%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-primary text-xs uppercase tracking-tight">AI Audit Note</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Student's typing dynamics are highly consistent with the established baseline. Minimal use of peripheral focus loss detected across all high-stakes activities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
