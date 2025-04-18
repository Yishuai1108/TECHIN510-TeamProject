'use client'

import { useState, useEffect, useRef } from 'react'
import { FaceSmileIcon, MusicalNoteIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { MusicRecommendationService } from '@/services/musicRecommendation'

declare global {
  interface Window {
    faceapi: any;
  }
}

export default function Dashboard() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<string>('')
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFaceApiReady, setIsFaceApiReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const musicService = useRef<MusicRecommendationService | null>(null)
  const detectionInterval = useRef<number | null>(null)
  const isDetectingRef = useRef(false)

  useEffect(() => {
    console.log('Component mounted')
    
    // 加载 face-api.js
    const loadFaceApi = async () => {
      try {
        console.log('Loading face-api.js...')
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
        script.async = true
        
        script.onload = async () => {
          console.log('face-api.js loaded')
          try {
            if (!window.faceapi) {
              throw new Error('face-api.js not found in window object')
            }
            console.log('face-api.js found in window object')

            const modelPath = '/models'
            console.log('Loading models from:', modelPath)

            // 检查模型文件
            const modelFiles = [
              'tiny_face_detector_model-weights_manifest.json',
              'face_landmark_68_model-weights_manifest.json',
              'face_expression_model-weights_manifest.json'
            ]

            for (const file of modelFiles) {
              const response = await fetch(`${modelPath}/${file}`)
              if (!response.ok) {
                throw new Error(`Model file not found: ${file}`)
              }
              console.log(`Model file found: ${file}`)
            }

            // 加载模型
            console.log('Loading TinyFaceDetector model...')
            await window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)
            console.log('TinyFaceDetector model loaded')
            
            console.log('Loading FaceLandmark68Net model...')
            await window.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
            console.log('FaceLandmark68Net model loaded')
            
            console.log('Loading FaceExpressionNet model...')
            await window.faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
            console.log('FaceExpressionNet model loaded')
            
            console.log('All models loaded successfully')
            setIsFaceApiReady(true)
          } catch (error: any) {
            console.error('Error loading models:', error)
            setError(`Failed to load models: ${error.message}`)
          }
        }

        script.onerror = (error) => {
          console.error('Failed to load face-api.js:', error)
          setError('Failed to load face-api.js')
        }

        document.body.appendChild(script)
      } catch (error: any) {
        console.error('Error in loadFaceApi:', error)
        setError(`Failed to load face-api.js: ${error.message}`)
      }
    }

    loadFaceApi()
    musicService.current = new MusicRecommendationService()

    return () => {
      console.log('Component unmounting')
      if (detectionInterval.current) {
        cancelAnimationFrame(detectionInterval.current)
      }
    }
  }, [])

  const startDetection = async () => {
    console.log('Starting detection...')
    if (!videoRef.current) {
      console.error('Video element not found')
      return
    }
    
    if (!isFaceApiReady) {
      console.error('face-api.js not ready')
      setError('Face detection system is not ready yet. Please wait.')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)

      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      console.log('Camera access granted')
      
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      console.log('Video started playing')

      // 设置检测状态
      isDetectingRef.current = true
      setIsDetecting(true)

      const detectEmotion = async () => {
        if (!isDetectingRef.current || !videoRef.current || !canvasRef.current) {
          console.log('Detection stopped or elements not ready')
          return
        }
        
        try {
          // 设置画布尺寸
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
          
          // 将视频帧绘制到画布
          const ctx = canvasRef.current.getContext('2d')
          if (!ctx) {
            console.error('Failed to get canvas context')
            return
          }
          
          ctx.drawImage(videoRef.current, 0, 0)
          
          // 使用画布进行检测
          console.log('Detecting face...')
          const detections = await window.faceapi.detectSingleFace(
            canvasRef.current,
            new window.faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceExpressions()

          if (detections) {
            console.log('Face detected:', detections)
            if (detections.expressions) {
              const expressions = detections.expressions as Record<string, number>
              console.log('Raw expressions:', expressions)
              
              // 情绪名称映射
              const emotionMap: { [key: string]: string } = {
                happy: 'happy',
                sad: 'sad',
                angry: 'angry',
                surprised: 'surprised',
                fearful: 'fearful',
                disgusted: 'disgusted',
                neutral: 'neutral'
              }

              let maxEmotion = ''
              let maxValue = 0

              for (const [emotion, value] of Object.entries(expressions)) {
                console.log(`Checking emotion: ${emotion}, value: ${value}`)
                if (value > maxValue) {
                  maxValue = value
                  maxEmotion = emotion
                }
              }

              console.log('Max emotion:', maxEmotion, 'with value:', maxValue)

              if (maxEmotion && maxValue > 0.5) {
                const mappedEmotion = emotionMap[maxEmotion] || 'neutral'
                console.log('Mapped emotion:', mappedEmotion)
                setCurrentEmotion(mappedEmotion)
                const tracks = await musicService.current?.getRecommendations(mappedEmotion)
                setRecommendations(tracks || [])
              } else {
                console.log('No emotion detected with sufficient confidence')
                setCurrentEmotion('Not Detected')
              }
            } else {
              console.log('No expressions detected')
              setCurrentEmotion('Not Detected')
            }
          } else {
            console.log('No face detected')
            setCurrentEmotion('Not Detected')
          }
        } catch (error: any) {
          console.error('Error in detectEmotion:', error)
          setError(`Error in emotion detection: ${error.message}`)
        }
        
        if (isDetectingRef.current) {
          detectionInterval.current = requestAnimationFrame(detectEmotion)
        }
      }
      
      // 启动检测循环
      detectEmotion()
    } catch (error: any) {
      console.error('Error in startDetection:', error)
      setError(`Failed to start detection: ${error.message}`)
      setIsDetecting(false)
      isDetectingRef.current = false
    } finally {
      setIsLoading(false)
    }
  }

  const stopDetection = () => {
    console.log('Stopping detection...')
    isDetectingRef.current = false
    setIsDetecting(false)
    if (detectionInterval.current) {
      cancelAnimationFrame(detectionInterval.current)
      detectionInterval.current = null
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Emotion Detection Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaceSmileIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Emotion Detection</h2>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <button
                onClick={isDetecting ? stopDetection : startDetection}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  isDetecting ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                disabled={isLoading || !isFaceApiReady}
              >
                {isLoading ? 'Loading...' : isDetecting ? 'Stop Detection' : 'Start Detection'}
              </button>
            </div>
            
            <div className="flex flex-col justify-center items-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Current Emotion</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {currentEmotion || 'Not Detected'}
              </p>
            </div>
          </div>
        </div>

        {/* Music Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MusicalNoteIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Music Recommendations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((track) => (
              <div
                key={track.id}
                className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedTrack(track)}
              >
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full rounded-lg mb-2"
                />
                <h3 className="font-medium">{track.title}</h3>
                <p className="text-sm text-gray-600">{track.artist}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Emotion History</h2>
          </div>
          
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Emotion trend chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
} 