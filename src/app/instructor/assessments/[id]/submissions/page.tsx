"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Users,
  AlertTriangle,
  RefreshCcw,
  Eye,
  FileText,
  TrendingUp,
  Database
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSessions, getAssessments } from "@/lib/storage"
import { StudentSession, AnswerSimilarity } from "@/app/lib/mock-data"
import { analyzeAssessmentSimilarities, getSimilarityReport, getCompletedStudents } from "@/lib/answer-similarity"
import { seedMockSimilarityData } from "@/lib/seed-similarity-data"
import { cn } from "@/lib/utils"

export default function AssessmentSubmissions() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<any>(null)
  const [completedStudents, setCompletedStudents] = useState<StudentSession[]>([])
  const [similarityReport, setSimilarityReport] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null)

  useEffect(() => {
    const assessments = getAssessments()
    const found = assessments.find(a => a.id === params.id)
    setAssessment(found)

    loadSubmissions()
  }, [params.id])

  const loadSubmissions = () => {
    const sessions = getSessions()
    const completed = sessions.filter(
      s => s.assessmentId === params.id && s.status === 'Completed'
    )
    setCompletedStudents(completed)

    const report = getSimilarityReport(params.id as string)
    setSimilarityReport(report)
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    
    setTimeout(() => {
      analyzeAssessmentSimilarities(params.id as string, assessment?.questions || [])
      loadSubmissions()
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleSeedDemoData = () => {
    seedMockSimilarityData()
    loadSubmissions()
    alert("✅ Demo similarity data created! Check the Similarity Matches tab.")
  }

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'exact': return 'bg-red-500 text-white'
      case 'high-similarity': return 'bg-orange-500 text-white'
      case 'paraphrased': return 'bg-yellow-500 text-black'
      default: return 'bg-slate-500 text-white'
    }
  }

  const getSimilarityBadge = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-700 border-red-200'
    if (score >= 70) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  if (!assessment) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 pt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-bold text-slate-900">{assessment.title}</h1>
            <p className="text-muted-foreground">Submission Analysis & Similarity Detection</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSeedDemoData}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            Seed Demo Data
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="gap-2 bg-primary"
          >
            <RefreshCcw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
            {isAnalyzing ? 'Analyzing...' : 'AI Similarity Analysis'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{similarityReport?.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Students completed</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Flagged Pairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{similarityReport?.flaggedPairs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Similar answer patterns</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              High Risk Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{similarityReport?.highRiskMatches?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">&gt;80% similarity</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round((completedStudents.length / 30) * 100)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Of enrolled students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submissions">
            <FileText className="w-4 h-4 mr-2" />
            Completed Submissions
          </TabsTrigger>
          <TabsTrigger value="similarities">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Similarity Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Students Who Finished</CardTitle>
              <CardDescription>
                Real-time list of students who completed this assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {completedStudents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No submissions yet. Students haven't completed this assessment.</p>
                    </div>
                  ) : (
                    completedStudents.map((student, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                            student.riskScore === 'Normal' ? 'bg-green-500' :
                            student.riskScore === 'Suspicious' ? 'bg-yellow-500' : 'bg-red-500'
                          )}>
                            {student.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.studentName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                Score: {student.score}/{student.totalPossiblePoints}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {student.lastActive}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {student.similarityMatches && student.similarityMatches.length > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {student.similarityMatches.length} matches
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similarities" className="space-y-4">
          <Card className="shadow-lg border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-5 h-5" />
                Detected Similarities
              </CardTitle>
              <CardDescription>
                AI-analyzed answer matches between students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {similarityReport?.highRiskMatches?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-green-600 font-medium">No suspicious similarities detected</p>
                      <p className="text-sm mt-2">All submissions appear to be original work</p>
                    </div>
                  ) : (
                    similarityReport?.highRiskMatches?.map((match: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-destructive/5 rounded-lg border border-destructive/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <span className="font-bold text-slate-900">
                              {match.student1} ↔ {match.student2}
                            </span>
                          </div>
                          <Badge className={getSimilarityBadge(match.similarity)}>
                            {match.similarity}% Similar
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Matched Questions:</span>
                            <p className="font-bold text-slate-900">{match.questions}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Level:</span>
                            <p className="font-bold text-destructive">High</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recommendation:</span>
                            <p className="font-bold text-orange-600">Review Required</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Detail Dialog */}
      {selectedStudent && (
        <Card className="shadow-xl border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedStudent.studentName}'s Submission</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{selectedStudent.score}/{selectedStudent.totalPossiblePoints}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted At</p>
                <p className="text-lg font-medium">{selectedStudent.lastActive}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <Badge variant={selectedStudent.riskScore === 'Normal' ? 'default' : 'destructive'}>
                  {selectedStudent.riskScore}
                </Badge>
              </div>
            </div>

            {selectedStudent.similarityMatches && selectedStudent.similarityMatches.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Similarity Matches ({selectedStudent.similarityMatches.length})
                </h4>
                {selectedStudent.similarityMatches.map((match: AnswerSimilarity, idx: number) => (
                  <div key={idx} className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{match.matchedStudentName}</span>
                      <Badge className={getSimilarityBadge(match.similarityScore)}>
                        {match.similarityScore}% match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{match.matchType}</Badge>
                      <span className="text-muted-foreground">{match.matchedQuestions.length} questions matched</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{match.details}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
