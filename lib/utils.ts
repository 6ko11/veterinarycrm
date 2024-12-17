import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '-'
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  
  if (!isValid(parsedDate)) {
    return '-'
  }
  
  return format(parsedDate, 'PPP')
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number, locale: string = 'en-US', currency: string = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function formatSKEuro(amount: number): string {
  return formatCurrency(amount, 'sk-SK', 'EUR')
}
