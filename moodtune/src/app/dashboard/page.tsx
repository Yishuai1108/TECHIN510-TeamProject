'use client'

import { useState, useEffect, useRef } from 'react'
import { FaceSmileIcon, MusicalNoteIcon, ChartBarIcon } from '@heroicons/react/24/outline'

// 定义情绪类型
type Emotion = 'happy' | 'sad' | 'angry' | 'neutral' | 'surprised' | 'fear' | 'disgust'

export default function Dashboard() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null)
  const [emotionProbabilities, setEmotionProbabilities] = useState<Record<string, number> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const detectionInterval = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 使用 WebSocket 替代轮询
  const ws = new WebSocket('ws://localhost:3000/ws/emotion')
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    setCurrentEmotion(data.emotion)
    setEmotionProbabilities(data.probabilities)
  }

  // 开始情绪检测
  const startDetection = async () => {
    try {
      // 请求摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsDetecting(true)

        // 定期调用情绪检测 API
        detectionInterval.current = setInterval(async () => {
          try {
            setIsLoading(true)
            const response = await fetch('/api/emotion', {
              method: 'POST'
            })
            const data = await response.json()
            
            if (data.result && !data.result.error) {
              setCurrentEmotion(data.result.emotion)
              setEmotionProbabilities(data.result.probabilities)
            }
          } catch (error) {
            console.error('Error detecting emotion:', error)
          } finally {
            setIsLoading(false)
          }
        }, 1000) // 每秒检测一次
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  // 停止情绪检测
  const stopDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current)
      detectionInterval.current = null
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setIsDetecting(false)
    setCurrentEmotion(null)
    setEmotionProbabilities(null)
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current)
      }
    }
  }, [])

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 情绪检测区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FaceSmileIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-indigo-900">Emotion Detection</h2>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute w-full h-full object-cover rounded-lg"
              style={{ display: isDetecting ? 'block' : 'none' }}
            />
            {!isDetecting ? (
              <button
                onClick={startDetection}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Start Detection
              </button>
            ) : (
              <button
                onClick={stopDetection}
                className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Stop Detection
              </button>
            )}
          </div>
          {currentEmotion && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-lg font-medium text-indigo-900">
                Current Emotion: {currentEmotion}
              </p>
              {emotionProbabilities && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Emotion Probabilities:</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(emotionProbabilities).map(([emotion, probability]) => (
                      <div key={emotion} className="flex justify-between">
                        <span className="text-sm text-gray-600">{emotion}:</span>
                        <span className="text-sm font-medium text-indigo-600">
                          {((probability as number) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 音乐推荐区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <MusicalNoteIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-indigo-900">Music Recommendations</h2>
          </div>
          {currentEmotion ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Based on your current mood, we recommend:
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-500">Music player will appear here</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Please start emotion detection first</p>
            </div>
          )}
        </div>
      </div>

      {/* 情绪历史记录区域 */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-bold text-indigo-900">Emotion History</h2>
        </div>
        <div className="h-64 bg-indigo-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Emotion trend chart will appear here</p>
        </div>
      </div>
    </main>
  )
} 