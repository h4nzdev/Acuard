import { CheckCircle2, AlertTriangle, ShieldCheck, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-headline font-bold">Welcome back, Alex!</h2>
          <p className="text-muted-foreground">Keep up the honest work. Your streak is at 12 days.</p>
        </div>
        <Button asChild>
          <Link href="/student/assessments">View All Assessments</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-white/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Honesty Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold text-primary mb-2">98%</div>
            <Progress value={98} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Top 5% of your class</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-white/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Active Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold text-slate-800">0</div>
            <p className="text-xs text-muted-foreground mt-2">Zero warnings in the last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-white/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Honest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold text-accent">12</div>
            <p className="text-xs text-muted-foreground mt-2">Days of consistent integrity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Intro to Algorithms</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 2:45 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">Normal</p>
                <p className="text-xs text-muted-foreground">Integrity Risk</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">European History</p>
                  <p className="text-xs text-muted-foreground">March 12, 10:00 AM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">Normal</p>
                <p className="text-xs text-muted-foreground">Integrity Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Integrity Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground">
              AcademiaGuard works best when you focus on your work. Remember these tips:
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-700">
              <li>Minimize tab switching during exams.</li>
              <li>Avoid copy-pasting content from external sources.</li>
              <li>Maintain a steady typing pace.</li>
              <li>Stay in frame if camera monitoring is active.</li>
            </ul>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg mt-4">
              <p className="font-medium text-primary mb-1">Upcoming Assessment</p>
              <p className="text-xs mb-3">Modern Physics Midterm • Tomorrow, 11:30 AM</p>
              <Button size="sm" variant="outline" className="w-full">Set Reminder</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
