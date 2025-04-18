'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FaceSmileIcon, 
  FaceFrownIcon, 
  MusicalNoteIcon, 
  ChartBarIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon as FaceMehIcon
} from '@heroicons/react/24/outline'
import { MusicRecommendationService } from '@/services/musicRecommendation'
import { MusicTrack } from '@/types/music'

declare global {
  interface Window {
    faceapi: any;
  }
}

export default function Dashboard() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<string>('Not Detected')
  const [recommendations, setRecommendations] = useState<MusicTrack[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFaceApiReady, setIsFaceApiReady] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState<string>('')
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const musicService = useRef<MusicRecommendationService | null>(null)
  const detectionInterval = useRef<number | null>(null)
  const isDetectingRef = useRef(false)

  // 情绪平滑相关的状态
  const emotionHistory = useRef<string[]>([])
  const lastEmotionChangeTime = useRef<number>(0)
  const samplingStartTime = useRef<number>(0)
  const EMOTION_HISTORY_SIZE = 30
  const EMOTION_CHANGE_THRESHOLD = 0.3
  const MIN_CHANGE_INTERVAL = 10000
  const SAMPLING_DURATION = 3000

  // 计算主要情绪
  const calculateDominantEmotion = (emotions: string[]): string => {
    const emotionCounts: { [key: string]: number } = {}
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    let dominantEmotion = 'neutral'
    let maxCount = 0

    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count
        dominantEmotion = emotion
      }
    }

    // 如果检测到足够多的情绪样本，返回主要情绪
    if (emotions.length >= EMOTION_HISTORY_SIZE / 2) {
      return dominantEmotion
    }
    return 'neutral' // 如果样本不足，返回中性情绪而不是 Not Detected
  }

  // 检查是否应该更新情绪
  const shouldUpdateEmotion = (newEmotion: string): boolean => {
    const now = Date.now()
    const timeSinceLastChange = now - lastEmotionChangeTime.current
    
    if (timeSinceLastChange < MIN_CHANGE_INTERVAL) {
      return false
    }

    const currentDominantEmotion = calculateDominantEmotion(emotionHistory.current)
    return newEmotion !== currentDominantEmotion
  }

  // 更新情绪历史
  const updateEmotionHistory = (newEmotion: string) => {
    emotionHistory.current.push(newEmotion)
    if (emotionHistory.current.length > EMOTION_HISTORY_SIZE) {
      emotionHistory.current.shift()
    }
  }

  // 获取情绪对应的图标
  const getEmotionIcon = (emotion: string) => {
    const baseStyle = "h-24 w-24";
    switch (emotion.toLowerCase()) {
      case 'happy':
        return <SparklesIcon className={`${baseStyle} text-yellow-500`} />;
      case 'sad':
        return <FaceFrownIcon className={`${baseStyle} text-blue-500`} />;
      case 'angry':
        return <FireIcon className={`${baseStyle} text-red-500`} />;
      case 'surprised':
        return <BoltIcon className={`${baseStyle} text-purple-500`} />;
      case 'fearful':
        return <ExclamationTriangleIcon className={`${baseStyle} text-indigo-500`} />;
      case 'disgusted':
        return <FaceMehIcon className={`${baseStyle} text-green-500`} />;
      case 'neutral':
        return <FaceSmileIcon className={`${baseStyle} text-gray-500`} />;
      default:
        return <FaceSmileIcon className={`${baseStyle} text-gray-500`} />;
    }
  };

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

  // 更新检测状态
  const updateDetectionStatus = (status: string) => {
    setDetectionStatus(status)
    console.log('Detection Status:', status)
  }

  const detectEmotion = async () => {
    if (!isDetectingRef.current || !videoRef.current || !canvasRef.current) {
      console.log('Detection stopped or elements not ready');
      return;
    }

    const now = Date.now();
    const samplingElapsed = now - samplingStartTime.current;

    try {
      // 确保在每次循环中都更新进度
      if (samplingElapsed < SAMPLING_DURATION) {
        const progress = Math.min(100, Math.round((samplingElapsed / SAMPLING_DURATION) * 100));
        updateDetectionStatus(`Analyzing... ${progress}%`);
        setCurrentEmotion('Analyzing...');
        setIsAnalysisComplete(false);
      } else if (samplingElapsed >= SAMPLING_DURATION) {
        if (!isAnalysisComplete) {
          // 在分析完成时，确保更新所有状态
          const dominantEmotion = calculateDominantEmotion(emotionHistory.current);
          setCurrentEmotion(dominantEmotion);
          updateDetectionStatus('Analysis Complete ✅');
          setIsAnalysisComplete(true);
          
          // 获取音乐推荐
          try {
            const tracks = await musicService.current?.getRecommendations(dominantEmotion);
            setRecommendations(tracks || []);
          } catch (error) {
            console.error('Error getting recommendations:', error);
          }

          // 分析完成后自动停止检测
          stopDetection();
          return;
        }
      }

      // 设置画布尺寸
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      // 将视频帧绘制到画布
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      ctx.drawImage(videoRef.current, 0, 0);

      // 使用画布进行检测
      const detections = await window.faceapi.detectSingleFace(
        canvasRef.current,
        new window.faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions();

      if (detections && detections.expressions) {
        const expressions = detections.expressions as Record<string, number>;
        console.log('Raw expressions:', expressions);

        const emotionMap: { [key: string]: string } = {
          happy: 'happy',
          sad: 'sad',
          angry: 'angry',
          surprised: 'surprised',
          fearful: 'fearful',
          disgusted: 'disgusted',
          neutral: 'neutral'
        };

        let maxEmotion = '';
        let maxValue = 0;

        for (const [emotion, value] of Object.entries(expressions)) {
          if (value > maxValue) {
            maxValue = value;
            maxEmotion = emotion;
          }
        }

        if (maxEmotion && maxValue > 0.3) {
          const mappedEmotion = emotionMap[maxEmotion] || 'neutral';
          updateEmotionHistory(mappedEmotion);
        } else {
          updateEmotionHistory('neutral');
        }
      } else {
        updateEmotionHistory('neutral');
      }
    } catch (error: any) {
      console.error('Error in detectEmotion:', error);
      // 即使发生错误，也继续更新进度
      if (samplingElapsed < SAMPLING_DURATION) {
        const progress = Math.min(100, Math.round((samplingElapsed / SAMPLING_DURATION) * 100));
        updateDetectionStatus(`Analyzing... ${progress}%`);
      }
    }

    // 使用 requestAnimationFrame 来确保更流畅的更新
    if (isDetectingRef.current) {
      requestAnimationFrame(detectEmotion);
    }
  };

  const startDetection = async () => {
    if (!isFaceApiReady) {
      setError('Face detection model is not ready yet');
      return;
    }

    try {
      setIsLoading(true);
      setCurrentEmotion('Initializing...');
      updateDetectionStatus('Requesting camera access...');
      
      // 确保视频元素存在
      if (!videoRef.current) {
        console.log('Video element not found, retrying...');
        // 等待下一个渲染周期
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (!videoRef.current) {
          throw new Error('Video element not found after retry');
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });

      if (!videoRef.current) {
        throw new Error('Video element disappeared');
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      // 重置所有状态
      isDetectingRef.current = true;
      setIsDetecting(true);
      setIsAnalysisComplete(false);
      samplingStartTime.current = Date.now();
      emotionHistory.current = [];
      
      updateDetectionStatus('Analyzing emotions, please keep your face clear and natural...');
      setIsLoading(false);
      
      // 使用 requestAnimationFrame 开始检测
      requestAnimationFrame(detectEmotion);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setError(`Error accessing camera: ${error.message}`);
      setIsLoading(false);
      setIsDetecting(false);
      isDetectingRef.current = false;
    }
  };

  const stopDetection = () => {
    console.log('Stopping detection...');
    isDetectingRef.current = false;
    setIsDetecting(false);
    setIsAnalysisComplete(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 添加 useEffect 来监听视频元素
  useEffect(() => {
    if (videoRef.current) {
      console.log('Video element is ready');
    }
  }, []); // 移除 videoRef.current 依赖

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧：视频和检测控制 */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Emotion Detection</h2>
              
              {/* 添加进度显示在这里 */}
              {detectionStatus && (
                <div className={`mb-4 p-3 rounded-lg text-center ${
                  isAnalysisComplete 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  <div className="text-lg font-medium">
                    {detectionStatus}
                  </div>
                </div>
              )}

              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {/* 视频元素始终存在 */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${!isDetecting ? 'hidden' : ''}`}
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0"
                  style={{ display: 'none' }}
                />

                {/* 如果分析结束，显示情绪图标 */}
                {isAnalysisComplete && !isDetecting && (
                  <div className="text-center transition-opacity duration-500 ease-in opacity-100">
                    {getEmotionIcon(currentEmotion)}
                    <p className="mt-2 text-lg font-medium text-white capitalize">
                      {currentEmotion}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={isDetecting ? stopDetection : startDetection}
                  disabled={isLoading || !isFaceApiReady}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    isDetecting ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Loading...' : isDetecting ? 'Stop Detection' : 'Start Detection'}
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：情绪和推荐 */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Current Emotion</h2>
              <div className="text-center p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {getEmotionIcon(currentEmotion)}
                  <div className="text-3xl font-bold text-indigo-600 capitalize">
                    {currentEmotion}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Music Recommendations</h2>
              <div className="grid grid-cols-1 gap-4">
                {recommendations.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-16 h-16 rounded"
                    />
                    <div>
                      <h3 className="font-medium">{track.title}</h3>
                      <p className="text-sm text-gray-600">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 移除底部的状态显示 */}
      </div>
    </div>
  )
} 