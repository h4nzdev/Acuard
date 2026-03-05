
"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  Eye,
  ShieldAlert,
  MoreVertical,
  RefreshCw,
  Filter,
  Search,
  Inbox,
  Trash2,
  ExternalLink,
  Unlock,
  CheckCircle2,
  Bell,
  Camera,
  Video,
  Users,
  User,
  Info,
  Shield
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getSessions, deleteSession, updateSession, getAssessments } from "@/lib/storage"
import { StudentSession, CollaboratorDetection } from "@/app/lib/mock-data"
import { toast } from "@/hooks/use-toast"
import { getCompletedStudents, getSimilarityReport } from "@/lib/answer-similarity"

// Get collaborator detections from localStorage
const getCollaboratorDetections = (): CollaboratorDetection[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('ag_collaborator_detections')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch (e) {
    return []
  }
}

export default function LiveMonitoring() {
  const [sessions, setSessions] = useState<StudentSession[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [recentCompletions, setRecentCompletions] = useState<StudentSession[]>([])
  const [collaboratorDetections, setCollaboratorDetections] = useState<CollaboratorDetection[]>([])
  const [activeTab, setActiveTab] = useState<"list" | "camera">("list")
  
  // Camera feed state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [selectedStudentForCamera, setSelectedStudentForCamera] = useState<string>("")
  
  // Mock students for demo grid
  const mockStudents = [
    { id: "demo-1", name: "Alex Chen", status: "Taking Assessment", avatar: "A" },
    { id: "demo-2", name: "Jordan Smith", status: "Taking Assessment", avatar: "J" },
    { id: "demo-3", name: "Sarah Johnson", status: "Taking Assessment", avatar: "S" },
    { id: "demo-4", name: "Mike Brown", status: "Taking Assessment", avatar: "M" },
    { id: "demo-5", name: "Emily Davis", status: "Taking Assessment", avatar: "E" },
    { id: "demo-6", name: "Chris Wilson", status: "Taking Assessment", avatar: "C" },
  ]

  useEffect(() => {
    loadSessions()
    setIsMounted(true)
    
    // Initialize camera for demo
    initCamera()
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      setCameraStream(stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Set first mock student as the one with camera
      setSelectedStudentForCamera("demo-1")
    } catch (error) {
      console.error("Camera initialization failed:", error)
    }
  }

  const loadSessions = () => {
    const allSessions = getSessions()
    setSessions(allSessions)
    
    // Load recent completions for notifications
    const assessments = getAssessments()
    const completions: StudentSession[] = []
    assessments.forEach(a => {
      const completed = getCompletedStudents(a.id)
      completions.push(...completed.slice(0, 3)) // Last 3 per assessment
    })
    setRecentCompletions(completions.sort((a, b) => b.lastActive.localeCompare(a.lastActive)).slice(0, 5))
    
    // Load collaborator detections
    const detections = getCollaboratorDetections()
    setCollaboratorDetections(detections.slice(0, 10)) // Show last 10 detections
  }

  const refreshFeed = () => {
    loadSessions()
  }

  const handleDelete = (studentId: string) => {
    deleteSession(studentId)
    loadSessions()
    toast({
      title: "Session Removed",
      description: "The student session has been cleared from the live feed.",
    })
  }

  const handleUnlock = (session: StudentSession) => {
    const updated: StudentSession = {
      ...session,
      status: 'In Progress',
      warningCount: 0,
      riskScore: 'Normal',
      lastActive: new Date().toLocaleTimeString()
    }
    updateSession(updated)
    loadSessions()
    toast({
      title: "Session Unlocked",
      description: `Access for ${session.studentName} has been restored.`,
    })
  }

  const filteredSessions = sessions.filter(s =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isMounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">Live Monitoring Feed</h2>
          <p className="text-muted-foreground">Real-time oversight of current assessments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={refreshFeed}>
            <RefreshCw className="w-4 h-4" />
            Refresh Feed
          </Button>
          <Button className="gap-2 bg-primary">
            <ShieldAlert className="w-4 h-4" />
            Active Incident Mode
          </Button>
        </div>
      </div>

      {/* Recent Completions Notification */}
      {recentCompletions.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Bell className="w-5 h-5" />
              Recent Submissions
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                {recentCompletions.length} new
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {recentCompletions.map((student, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-white text-slate-700 border-green-200 py-2 px-3 gap-2"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span className="font-medium">{student.studentName}</span>
                  <span className="text-xs text-muted-foreground">finished {student.assessmentTitle}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaborator Detections */}
      {collaboratorDetections.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Camera className="w-5 h-5" />
              Collaborator Detections
              <Badge variant="destructive" className="ml-2">
                {collaboratorDetections.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="flex gap-4">
                {collaboratorDetections.map((detection, idx) => (
                  <div
                    key={idx}
                    className="min-w-[200px] bg-white rounded-lg border border-destructive/20 overflow-hidden"
                  >
                    <img
                      src={detection.screenshot}
                      alt="Detection"
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3 space-y-1">
                      <p className="font-bold text-sm text-slate-900">{detection.studentName}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{detection.reason}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px]">
                          {detection.confidence}% match
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{detection.timestamp.split(' ')[1]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students or assessments..."
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="gap-2 h-11 border">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Tabs for List View and Camera Grid */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "list" | "camera")} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="gap-2">
            <Users className="w-4 h-4" />
            Student List
          </TabsTrigger>
          <TabsTrigger value="camera" className="gap-2">
            <Video className="w-4 h-4" />
            Live Camera Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            {filteredSessions.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold py-5 text-xs uppercase tracking-wider">Student</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Assessment</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Risk Score</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Warnings</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={`${session.studentId}-${session.assessmentId}`} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-5">
                    <Link href={`/instructor/monitoring/${session.studentId}`} className="group">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{session.studentName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">ID: {session.studentId}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-600">{session.assessmentTitle}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge score={session.riskScore} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${session.warningCount >= 2 ? 'text-destructive' : 'text-slate-600'}`}>
                        {session.warningCount}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= session.warningCount ? 'bg-destructive' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {session.status === 'Locked' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUnlock(session)}
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 font-bold gap-1.5"
                          title="Unlock Session"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Unlock
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="icon" title="View Analytics" asChild>
                        <Link href={`/instructor/monitoring/${session.studentId}`}>
                          <Eye className="w-4 h-4 text-primary" />
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/instructor/monitoring/${session.studentId}`} className="gap-2 cursor-pointer">
                              <ExternalLink className="w-4 h-4" /> View Analytics
                            </Link>
                          </DropdownMenuItem>
                          
                          {session.status === 'Locked' && (
                            <DropdownMenuItem 
                              className="gap-2 text-green-600 focus:text-green-700 cursor-pointer"
                              onClick={() => handleUnlock(session)}
                            >
                              <Unlock className="w-4 h-4" /> Unlock Session
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => handleDelete(session.studentId)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete Session
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="p-4 bg-slate-50 rounded-full">
              <Inbox className="w-12 h-12 text-slate-300" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-lg font-bold text-slate-900">No active sessions</h3>
              <p className="text-sm text-muted-foreground">When students start their assessments, they will appear in this real-time feed.</p>
            </div>
            <Button variant="outline" onClick={refreshFeed}>
              Check for new sessions
            </Button>
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Live Proctoring Grid
              </CardTitle>
              <CardDescription>
                Real-time camera feeds from students taking assessments. <Badge variant="outline" className="ml-2">Demo Mode</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {/* First student - REAL CAMERA FEED */}
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-primary shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-bold text-sm">{mockStudents[0].name}</span>
                      </div>
                      <Badge className="bg-primary text-white">
                        <Camera className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                    </div>
                    <p className="text-white/80 text-xs mt-1">{mockStudents[0].status}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="destructive" className="gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Monitoring
                    </Badge>
                  </div>
                </div>

                {/* Other students - MOCK FEEDS */}
                {mockStudents.slice(1).map((student, idx) => (
                  <div key={student.id} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                    {/* Mock video placeholder */}
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <div className="w-20 h-20 rounded-full bg-slate-300 flex items-center justify-center mb-3">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.status}</p>
                      </div>
                    </div>
                    
                    {/* Status overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-white font-bold text-sm">{student.name}</span>
                        </div>
                        <Badge variant="outline" className="bg-white/90 text-slate-700">
                          <Camera className="w-3 h-3 mr-1" />
                          Waiting
                        </Badge>
                      </div>
                      <p className="text-white/80 text-xs mt-1">{student.status}</p>
                    </div>
                    
                    {/* Corner badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Monitoring
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info banner */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Demo Mode Active</p>
                    <p className="text-xs text-blue-700 mt-1">
                      The first student shows the real camera feed from your device. Other students display mock placeholders for demonstration purposes. In production, all students would have live camera feeds.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'In Progress': 'bg-primary/10 text-primary border-primary/20',
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Flagged': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Locked': 'bg-destructive/10 text-destructive border-destructive/20'
  }
  return (
    <Badge variant="outline" className={`${styles[status]} font-bold text-[10px] uppercase tracking-wider`}>
      {status}
    </Badge>
  )
}

function RiskBadge({ score }: { score: string }) {
  const styles: any = {
    'Normal': 'bg-green-500',
    'Suspicious': 'bg-yellow-500',
    'Highly Suspicious': 'bg-destructive'
  }
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${styles[score]}`} />
      <span className="text-xs font-bold text-slate-600">{score}</span>
    </div>
  )
}
