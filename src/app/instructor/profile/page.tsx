"use client"

import { useState, useEffect } from "react"
import { 
  User, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Building, 
  Save, 
  Mail,
  Loader2,
  Lock,
  Globe
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { getGlobalSettings, saveGlobalSettings } from "@/lib/storage"

export default function InstructorProfile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "Admin Instructor",
    email: "admin@academiaguard.edu",
    notifications: true,
    autoApprove: false
  })

  useEffect(() => {
    setSettings(getGlobalSettings())
  }, [])

  const handleSave = () => {
    setIsUpdating(true)
    if (settings) {
      saveGlobalSettings(settings)
    }
    
    setTimeout(() => {
      setIsUpdating(false)
      toast({
        title: "Profile Updated",
        description: "Your instructor preferences have been saved."
      })
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold">Instructor Profile</h2>
            <p className="text-muted-foreground">Manage your credentials and platform preferences.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isUpdating}
          className="bg-primary hover:bg-primary/90 gap-2 px-6"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Identity Settings</CardTitle>
              <CardDescription>How you appear to students and other staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inst-name">Full Name</Label>
                  <Input 
                    id="inst-name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst-email">Work Email</Label>
                  <Input 
                    id="inst-email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Institution Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>University / School Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={settings?.institutionName || ""} 
                    onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label className="font-bold text-sm">Real-time Alerting</Label>
                  <p className="text-xs text-muted-foreground">Notify immediately when a critical integrity risk is detected.</p>
                </div>
                <Switch 
                  checked={formData.notifications} 
                  onCheckedChange={(checked) => setFormData({...formData, notifications: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200 bg-primary/[0.02]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Access Tier</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-white rounded-xl border space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Role</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Lead Proctor</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">API Usage</span>
                  <span className="font-bold">Enterprise</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a Lead Proctor, you have full control over institutional integrity policies and student lockout resets.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <Globe className="w-5 h-5" />
              <h4 className="font-headline font-bold text-lg">System Health</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>AI Nodes Active</span>
                <span className="text-green-400">Stable</span>
              </div>
              <Progress value={100} className="h-1 bg-white/10 [&>div]:bg-green-400" />
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed">
              Biometric analysis engine is currently monitoring 14 active sessions across your institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
