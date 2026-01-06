import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils/time'

async function getDashboardData(userId: string) {
  // Get user's personal best
  const personalBest = await prisma.attempt.findFirst({
    where: { userId, isPersonalBest: true },
    orderBy: { durationSeconds: 'desc' },
  })

  // Get user's rank
  const allBests = await prisma.attempt.groupBy({
    by: ['userId'],
    _max: { durationSeconds: true },
    orderBy: { _max: { durationSeconds: 'desc' } },
  })

  const rank = allBests.findIndex((b) => b.userId === userId) + 1
  const totalUsers = allBests.length

  // Get recent attempts
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { attemptedAt: 'desc' },
    take: 3,
  })

  return { personalBest, rank: rank || null, totalUsers, recentAttempts }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const { personalBest, rank, totalUsers, recentAttempts } = await getDashboardData(
    session.user.id
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Welcome back, {session.user.name}!
        </h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Your Personal Best
            </h2>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {personalBest ? formatDuration(personalBest.durationSeconds) : '--:--'}
            </p>
            {personalBest && (
              <p className="mt-1 text-sm text-gray-500">
                Achieved on{' '}
                {new Date(personalBest.attemptedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Your Rank
            </h2>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {rank ? `#${rank}` : '--'}
              {totalUsers > 0 && (
                <span className="text-lg font-normal text-gray-500">
                  {' '}
                  / {totalUsers}
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-500">On the leaderboard</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/timer"
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Start Timer
          </Link>
          <Link
            href="/history"
            className="flex items-center justify-center px-6 py-4 bg-white text-gray-700 rounded-lg font-medium text-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Log Manually
          </Link>
        </div>

        {/* Recent attempts */}
        {recentAttempts.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Attempts</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentAttempts.map((attempt) => (
                <li key={attempt.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDuration(attempt.durationSeconds)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(attempt.attemptedAt).toLocaleDateString()}
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
          </div>
        )}
      </main>
    </div>
  )
}
