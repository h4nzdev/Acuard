"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2,
  Users,
  Trophy
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { getAssessments, getStudents, getSessions } from "@/lib/storage"
import { Assessment, Student, StudentSession } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

export default function AssessmentStudentProgress() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const assessments = getAssessments()
    const foundAssessment = assessments.find(a => a.id === params.id)
    
    if (foundAssessment) {
      setAssessment(foundAssessment)
      setStudents(getStudents())
      setSessions(getSessions().filter(s => s.assessmentId === params.id))
    }
    
    setIsMounted(true)
  }, [params.id])

  if (!isMounted) return null

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading progress data...</p>
      </div>
    )
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedCount = students.filter(student => 
    sessions.some(s => s.studentId === student.id && s.status === 'Completed')
  ).length

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">{assessment.title}</h2>
            <p className="text-muted-foreground">Student Submission Status & Progress</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Card className="flex items-center gap-3 px-4 py-2 border-none shadow-sm ring-1 ring-slate-200">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Completed</p>
              <p className="text-xl font-bold text-slate-900">{completedCount} / {students.length}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
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
              <TableHead className="font-bold py-5 text-xs uppercase tracking-wider pl-8">Student Name</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">ID</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Score</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const session = sessions.find(s => s.studentId === student.id)
                const isCompleted = session?.status === 'Completed'
                
                return (
                  <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-5 font-bold text-slate-800 pl-8">
                      {student.name}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {student.id}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Done</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Pending</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isCompleted && session.score !== undefined ? (
                        <div className="flex items-center justify-center gap-1.5 font-bold text-primary">
                          <Trophy className="w-3.5 h-3.5" />
                          {session.score} / {session.totalPossiblePoints}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      {isCompleted ? (
                        <Button variant="ghost" size="sm" asChild className="font-bold text-primary">
                          <Link href={`/instructor/monitoring/${student.id}`}>
                            View Analytics
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Data</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  {searchQuery ? `No results found for "${searchQuery}"` : "No student records found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
