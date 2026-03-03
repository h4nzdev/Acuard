"use client"

import { useEffect, useState } from "react"
import { Users, AlertTriangle, FileCheck, ShieldX, Activity, ArrowUpRight, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSessions, getAssessments } from "@/lib/storage"
import { StudentSession, Assessment } from "@/app/lib/mock-data"
import Link from "next/link"

export default function InstructorDashboard() {
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setSessions(getSessions())
    setAssessments(getAssessments())
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Calculate real metrics from storage
  const flaggedCount = sessions.filter(s => s.status === 'Flagged' || s.status === 'Locked').length
  const lockedCount = sessions.filter(s => s.status === 'Locked').length
  const activeExamsCount = assessments.length
  
  // Unique students count
  const totalStudentsCount = Array.from(new Set(sessions.map(s => s.studentId))).length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Instructor Overview</h2>
          <p className="text-muted-foreground">Monitor integrity performance across all your courses.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/instructor/monitoring">Go to Live Feed</Link>
          </Button>
          <Button asChild className="bg-primary">
            <Link href="/instructor/assessments/new">Create New Activity</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={totalStudentsCount.toString()} icon={Users} trend="Active sessions" />
        <StatCard title="Active Exams" value={activeExamsCount.toString()} icon={Activity} color="text-primary" />
        <StatCard title="Flagged Sessions" value={flaggedCount.toString()} icon={AlertTriangle} color="text-yellow-600" />
        <StatCard title="Locked Sessions" value={lockedCount.toString()} icon={ShieldX} color="text-destructive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">Recent Flagged Activity</CardTitle>
              <CardDescription>Review students requiring integrity verification.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/instructor/monitoring" className="gap-1">View All <ArrowUpRight className="w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'Flagged' || s.status === 'Locked').length > 0 ? (
                sessions.filter(s => s.status === 'Flagged' || s.status === 'Locked').map((session) => (
                  <div key={`${session.studentId}-${session.assessmentId}`} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl hover:bg-white transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${session.status === 'Locked' ? 'bg-destructive' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800">{session.studentName}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Activity: {session.assessmentTitle}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                          session.riskScore === 'Highly Suspicious' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {session.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{session.warningCount} warnings triggered</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 flex flex-col items-center gap-4 border-2 border-dashed rounded-2xl bg-slate-50/50">
                  <div className="p-4 bg-white rounded-full shadow-sm">
                    <Activity className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1 max-w-[250px]">
                    <p className="font-bold text-slate-600">No flags detected</p>
                    <p className="text-xs text-muted-foreground">Suspicious behavior or policy violations will appear here for your review.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Integrity Trends</CardTitle>
            <CardDescription>Aggregate session performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessions.length > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Normal Activity</span>
                    <span>{Math.round((sessions.filter(s => s.riskScore === 'Normal').length / sessions.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500" 
                      style={{ width: `${(sessions.filter(s => s.riskScore === 'Normal').length / sessions.length) * 100}%` }} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>AI Likelihood Detected</span>
                    <span>{Math.round((sessions.filter(s => s.riskScore === 'Suspicious').length / sessions.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-500" 
                      style={{ width: `${(sessions.filter(s => s.riskScore === 'Suspicious').length / sessions.length) * 100}%` }} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Policy Violations</span>
                    <span>{Math.round((sessions.filter(s => s.status === 'Locked').length / sessions.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive transition-all duration-500" 
                      style={{ width: `${(sessions.filter(s => s.status === 'Locked').length / sessions.length) * 100}%` }} 
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-sm text-muted-foreground px-4">Create an assessment and enroll students to start tracking integrity trends.</p>
                <Button variant="outline" size="sm" asChild className="font-bold">
                  <Link href="/instructor/assessments/new">
                    <PlusCircle className="w-4 h-4 mr-2 text-primary" />
                    Create Assessment
                  </Link>
                </Button>
              </div>
            )}

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-primary text-sm">Policy Analytics</h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your current configuration blocks copy-pasting for high-stakes assessments, which significantly discourages potential misconduct.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, color = "text-slate-800" }: any) {
  return (
    <Card className="shadow-md border-none ring-1 ring-slate-200 hover:ring-primary/20 transition-all">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {trend && <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className={`text-4xl font-headline font-bold mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}