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

  const flaggedCount = sessions.filter(s => s.status === 'Flagged' || s.status === 'Locked').length
  const lockedCount = sessions.filter(s => s.status === 'Locked').length
  const activeExamsCount = assessments.length

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Instructor Overview</h2>
          <p className="text-muted-foreground">Monitor integrity performance across all your courses.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/instructor/monitoring">Go to Live Feed</Link>
          </Button>
          <Button asChild>
            <Link href="/instructor/assessments/new">Create New Activity</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="0" icon={Users} trend="No data" />
        <StatCard title="Active Exams" value={activeExamsCount.toString()} icon={Activity} color="text-primary" />
        <StatCard title="Flagged Sessions" value={flaggedCount.toString()} icon={AlertTriangle} color="text-yellow-600" />
        <StatCard title="Locked Sessions" value={lockedCount.toString()} icon={ShieldX} color="text-destructive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg">
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
              {sessions.filter(s => s.status !== 'In Progress').length > 0 ? (
                sessions.filter(s => s.status !== 'In Progress').map((session) => (
                  <div key={session.studentId} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl hover:bg-white transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${session.status === 'Locked' ? 'bg-destructive' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800">{session.studentName}</p>
                        <p className="text-xs text-muted-foreground">Activity ID: {session.assessmentId}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          session.riskScore === 'Highly Suspicious' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {session.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{session.warningCount} warnings triggered</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed rounded-xl bg-slate-50/50">
                  <Activity className="w-12 h-12 text-slate-300" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-600">No activity detected yet</p>
                    <p className="text-xs text-muted-foreground">Flagged sessions will appear here once students begin assessments.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Integrity Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeExamsCount > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Normal Activity</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>AI Likelihood Detected</span>
                    <span>0%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '0%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Copy-Paste Violations</span>
                    <span>0%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-destructive" style={{ width: '0%' }} />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-muted-foreground">Create an assessment to start tracking integrity trends.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/instructor/assessments/new">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create First Assessment
                  </Link>
                </Button>
              </div>
            )}

            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 mt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileCheck className="w-5 h-5 text-accent" />
                <h4 className="font-bold text-accent text-sm">Policy effectiveness</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Define strict "Not Allowed" paste policies to significantly reduce potential integrity risks.
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
    <Card className="shadow-md border-none ring-1 ring-slate-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {trend && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-headline font-bold mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
