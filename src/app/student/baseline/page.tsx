
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PenTool, BrainCircuit, ShieldCheck, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { studentWritingFingerprintBaseline } from "@/ai/flows/student-writing-fingerprint-baseline"
import { toast } from "@/hooks/use-toast"
import { saveStudentBaseline, getStudentBaseline } from "@/lib/storage"

export default function BaselineTool() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fingerprint, setFingerprint] = useState<any>(null)
  const [wpm, setWpm] = useState(0)
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setStudentId(user.id)
      
      // Check if already has baseline
      const existing = getStudentBaseline(user.id)
      if (existing) {
        setFingerprint(existing)
      }
    } else {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (!startTime || !text) return
    const elapsedMinutes = (Date.now() - startTime) / 60000
    if (elapsedMinutes > 0) {
      const words = text.trim().split(/\s+/).length
      setWpm(Math.round(words / elapsedMinutes))
    }
  }, [text, startTime])

  const handleStart = () => {
    setStartTime(Date.now())
  }

  const handleSubmit = async () => {
    if (text.length < 500) {
      toast({
        title: "Sample too short",
        description: "Please write at least 500 characters to ensure an accurate fingerprint.",
        variant: "destructive"
      })
      return
    }

    if (!studentId) return

    setIsSubmitting(true)
    try {
      const result = await studentWritingFingerprintBaseline({
        writingSample: text,
        typingSpeedWpm: wpm
      })
      
      saveStudentBaseline(studentId, result)
      setFingerprint(result)
      
      toast({
        title: "Fingerprint Created",
        description: "Your writing baseline has been successfully established."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate fingerprint. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (fingerprint) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-4xl font-headline font-bold">Baseline Established</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your writing fingerprint has been securely recorded. This will be used to verify your work in future assessments.
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={() => router.push('/student/assessments')} className="gap-2">
              Go to Assessments <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Style Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">Typing Speed</p>
                <p className="text-lg font-bold">{fingerprint.typingSpeedWpm} WPM</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">Style Summary</p>
                <p className="text-sm leading-relaxed text-slate-600">{fingerprint.writingStyleSummary}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Structural Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">Vocabulary</p>
                <p className="text-sm leading-relaxed text-slate-600">{fingerprint.vocabularyAnalysis}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">Structure</p>
                <p className="text-sm leading-relaxed text-slate-600">{fingerprint.sentenceStructureAnalysis}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <PenTool className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-headline font-bold">Initial Writing Baseline</h2>
          <p className="text-muted-foreground">Establish your unique biometric profile before starting assessments.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline">Prompt: Technology in Education</CardTitle>
              <CardDescription>
                Share your thoughts on how digital tools have changed the way you learn. 
                Write at least 500 characters. **Do not copy-paste or use AI.**
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Start writing your sample here..."
                className="min-h-[400px] text-lg leading-relaxed font-body"
                value={text}
                onChange={(e) => {
                  if (!startTime) handleStart()
                  setText(e.target.value)
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Paste Blocked",
                    description: "You must type your baseline sample manually. Copy-pasting is not allowed.",
                    variant: "destructive"
                  });
                }}
                onContextMenu={(e) => e.preventDefault()}
                disabled={isSubmitting}
              />
              <div className="mt-6 flex justify-between items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Progress: <span className={text.length >= 500 ? "text-green-600" : "text-primary"}>{text.length}</span> / 500 characters
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || text.length < 500}
                  className="px-8 bg-accent hover:bg-accent/90 shadow-lg"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Fingerprint...</> : "Submit Baseline"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-accent" />
                Biometric Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Current WPM</p>
                <p className="text-4xl font-headline font-bold text-primary">{wpm}</p>
              </div>
              <div className="pt-4 border-t space-y-4">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Tracking Parameters</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Keystroke Interval Dynamics
                  </li>
                  <li className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Syntactic Structure Patterns
                  </li>
                  <li className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Vocabulary Nuance Analysis
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl shadow-sm">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Requirement</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This baseline is mandatory. AcademiaGuard uses it to protect your academic reputation by verifying that your submitted work consistently matches your unique writing style.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
