import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/Navigation'
import { formatDuration } from '@/lib/utils/time'

async function getLeaderboard(currentUserId: string) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      attempts: {
        orderBy: { durationSeconds: 'desc' },
        take: 1,
        select: {
          durationSeconds: true,
          attemptedAt: true,
        },
      },
    },
  })

  return users
    .filter((user) => user.attempts.length > 0)
    .sort((a, b) => b.attempts[0].durationSeconds - a.attempts[0].durationSeconds)
    .map((user, index) => ({
      rank: index + 1,
      id: user.id,
      displayName: user.displayName,
      bestTime: user.attempts[0].durationSeconds,
      achievedAt: user.attempts[0].attemptedAt,
      isCurrentUser: user.id === currentUserId,
    }))
}

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const leaderboard = await getLeaderboard(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Leaderboard</h1>

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No attempts yet. Be the first to log a plank!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Achieved
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className={entry.isCurrentUser ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg">
                        {getMedalEmoji(entry.rank)}
                        {entry.rank <= 3 ? ' ' : ''}
                        <span className={entry.rank <= 3 ? 'font-bold' : ''}>
                          #{entry.rank}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${entry.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                        {entry.displayName}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600">(you)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-mono font-medium text-gray-900">
                        {formatDuration(entry.bestTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(entry.achievedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
