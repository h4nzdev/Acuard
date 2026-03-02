"use client"

import { useState, useEffect } from "react"
import { 
  User, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Lock, 
  Fingerprint, 
  Save, 
  ShieldAlert,
  Loader2,
  Mail,
  Smartphone,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { getStudents, updateStudent, getStudentBaseline } from "@/lib/storage"

export default function StudentProfile() {
  const [student, setStudent] = useState<any>(null)
  const [hasBaseline, setHasBaseline] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: true,
    shareBiometrics: true
  })

  useEffect(() => {
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      const allStudents = getStudents()
      const found = allStudents.find(s => s.id === user.id)
      if (found) {
        setStudent(found)
        setFormData({
          name: found.name,
          email: found.email,
          notifications: true,
          shareBiometrics: true
        })
        setHasBaseline(!!getStudentBaseline(user.id))
      }
    }
  }, [])

  const handleSave = () => {
    if (!student) return
    setIsUpdating(true)

    const updated = {
      ...student,
      name: formData.name,
      email: formData.email
    }

    // Update both student list and current user session
    updateStudent(updated)
    localStorage.setItem('ag_current_user', JSON.stringify({
      id: updated.id,
      name: updated.name,
      email: updated.email
    }))

    setTimeout(() => {
      setIsUpdating(false)
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully."
      })
    }, 800)
  }

  if (!student) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold">My Profile</h2>
            <p className="text-muted-foreground">Manage your identity and integrity settings.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isUpdating}
          className="bg-primary hover:bg-primary/90 gap-2 px-6"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Account Details</CardTitle>
              <CardDescription>Primary information used for assessment identification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Student Identifier</p>
                <code className="bg-slate-50 px-3 py-1.5 rounded border text-xs font-mono font-bold text-slate-700">
                  {student.id}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-bold">Session Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive browser alerts for risk warnings and session status.</p>
                </div>
                <Switch 
                  checked={formData.notifications} 
                  onCheckedChange={(checked) => setFormData({...formData, notifications: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-bold">Biometric Visibility</Label>
                  <p className="text-xs text-muted-foreground">Allow instructors to view your typing cadence analytics.</p>
                </div>
                <Switch 
                  checked={formData.shareBiometrics} 
                  onCheckedChange={(checked) => setFormData({...formData, shareBiometrics: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-none ring-1 ring-slate-200 bg-primary/[0.02]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Biometric Profile</CardTitle>
              </div>
              <CardDescription>Verified writing fingerprint status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm">
                {hasBaseline ? (
                  <>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-green-700">Established</p>
                      <p className="text-[10px] text-muted-foreground">Verified on {student.enrolledDate}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ShieldAlert className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-yellow-700">Missing</p>
                      <p className="text-[10px] text-muted-foreground">Action required for exams.</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your biometric profile is used to protect the integrity of your degree. It tracks unique keystroke dynamics and syntactic patterns.
                </p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Typing Cadence Baseline
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Syntactic Fingerprint
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-accent rounded-2xl text-accent-foreground shadow-xl">
            <h4 className="font-headline font-bold text-lg mb-2">Honesty Reputation</h4>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-headline font-bold">{student.honestyScore}%</span>
            </div>
            <Progress value={student.honestyScore} className="h-1.5 bg-white/20 mb-4" />
            <p className="text-xs opacity-90 leading-relaxed">
              Your reputation is calculated based on clean assessment completions. Maintain your streak to boost this score.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
