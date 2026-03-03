
"use client"

import { useState, useEffect, useRef } from "react"
import { ShieldAlert, AlertCircle, Eye, Loader2, Minimize2, Maximize2, Clock, Users, ShieldX } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { predictIntegrityRiskScore } from "@/ai/flows/predictive-integrity-risk-score"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { updateSession, getSessions, getStudentBaseline, getGlobalSettings } from "@/lib/storage"
import { TypingVector } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'

interface MonitoringEngineProps {
  currentWriting: string
  onRiskUpdate: (score: string) => void
  onWarning: (count: number) => void
  assessmentId?: string
  studentId?: string
  durationMinutes?: number
}

const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

export function MonitoringEngine({ 
  currentWriting, 
  onRiskUpdate, 
  onWarning,
  assessmentId,
  studentId = "demo_student",
  durationMinutes = 60
}: MonitoringEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [riskScore, setRiskScore] = useState<string>("Normal")
  const [integrityPoints, setIntegrityPoints] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  
  const [faceStatus, setFaceStatus] = useState<"Tracking" | "Missing" | "Multiple" | "Loading">("Loading")
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null)
  const faceMissingCount = useRef(0)
  const multiFaceCount = useRef(0)

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
    const loadFaceModel = async () => {
      try {
        await tf.ready()
        const loadedModel = await blazeface.load()
        setModel(loadedModel)
        setFaceStatus("Tracking")
      } catch (err) {
        setFaceStatus("Missing") 
      }
    }
    loadFaceModel()
  }, [])

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true })
        setHasCameraPermission(true)
        setStream(s)
      } catch (error) {
        setHasCameraPermission(false)
      }
    }
    getCameraPermission()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

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
    toast({
      title: "Integrity Violation",
      description: msg,
      variant: "destructive"
    })

    setIntegrityPoints(prevPoints => {
      const newTotal = prevPoints + points
      const nextWarning = Math.min(3, Math.floor(newTotal / 30))
      
      setWarningCount(prevWarning => {
        if (nextWarning > prevWarning) {
          onWarning(nextWarning)
          toast({
            title: "Warning Issued",
            description: `Warning threshold crossed: ${nextWarning}/3`,
            variant: "destructive"
          })
          return nextWarning
        }
        return prevWarning
      })

      const sessions = getSessions()
      const current = sessions.find(s => s.studentId === studentId && s.assessmentId === assessmentId)
      if (current) {
        const violationMsg = `${msg} at ${new Date().toLocaleTimeString()}`;
        updateSession({
          ...current,
          warningCount: nextWarning,
          integrityPoints: newTotal,
          tabSwitchCount: tabSwitches.current,
          pasteCount: pasteEvents.current,
          status: nextWarning >= 3 ? 'Locked' : (current.status === 'Completed' ? 'Completed' : 'Flagged'),
          violations: [...(current.violations || []), violationMsg],
          lastActive: new Date().toLocaleTimeString()
        })
      }
      return newTotal
    })
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const writing = currentWritingRef.current
      if (!writing || writing.length < 5 || !studentId) return

      setIsAnalyzing(true)
      
      const elapsed = (Date.now() - sessionStartTime.current) / 60000
      const wordsArr = writing.trim().split(/\s+/).filter(w => w.length > 0)
      const wordCount = wordsArr.length
      const currentWpm = Math.round(wordCount / (elapsed || 0.1)) || 1
      
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
            tabSwitchCount: tabSwitches.current,
            pasteCount: pasteEvents.current,
            currentVector,
            lastActive: new Date().toLocaleTimeString()
          })
        }
      } catch (err) {
        console.error("Analysis Error:", err)
      } finally {
        setIsAnalyzing(false)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [studentId, assessmentId])

  useEffect(() => {
    if (!model || !hasCameraPermission) return

    const cvLoop = setInterval(async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        try {
          const predictions = await model.estimateFaces(video, false)
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (predictions.length === 0) {
            setFaceStatus("Missing")
            faceMissingCount.current++
            if (faceMissingCount.current % 2 === 0) playBeep();
            if (faceMissingCount.current >= 30) {
              triggerPenalty(15, "Focus on the screen! Face not detected.")
              faceMissingCount.current = 0 
            }
          } else if (predictions.length > 1) {
            setFaceStatus("Multiple")
            multiFaceCount.current++
            predictions.forEach((prediction: any) => {
              const rawStart = prediction.topLeft as [number, number]
              const rawEnd = prediction.bottomRight as [number, number]
              const size = [rawEnd[0] - rawStart[0], rawEnd[1] - rawStart[1]]
              const mirroredX = canvas.width - rawEnd[0]
              ctx.strokeStyle = '#ef4444'
              ctx.lineWidth = 4
              ctx.strokeRect(mirroredX, rawStart[1], size[0], size[1])
              ctx.fillStyle = '#ef4444'
              ctx.font = 'bold 14px Inter'
              ctx.fillText('UNAUTHORIZED', mirroredX, rawStart[1] - 10)
            })
            if (multiFaceCount.current >= 10) {
              triggerPenalty(30, "Collaboration detected! Multiple faces identified.")
              multiFaceCount.current = 0
            }
          } else {
            setFaceStatus("Tracking")
            faceMissingCount.current = 0
            multiFaceCount.current = 0
            const prediction = predictions[0] as any
            const rawStart = prediction.topLeft as [number, number]
            const rawEnd = prediction.bottomRight as [number, number]
            const size = [rawEnd[0] - rawStart[0], rawEnd[1] - rawStart[1]]
            const mirroredX = canvas.width - rawEnd[0]
            ctx.strokeStyle = '#22c55e'
            ctx.lineWidth = 3
            ctx.setLineDash([10, 5])
            ctx.strokeRect(mirroredX, rawStart[1], size[0], size[1])
            ctx.setLineDash([])
            ctx.fillStyle = '#22c55e'
            ctx.font = 'bold 16px Inter'
            ctx.fillText('IDENTIFIED', mirroredX, rawStart[1] - 10)
          }
        } catch (err) {}
      }
    }, 500)

    return () => clearInterval(cvLoop)
  }, [model, hasCameraPermission])

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
                riskScore === 'Normal' && faceStatus === 'Tracking' ? "bg-green-500" : "bg-orange-500"
              )} />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none">Biometric Engine</span>
                <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(timeLeft)}
                  <span className={cn(
                    "ml-2 text-[8px] font-black uppercase",
                    faceStatus === 'Tracking' ? "text-green-600" : "text-destructive"
                  )}>
                    {faceStatus === 'Tracking' ? "● Eyes On" : faceStatus === 'Multiple' ? "● Collaboration" : "● Attention Alert"}
                  </span>
                </span>
              </div>
              {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-primary/60" />}
            </div>
            <div className="flex items-center gap-1">
              {warningCount >= 2 && <ShieldX className="w-4 h-4 text-destructive animate-pulse mr-1" />}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          <div className={cn("p-4 space-y-4", isCollapsed && "hidden")}>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border shadow-inner">
              <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-md border border-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Analysis</span>
              </div>
              {faceStatus === 'Missing' && (
                <div className="absolute inset-0 bg-destructive/20 flex flex-col items-center justify-center backdrop-blur-[1px] p-4 text-center">
                  <AlertCircle className="w-10 h-10 text-white animate-pulse mb-2" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Face Not Detected</p>
                </div>
              )}
              {faceStatus === 'Multiple' && (
                <div className="absolute inset-0 bg-destructive/40 flex flex-col items-center justify-center backdrop-blur-[1px] p-4 text-center">
                  <Users className="w-10 h-10 text-white animate-bounce mb-2" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Collaboration Alert</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Honesty Check</p>
                <p className="text-xl font-headline font-bold text-slate-900">{Math.min(100, 100 - integrityPoints)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Status</p>
                <p className={cn(
                  "text-sm font-bold uppercase",
                  riskScore === 'Normal' ? 'text-green-600' : 'text-destructive'
                )}>{riskScore}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                <span className={warningCount >= 2 ? "text-destructive" : ""}>Warnings</span>
                <span className={warningCount >= 2 ? "text-destructive font-black" : ""}>{warningCount}/3</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", warningCount >= 2 ? "bg-destructive" : "bg-primary")}
                  style={{ width: `${(warningCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
