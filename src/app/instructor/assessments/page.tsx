"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Clock, 
  Shield, 
  ExternalLink,
  Search,
  BookOpen,
  Edit,
  Users
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
import { getAssessments, deleteAssessment } from "@/lib/storage"
import { Assessment } from "@/app/lib/mock-data"
import { toast } from "@/hooks/use-toast"

export default function InstructorAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setAssessments(getAssessments())
    setIsMounted(true)
  }, [])

  const handleDelete = (id: string) => {
    deleteAssessment(id)
    setAssessments(getAssessments())
    toast({
      title: "Assessment Deleted",
      description: "The assessment has been removed from the system.",
    })
  }

  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Assessment Management</h2>
          <p className="text-muted-foreground">Create and manage your course modules and integrity policies.</p>
        </div>
        <Button asChild className="gap-2 bg-accent hover:bg-accent/90 shadow-md">
          <Link href="/instructor/assessments/new">
            <Plus className="w-4 h-4" />
            Create Assessment
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assessments..." 
            className="pl-10 h-11" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredAssessments.length > 0 ? (
          filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow duration-300 overflow-hidden border-none ring-1 ring-slate-200">
              <CardContent className="p-0">
                <div className="flex items-center p-6 gap-6">
                  <Link 
                    href={`/instructor/assessments/${assessment.id}`}
                    className="flex items-center gap-6 flex-1 group"
                  >
                    <div className="p-4 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-headline font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {assessment.title}
                        </h3>
                        <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] ${
                          assessment.policy === 'Not Allowed' ? 'border-destructive text-destructive' :
                          assessment.policy === 'Allowed but Monitored' ? 'border-primary text-primary' :
                          'border-green-600 text-green-600'
                        }`}>
                          {assessment.policy}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
                        {assessment.description || "No description provided."}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3 h-3" />
                          {assessment.durationMinutes} Minutes
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Shield className="w-3 h-3" />
                          {assessment.questions?.length || 0} Questions
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="font-bold">
                      <Link href={`/instructor/assessments/${assessment.id}/edit`} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/assessments/${assessment.id}`} className="gap-2">
                            <ExternalLink className="w-4 h-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/assessments/${assessment.id}/students`} className="gap-2">
                            <Users className="w-4 h-4" /> View Student Progress
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={() => handleDelete(assessment.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete Assessment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-6 shadow-sm">
            <div className="p-8 bg-slate-50 rounded-full">
              <BookOpen className="w-16 h-16 text-slate-200" />
            </div>
            <div className="max-w-sm space-y-2">
              <h3 className="text-2xl font-headline font-bold text-slate-900">No assessment yet</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different search term.` 
                  : "You haven't created any modules yet. Get started by defining your first assessment and integrity policy."}
              </p>
            </div>
            {!searchQuery && (
              <Button asChild className="gap-2 px-8 py-6 h-auto text-lg" size="lg">
                <Link href="/instructor/assessments/new">
                  <Plus className="w-5 h-5" />
                  Create First Assessment
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
