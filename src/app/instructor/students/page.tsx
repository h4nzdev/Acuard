"use client"

import { useEffect, useState, useRef } from "react"
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
  Lock,
  Upload,
  Image as ImageIcon,
  X,
  FileCheck,
  User as UserIcon
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { getStudents, saveStudent, deleteStudent } from "@/lib/storage"
import { Student } from "@/app/lib/mock-data"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  
  // New student form state
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [idPhoto, setIdPhoto] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStudents(getStudents())
    setIsMounted(true)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddStudent = () => {
    if (!newName || !newEmail || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all identity fields including the password.",
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
      honestyScore: 100, 
      totalAssessments: 0,
      flaggedSessions: 0,
      honestStreak: 0,
      idPhotoUrl: idPhoto || undefined
    }

    saveStudent(newStudent)
    setStudents(getStudents())
    setIsDialogOpen(false)
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setIdPhoto(null)
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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Add New Student</DialogTitle>
              <DialogDescription>Configure details and verification for the new student.</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="identity" className="py-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="identity" className="gap-2">
                  <UserIcon className="w-3.5 h-3.5" /> Identity
                </TabsTrigger>
                <TabsTrigger value="verification" className="gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-4 pt-4 animate-in fade-in slide-in-from-left-2">
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
              </TabsContent>

              <TabsContent value="verification" className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-2">
                <Label>Student ID Photo</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setIdPhoto(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl h-56 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group",
                    idPhoto ? "border-green-200 bg-green-50/30" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  )}
                >
                  {idPhoto ? (
                    <div className="absolute inset-0 p-2">
                      <div className="relative w-full h-full rounded-lg overflow-hidden border shadow-sm bg-white">
                        <img 
                          src={idPhoto} 
                          alt="Student ID" 
                          className="w-full h-full object-contain" 
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIdPhoto(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="absolute bottom-0 inset-x-0 bg-green-600 text-white text-[10px] font-bold uppercase py-1 text-center flex items-center justify-center gap-1">
                          <FileCheck className="w-3 h-3" /> ID Ready
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-slate-100 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                      </div>
                      <div className="text-center mt-3 px-4">
                        <p className="text-sm font-bold text-slate-700">Upload Student ID</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Drag and drop or click to upload<br />(JPG, PNG)</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-muted-foreground leading-tight italic text-center">
                    The ID photo will be used to verify student identity during monitored assessments.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0 sm:flex-col mt-2">
              <Button onClick={handleAddStudent} className="w-full bg-primary hover:bg-primary/90 font-bold shadow-md h-11">
                Enroll Student
              </Button>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full mt-2">
                Cancel
              </Button>
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
                    <div className="relative">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors overflow-hidden border">
                        {student.idPhotoUrl ? (
                          <img src={student.idPhotoUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCheck className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      {student.idPhotoUrl && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full p-0.5 shadow-sm">
                          <FileCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
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
