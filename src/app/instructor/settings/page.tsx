"use client"

import { useEffect, useState } from "react"
import { 
  Settings, 
  ShieldAlert, 
  Bell, 
  Lock, 
  BrainCircuit, 
  Save, 
  Building,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  KeyRound
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { getGlobalSettings, saveGlobalSettings, GlobalSettings } from "@/lib/storage"
import { cn } from "@/lib/utils"

export default function PoliciesSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [originalSettingsJson, setOriginalSettingsJson] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const s = getGlobalSettings()
    setSettings(s)
    setOriginalSettingsJson(JSON.stringify(s))
    setIsMounted(true)
  }, [])

  const handleSave = () => {
    if (settings) {
      saveGlobalSettings(settings)
      setOriginalSettingsJson(JSON.stringify(settings))
      toast({
        title: "Settings Saved",
        description: "Institutional integrity policies have been updated successfully.",
      })
    }
  }

  if (!isMounted || !settings) return null

  const hasChanges = JSON.stringify(settings) !== originalSettingsJson

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Integrity Policies</h2>
          <p className="text-muted-foreground">Configure institutional defaults and analysis thresholds.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className={cn(
            "gap-2 transition-all duration-300", 
            hasChanges 
              ? "bg-primary hover:bg-primary/90 shadow-md" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
          )}
        >
          <Save className="w-4 h-4" />
          {hasChanges ? "Save Changes" : "No Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-headline">AI Configuration</CardTitle>
            </div>
            <CardDescription>Setup your Gemini API key to power GenAI analysis features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="gemini-key" 
                  type="password"
                  placeholder="Enter your Google AI API Key..."
                  className="pl-10 h-11"
                  value={settings.geminiApiKey || ""} 
                  onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                This key is stored locally and used to authenticate Genkit flows for writing analysis and OCR questions.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-headline">Institution Profile</CardTitle>
            </div>
            <CardDescription>General information for your Acuard instance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inst-name">Institution Name</Label>
              <Input 
                id="inst-name" 
                value={settings.institutionName} 
                onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-headline">Identity Verification</CardTitle>
            </div>
            <CardDescription>Control baseline requirements for students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Require Writing Baseline</Label>
                <p className="text-xs text-muted-foreground">Students must establish a writing fingerprint before starting any assessments.</p>
              </div>
              <Switch 
                checked={settings.requireBaseline} 
                onCheckedChange={(checked) => setSettings({...settings, requireBaseline: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-headline">AI Analysis Thresholds</CardTitle>
            </div>
            <CardDescription>Adjust how sensitive the AI is when flagging behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold">Detection Sensitivity</Label>
                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {settings.sensitivity}%
                </span>
              </div>
              <Slider 
                value={[settings.sensitivity]} 
                onValueChange={(val) => setSettings({...settings, sensitivity: val[0]})}
                max={100}
                step={1}
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Higher sensitivity leads to more frequent flags but may increase false positives for natural variations in typing cadence.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-headline">Automated Enforcement</CardTitle>
            </div>
            <CardDescription>Rules for session termination and lockouts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Auto-Lock Warning Threshold</Label>
                <p className="text-xs text-muted-foreground">Number of warnings before a session is automatically terminated.</p>
              </div>
              <Select 
                value={settings.autoLockThreshold.toString()} 
                onValueChange={(val) => setSettings({...settings, autoLockThreshold: parseInt(val)})}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Warning</SelectItem>
                  <SelectItem value="2">2 Warnings</SelectItem>
                  <SelectItem value="3">3 Warnings</SelectItem>
                  <SelectItem value="5">5 Warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-headline">Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive integrity alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Notify on Flagged Session</Label>
                <p className="text-xs text-muted-foreground">Receive immediate notification when behavior is marked as suspicious.</p>
              </div>
              <Switch 
                checked={settings.notifyOnFlag} 
                onCheckedChange={(checked) => setSettings({...settings, notifyOnFlag: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Notify on Locked Session</Label>
                <p className="text-xs text-muted-foreground">Receive critical alert when a student is locked out of an assessment.</p>
              </div>
              <Switch 
                checked={settings.notifyOnLock} 
                onCheckedChange={(checked) => setSettings({...settings, notifyOnLock: checked})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-green-800 uppercase">Policy Health</h4>
            <p className="text-[11px] text-green-700 leading-relaxed">
              Your current settings are balanced. 3-warning lockout is standard for high-stakes environments.
            </p>
          </div>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-yellow-800 uppercase">Security Note</h4>
            <p className="text-[11px] text-yellow-700 leading-relaxed">
              Changing sensitivity impacts real-time risk scores for all active and future assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
