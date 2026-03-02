
"use client"

import { useState, useEffect, useRef } from "react"
import { ShieldAlert, AlertCircle, Eye, Loader2, ChevronDown, ChevronUp, Minimize2, Maximize2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { predictIntegrityRiskScore } from "@/ai/flows/predictive-integrity-risk-score"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { updateSession, getSessions, getStudents, updateStudent } from "@/lib/storage"
import { StudentSession } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"

interface MonitorStats {
  typingSpeed: number
  pasteFrequency: number
  tabSwitchCount: number
}

interface MonitoringEngineProps {
  currentWriting: string
  onRiskUpdate: (score: string) => void
  onWarning: (count: number) => void
  assessmentId?: string
  studentId?: string
}

export function MonitoringEngine({ 
  currentWriting, 
  onRiskUpdate, 
  onWarning,
  assessmentId,
  studentId = "demo_student"
}: MonitoringEngineProps) {
  const [stats, setStats] = useState<MonitorStats>({
    typingSpeed: 0,
    pasteFrequency: 0,
    tabSwitchCount: 0
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [riskScore, setRiskScore] = useState<string>("Normal")
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const lastRiskScore = useRef<string>("Normal")
  const sessionStartTime = useRef<number>(Date.now())

  // Monitoring listeners
  useEffect(() => {
    const handleBlur = () => {
      setStats(prev => {
        const newCount = prev.tabSwitchCount + 1
        if (newCount > 2) {
          triggerWarning("Tab switching detected")
        }
        return { ...prev, tabSwitchCount: newCount }
      })
    }

    const handlePaste = (e: ClipboardEvent) => {
      setStats(prev => {
        const newCount = prev.pasteFrequency + 1
        triggerWarning("Content pasted into assessment")
        return { ...prev, pasteFrequency: newCount }
      })
    }

    window.addEventListener('blur', handleBlur)
    document.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('paste', handlePaste)
    }
  }, [warningCount])

  const triggerWarning = (msg: string) => {
    const nextCount = warningCount + 1
    setWarningCount(nextCount)
    onWarning(nextCount)
    
    toast({
      title: "Integrity Warning",
      description: `${msg}. Warning ${nextCount}/3`,
      variant: "destructive"
    })

    if (nextCount >= 3) {
      toast({
        title: "Session Locked",
        description: "Multiple violations detected. Your session has been locked for review.",
        variant: "destructive"
      })
    }

    // Update session in storage
    const sessions = getSessions()
    const current = sessions.find(s => s.studentId === studentId && s.assessmentId === assessmentId)
    if (current) {
      updateSession({
        ...current,
        warningCount: nextCount,
        status: nextCount >= 3 ? 'Locked' : 'Flagged',
        violations: [...(current.violations || []), `${msg} at ${new Date().toLocaleTimeString()}`],
        pasteCount: stats.pasteFrequency + 1, // Reflect latest state
        tabSwitchCount: stats.tabSwitchCount,
        lastActive: new Date().toLocaleTimeString()
      })
    }

    // Update student score and flagged sessions
    const students = getStudents()
    const student = students.find(s => s.id === studentId)
    if (student) {
      const newScore = Math.max(0, student.honestyScore - 5)
      const newFlaggedCount = nextCount >= 3 ? student.flaggedSessions + 1 : student.flaggedSessions
      
      updateStudent({
        ...student,
        honestyScore: newScore,
        flaggedSessions: newFlaggedCount
      })
    }
  }

  // Calculate WPM and analyze risk periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentWriting || currentWriting.length < 10) return

      const elapsedMinutes = (Date.now() - sessionStartTime.current) / 60000
      const words = currentWriting.trim().split(/\s+/).length
      const currentWpm = Math.round(words / (elapsedMinutes || 1))

      setStats(prev => ({ ...prev, typingSpeed: currentWpm }))

      setIsAnalyzing(true)
      try {
        const result = await predictIntegrityRiskScore({
          currentWritingSample: currentWriting,
          baselineWritingFingerprint: "Baseline text sample for comparison...",
          typingSpeed: currentWpm,
          pasteFrequency: stats.pasteFrequency,
          tabSwitchCount: stats.tabSwitchCount
        })

        if (result.riskScore !== lastRiskScore.current) {
          onRiskUpdate(result.riskScore)
          setRiskScore(result.riskScore)
          lastRiskScore.current = result.riskScore
        }

        // Update persistent session record
        const sessions = getSessions()
        const current = sessions.find(s => s.studentId === studentId && s.assessmentId === assessmentId)
        if (current) {
          updateSession({
            ...current,
            riskScore: result.riskScore as any,
            typingSpeed: currentWpm,
            pasteCount: stats.pasteFrequency,
            tabSwitchCount: stats.tabSwitchCount,
            lastActive: new Date().toLocaleTimeString()
          })
        }
      } catch (err) {
        console.error("Risk analysis failed", err)
      } finally {
        setIsAnalyzing(false)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [currentWriting, stats.pasteFrequency, stats.tabSwitchCount, studentId, assessmentId])

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
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Monitoring</span>
              {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-primary/60" />}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-primary/10"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          </div>

          {!isCollapsed && (
            <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Typing Speed</p>
                  <p className="text-xl font-headline font-bold text-slate-900">
                    {stats.typingSpeed} <span className="text-[10px] font-normal text-muted-foreground uppercase">WPM</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Risk Status</p>
                  <p className={cn(
                    "text-sm font-bold uppercase tracking-tight",
                    riskScore === 'Normal' ? 'text-green-600' : 'text-orange-600'
                  )}>
                    {riskScore}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Warning Progress</span>
                  <span className={cn(
                    warningCount >= 2 ? "text-destructive" : "text-primary"
                  )}>
                    {warningCount} / 3
                  </span>
                </div>
                <Progress 
                  value={(warningCount / 3) * 100} 
                  className={cn(
                    "h-1.5 transition-all duration-500",
                    warningCount >= 2 ? "[&>div]:bg-destructive" : ""
                  )} 
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className={cn(
        "flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg transition-all duration-300",
        isCollapsed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}>
        <ShieldAlert className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Monitored Session</span>
      </div>
    </div>
  )
}
