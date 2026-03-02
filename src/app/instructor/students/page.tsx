"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle,
  Trash2,
  Mail,
  Calendar,
  Eye,
  Lock
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getStudents, saveStudent, deleteStudent } from "@/lib/storage"
import { Student } from "@/app/lib/mock-data"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  
  // New student form state
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setStudents(getStudents())
    setIsMounted(true)
  }, [])

  const handleAddStudent = () => {
    if (!newName || !newEmail || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields including the password.",
        variant: "destructive"
      })
      return
    }

    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: newName,
      email: newEmail,
      password: newPassword,
      enrolledDate: new Date().toLocaleDateString(),
      honestyScore: 100, // Initial score
      totalAssessments: 0,
      flaggedSessions: 0,
    }

    saveStudent(newStudent)
    setStudents(getStudents())
    setIsDialogOpen(false)
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    toast({
      title: "Student Added",
      description: `${newName} has been enrolled successfully.`
    })
  }

  const handleDelete = (id: string) => {
    deleteStudent(id)
    setStudents(getStudents())
    toast({
      title: "Student Removed",
      description: "The student has been removed from the roster.",
    })
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Student Directory</h2>
          <p className="text-muted-foreground">Manage student enrollment and monitor integrity profiles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90 shadow-md">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Add New Student</DialogTitle>
              <DialogDescription>Enter the details below to enroll a student into the platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g. john@university.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Login Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Create a secure password" 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-11" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow border-none ring-1 ring-slate-200">
              <CardContent className="p-0">
                <div className="flex items-center p-5 gap-6">
                  <Link 
                    href={`/instructor/students/${student.id}`}
                    className="flex items-center gap-5 flex-1 group"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <UserCheck className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {student.email}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Enrolled {student.enrolledDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 pr-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Honesty Score</p>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={cn("w-4 h-4", student.honestyScore > 90 ? "text-green-500" : "text-yellow-500")} />
                          <span className="text-xl font-headline font-bold text-slate-900">{student.honestyScore}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Flags</p>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={cn("w-4 h-4", student.flaggedSessions > 0 ? "text-destructive" : "text-slate-300")} />
                          <span className="text-xl font-headline font-bold text-slate-900">{student.flaggedSessions}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/students/${student.id}`} className="gap-2">
                        <Eye className="w-4 h-4" /> View Profile
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Remove Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-6">
            <Users className="w-16 h-16 text-slate-200" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No students enrolled</h3>
              <p className="text-muted-foreground text-sm">Enroll your first student to begin monitoring their academic integrity.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
