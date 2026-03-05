"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ShieldAlert, 
  Camera, 
  Users, 
  Eye, 
  Smartphone, 
  Trash2,
  Maximize2,
  X
} from "lucide-react"
import { CollaboratorDetection } from "@/app/lib/mock-data"
import { cn } from "@/lib/utils"
import { useState, ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CollaboratorAlertsProps {
  detections: CollaboratorDetection[]
  onClear?: () => void
  title?: ReactNode
}

const getTypeIcon = (type: CollaboratorDetection['type']) => {
  switch (type) {
    case 'multiple-faces':
      return <Users className="w-4 h-4" />
    case 'looking-off-screen':
      return <Eye className="w-4 h-4" />
    case 'phone-detected':
      return <Smartphone className="w-4 h-4" />
    default:
      return <ShieldAlert className="w-4 h-4" />
  }
}

const getTypeColor = (type: CollaboratorDetection['type']) => {
  switch (type) {
    case 'multiple-faces':
      return 'bg-red-500'
    case 'looking-off-screen':
      return 'bg-yellow-500'
    case 'phone-detected':
      return 'bg-orange-500'
    default:
      return 'bg-red-500'
  }
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-600'
  if (confidence >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

export function CollaboratorAlerts({ 
  detections, 
  onClear,
  title = "Collaborator Detection"
}: CollaboratorAlertsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!detections || detections.length === 0) {
    return null
  }

  return (
    <>
      <Card className="border-destructive/50 bg-destructive/5 ring-1 ring-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              {title}
              <Badge variant="destructive" className="ml-2">
                {detections.length}
              </Badge>
            </CardTitle>
            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-3">
              {detections.map((detection, idx) => (
                <div
                  key={detection.id}
                  className="group relative flex gap-4 p-3 bg-white rounded-lg border border-destructive/20 hover:border-destructive/40 transition-colors"
                >
                  {/* Screenshot Thumbnail */}
                  <div 
                    className="relative w-32 h-24 shrink-0 rounded-md overflow-hidden cursor-pointer border-2 border-slate-200"
                    onClick={() => setSelectedImage(detection.screenshot)}
                  >
                    <img
                      src={detection.screenshot}
                      alt="Detection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Detection Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-full text-white",
                          getTypeColor(detection.type)
                        )}>
                          {getTypeIcon(detection.type)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">
                            {detection.studentName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ID: {detection.studentId}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-bold",
                          getConfidenceColor(detection.confidence)
                        )}
                      >
                        {detection.confidence}% match
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-700 leading-snug">
                      {detection.reason}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400">
                        {detection.timestamp}
                      </p>
                      <Badge variant="secondary" className="text-[9px] uppercase">
                        {detection.type.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Full-size Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detection Screenshot</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full detection"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
