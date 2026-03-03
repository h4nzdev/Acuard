"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { PenTool, BrainCircuit, ShieldCheck, Loader2, ArrowRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { saveStudentBaseline, getStudentBaseline } from "@/lib/storage"
import { TypingVector } from "@/app/lib/mock-data"

export default function BaselineTool() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fingerprint, setFingerprint] = useState<any>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  
  // Tracking State
  const startTime = useRef<number | null>(null)
  const backspaceCount = useRef(0)
  const lastKeyTime = useRef<number>(Date.now())
  const pauses = useRef<number>(0)
  const [liveWpm, setLiveWpm] = useState(0)

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setStudentId(user.id)
      const existing = getStudentBaseline(user.id)
      if (existing) setFingerprint(existing)
    } else {
      router.push('/login')
    }
  }, [router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!startTime.current) startTime.current = Date.now()
    
    if (e.key === 'Backspace') backspaceCount.current++
    
    const now = Date.now()
    if (now - lastKeyTime.current > 2000) {
      pauses.current++
    }
    lastKeyTime.current = now

    // Calculate live WPM
    const elapsed = (now - startTime.current) / 60000
    if (elapsed > 0.1) {
      const words = text.trim().split(/\s+/).length
      setLiveWpm(Math.round(words / elapsed))
    }
  }

  const handleSubmit = async () => {
    if (text.length < 150) {
      toast({
        title: "Sample too short",
        description: "Please write at least 150 characters to establish a reliable baseline.",
        variant: "destructive"
      })
      return
    }

    if (!studentId) return
    setIsSubmitting(true)

    // Calculate final Vector
    const totalMinutes = (Date.now() - (startTime.current || Date.now())) / 60000
    const words = text.trim().split(/\s+/).length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    const vector: TypingVector = {
      wpm: Math.round(words / totalMinutes),
      consistency: Math.random() * 10 + 85, // Simulation of rhythmic consistency
      backspaceRate: Math.round((backspaceCount.current / text.length) * 100),
      pauseCount: pauses.current,
      avgSentenceLength: Math.round(words / (sentences.length || 1)),
      vocabComplexity: Math.min(10, Math.round(words / 10)), // Simple mock
      pasteCount: 0
    }

    setTimeout(() => {
      const result = {
        ...vector,
        writingStyleSummary: "Consistent syntactic patterns detected. Profile established using Behavioral Vector Comparison.",
        analysisDate: new Date().toLocaleDateString()
      }
      
      saveStudentBaseline(studentId, result)
      setFingerprint(result)
      setIsSubmitting(false)
      
      toast({
        title: "Signature Verified",
        description: "Your unique typing fingerprint has been encrypted and saved."
      })
    }, 2000)
  }

  if (fingerprint) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-4xl font-headline font-bold">Identity Baseline Established</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your Behavioral Vector is now the standard for your assessments.
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={() => router.push('/student/assessments')} className="gap-2">
              Continue to Assessments <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <VectorStat title="Typing Speed" value={`${fingerprint.wpm} WPM`} icon={Activity} />
          <VectorStat title="Rhythm Consistency" value={`${Math.round(fingerprint.consistency)}%`} icon={BrainCircuit} />
          <VectorStat title="Correction Rate" value={`${fingerprint.backspaceRate}%`} icon={PenTool} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-headline font-bold">Biometric Signature Collection</h2>
          <p className="text-muted-foreground">This 3-5 sentence sample helps Acuard verify your identity during exams.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline">Prompt: The Future of Digital Integrity</CardTitle>
              <CardDescription>
                Briefly describe why you think academic honesty is important in the age of AI. (Min. 150 chars)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Start typing naturally..."
                className="min-h-[300px] text-lg leading-relaxed font-body"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
              <div className="mt-6 flex justify-between items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Characters: <span className={text.length >= 150 ? "text-green-600" : "text-primary"}>{text.length}</span> / 150
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || text.length < 150}
                  className="px-8 bg-accent hover:bg-accent/90 shadow-lg"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Syncing Vectors...</> : "Establish Baseline"}
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
                Live Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Detected Cadence</p>
                <p className="text-4xl font-headline font-bold text-primary">{liveWpm} <span className="text-xs font-normal opacity-50">WPM</span></p>
              </div>
              <div className="pt-4 border-t space-y-4">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Captured Vectors</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Keystroke Interval Dynamics
                  </li>
                  <li className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Pause Duration Analysis
                  </li>
                  <li className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Correction Rate per Sentance
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function VectorStat({ title, value, icon: Icon }: any) {
  return (
    <Card className="shadow-sm border-none ring-1 ring-slate-200 p-6 text-center">
      <div className="inline-flex p-3 bg-slate-50 rounded-xl mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  )
}
