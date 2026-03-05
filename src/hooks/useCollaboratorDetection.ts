"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { CollaboratorDetection } from '@/app/lib/mock-data'

// Simple face detection using MediaPipe (loaded via CDN)
// For hackathon demo: primarily uses mock data with optional real detection

interface UseCollaboratorDetectionOptions {
  studentId: string
  studentName: string
  enabled?: boolean
  useRealDetection?: boolean // Set to true for actual webcam detection
}

export function useCollaboratorDetection({
  studentId,
  studentName,
  enabled = true,
  useRealDetection = false
}: UseCollaboratorDetectionOptions) {
  const [detections, setDetections] = useState<CollaboratorDetection[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionInterval = useRef<NodeJS.Timeout | null>(null)
  const faceDetectionRef = useRef<any>(null)

  // Mock detections for demo reliability
  const getMockDetections = useCallback((): CollaboratorDetection[] => {
    const now = new Date()
    return [
      {
        id: `cd-${Date.now()}-1`,
        screenshot: 'https://placehold.co/400x300/1e293b/ffffff?text=Multiple+Faces+Detected',
        studentName: studentName,
        studentId: studentId,
        reason: 'Multiple faces detected in frame',
        timestamp: now.toLocaleString(),
        confidence: 94,
        type: 'multiple-faces'
      },
      {
        id: `cd-${Date.now()}-2`,
        screenshot: 'https://placehold.co/400x300/1e293b/ffffff?text=Looking+Off-Screen',
        studentName: studentName,
        studentId: studentId,
        reason: 'Student looking off-screen for extended period',
        timestamp: now.toLocaleString(),
        confidence: 87,
        type: 'looking-off-screen'
      }
    ]
  }, [studentId, studentName])

  // Initialize MediaPipe Face Detection (loaded via CDN)
  const initializeMediaPipe = useCallback(async () => {
    if (!useRealDetection) return

    try {
      // Load MediaPipe from CDN
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js'
      script.async = true
      
      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      // @ts-ignore - MediaPipe global
      if (window.FaceDetection) {
        // @ts-ignore
        faceDetectionRef.current = new window.FaceDetection({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
          }
        })

        // @ts-ignore
        faceDetectionRef.current.setOptions({
          model: 'short',
          minDetectionConfidence: 0.7
        })

        // @ts-ignore
        faceDetectionRef.current.onResults(onDetectionResults)
      }
    } catch (error) {
      console.error('Failed to load MediaPipe:', error)
      setCameraError('Failed to load detection model')
    }
  }, [useRealDetection])

  // Process detection results
  const onDetectionResults = useCallback((results: any) => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check for multiple faces
    if (results.detections && results.detections.length > 1) {
      const newDetection: CollaboratorDetection = {
        id: `cd-${Date.now()}`,
        screenshot: canvas.toDataURL('image/jpeg', 0.8),
        studentName: studentName,
        studentId: studentId,
        reason: `${results.detections.length} faces detected - possible collaborator`,
        timestamp: new Date().toLocaleString(),
        confidence: Math.round(results.detections[0].score * 100),
        type: 'multiple-faces'
      }
      
      setDetections(prev => [newDetection, ...prev].slice(0, 10)) // Keep last 10
    }

    // Draw landmarks for visualization
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
  }, [studentId, studentName])

  // Start camera and detection
  const startDetection = useCallback(async () => {
    if (!useRealDetection) {
      // Use mock data for demo
      setIsDetecting(true)
      setDetections(getMockDetections())
      return
    }

    try {
      setIsDetecting(true)
      setCameraError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })

      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        if (faceDetectionRef.current) {
          // Run detection every 2 seconds
          detectionInterval.current = setInterval(async () => {
            if (videoRef.current && faceDetectionRef.current) {
              await faceDetectionRef.current.send({ image: videoRef.current })
            }
          }, 2000)
        }
      }
    } catch (error: any) {
      console.error('Camera error:', error)
      setCameraError(error.message || 'Camera access denied')
      setIsDetecting(false)
    }
  }, [useRealDetection, getMockDetections])

  // Stop camera and detection
  const stopDetection = useCallback(() => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current)
      detectionInterval.current = null
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }

    setIsDetecting(false)
  }, [])

  // Capture manual screenshot
  const captureScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Add manual detection
  const addManualDetection = useCallback((type: CollaboratorDetection['type'], reason: string) => {
    const screenshot = captureScreenshot() || 'https://placehold.co/400x300/1e293b/ffffff?text=Manual+Capture'
    
    const newDetection: CollaboratorDetection = {
      id: `cd-${Date.now()}`,
      screenshot,
      studentName: studentName,
      studentId: studentId,
      reason,
      timestamp: new Date().toLocaleString(),
      confidence: 100,
      type
    }

    setDetections(prev => [newDetection, ...prev])
  }, [studentId, studentName, captureScreenshot])

  // Clear all detections
  const clearDetections = useCallback(() => {
    setDetections([])
  }, [])

  useEffect(() => {
    if (enabled && useRealDetection) {
      initializeMediaPipe()
    }
  }, [enabled, useRealDetection, initializeMediaPipe])

  useEffect(() => {
    if (enabled) {
      startDetection()
    }

    return () => {
      stopDetection()
    }
  }, [enabled, startDetection, stopDetection])

  return {
    detections,
    isDetecting,
    cameraError,
    hasPermission,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    captureScreenshot,
    addManualDetection,
    clearDetections
  }
}
