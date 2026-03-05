"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCcw, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { recalculateAllHonestyScores } from "@/lib/honesty-score"
import { getStudents, getSessions } from "@/lib/storage"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminSettings() {
  const router = useRouter()
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [stats, setStats] = useState<{ students: number, sessions: number } | null>(null)

  const handleLoadStats = () => {
    const students = getStudents()
    const sessions = getSessions()
    setStats({
      students: students.length,
      sessions: sessions.length
    })
    toast({
      title: "Statistics Loaded",
      description: `${students.length} students, ${sessions.length} sessions found`
    })
  }

  const handleRecalculate = () => {
    setIsRecalculating(true)
    
    // Simulate async operation
    setTimeout(() => {
      recalculateAllHonestyScores()
      setIsRecalculating(false)
      setShowConfirm(false)
      
      toast({
        title: "Recalculation Complete",
        description: "All student honesty scores have been updated based on session history"
      })
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900">Admin Settings</h1>
          <p className="text-muted-foreground">System configuration and data management</p>
        </div>
      </div>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-destructive" />
            <CardTitle>Honesty Score Recalculation</CardTitle>
          </div>
          <CardDescription>
            Recalculate all student honesty scores based on their session history. 
            This will update scores using tab switches, paste violations, warnings, and risk levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleLoadStats}
              className="border-primary/20"
            >
              Load Statistics
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowConfirm(true)}
              disabled={isRecalculating}
              className="gap-2"
            >
              {isRecalculating ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Recalculate All Scores
                </>
              )}
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.students}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{stats.sessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Warning: This action will overwrite all existing honesty scores. Make sure to backup important data first.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Recalculation
            </DialogTitle>
            <DialogDescription>
              This will recalculate honesty scores for all {stats?.students || 0} students based on {stats?.sessions || 0} sessions.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRecalculate}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Yes, Recalculate All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
