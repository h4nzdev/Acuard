import Link from "next/link"
import { FileText, Clock, ChevronRight, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_ASSESSMENTS } from "@/lib/mock-data"

export default function StudentAssessments() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold">Available Assessments</h2>
        <p className="text-muted-foreground">Select an assessment to begin. Ensure you are in a quiet environment.</p>
      </div>

      <div className="grid gap-6">
        {MOCK_ASSESSMENTS.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">{assessment.title}</CardTitle>
                </div>
                <CardDescription className="max-w-xl text-slate-600">
                  {assessment.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                {assessment.policy}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {assessment.durationMinutes} Minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  Monitoring Active
                </div>
              </div>
              <Button asChild>
                <Link href={`/student/assessments/${assessment.id}`} className="gap-2">
                  Begin Assessment
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
        <h3 className="text-lg font-headline font-bold text-primary mb-2">Before you start...</h3>
        <p className="text-sm text-muted-foreground mb-4">
          By starting an assessment, you acknowledge that AcademiaGuard will monitor your writing style and browser activity to maintain academic integrity.
        </p>
        <ul className="grid md:grid-cols-2 gap-4 text-sm font-medium">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Check your internet connection
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Ensure your writing baseline is completed
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Close unnecessary tabs and applications
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Verify you have the required materials
          </li>
        </ul>
      </div>
    </div>
  )
}

function Badge({ children, className, variant }: any) {
  return (
    <div className={`px-2 py-1 rounded text-xs ${className}`}>
      {children}
    </div>
  )
}
