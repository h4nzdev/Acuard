"use client"

import { useState, useRef, useEffect } from "react"
import { PenTool, BrainCircuit, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { studentWritingFingerprintBaseline } from "@/ai/flows/student-writing-fingerprint-baseline"
import { toast } from "@/hooks/use-toast"

export default function BaselineTool() {
  const [text, setText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fingerprint, setFingerprint] = useState<any>(null)
  const [wpm, setWpm] = useState(0)

  // Track WPM live
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

    setIsSubmitting(true)
    try {
      const result = await studentWritingFingerprintBaseline({
        writingSample: text,
        typingSpeedWpm: wpm
      })
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-4xl font-headline font-bold">Baseline Established</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your writing fingerprint has been securely recorded. This will be used to verify your work in future assessments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><strong>Typing Speed:</strong> {fingerprint.typingSpeedWpm} WPM</p>
              <p className="text-sm"><strong>Summary:</strong> {fingerprint.writingStyleSummary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Structural Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><strong>Vocabulary:</strong> {fingerprint.vocabularyAnalysis}</p>
              <p className="text-sm"><strong>Structure:</strong> {fingerprint.sentenceStructureAnalysis}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <PenTool className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-headline font-bold">Initial Writing Baseline</h2>
          <p className="text-muted-foreground">Complete this short essay to establish your unique writing fingerprint.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Prompt: The Future of Academic Integrity</CardTitle>
              <CardDescription>
                Please write 200-300 words sharing your thoughts on how AI affects academic honesty.
                Do not copy-paste or use AI assistance for this task.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Start writing here..."
                className="min-h-[400px] text-lg leading-relaxed font-body"
                value={text}
                onChange={(e) => {
                  if (!startTime) handleStart()
                  setText(e.target.value)
                }}
                disabled={isSubmitting}
              />
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Characters: {text.length} / 500 minimum
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || text.length < 100}
                  className="px-8"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</> : "Submit Baseline"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-accent" />
                Live Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Live WPM</p>
                <p className="text-3xl font-headline font-bold">{wpm}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground font-medium mb-2">Metrics Tracked:</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Keystroke dynamics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Sentence complexity
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Vocabulary diversity
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-bold text-yellow-800 mb-1">Important</h4>
            <p className="text-xs text-yellow-700 leading-relaxed">
              This process only happens once. Please provide a natural writing sample for the most accurate baseline.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
