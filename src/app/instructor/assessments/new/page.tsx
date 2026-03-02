"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FilePlus, Shield, MousePointer2, AlertCircle, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

export default function NewAssessment() {
  const router = useRouter()
  const [policy, setPolicy] = useState('Monitored')

  const handleCreate = () => {
    toast({
      title: "Assessment Created",
      description: "Policy applied and activity is ready for student access."
    })
    router.push('/instructor/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FilePlus className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold">New Assessment</h2>
            <p className="text-muted-foreground">Configure content and integrity policies.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.back()}><X className="w-4 h-4 mr-2" /> Cancel</Button>
          <Button onClick={handleCreate} className="bg-accent hover:bg-accent/90"><Save className="w-4 h-4 mr-2" /> Save & Publish</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Activity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input id="title" placeholder="e.g. Modern Physics Midterm" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" placeholder="Enter instructions for students..." className="min-h-[150px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Minutes)</Label>
                  <Input id="duration" type="number" defaultValue={60} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Grade Weight (%)</Label>
                  <Input id="weight" type="number" defaultValue={20} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20 bg-primary/[0.02]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline">Integrity & Policy Control</CardTitle>
              </div>
              <CardDescription>Define how AcademiaGuard monitors this activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">Copy-Paste Policy</Label>
                <RadioGroup defaultValue="monitored" onValueChange={setPolicy} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="not-allowed"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:bg-slate-50 cursor-pointer ${policy === 'not-allowed' ? 'border-primary bg-primary/[0.05]' : 'border-muted'}`}
                  >
                    <RadioGroupItem value="not-allowed" id="not-allowed" className="sr-only" />
                    <X className="mb-3 h-6 w-6 text-destructive" />
                    <span className="text-xs font-bold uppercase">Disallowed</span>
                  </Label>
                  <Label
                    htmlFor="monitored"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:bg-slate-50 cursor-pointer ${policy === 'monitored' ? 'border-primary bg-primary/[0.05]' : 'border-muted'}`}
                  >
                    <RadioGroupItem value="monitored" id="monitored" className="sr-only" />
                    <Shield className="mb-3 h-6 w-6 text-primary" />
                    <span className="text-xs font-bold uppercase">Monitored</span>
                  </Label>
                  <Label
                    htmlFor="allowed"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:bg-slate-50 cursor-pointer ${policy === 'allowed' ? 'border-primary bg-primary/[0.05]' : 'border-muted'}`}
                  >
                    <RadioGroupItem value="allowed" id="allowed" className="sr-only" />
                    <MousePointer2 className="mb-3 h-6 w-6 text-green-600" />
                    <span className="text-xs font-bold uppercase">Fully Allowed</span>
                  </Label>
                </RadioGroup>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 bg-white p-3 rounded-lg border italic">
                  {policy === 'not-allowed' && "Students will be blocked from pasting. Keystrokes are strictly monitored against baseline fingerprint."}
                  {policy === 'monitored' && "Students can paste, but events are flagged and analyzed for similarity with baseline style."}
                  {policy === 'allowed' && "Standard monitoring is active, but paste events do not trigger automatic warnings."}
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">AI Behavior Scoring</Label>
                    <p className="text-xs text-muted-foreground">Compare typing cadence and style against student fingerprint.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Browser Tab Monitoring</Label>
                    <p className="text-xs text-muted-foreground">Log events when student leaves the assessment tab.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between opacity-50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Camera Attention Tracking (BETA)</Label>
                    <p className="text-xs text-muted-foreground">Use face detection to ensure constant focus on exam screen.</p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-accent rounded-2xl text-accent-foreground shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-headline font-bold">Proctor Summary</h3>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              AcademiaGuard will automatically flag behavior that deviates significantly from a student's baseline.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium border-b border-white/20 pb-2">
                <span>Auto-Lock on Warnings</span>
                <span>3 Warnings</span>
              </div>
              <div className="flex justify-between text-xs font-medium border-b border-white/20 pb-2">
                <span>Fingerprint Sensitivity</span>
                <span>High</span>
              </div>
              <div className="flex justify-between text-xs font-medium pb-2">
                <span>Notify Instructor</span>
                <span>Immediate</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Activity Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Open Date</Label>
                <Input type="date" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Close Date</Label>
                <Input type="date" className="h-9" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
