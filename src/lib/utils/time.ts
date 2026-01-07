/**
 * Format seconds to mm:ss or h:mm:ss display format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format seconds to mm:ss.ms display format (for timer)
 */
export function formatDurationWithMs(totalMs: number): string {
  const totalSeconds = Math.floor(totalMs / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const ms = Math.floor((totalMs % 1000) / 10)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

/**
 * Parse mm:ss input to seconds
 * Returns null if invalid format
 */
export function parseDuration(input: string): number | null {
  // Handle formats: "1:30", "01:30", "90" (seconds only)
  const trimmed = input.trim()

  // Try mm:ss format
  const mmssMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (mmssMatch) {
    const mins = parseInt(mmssMatch[1], 10)
    const secs = parseInt(mmssMatch[2], 10)
    if (secs >= 60) return null
    return mins * 60 + secs
  }

  // Try seconds only
  const secsMatch = trimmed.match(/^(\d+)$/)
  if (secsMatch) {
    return parseInt(secsMatch[1], 10)
  }

  return null
}

/**
 * Validate duration is reasonable (between 1 second and 1 hour)
 */
export function isValidDuration(seconds: number): boolean {
  return seconds >= 1 && seconds <= 3600
}
