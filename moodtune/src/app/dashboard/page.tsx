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
  FaceSmileIcon as FaceMehIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { MusicRecommendationService } from '@/services/musicRecommendation'
import { MusicTrack } from '@/types/music'
import { useSession } from 'next-auth/react'
import SpotifyLogin from '@/components/SpotifyLogin'
import Navigation from '@/components/Navigation'

declare global {
  interface Window {
    faceapi: any;
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession();
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

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [hasInteracted, setHasInteracted] = useState(false);

  // 添加新的状态来跟踪进度条拖动
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

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

    return () => {
      console.log('Component unmounting')
      if (detectionInterval.current) {
        cancelAnimationFrame(detectionInterval.current)
      }
    }
  }, [])

  // 初始化音乐推荐服务
  useEffect(() => {
    if (session?.accessToken) {
      console.log("✅ Access Token from session:", session.accessToken);
      musicService.current = new MusicRecommendationService(session.accessToken);
      
      // 设置播放状态回调
      if (musicService.current) {
        musicService.current.setPlaybackStateCallback(updatePlaybackProgress);
      }
    } else {
      console.log("❌ No access token in session.");
    }

    // 清理函数
    return () => {
      if (musicService.current) {
        musicService.current.removePlaybackStateCallback();
      }
    };
  }, [session]);

  // 更新检测状态
  const updateDetectionStatus = (status: string) => {
    setDetectionStatus(status)
    console.log('Detection Status:', status)
  }

  // 更新情绪检测函数
  const detectEmotion = async () => {
    if (!isDetectingRef.current || !videoRef.current || !canvasRef.current || !isFaceApiReady) {
      console.log('Detection stopped or elements not ready');
      return;
    }

    const now = Date.now();
    const samplingElapsed = now - samplingStartTime.current;

    try {
      // 更新进度
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
          if (musicService.current && session?.accessToken) {
            try {
              console.log('Fetching recommendations for emotion:', dominantEmotion);
              const recommendations = await musicService.current.getRecommendations(dominantEmotion);
              console.log('Recommendations received:', recommendations);
              setRecommendations(recommendations);
            } catch (error) {
              console.error('Error getting recommendations:', error);
              setError('Failed to get music recommendations. Please try again.');
            }
          } else {
            console.error('Music service or access token not available');
            setError('Spotify connection not available. Please log in again.');
          }
          
          // 分析完成后自动停止检测
          stopDetection();
          return;
        }
      }

      const detections = await window.faceapi.detectSingleFace(
        videoRef.current,
        new window.faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceExpressions();

      if (detections) {
        const expressions = detections.expressions as Record<string, number>;
        const emotion = Object.entries(expressions)
          .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        if (expressions[emotion] > 0.3) {
          updateEmotionHistory(emotion);
        }
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
    }

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

  // 播放上一首
  const handlePlayPrevious = async () => {
    if (!musicService.current || currentTrackIndex <= 0) return;
    
    const previousTrack = recommendations[currentTrackIndex - 1];
    setCurrentTrackIndex(currentTrackIndex - 1);
    setCurrentTrack(previousTrack);
    setIsPlaying(true);
    await musicService.current.playTrack(previousTrack);
  };

  // 播放下一首
  const handlePlayNext = async () => {
    if (!musicService.current || currentTrackIndex >= recommendations.length - 1) return;
    
    const nextTrack = recommendations[currentTrackIndex + 1];
    setCurrentTrackIndex(currentTrackIndex + 1);
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    await musicService.current.playTrack(nextTrack);
  };

  // 更新播放进度
  const updatePlaybackProgress = (state: any) => {
    if (state) {
      console.log('Playback state:', state);
      setCurrentTime(state.position);
      setDuration(state.duration);
      setIsPlaying(!state.paused);
    }
  };

  // 格式化时间
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 处理播放/暂停
  const handlePlayPause = async () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      setIsPlaying(false);
      await musicService.current?.pausePlayback();
    } else {
      setIsPlaying(true);
      await musicService.current?.playTrack(currentTrack);
    }
  };

  // 处理歌曲点击
  const handlePlayTrack = async (track: MusicTrack) => {
    try {
      if (!musicService.current) {
        console.error('Music service not initialized');
        return;
      }

      // 如果点击的是当前正在播放的歌曲，则切换播放状态
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          await musicService.current.pausePlayback();
          setIsPlaying(false);
        } else {
          await musicService.current.playTrack(track);
          setIsPlaying(true);
        }
        return;
      }

      // 如果是新歌曲，开始播放
      await musicService.current.playTrack(track);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
      if (error instanceof Error) {
        if (error.message.includes('Premium account required')) {
          alert('Please log in with a Spotify Premium account to play music.');
        } else if (error.message.includes('Player not ready')) {
          alert('Player is not ready yet. Please wait a moment and try again.');
        } else if (error.message.includes('Invalid track')) {
          alert('This track cannot be played. Please try another one.');
        } else {
          alert('Failed to play track. Please try again.');
        }
      }
    }
  };

  // 处理进度条拖动开始
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // 处理进度条拖动结束
  const handleDragEnd = async () => {
    if (!musicService.current || !currentTrack) return;
    
    try {
      // 计算新的播放位置（毫秒）
      const newPosition = Math.round((dragPosition / 100) * duration);
      await musicService.current.seekToPosition(newPosition);
      setCurrentTime(newPosition);
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
    
    setIsDragging(false);
  };

  // 处理进度条拖动
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDragPosition(percentage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">MoodTune Dashboard</h1>
          {status === 'loading' ? (
            <div className="text-gray-600">Loading...</div>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <img
                src={session.user?.image || '/images/default-avatar.png'}
                alt="User avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-700">{session.user?.name}</span>
            </div>
          ) : (
            <SpotifyLogin />
          )}
        </div>
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
                  {!isAnalysisComplete && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, Math.round((Date.now() - samplingStartTime.current) / SAMPLING_DURATION * 100))}%` 
                        }}
                      ></div>
                    </div>
                  )}
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
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="relative">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-16 h-16 rounded"
                      />
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded hover:bg-opacity-75 transition-opacity"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <PauseIcon className="w-6 h-6 text-white" />
                        ) : (
                          <PlayIcon className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium">{track.title}</h3>
                      <p className="text-sm text-gray-600">{track.artist}</p>
                      <p className="text-xs text-gray-500">{track.album}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 固定在底部的播放控制栏 */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* 歌曲信息 */}
              <div className="flex items-center space-x-4">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{currentTrack.title}</h3>
                  <p className="text-sm text-gray-600">{currentTrack.artist}</p>
                </div>
              </div>

              {/* 播放控制 */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={handlePlayPrevious}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="上一首"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  title={isPlaying ? "暂停" : "播放"}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={handlePlayNext}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="下一首"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 进度条 */}
              <div className="flex-1 max-w-md">
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDrag}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${isDragging ? dragPosition : (duration > 0 ? (currentTime / duration) * 100 : 0)}%` 
                      }}
                    />
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow cursor-pointer"
                      style={{ 
                        left: `${isDragging ? dragPosition : (duration > 0 ? (currentTime / duration) * 100 : 0)}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 