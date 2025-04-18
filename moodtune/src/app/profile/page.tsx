'use client'

import { useState } from 'react'
import { UserCircleIcon, Cog6ToothIcon, BellIcon, ShareIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const [settings, setSettings] = useState({
    detectionInterval: 30,
    autoPlay: true,
    shareEmotions: true,
    notifications: true,
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-indigo-900">Profile</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-900">Test User</h2>
              <p className="text-gray-500">user@example.com</p>
            </div>
          </div>
          <button className="text-indigo-600 hover:text-indigo-700 flex items-center">
            <Cog6ToothIcon className="h-5 w-5 mr-1" />
            Edit Profile
          </button>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Cog6ToothIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-indigo-900">App Settings</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotion Detection Interval (seconds)
              </label>
              <input
                type="number"
                value={settings.detectionInterval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    detectionInterval: parseInt(e.target.value),
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Auto-play Music</h3>
                  <p className="text-sm text-gray-500">
                    Automatically play recommended music when mood changes
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, autoPlay: !settings.autoPlay })
                  }
                  className={`${
                    settings.autoPlay ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.autoPlay ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Share Emotions</h3>
                  <p className="text-sm text-gray-500">
                    Allow sharing your emotional state in the community
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      shareEmotions: !settings.shareEmotions,
                    })
                  }
                  className={`${
                    settings.shareEmotions ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.shareEmotions ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications for new music recommendations and community interactions
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: !settings.notifications,
                    })
                  }
                  className={`${
                    settings.notifications ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      settings.notifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 