
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Eye, 
  ShieldAlert, 
  MoreVertical, 
  RefreshCw, 
  Filter, 
  Search, 
  Inbox,
  Trash2,
  ExternalLink,
  Unlock
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getSessions, deleteSession, updateSession } from "@/lib/storage"
import { StudentSession } from "@/app/lib/mock-data"
import { toast } from "@/hooks/use-toast"

export default function LiveMonitoring() {
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setSessions(getSessions())
    setIsMounted(true)
  }, [])

  const refreshFeed = () => {
    setSessions(getSessions())
  }

  const handleDelete = (studentId: string) => {
    deleteSession(studentId)
    setSessions(getSessions())
    toast({
      title: "Session Removed",
      description: "The student session has been cleared from the live feed.",
    })
  }

  const handleUnlock = (session: StudentSession) => {
    const updated: StudentSession = {
      ...session,
      status: 'In Progress',
      warningCount: 0,
      riskScore: 'Normal',
      lastActive: new Date().toLocaleTimeString()
    }
    updateSession(updated)
    setSessions(getSessions())
    toast({
      title: "Session Unlocked",
      description: `Access for ${session.studentName} has been restored.`,
    })
  }

  const filteredSessions = sessions.filter(s => 
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Live Monitoring Feed</h2>
          <p className="text-muted-foreground">Real-time oversight of current assessments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={refreshFeed}>
            <RefreshCw className="w-4 h-4" />
            Refresh Feed
          </Button>
          <Button className="gap-2 bg-primary">
            <ShieldAlert className="w-4 h-4" />
            Active Incident Mode
          </Button>
        </div>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students or assessments..." 
            className="pl-10 h-11" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="gap-2 h-11 border">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {filteredSessions.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold py-5 text-xs uppercase tracking-wider">Student</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Assessment</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Risk Score</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Warnings</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={`${session.studentId}-${session.assessmentId}`} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-5">
                    <Link href={`/instructor/monitoring/${session.studentId}`} className="group">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{session.studentName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">ID: {session.studentId}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-600">{session.assessmentTitle}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge score={session.riskScore} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${session.warningCount >= 2 ? 'text-destructive' : 'text-slate-600'}`}>
                        {session.warningCount}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= session.warningCount ? 'bg-destructive' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {session.status === 'Locked' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUnlock(session)}
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 font-bold gap-1.5"
                          title="Unlock Session"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Unlock
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="icon" title="View Analytics" asChild>
                        <Link href={`/instructor/monitoring/${session.studentId}`}>
                          <Eye className="w-4 h-4 text-primary" />
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/instructor/monitoring/${session.studentId}`} className="gap-2 cursor-pointer">
                              <ExternalLink className="w-4 h-4" /> View Analytics
                            </Link>
                          </DropdownMenuItem>
                          
                          {session.status === 'Locked' && (
                            <DropdownMenuItem 
                              className="gap-2 text-green-600 focus:text-green-700 cursor-pointer"
                              onClick={() => handleUnlock(session)}
                            >
                              <Unlock className="w-4 h-4" /> Unlock Session
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => handleDelete(session.studentId)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete Session
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="p-4 bg-slate-50 rounded-full">
              <Inbox className="w-12 h-12 text-slate-300" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-lg font-bold text-slate-900">No active sessions</h3>
              <p className="text-sm text-muted-foreground">When students start their assessments, they will appear in this real-time feed.</p>
            </div>
            <Button variant="outline" onClick={refreshFeed}>
              Check for new sessions
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'In Progress': 'bg-primary/10 text-primary border-primary/20',
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Flagged': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Locked': 'bg-destructive/10 text-destructive border-destructive/20'
  }
  return (
    <Badge variant="outline" className={`${styles[status]} font-bold text-[10px] uppercase tracking-wider`}>
      {status}
    </Badge>
  )
}

function RiskBadge({ score }: { score: string }) {
  const styles: any = {
    'Normal': 'bg-green-500',
    'Suspicious': 'bg-yellow-500',
    'Highly Suspicious': 'bg-destructive'
  }
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${styles[score]}`} />
      <span className="text-xs font-bold text-slate-600">{score}</span>
    </div>
  )
}
