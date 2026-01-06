import { Navigation } from '@/components/Navigation'
import { Timer } from '@/components/Timer'

export default function TimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Plank Timer
        </h1>

        <div className="bg-white rounded-lg shadow p-8">
          <Timer />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Press Start when you begin your plank, Stop when you&apos;re done, then Save to record your time.
        </p>
      </main>
    </div>
  )
}
