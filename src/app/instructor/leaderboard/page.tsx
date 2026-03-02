"use client"

import { useEffect, useState } from "react"
import { Trophy, Flame, ShieldCheck, User, Users, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { getStudents } from "@/lib/storage"
import { Student } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

export default function InstructorLeaderboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const allStudents = getStudents()
    const sorted = [...allStudents].sort((a, b) => {
      if (b.honestyScore !== a.honestyScore) {
        return b.honestyScore - a.honestyScore
      }
      return (b.honestStreak || 0) - (a.honestStreak || 0)
    })
    setStudents(sorted)
    setIsMounted(true)
  }, [])

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Institutional Honesty Ranking</h2>
          <p className="text-muted-foreground">Monitoring the integrity performance of the entire student body.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Rankings
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={students.length.toString()} icon={Users} />
        <StatCard title="Average Honesty" value={`${Math.round(students.reduce((acc, s) => acc + s.honestyScore, 0) / (students.length || 1))}%`} icon={ShieldCheck} color="text-primary" />
        <StatCard title="Top Streak" value={`${Math.max(...students.map(s => s.honestStreak || 0), 0)}`} icon={Flame} color="text-orange-600" />
        <StatCard title="Integrity Level" value="High" icon={Trophy} color="text-accent" />
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students by name or ID..." 
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
              <TableHead className="font-bold py-5 text-xs uppercase tracking-wider pl-8">Rank</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Student</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Honesty Score</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Honest Streak</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Total Exams</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-8">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-5 font-bold text-slate-400 pl-8">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {student.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "font-bold",
                      student.honestyScore > 90 ? "text-green-600" :
                      student.honestyScore > 70 ? "text-yellow-600" :
                      "text-destructive"
                    )}>
                      {student.honestyScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-orange-600">
                    <div className="flex items-center justify-center gap-1.5">
                      <Flame className="w-4 h-4 fill-orange-600" />
                      {student.honestStreak || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 font-medium">
                    {student.totalAssessments || 0}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Badge variant="outline" className={cn(
                      "font-bold text-[10px] uppercase tracking-widest",
                      student.honestyScore > 90 ? "bg-green-50 text-green-700 border-green-200" :
                      student.honestyScore > 70 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-destructive/5 text-destructive border-destructive/10"
                    )}>
                      {student.honestyScore > 90 ? "Trusted" : student.honestyScore > 70 ? "Fair" : "At Risk"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                  {searchQuery ? `No results found for "${searchQuery}"` : "No student data available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
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
