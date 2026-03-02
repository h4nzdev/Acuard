
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Clock, ChevronRight, AlertCircle, ShieldCheck, PenTool, BrainCircuit, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getAssessments, getSessions, getStudentBaseline, getGlobalSettings, saveStudentBaseline } from "@/lib/storage"
import { Assessment, StudentSession } from "@/app/lib/mock-data"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function StudentAssessments() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [hasBaseline, setHasBaseline] = useState<boolean>(true)
  const [requireBaseline, setRequireBaseline] = useState<boolean>(true)
  
  // Baseline Tool State (Embedded)
  const [baselineText, setBaselineText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isSubmittingBaseline, setIsSubmittingBaseline] = useState(false)
  const [wpm, setWpm] = useState(0)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setStudentId(user.id)
      
      const baseline = getStudentBaseline(user.id)
      setHasBaseline(!!baseline)

      const settings = getGlobalSettings()
      setRequireBaseline(settings.requireBaseline)
    } else {
      router.push('/login')
    }
    
    setAssessments(getAssessments())
    setSessions(getSessions())
    setIsMounted(true)
  }, [router])

  useEffect(() => {
    if (!startTime || !baselineText) return
    const elapsedMinutes = (Date.now() - startTime) / 60000
    if (elapsedMinutes > 0) {
      const words = baselineText.trim().split(/\s+/).length
      setWpm(Math.round(words / elapsedMinutes))
    }
  }, [baselineText, startTime])

  const handleBaselineSubmit = () => {
    if (baselineText.length < 50) {
      toast({
        title: "Sample too short",
        description: "Please write at least 50 characters.",
        variant: "destructive"
      })
      return
    }

    if (!studentId) return

    setIsSubmittingBaseline(true)
    
    // Mock processing for frontend setup
    setTimeout(() => {
      const mockResult = {
        typingSpeedWpm: wpm || 45,
        writingStyleSummary: "Established via assessment gateway.",
        vocabularyAnalysis: "Consistent with academic standards.",
        sentenceStructureAnalysis: "Standard complexity detected.",
        sentimentAnalysis: "Objective.",
        potentialAIIndicators: ["None detected."]
      }
      
      saveStudentBaseline(studentId, mockResult)
      setHasBaseline(true)
      setIsSubmittingBaseline(false)
      
      toast({
        title: "Baseline Established",
        description: "Your writing fingerprint is recorded. Assessments are now unlocked."
      })
    }, 1500)
  }

  if (!isMounted) return null

  // Mandatory Baseline Gateway
  if (requireBaseline && !hasBaseline) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 py-4">
        <Card className="border-none shadow-2xl ring-1 ring-slate-200 overflow-hidden">
          <div className="h-2 bg-accent" />
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <PenTool className="w-8 h-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-slate-900">Writing Baseline Required</CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              Please provide a writing sample below to unlock your assessments. This sample helps establish your unique typing and writing style.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border mb-4">
              <p className="text-xs font-bold text-primary uppercase mb-2">Instructions</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe your academic goals for this semester. Write at least 50 characters. 
                <span className="font-bold text-accent ml-1">Copy-paste is allowed for testing.</span>
              </p>
            </div>

            <Textarea
              placeholder="Start typing your goals here..."
              className="min-h-[250px] text-lg leading-relaxed font-body"
              value={baselineText}
              onChange={(e) => {
                if (!startTime) setStartTime(Date.now())
                setBaselineText(e.target.value)
              }}
              disabled={isSubmittingBaseline}
            />

            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-muted-foreground">Progress</p>
                  <p className="text-lg font-bold">{baselineText.length} / 50</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-muted-foreground">Est. WPM</p>
                  <p className="text-lg font-bold">{wpm}</p>
                </div>
              </div>
              <Button 
                onClick={handleBaselineSubmit} 
                disabled={isSubmittingBaseline || baselineText.length < 50}
                className="px-10 h-12 bg-accent hover:bg-accent/90 shadow-lg font-bold"
              >
                {isSubmittingBaseline ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Submit & Unlock"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">Available Assessments</h2>
        <p className="text-muted-foreground">Select an assessment to begin. Your behavior will be monitored for integrity.</p>
      </div>

      <div className="grid gap-6">
        {assessments.length > 0 ? (
          assessments.map((assessment) => {
            const studentSession = sessions.find(s => s.assessmentId === assessment.id && s.studentId === studentId)
            const isCompleted = studentSession?.status === 'Completed'
            const isLocked = studentSession?.status === 'Locked'
            
            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow duration-300 border-none ring-1 ring-slate-200">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="font-headline text-2xl">{assessment.title}</CardTitle>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="max-w-xl text-slate-600">
                      {assessment.description || "No specific instructions provided."}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] ${
                    assessment.policy === 'Not Allowed' ? 'border-destructive text-destructive' :
                    assessment.policy === 'Allowed but Monitored' ? 'border-primary text-primary' :
                    'border-green-600 text-green-600'
                  }`}>
                    {assessment.policy} Policy
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {assessment.durationMinutes} Minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      {assessment.questions?.length || 0} Questions
                    </div>
                  </div>
                  
                  {isLocked ? (
                    <Button variant="destructive" disabled className="gap-2">
                      Session Locked
                    </Button>
                  ) : isCompleted ? (
                    <Button variant="outline" asChild>
                      <Link href="/student/history">View Results</Link>
                    </Button>
                  ) : (
                    <Button asChild className="gap-2 bg-primary">
                      <Link href={`/student/assessments/${assessment.id}`}>
                        Begin Assessment
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
            <div className="p-6 bg-slate-50 rounded-full">
              <FileText className="w-12 h-12 text-slate-200" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-xl font-bold text-slate-900">No assessments found</h3>
              <p className="text-sm text-muted-foreground">Your instructor hasn't published any assessments for this course yet.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
        <h3 className="text-lg font-headline font-bold text-primary mb-2">Integrity Agreement</h3>
        <p className="text-sm text-muted-foreground mb-6">
          AcademiaGuard utilizes behavioral biometrics (typing cadence, focus patterns) to verify your identity and ensure academic honesty. By starting an assessment, you agree to the following:
        </p>
        <ul className="grid md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-tight text-slate-600">
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Stable Internet Connection
          </li>
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Verified Writing Baseline
          </li>
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Exclusive Focus on Tab
          </li>
          <li className="flex items-center gap-3 p-3 bg-white rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            No AI Assistance
          </li>
        </ul>
      </div>
    </div>
  )
}
