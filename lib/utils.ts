import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { JobApplicationStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: JobApplicationStatus): string {
  switch (status) {
    case 'saved':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    case 'applied':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'interview':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'offer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: JobApplicationStatus): string {
  switch (status) {
    case 'saved': return 'Saved'
    case 'applied': return 'Applied'
    case 'interview': return 'Interview'
    case 'offer': return 'Offer'
    case 'rejected': return 'Rejected'
    default: return status
  }
}

export function getAIScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

export function getATSRating(score: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}