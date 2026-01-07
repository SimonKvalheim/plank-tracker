import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all users with their best attempts
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

  // Filter users with attempts and sort by best time
  const leaderboard = users
    .filter((user) => user.attempts.length > 0)
    .sort((a, b) => b.attempts[0].durationSeconds - a.attempts[0].durationSeconds)
    .map((user, index) => ({
      rank: index + 1,
      id: user.id,
      displayName: user.displayName,
      bestTime: user.attempts[0].durationSeconds,
      achievedAt: user.attempts[0].attemptedAt,
      isCurrentUser: user.id === session.user.id,
    }))

  return NextResponse.json(leaderboard)
}
