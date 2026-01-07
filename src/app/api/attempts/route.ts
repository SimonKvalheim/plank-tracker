import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const attempts = await prisma.attempt.findMany({
    where: { userId: session.user.id },
    orderBy: { attemptedAt: 'desc' },
  })

  return NextResponse.json(attempts)
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { durationSeconds, attemptedAt } = body

    // Validate duration
    if (!durationSeconds || typeof durationSeconds !== 'number') {
      return NextResponse.json(
        { error: 'Duration is required and must be a number' },
        { status: 400 }
      )
    }

    if (durationSeconds < 1 || durationSeconds > 3600) {
      return NextResponse.json(
        { error: 'Duration must be between 1 second and 1 hour' },
        { status: 400 }
      )
    }

    // Get user's current personal best
    const currentBest = await prisma.attempt.findFirst({
      where: { userId: session.user.id },
      orderBy: { durationSeconds: 'desc' },
    })

    const isPersonalBest = !currentBest || durationSeconds > currentBest.durationSeconds

    // If this is a new personal best, update the old one
    if (isPersonalBest && currentBest?.isPersonalBest) {
      await prisma.attempt.update({
        where: { id: currentBest.id },
        data: { isPersonalBest: false },
      })
    }

    // Parse optional date (default to now)
    let attemptDate = new Date()
    if (attemptedAt) {
      const parsed = new Date(attemptedAt)
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        )
      }
      attemptDate = parsed
    }

    // Create the new attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        durationSeconds: Math.round(durationSeconds),
        attemptedAt: attemptDate,
        isPersonalBest,
      },
    })

    return NextResponse.json({
      attempt,
      isPersonalBest,
      message: isPersonalBest
        ? 'New personal best!'
        : 'Attempt logged successfully',
    })
  } catch (error) {
    console.error('Error creating attempt:', error)
    return NextResponse.json(
      { error: 'Failed to create attempt' },
      { status: 500 }
    )
  }
}
