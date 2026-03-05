"use client"

import { useEffect, useState } from "react"
import { Trophy, Flame, ShieldCheck, User, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export default function HonestyLeaderboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      setCurrentUserId(JSON.parse(userStr).id)
    }

    const allStudents = getStudents()
    // Sort by honesty score first, then streak
    const sorted = [...allStudents].sort((a, b) => {
      if (b.honestyScore !== a.honestyScore) {
        return b.honestyScore - a.honestyScore
      }
      return (b.honestStreak || 0) - (a.honestStreak || 0)
    })
    setStudents(sorted)
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const topThree = students.slice(0, 3)
  const remaining = students.slice(3)
  
  // Calculate real metrics
  const currentUserRank = students.findIndex(s => s.id === currentUserId)
  const currentUser = students.find(s => s.id === currentUserId)
  const percentile = students.length > 0 && currentUserRank >= 0
    ? Math.round(((students.length - currentUserRank) / students.length) * 100) 
    : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">Honesty Leaderboard</h2>
        <p className="text-muted-foreground">Recognizing students with the highest standards of academic integrity.</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {topThree.map((student, index) => (
          <Card key={student.id} className={cn(
            "relative overflow-hidden border-none shadow-xl ring-1 ring-slate-200 transition-all hover:scale-[1.02]",
            index === 0 ? "md:-translate-y-4 ring-2 ring-yellow-400/50 bg-yellow-50/10" : ""
          )}>
            {index === 0 && (
              <div className="absolute top-0 right-0 p-2">
                <Trophy className="w-12 h-12 text-yellow-400 rotate-12 opacity-20" />
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center relative",
                  index === 0 ? "bg-yellow-100 ring-4 ring-yellow-400" :
                  index === 1 ? "bg-slate-100 ring-4 ring-slate-300" :
                  "bg-orange-100 ring-4 ring-orange-300"
                )}>
                  <User className={cn(
                    "w-10 h-10",
                    index === 0 ? "text-yellow-600" :
                    index === 1 ? "text-slate-600" :
                    "text-orange-600"
                  )} />
                  <div className={cn(
                    "absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-lg",
                    index === 0 ? "bg-yellow-400" :
                    index === 1 ? "bg-slate-400" :
                    "bg-orange-400"
                  )}>
                    {index + 1}
                  </div>
                </div>
              </div>
              <CardTitle className="font-headline text-xl">{student.name}</CardTitle>
              <CardDescription className="text-xs uppercase font-black tracking-widest">
                Rank {index + 1} • {student.id === currentUserId ? "You" : "Student"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Honesty</p>
                  <p className="text-2xl font-bold text-primary">{student.honestyScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Streak</p>
                  <p className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-orange-600" />
                    {student.honestStreak || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <Card className="shadow-lg border-none ring-1 ring-slate-200 overflow-hidden mt-8">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold py-5 text-xs uppercase tracking-wider pl-8">Rank</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Student</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Honesty Score</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Honest Streak</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <TableRow key={student.id} className={cn(
                  "hover:bg-slate-50 transition-colors",
                  student.id === currentUserId ? "bg-primary/[0.03] ring-1 ring-primary/10 inset-0" : ""
                )}>
                  <TableCell className="py-5 font-bold text-slate-400 pl-8">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {student.name}
                          {student.id === currentUserId && <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black uppercase">You</span>}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {student.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck className={cn("w-4 h-4", student.honestyScore > 90 ? "text-green-500" : "text-yellow-500")} />
                      <span className="font-bold text-slate-900">{student.honestyScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Flame className={cn("w-4 h-4", (student.honestStreak || 0) > 0 ? "text-orange-500 fill-orange-500" : "text-slate-200")} />
                      <span className="font-bold text-slate-700">{student.honestStreak || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {(student.honestStreak || 0) > 2 ? <ArrowUp className="w-4 h-4 text-green-500 mx-auto" /> : (student.flaggedSessions > 0 ? <ArrowDown className="w-4 h-4 text-destructive mx-auto" /> : <Minus className="w-4 h-4 text-slate-300 mx-auto" />)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  No rankings available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-headline font-bold">Your Standing</h3>
          <p className="text-slate-400 text-sm max-w-md">
            Maintain high standards of integrity to climb the leaderboard. Consistent clean assessments boost your Honesty Score and Streak.
          </p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Honesty Score</p>
            <p className="text-4xl font-headline font-bold text-primary">
              {currentUser?.honestyScore || '--'}%
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Same as dashboard
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Rank</p>
            <p className="text-4xl font-headline font-bold text-accent">
              #{currentUserRank >= 0 ? currentUserRank + 1 : '--'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Honesty Percentile</p>
            <p className="text-4xl font-headline font-bold text-green-400">
              {percentile > 0 ? `${percentile}%` : '--'}
            </p>
            {percentile > 0 && (
              <p className="text-[10px] text-slate-500 mt-1">
                Top {100 - percentile}% of students
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
