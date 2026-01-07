'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDurationWithMs } from '@/lib/utils/time'

type TimerState = 'idle' | 'running' | 'stopped'

export function Timer() {
  const router = useRouter()
  const [state, setState] = useState<TimerState>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const start = useCallback(() => {
    setState('running')
    setMessage(null)
    startTimeRef.current = Date.now() - elapsedMs
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current)
    }, 10)
  }, [elapsedMs])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState('stopped')
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState('idle')
    setElapsedMs(0)
    setMessage(null)
  }, [])

  const save = useCallback(async () => {
    const seconds = Math.floor(elapsedMs / 1000)
    if (seconds < 1) {
      setMessage({ type: 'error', text: 'Hold the plank for at least 1 second' })
      return
    }

    setSaving(true)
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

      // Reset after a moment
      setTimeout(() => {
        reset()
        router.refresh()
      }, 2000)
    } catch {
      setMessage({ type: 'error', text: 'Failed to save attempt' })
    } finally {
      setSaving(false)
    }
  }, [elapsedMs, reset, router])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Keyboard controls - space to start/stop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        if (state === 'idle') {
          start()
        } else if (state === 'running') {
          stop()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, start, stop])

  return (
    <div className="flex flex-col items-center">
      {/* Timer display */}
      <div className="text-7xl md:text-9xl font-mono font-bold text-gray-900 mb-8 tabular-nums">
        {formatDurationWithMs(elapsedMs)}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-2 rounded-md text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {state === 'idle' && (
          <button
            onClick={start}
            className="flex-1 px-8 py-4 bg-green-600 text-white rounded-lg font-medium text-xl hover:bg-green-700 transition-colors"
          >
            Start
          </button>
        )}

        {state === 'running' && (
          <button
            onClick={stop}
            className="flex-1 px-8 py-4 bg-red-600 text-white rounded-lg font-medium text-xl hover:bg-red-700 transition-colors"
          >
            Stop
          </button>
        )}

        {state === 'stopped' && (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={reset}
              disabled={saving}
              className="flex-1 px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-medium text-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Keyboard hint */}
      {(state === 'idle' || state === 'running') && (
        <p className="mt-6 text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Space</kbd> to {state === 'idle' ? 'start' : 'stop'}
        </p>
      )}
    </div>
  )
}
