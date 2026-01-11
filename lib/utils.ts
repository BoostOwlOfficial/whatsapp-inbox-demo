import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format timestamp to Indian Standard Time (IST)
 * @param timestamp - Unix timestamp in seconds or milliseconds
 * @param format - 'short' for time only, 'long' for date and time
 */
export function formatToIST(timestamp: number, format: 'short' | 'long' = 'short'): string {
  // Convert to milliseconds if timestamp is in seconds
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp

  const date = new Date(ms)

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }

  if (format === 'long') {
    options.day = '2-digit'
    options.month = 'short'
    options.year = 'numeric'
  }

  return date.toLocaleString('en-IN', options)
}

/**
 * Get relative time for conversation list (e.g., "2 min ago", "Yesterday", "12/25/2024")
 */
export function getRelativeTime(timestamp: number): string {
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp
  const date = new Date(ms)
  const now = new Date()

  // Convert to IST
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))

  const diffMs = istNow.getTime() - istDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Less than 1 minute
  if (diffMins < 1) return 'Just now'

  // Less than 1 hour
  if (diffMins < 60) return `${diffMins} min ago`

  // Less than 24 hours
  if (diffHours < 24) return `${diffHours}h ago`

  // Yesterday
  if (diffDays === 1) return 'Yesterday'

  // Less than 7 days
  if (diffDays < 7) return `${diffDays} days ago`

  // Older - show date
  return istDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: istDate.getFullYear() !== istNow.getFullYear() ? 'numeric' : undefined,
  })
}
