import { Users, AlertTriangle, FileCheck, ShieldX, Activity, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_SESSIONS } from "@/lib/mock-data"
import Link from "next/link"

export default function InstructorDashboard() {
  const flaggedCount = MOCK_SESSIONS.filter(s => s.status === 'Flagged' || s.status === 'Locked').length

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
        <StatCard title="Total Students" value="124" icon={Users} trend="+4% this week" />
        <StatCard title="Active Exams" value="3" icon={Activity} color="text-primary" />
        <StatCard title="Flagged Sessions" value={flaggedCount.toString()} icon={AlertTriangle} color="text-yellow-600" />
        <StatCard title="Locked Sessions" value="1" icon={ShieldX} color="text-destructive" />
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
              {MOCK_SESSIONS.filter(s => s.status !== 'In Progress').map((session) => (
                <div key={session.studentId} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${session.status === 'Locked' ? 'bg-destructive' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-bold text-slate-800">{session.studentName}</p>
                      <p className="text-xs text-muted-foreground">Modern European History Final</p>
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
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Integrity Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Normal Activity</span>
                <span>92%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '92%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>AI Likelihood Detected</span>
                <span>5.2%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '5%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Copy-Paste Violations</span>
                <span>2.8%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-destructive" style={{ width: '3%' }} />
              </div>
            </div>

            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 mt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileCheck className="w-5 h-5 text-accent" />
                <h4 className="font-bold text-accent text-sm">Policy Effectiveness</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assessments with "Not Allowed" paste policy show 40% fewer flags than monitored sessions.
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
          {trend && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-headline font-bold mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
