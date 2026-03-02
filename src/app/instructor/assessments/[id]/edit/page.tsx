"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { 
  FilePlus, 
  Shield, 
  MousePointer2, 
  AlertCircle, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Loader2,
  FileText,
  Copy,
  CheckCircle2,
  ListTodo
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { getAssessments, updateAssessment } from "@/lib/storage"
import { Assessment, Question } from "@/app/lib/mock-data"
import { extractQuestionsFromImage } from "@/ai/flows/ocr-questions-flow"
import { cn } from "@/lib/utils"

function EditAssessmentForm() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [defaultTab] = useState(searchParams.get('tab') || 'details')

  // Configuration State
  const [policy, setPolicy] = useState<'Not Allowed' | 'Allowed but Monitored' | 'Fully Allowed'>('Allowed but Monitored')
  const [title, setTitle] = useState("")
  const [instructions, setInstructions] = useState("")
  const [duration, setDuration] = useState("60")

  // Questionnaire State
  const [questions, setQuestions] = useState<Question[]>([])
  const [isOcrLoading, setIsOcrLoading] = useState(false)

  useEffect(() => {
    const assessments = getAssessments()
    const found = assessments.find(a => a.id === params.id)
    if (found) {
      setTitle(found.title)
      setInstructions(found.description)
      setPolicy(found.policy as any)
      setDuration(found.durationMinutes.toString())
      setQuestions(found.questions || [])
      setIsLoaded(true)
    } else {
      toast({
        title: "Not Found",
        description: "Assessment could not be loaded.",
        variant: "destructive"
      })
      router.push('/instructor/assessments')
    }
  }, [params.id, router])

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      points: 10,
      type: 'Questionnaire',
      allowCopyPaste: false,
      correctAnswer: "",
      choices: ["", "", "", ""],
      choiceType: 'True/False'
    }
    setQuestions([...questions, newQuestion])
  }

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...updates }
        if (updated.type === 'Multiple Choice' && !updated.choices) {
          updated.choices = ["", "", "", ""]
          updated.choiceType = updated.choiceType || 'True/False'
        }
        return updated
      }
      return q
    }))
  }

  const handleChoiceUpdate = (qId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.choices) {
        const newChoices = [...q.choices]
        newChoices[index] = value
        return { ...q, choices: newChoices }
      }
      return q
    }))
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsOcrLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      try {
        const result = await extractQuestionsFromImage({ photoDataUri: base64 })
        const ocrQuestions = result.questions.map(q => ({
          id: Math.random().toString(36).substr(2, 9),
          text: q.text,
          points: q.points,
          type: 'Questionnaire' as const,
          allowCopyPaste: false,
          correctAnswer: ""
        }))
        setQuestions([...questions, ...ocrQuestions])
        toast({
          title: "OCR Success",
          description: `Extracted ${ocrQuestions.length} questions from the image.`
        })
      } catch (err) {
        toast({
          title: "OCR Failed",
          description: "Could not extract text from the image.",
          variant: "destructive"
        })
      } finally {
        setIsOcrLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!title) {
      toast({
        title: "Missing Information",
        description: "Please enter an assessment title.",
        variant: "destructive"
      })
      return
    }

    const incompleteQuestion = questions.find(q => {
      if (!q.text || !q.correctAnswer) return true
      if (q.type === 'Multiple Choice') {
        if (q.choiceType === 'Custom' && q.choices?.some(c => !c)) return true
      }
      return false
    })

    if (incompleteQuestion) {
      toast({
        title: "Incomplete Questions",
        description: "Every question must have a question text and a final correct answer. Check Multiple Choice options.",
        variant: "destructive"
      })
      return
    }

    const updated: Assessment = {
      id: params.id as string,
      title,
      description: instructions,
      policy: policy as any,
      durationMinutes: parseInt(duration),
      questions: questions.map(q => ({
        ...q,
        allowCopyPaste: policy === 'Not Allowed' ? false : q.allowCopyPaste
      }))
    }

    updateAssessment(updated)

    toast({
      title: "Assessment Updated",
      description: "Changes have been saved successfully."
    })
    router.push(`/instructor/assessments/${params.id}`)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center border-b pb-6 pt-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold">Edit Assessment</h2>
            <p className="text-muted-foreground">Modify assessment configuration and questions.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.back()}><X className="w-4 h-4 mr-2" /> Cancel</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 shadow-md"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-white border">
          <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            1. Details & Policies
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            2. Questionnaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline">Activity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assessment Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Modern Physics Midterm" 
                      className="h-11" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea 
                      id="instructions" 
                      placeholder="Enter instructions for students..." 
                      className="min-h-[150px]" 
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (Minutes)</Label>
                      <Input 
                        id="duration" 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)}
                      />
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
                    <RadioGroup 
                      value={policy} 
                      onValueChange={(val) => setPolicy(val as any)} 
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <RadioGroupItem value="Not Allowed" id="not-allowed" className="sr-only" />
                        <Label
                          htmlFor="not-allowed"
                          className={cn(
                            "flex flex-col items-center justify-center w-full rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-slate-50",
                            policy === 'Not Allowed' ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"
                          )}
                        >
                          <X className="mb-3 h-6 w-6 text-destructive" />
                          <span className="text-xs font-bold uppercase">Disallowed</span>
                        </Label>
                      </div>

                      <div className="flex flex-col items-center">
                        <RadioGroupItem value="Allowed but Monitored" id="monitored" className="sr-only" />
                        <Label
                          htmlFor="monitored"
                          className={cn(
                            "flex flex-col items-center justify-center w-full rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-slate-50",
                            policy === 'Allowed but Monitored' ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"
                          )}
                        >
                          <Shield className="mb-3 h-6 w-6 text-primary" />
                          <span className="text-xs font-bold uppercase">Monitored</span>
                        </Label>
                      </div>

                      <div className="flex flex-col items-center">
                        <RadioGroupItem value="Fully Allowed" id="allowed" className="sr-only" />
                        <Label
                          htmlFor="allowed"
                          className={cn(
                            "flex flex-col items-center justify-center w-full rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-slate-50",
                            policy === 'Fully Allowed' ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"
                          )}
                        >
                          <MousePointer2 className="mb-3 h-6 w-6 text-green-600" />
                          <span className="text-xs font-bold uppercase">Fully Allowed</span>
                        </Label>
                      </div>
                    </RadioGroup>
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
                  <div className="flex justify-between text-xs font-medium pb-2">
                    <span>Notify Instructor</span>
                    <span>Immediate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-headline">Assessment Questions</CardTitle>
                    <CardDescription>Modify assessment questions.</CardDescription>
                  </div>
                  <Button onClick={handleAddQuestion} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Question
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
                      <FilePlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No questions added yet.</p>
                    </div>
                  ) : (
                    questions.map((q, index) => (
                      <div key={q.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Question {index + 1}</Label>
                            <Textarea 
                              placeholder="Type your question here..." 
                              value={q.text}
                              onChange={(e) => handleUpdateQuestion(q.id, { text: e.target.value })}
                              className="min-h-[80px]"
                            />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(q.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {q.type === 'Multiple Choice' && (
                          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs uppercase font-bold text-slate-500">Choice Settings</Label>
                              <RadioGroup 
                                value={q.choiceType} 
                                onValueChange={(val) => handleUpdateQuestion(q.id, { choiceType: val as any })}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="True/False" id={`edit-choice-tf-${q.id}`} />
                                  <Label htmlFor={`edit-choice-tf-${q.id}`} className="text-xs font-bold cursor-pointer">True / False</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Custom" id={`edit-choice-custom-${q.id}`} />
                                  <Label htmlFor={`edit-choice-custom-${q.id}`} className="text-xs font-bold cursor-pointer">4 Custom Labels</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            
                            {q.choiceType === 'Custom' && (
                              <div className="grid grid-cols-1 gap-3">
                                {(q.choices || ["", "", "", ""]).map((choice, cIdx) => (
                                  <div key={cIdx} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                      {String.fromCharCode(65 + cIdx)}
                                    </div>
                                    <Input 
                                      placeholder={`Choice ${String.fromCharCode(65 + cIdx)} content...`}
                                      value={choice}
                                      onChange={(e) => handleChoiceUpdate(q.id, cIdx, e.target.value)}
                                      className="h-9"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.choiceType === 'True/False' && (
                              <div className="text-sm font-medium text-slate-500 italic p-2 border border-dashed rounded bg-slate-100/50">
                                Options will be fixed as "True" and "False".
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-bold text-primary flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Final Correct Answer
                          </Label>
                          {q.type === 'Multiple Choice' ? (
                            <RadioGroup 
                              value={q.correctAnswer} 
                              onValueChange={(val) => handleUpdateQuestion(q.id, { correctAnswer: val })}
                              className="flex flex-wrap gap-4"
                            >
                              {q.choiceType === 'True/False' ? (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="True" id={`edit-correct-true-${q.id}`} />
                                    <Label htmlFor={`edit-correct-true-${q.id}`} className="text-xs font-medium">True</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="False" id={`edit-correct-false-${q.id}`} />
                                    <Label htmlFor={`edit-correct-false-${q.id}`} className="text-xs font-medium">False</Label>
                                  </div>
                                </>
                              ) : (
                                [0, 1, 2, 3].map((idx) => {
                                  const label = String.fromCharCode(65 + idx)
                                  const value = q.choices?.[idx] || label
                                  return (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <RadioGroupItem value={value} id={`edit-correct-${q.id}-${idx}`} disabled={!value} />
                                      <Label htmlFor={`edit-correct-${q.id}-${idx}`} className="text-xs font-medium">{label}</Label>
                                    </div>
                                  )
                                })
                              )}
                            </RadioGroup>
                          ) : (
                            <Textarea 
                              placeholder="Enter the correct reference answer for this question..." 
                              value={q.correctAnswer}
                              onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value })}
                              className="min-h-[80px] border-primary/20 focus-visible:ring-primary"
                            />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                          <div className="space-y-3">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Response Type</Label>
                            <RadioGroup 
                              value={q.type} 
                              onValueChange={(val) => handleUpdateQuestion(q.id, { type: val as any })}
                              className="flex flex-wrap gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Questionnaire" id={`edit-q-type-q-${q.id}`} />
                                <Label htmlFor={`edit-q-type-q-${q.id}`} className="font-medium cursor-pointer">Questionnaire</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Text Area" id={`edit-q-type-t-${q.id}`} />
                                <Label htmlFor={`edit-q-type-t-${q.id}`} className="font-medium cursor-pointer">Text Area</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Multiple Choice" id={`edit-q-type-m-${q.id}`} />
                                <Label htmlFor={`edit-q-type-m-${q.id}`} className="font-medium cursor-pointer flex items-center gap-1.5">
                                  <ListTodo className="w-3.5 h-3.5" /> Multiple Choice
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-muted-foreground">Points</Label>
                              <Input 
                                type="number" 
                                value={q.points}
                                onChange={(e) => handleUpdateQuestion(q.id, { points: parseInt(e.target.value) })}
                                className="h-9 w-24"
                              />
                            </div>
                            
                            <div className="flex items-center gap-3 pt-6">
                              <div className={cn(
                                "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200",
                                policy === 'Not Allowed' ? "bg-slate-100 opacity-50 cursor-not-allowed" : "bg-slate-50"
                              )}>
                                <Checkbox 
                                  id={`edit-copy-paste-${q.id}`} 
                                  checked={policy === 'Not Allowed' ? false : q.allowCopyPaste}
                                  onCheckedChange={(checked) => handleUpdateQuestion(q.id, { allowCopyPaste: !!checked })}
                                  disabled={policy === 'Not Allowed'}
                                />
                                <Label 
                                  htmlFor={`edit-copy-paste-${q.id}`}
                                  className={cn(
                                    "text-xs font-bold flex items-center gap-1.5",
                                    policy === 'Not Allowed' ? "cursor-not-allowed" : "cursor-pointer"
                                  )}
                                >
                                  <Copy className="w-3 h-3" /> Allow Paste
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-accent/20 bg-accent/[0.02]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-accent" />
                    <CardTitle className="text-lg font-headline">Smart OCR Import</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    onClick={() => !isOcrLoading && fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                      isOcrLoading ? "bg-slate-100 opacity-50" : "hover:bg-accent/[0.05] hover:border-accent/40 border-muted-foreground/20"
                    )}
                  >
                    {isOcrLoading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
                        <p className="text-sm font-medium">Extracting Questions...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="text-sm font-bold">Upload Assessment Photo</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      disabled={isOcrLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function EditAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <EditAssessmentForm />
    </Suspense>
  )
}
