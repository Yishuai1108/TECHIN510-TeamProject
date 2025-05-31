'use client'

import { HeartIcon, ShareIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

export default function Community() {
  const mockPosts = [
    {
      id: 1,
      user: 'UserA',
      emotion: 'Happy',
      music: 'Sunshine After Rain',
      timestamp: '2024-03-20 14:30',
      likes: 12,
    },
    {
      id: 2,
      user: 'UserB',
      emotion: 'Calm',
      music: 'Moonlight Sonata',
      timestamp: '2024-03-20 13:15',
      likes: 8,
    },
    {
      id: 3,
      user: 'UserC',
      emotion: 'Excited',
      music: 'Youth Album',
      timestamp: '2024-03-20 12:00',
      likes: 15,
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-indigo-900">Community Feed</h1>
        
        {/* Share Button */}
        <button className="mb-8 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center">
          <ShareIcon className="h-5 w-5 mr-2" />
          Share My Mood
        </button>

        {/* Posts List */}
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">{post.user[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">{post.user}</p>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">More options</span>
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-600">
                  Current Mood: <span className="font-medium text-indigo-900">{post.emotion}</span>
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Listening to:</p>
                  <p className="font-medium text-indigo-900">{post.music}</p>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600">
                    <HeartIcon className="h-5 w-5" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="text-gray-500 hover:text-indigo-600 flex items-center">
                    <ShareIcon className="h-5 w-5 mr-1" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
} 