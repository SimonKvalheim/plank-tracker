'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { formatDuration, parseDuration, isValidDuration } from '@/lib/utils/time'

interface Attempt {
  id: string
  durationSeconds: number
  attemptedAt: string
  isPersonalBest: boolean
}

export default function HistoryPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  // Manual entry form
  const [manualTime, setManualTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchAttempts()
  }, [])

  async function fetchAttempts() {
    try {
      const response = await fetch('/api/attempts')
      if (response.ok) {
        const data = await response.json()
        setAttempts(data)
      }
    } catch (error) {
      console.error('Failed to fetch attempts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const seconds = parseDuration(manualTime)
    if (seconds === null) {
      setMessage({ type: 'error', text: 'Invalid format. Use mm:ss (e.g., 1:30)' })
      return
    }

    if (!isValidDuration(seconds)) {
      setMessage({ type: 'error', text: 'Duration must be between 1 second and 1 hour' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSeconds: seconds }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save attempt' })
        return
      }

      setMessage({
        type: 'success',
        text: data.isPersonalBest ? 'New personal best!' : 'Attempt saved!',
      })
      setManualTime('')
      fetchAttempts()
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save attempt' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">History</h1>

        {/* Manual entry form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Log Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                placeholder="Enter time (e.g., 1:30 or 90)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: mm:ss (e.g., 1:30) or seconds (e.g., 90)
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || !manualTime}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Log Attempt'}
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 px-4 py-2 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Attempts list */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Attempts</h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : attempts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No attempts yet. Use the timer or log a manual entry!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <li
                  key={attempt.id}
                  className="px-6 py-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-mono font-medium text-gray-900">
                      {formatDuration(attempt.durationSeconds)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(attempt.attemptedAt).toLocaleString()}
                    </p>
                  </div>
                  {attempt.isPersonalBest && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Personal Best
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
