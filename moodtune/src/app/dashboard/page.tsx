'use client'

import { useState } from 'react'
import { FaceSmileIcon, MusicalNoteIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emotion Detection Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FaceSmileIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-indigo-900">Emotion Detection</h2>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            {isDetecting ? (
              <div className="text-center">
                <p className="text-gray-500">Camera preview will appear here</p>
                <p className="text-sm text-gray-400">Detecting emotions...</p>
              </div>
            ) : (
              <button
                onClick={() => setIsDetecting(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Start Detection
              </button>
            )}
          </div>
          {currentEmotion && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-lg font-medium text-indigo-900">Current Emotion: {currentEmotion}</p>
            </div>
          )}
        </div>

        {/* Music Recommendation Section */}
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

      {/* Emotion History Section */}
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