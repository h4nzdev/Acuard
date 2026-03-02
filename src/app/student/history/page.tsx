
"use client"

import { useEffect, useState } from "react"
import { 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Search, 
  ChevronRight,
  FileText,
  Trophy
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { getSessions } from "@/lib/storage"
import { StudentSession } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function StudentHistory() {
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      const allSessions = getSessions()
      setSessions(allSessions.filter(s => s.studentId === user.id))
    }
    setIsMounted(true)
  }, [])

  const filteredSessions = sessions.filter(s => 
    s.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Assessment History</h2>
          <p className="text-muted-foreground">Review your past submissions and integrity performance logs.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Attempts" 
          value={sessions.length.toString()} 
          icon={FileText} 
        />
        <StatCard 
          title="Verified Clean" 
          value={sessions.filter(s => s.riskScore === 'Normal').length.toString()} 
          icon={ShieldAlert} 
          color="text-green-600"
        />
        <StatCard 
          title="Flagged Issues" 
          value={sessions.filter(s => s.riskScore !== 'Normal').length.toString()} 
          icon={AlertTriangle} 
          color="text-yellow-600"
        />
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by assessment title..." 
            className="pl-10 h-11" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-xl border-none ring-1 ring-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold py-5 text-xs uppercase tracking-wider">Assessment</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Score</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Integrity Risk</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Warnings</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-5">
                    <Link href={`/student/history/${session.assessmentId}`} className="font-bold text-slate-800 hover:text-primary transition-colors">
                      {session.assessmentTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "font-bold text-[10px] uppercase tracking-wider",
                      session.status === 'Completed' ? "bg-green-100 text-green-700 border-green-200" :
                      session.status === 'Locked' ? "bg-destructive/10 text-destructive border-destructive/20" :
                      "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {session.score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-accent" />
                        <span className="font-bold text-slate-800">{session.score} / {session.totalPossiblePoints}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        session.riskScore === 'Normal' ? "bg-green-500" :
                        session.riskScore === 'Suspicious' ? "bg-yellow-500" : "bg-destructive"
                      )} />
                      <span className="text-xs font-bold text-slate-600">{session.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-sm font-bold",
                      session.warningCount > 0 ? "text-destructive" : "text-slate-600"
                    )}>
                      {session.warningCount} / 3
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary" asChild>
                      <Link href={`/student/history/${session.assessmentId}`}>
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <History className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-muted-foreground italic text-sm">No assessment history found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="p-6 bg-accent rounded-2xl text-accent-foreground shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-headline font-bold">Integrity Reputation</h3>
          <p className="text-sm opacity-90 leading-relaxed max-w-xl">
            Your consistent "Normal" risk scores help maintain a high honesty rating, which is visible to instructors and credentialing bodies.
          </p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color = "text-slate-800" }: any) {
  return (
    <Card className="shadow-md border-none ring-1 ring-slate-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={cn("w-4 h-4", color)} />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
        </div>
        <p className={cn("text-3xl font-headline font-bold", color)}>{value}</p>
      </CardContent>
    </Card>
  )
}
