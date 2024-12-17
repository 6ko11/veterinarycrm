import { supabase } from './supabase'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, startOfDay, endOfDay } from 'date-fns'

export interface DashboardStats {
  totalPatients: number
  appointmentsToday: number
  revenueThisMonth: number
  pendingInvoices: number
  weeklyAppointments: { name: string; appointments: number }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const dayStart = startOfDay(today)
  const dayEnd = endOfDay(today)

  // Get total patients
  const { count: totalPatients } = await supabase
    .from('pets')
    .select('*', { count: 'exact' })

  // Get today's appointments using timestamp range
  const { count: appointmentsToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact' })
    .gt('timestamp', dayStart.toISOString())
    .lt('timestamp', dayEnd.toISOString())

  // Get this month's revenue
  const { data: monthlyInvoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .gt('timestamp', monthStart.toISOString())
    .lt('timestamp', monthEnd.toISOString())
    .eq('status', 'paid')

  const revenueThisMonth = monthlyInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0

  // Get pending invoices
  const { count: pendingInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('status', 'pending')

  // Get weekly appointments
  const { data: weeklyAppointmentsData } = await supabase
    .from('appointments')
    .select('timestamp')
    .gt('timestamp', weekStart.toISOString())
    .lt('timestamp', weekEnd.toISOString())

  // Process weekly appointments
  const appointmentsByDay = Array.from({ length: 7 }, (_, i) => ({
    name: format(new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000), 'EEE'),
    appointments: 0
  }))

  weeklyAppointmentsData?.forEach(appointment => {
    const appointmentDate = new Date(appointment.timestamp)
    const dayIndex = Math.floor((appointmentDate.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000))
    if (dayIndex >= 0 && dayIndex < 7) {
      appointmentsByDay[dayIndex].appointments++
    }
  })

  return {
    totalPatients: totalPatients || 0,
    appointmentsToday: appointmentsToday || 0,
    revenueThisMonth,
    pendingInvoices: pendingInvoices || 0,
    weeklyAppointments: appointmentsByDay
  }
}
