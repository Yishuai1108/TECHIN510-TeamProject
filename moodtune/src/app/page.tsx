import Link from 'next/link'
import Image from 'next/image'
import { MusicalNoteIcon, FaceSmileIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-b from-indigo-50 to-white">
      <div className="z-10 max-w-5xl w-full flex justify-center">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
          Welcome to MoodTune
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="w-full max-w-2xl text-center">
          <div className="relative w-64 h-64 mx-auto mb-8">
            <Image
              src="/images/music-notes.svg"
              alt="Music Notes"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
            Emotion-Based Music Recommendation
          </h2>
          <p className="mb-8 text-gray-600">
            Discover the perfect soundtrack for your mood through real-time facial expression analysis
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <h2 className="mb-3 text-2xl font-semibold text-indigo-900">
                Get Started
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Start emotion detection and music recommendations
              </p>
            </Link>

            <Link
              href="/community"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <h2 className="mb-3 text-2xl font-semibold text-indigo-900">
                Community
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Explore other users' moods and music shares
              </p>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50">
          <div className="flex items-center mb-3">
            <FaceSmileIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-semibold text-indigo-900">
              Real-time Emotion Detection
            </h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Analyze your emotional state using advanced facial recognition technology
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50">
          <div className="flex items-center mb-3">
            <MusicalNoteIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-semibold text-indigo-900">
              Smart Music Recommendations
            </h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Get personalized music recommendations based on your mood
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50">
          <div className="flex items-center mb-3">
            <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-semibold text-indigo-900">
              Mood Tracking
            </h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Track and analyze your emotional trends over time
          </p>
        </div>
      </div>
    </main>
  )
}
