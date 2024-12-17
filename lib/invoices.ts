import { supabase } from './supabase'
import { Invoice as PatientFlowInvoice } from './patient-flow'

export type Invoice = PatientFlowInvoice

export interface InvoiceItem {
  id: number
  invoice_id: number
  description: string
  quantity: number
  unit_price: number
  created_at: string
  updated_at: string
}

export async function createInvoice(data: Partial<Invoice>, items: { description: string; quantity: number; unit_price: number }[]) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([{
      ...data,
      user_id: user.id,
    }])
    .select()
    .single()

  if (invoiceError) throw invoiceError
  if (!invoice) throw new Error('Failed to create invoice')

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(
        items.map(item => ({
          invoice_id: invoice.id,
          ...item
        }))
      )

    if (itemsError) throw itemsError
  }

  return invoice
}

export async function updateInvoice(id: number, data: Partial<Invoice>, items?: { description: string; quantity: number; unit_price: number }[]) {
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', id)

  if (invoiceError) throw invoiceError

  if (items) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id)

    if (deleteError) throw deleteError

    // Insert new items
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          items.map(item => ({
            invoice_id: id,
            ...item
          }))
        )

      if (itemsError) throw itemsError
    }
  }
}

export async function deleteInvoice(id: number) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchInvoicesByPetId(petId: number) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items (
        id,
        description,
        quantity,
        unit_price
      )
    `)
    .eq('pet_id', petId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchInvoiceById(id: number) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items (
        id,
        description,
        quantity,
        unit_price
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
