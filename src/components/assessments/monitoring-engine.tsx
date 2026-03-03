"use client"

import { useState, useEffect, useRef } from "react"
import { ShieldAlert, AlertCircle, Eye, Loader2, ChevronDown, ChevronUp, Minimize2, Maximize2, Clock, Camera, CameraOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { predictIntegrityRiskScore } from "@/ai/flows/predictive-integrity-risk-score"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { updateSession, getSessions, getStudents, updateStudent, getStudentBaseline, getGlobalSettings } from "@/lib/storage"
import { TypingVector } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

interface MonitoringEngineProps {
  currentWriting: string
  onRiskUpdate: (score: string) => void
  onWarning: (count: number) => void
  assessmentId?: string
  studentId?: string
  durationMinutes?: number
}

export function MonitoringEngine({ 
  currentWriting, 
  onRiskUpdate, 
  onWarning,
  assessmentId,
  studentId = "demo_student",
  durationMinutes = 60
}: MonitoringEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [riskScore, setRiskScore] = useState<string>("Normal")
  const [integrityPoints, setIntegrityPoints] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  
  // Real-time Vectors
  const backspaceCount = useRef(0)
  const lastKeyTime = useRef<number>(Date.now())
  const pauses = useRef(0)
  const tabSwitches = useRef(0)
  const pasteEvents = useRef(0)
  const sessionStartTime = useRef<number>(Date.now())
  
  const currentWritingRef = useRef(currentWriting)
  useEffect(() => {
    currentWritingRef.current = currentWriting
  }, [currentWriting])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') backspaceCount.current++
      const now = Date.now()
      if (now - lastKeyTime.current > 2000) pauses.current++
      lastKeyTime.current = now
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setHasCameraPermission(true)
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (error) {
        setHasCameraPermission(false)
      }
    }
    getCameraPermission()
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    const handleBlur = () => {
      tabSwitches.current++
      triggerPenalty(15, "Window focus lost (Tab switch detected)")
    }
    const handlePaste = (e: ClipboardEvent) => {
      pasteEvents.current++
      triggerPenalty(20, "Content pasted into assessment")
    }
    window.addEventListener('blur', handleBlur)
    document.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('paste', handlePaste)
    }
  }, [integrityPoints])

  const triggerPenalty = (points: number, msg: string) => {
    setIntegrityPoints(prev => {
      const newTotal = prev + points
      const nextWarning = Math.floor(newTotal / 30)
      
      if (nextWarning > warningCount) {
        setWarningCount(nextWarning)
        onWarning(nextWarning)
        toast({
          title: "Integrity Flag",
          description: `${msg}. Warning ${nextWarning}/3`,
          variant: "destructive"
        })
      }

      const sessions = getSessions()
      const current = sessions.find(s => s.studentId === studentId && s.assessmentId === assessmentId)
      if (current) {
        updateSession({
          ...current,
          warningCount: nextWarning,
          integrityPoints: newTotal,
          status: nextWarning >= 3 ? 'Locked' : (current.status === 'Completed' ? 'Completed' : 'Flagged'),
          violations: [...(current.violations || []), `${msg} at ${new Date().toLocaleTimeString()}`],
          lastActive: new Date().toLocaleTimeString()
        })
      }
      return newTotal
    })
  }

  // BIOMETRIC VECTOR COMPARISON LOGIC
  useEffect(() => {
    const interval = setInterval(async () => {
      const writing = currentWritingRef.current
      if (!writing || writing.length < 20 || !studentId) return

      setIsAnalyzing(true)
      
      const elapsed = (Date.now() - sessionStartTime.current) / 60000
      const wordsArr = writing.trim().split(/\s+/).filter(w => w.length > 0)
      const wordCount = wordsArr.length
      const currentWpm = Math.round(wordCount / (elapsed || 0.1))
      
      // Calculate real complexity (Unique words ratio)
      const uniqueWords = new Set(writing.toLowerCase().match(/\b(\w+)\b/g)).size
      const complexity = Math.min(10, Math.round((uniqueWords / (wordCount || 1)) * 10))
      
      const sentences = writing.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const avgSentenceLen = Math.round(wordCount / (sentences.length || 1))

      const currentVector: TypingVector = {
        wpm: currentWpm,
        consistency: 90, 
        backspaceRate: Math.round((backspaceCount.current / (writing.length || 1)) * 100),
        pauseCount: pauses.current,
        avgSentenceLength: avgSentenceLen,
        vocabComplexity: complexity,
        pasteCount: pasteEvents.current
      }

      const baseline = getStudentBaseline(studentId)
      const settings = getGlobalSettings()
      
      if (baseline) {
        let deviationPenalty = 0
        
        // 1. Speed Deviation (>50% difference)
        const wpmDiff = Math.abs(currentWpm - baseline.wpm) / (baseline.wpm || 1)
        if (wpmDiff > 0.5) deviationPenalty += 30
        
        // 2. Vocab Complexity Drop (Sign of random typing vs proper text)
        const complexityDiff = Math.abs(complexity - baseline.vocabComplexity)
        if (complexityDiff > 3) deviationPenalty += 20

        // 3. Sentence Structure Variance
        const sentenceDiff = Math.abs(avgSentenceLen - baseline.avgSentenceLength) / (baseline.avgSentenceLength || 1)
        if (sentenceDiff > 1.0) deviationPenalty += 15

        if (deviationPenalty > 0) {
          triggerPenalty(deviationPenalty, "Behavioral signature mismatch detected")
        } else {
          toast({
            title: "Integrity Verified",
            description: "Typing cadence and syntax match your verified baseline.",
          })
        }
      }

      try {
        const result = await predictIntegrityRiskScore({
          currentWritingSample: writing,
          baselineWritingFingerprint: baseline ? JSON.stringify(baseline) : "Standard baseline",
          typingSpeed: currentWpm,
          pasteFrequency: pasteEvents.current,
          tabSwitchCount: tabSwitches.current,
          apiKey: settings.geminiApiKey
        })

        setRiskScore(result.riskScore)
        onRiskUpdate(result.riskScore)

        const sessions = getSessions()
        const current = sessions.find(s => s.studentId === studentId && s.assessmentId === assessmentId)
        if (current) {
          updateSession({
            ...current,
            riskScore: result.riskScore as any,
            typingSpeed: currentWpm,
            currentVector,
            lastActive: new Date().toLocaleTimeString()
          })
        }
      } catch (err) {
        console.error("Analysis Error:", err)
      } finally {
        setIsAnalyzing(false)
      }
    }, 20000) // 20 second capture cycles

    return () => clearInterval(interval)
  }, [studentId, assessmentId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-8 right-8 w-80 space-y-3 z-50 animate-in slide-in-from-bottom-4 transition-all duration-300">
      <Card className={cn(
        "shadow-2xl border-primary/20 bg-white/95 backdrop-blur-sm transition-all duration-300 overflow-hidden",
        isCollapsed ? "h-14" : "h-auto"
      )}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 bg-primary/5 border-b">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                riskScore === 'Normal' ? "bg-green-500" : "bg-orange-500"
              )} />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none">Biometric Engine</span>
                <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(timeLeft)}
                </span>
              </div>
              {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-primary/60" />}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          </div>

          {!isCollapsed && (
            <div className="p-4 space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-md border border-white/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Monitor</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Integrity Load</p>
                  <p className="text-xl font-headline font-bold text-slate-900">{Math.min(100, integrityPoints)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Risk Level</p>
                  <p className={cn(
                    "text-sm font-bold uppercase",
                    riskScore === 'Normal' ? 'text-green-600' : 'text-orange-600'
                  )}>{riskScore}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Warning Threshold</span>
                  <span>{warningCount}/3</span>
                </div>
                <Progress value={(warningCount / 3) * 100} className="h-1.5" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
