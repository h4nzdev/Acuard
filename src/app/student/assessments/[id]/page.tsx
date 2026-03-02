"use client"

import { useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { FileText, Save, Send, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MonitoringEngine } from "@/components/assessments/monitoring-engine"
import { MOCK_ASSESSMENTS } from "@/lib/mock-data"
import { toast } from "@/hooks/use-toast"

export default function ActiveAssessment() {
  const params = useParams()
  const router = useRouter()
  const assessment = MOCK_ASSESSMENTS.find(a => a.id === params.id) || MOCK_ASSESSMENTS[0]
  
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [riskScore, setRiskScore] = useState("Normal")

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      toast({
        title: "Assessment Submitted",
        description: "Your work has been securely uploaded and flagged for review."
      })
      router.push('/student/dashboard')
    }, 2000)
  }

  if (warningCount >= 3) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center border-destructive shadow-2xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold text-destructive">Session Locked</CardTitle>
            <CardDescription>
              Your session has been terminated due to multiple integrity violations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please contact your instructor or the academic office to discuss this session. Your partial progress has been saved.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="/student/dashboard">Return to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border sticky top-8 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">{assessment.title}</h1>
            <p className="text-xs text-muted-foreground">Policy: {assessment.policy} • Ends in 45:00</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button className="gap-2 bg-accent hover:bg-accent/90" onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="w-4 h-4" />
            Submit Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="min-h-[600px] shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Assessment Content</CardTitle>
            <CardDescription>
              Write your response below. Be descriptive and follow the guidelines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Begin typing your assessment here..."
              className="min-h-[500px] text-lg leading-relaxed focus-visible:ring-accent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onContextMenu={(e) => assessment.policy === 'Not Allowed' && e.preventDefault()}
            />
          </CardContent>
        </Card>
      </div>

      <MonitoringEngine 
        currentWriting={content}
        onRiskUpdate={setRiskScore}
        onWarning={setWarningCount}
      />
    </div>
  )
}
