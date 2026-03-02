"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Clock, 
  Edit, 
  ChevronRight,
  HelpCircle,
  Copy,
  Type,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAssessments } from "@/lib/storage"
import { Assessment } from "@/app/lib/mock-data"
import Link from "next/link"

export default function AssessmentDetails() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const assessments = getAssessments()
    const found = assessments.find(a => a.id === params.id)
    setAssessment(found || null)
    setIsMounted(true)
  }, [params.id])

  if (!isMounted) return null

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-slate-100 rounded-full">
          <FileText className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold">Assessment Not Found</h2>
        <p className="text-muted-foreground">The module you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/instructor/assessments')}>Back to Assessments</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">{assessment.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className={`font-bold uppercase text-[10px] ${
                assessment.policy === 'Not Allowed' ? 'border-destructive text-destructive' :
                assessment.policy === 'Allowed but Monitored' ? 'border-primary text-primary' :
                'border-green-600 text-green-600'
              }`}>
                {assessment.policy} Policy
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {assessment.durationMinutes} Minutes
              </div>
            </div>
          </div>
        </div>
        <Button asChild className="gap-2 bg-primary">
          <Link href={`/instructor/assessments/${assessment.id}/edit`}>
            <Edit className="w-4 h-4" />
            Edit Assessment
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Assessment Overview</CardTitle>
            <CardDescription>Instructions and student-facing guidelines.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
              {assessment.description || "No specific instructions provided for this assessment."}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200 bg-primary/[0.02]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Policy Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground">Copy-Paste</span>
                <span className={assessment.policy === 'Not Allowed' ? 'text-destructive font-bold' : 'text-slate-900'}>
                  {assessment.policy}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground">AI Style Scoring</span>
                <span className="text-green-600 font-bold">Always Active</span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium pb-2">
                <span className="text-muted-foreground">Tab Monitoring</span>
                <span className="text-green-600 font-bold">Always Active</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-accent" />
              <h4 className="text-xs font-bold text-accent uppercase">Proctor Note</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This assessment uses behavioral fingerprinting. Students must complete their writing baseline before attempting this module.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            Questionnaire
          </h3>
          <Badge variant="secondary" className="px-3 py-1 font-bold">
            {assessment.questions?.length || 0} Items
          </Badge>
        </div>

        <div className="grid gap-4">
          {assessment.questions && assessment.questions.length > 0 ? (
            assessment.questions.map((q, index) => (
              <Card key={q.id} className="hover:ring-2 hover:ring-primary/20 transition-all border-none ring-1 ring-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-primary/40 uppercase tracking-widest">Q{index + 1}</span>
                        <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold">
                          {q.points} Points
                        </Badge>
                      </div>
                      <p className="text-slate-800 font-medium text-lg leading-snug">{q.text}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                        {q.type === 'Text Area' ? <Type className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                        {q.type}
                      </div>
                      {q.allowCopyPaste ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[9px] font-bold uppercase tracking-tighter">
                          <Copy className="w-3 h-3 mr-1" /> Paste Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/10 text-[9px] font-bold uppercase tracking-tighter">
                          <Shield className="w-3 h-3 mr-1" /> Paste Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground italic">No questions have been added to this assessment yet.</p>
              <Button variant="link" asChild className="mt-2">
                <Link href={`/instructor/assessments/${assessment.id}/edit?tab=questions`}>
                  Add your first question
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
