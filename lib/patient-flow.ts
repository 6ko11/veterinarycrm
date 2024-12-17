import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  created_at?: string
  updated_at?: string
}

export interface Pet {
  id: number
  client_id: number
  name: string
  species: string
  breed: string
  age: number
  created_at?: string
  updated_at?: string
  client?: Client
}

export interface MedicalRecord {
  id: number
  pet_id: number
  date: string
  diagnosis: string
  treatment: string
  notes?: string
  created_at?: string
  updated_at?: string
  pet?: Pet
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  description: string
  quantity: number
  unit_price: number
  created_at?: string
  updated_at?: string
}

export interface Invoice {
  id: number
  client_id: number
  pet_id: number
  date: string
  total: number
  status: 'pending' | 'paid' | 'cancelled'
  items: InvoiceItem[]
  created_at?: string
  updated_at?: string
  client?: Client
  pet?: Pet
}

// Client CRUD operations
export async function fetchClients() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
  
  return data
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating client:', error)
    throw error
  }
  
  return data
}

export async function updateClient(id: number, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating client:', error)
    throw error
  }
  
  return data
}

export async function deleteClient(id: number) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting client:', error)
    throw error
  }
}

// Pet CRUD operations
export async function fetchPets(clientId?: number) {
  const supabase = createClientComponentClient()
  let query = supabase
    .from('pets')
    .select('*')
    .order('name')
  
  if (clientId) {
    query = query.eq('client_id', clientId)
  }
  
  const { data: pets, error } = await query
  
  if (error) {
    console.error('Error fetching pets:', error)
    throw error
  }

  // Fetch clients for the pets
  if (pets && pets.length > 0) {
    const clientIds = Array.from(new Set(pets.map(pet => pet.client_id)))
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .in('id', clientIds)

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
      throw clientsError
    }

    return pets.map(pet => ({
      ...pet,
      client: clients?.find(client => client.id === pet.client_id)
    }))
  }

  return pets
}

export async function createPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating pet:', error)
    throw error
  }
  
  return data
}

export async function updatePet(id: number, pet: Partial<Omit<Pet, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('pets')
    .update(pet)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    console.error('Error updating pet:', error)
    throw error
  }
  
  return data
}

export async function deletePet(id: number) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting pet:', error)
    throw error
  }
}

// Medical Record CRUD operations
export async function fetchMedicalRecords(petId?: number) {
  const supabase = createClientComponentClient()
  let query = supabase
    .from('medical_records')
    .select('*')
    .order('date', { ascending: false })
  
  if (petId) {
    query = query.eq('pet_id', petId)
  }
  
  const { data: records, error } = await query
  
  if (error) {
    console.error('Error fetching medical records:', error)
    throw error
  }

  // Fetch pets and clients for the records
  if (records && records.length > 0) {
    const petIds = Array.from(new Set(records.map(record => record.pet_id)))
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .in('id', petIds)

    if (petsError) {
      console.error('Error fetching pets:', petsError)
      throw petsError
    }

    if (pets && pets.length > 0) {
      const clientIds = Array.from(new Set(pets.map(pet => pet.client_id)))
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .in('id', clientIds)

      if (clientsError) {
        console.error('Error fetching clients:', clientsError)
        throw clientsError
      }

      const petsWithClients = pets.map(pet => ({
        ...pet,
        client: clients?.find(client => client.id === pet.client_id)
      }))

      return records.map(record => ({
        ...record,
        pet: petsWithClients.find(pet => pet.id === record.pet_id)
      }))
    }
  }

  return records
}

export async function createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('medical_records')
    .insert(record)
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating medical record:', error)
    throw error
  }
  
  return data
}

export async function updateMedicalRecord(id: number, record: Partial<Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('medical_records')
    .update(record)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    console.error('Error updating medical record:', error)
    throw error
  }
  
  return data
}

export async function deleteMedicalRecord(id: number) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting medical record:', error)
    throw error
  }
}

// Invoice CRUD operations
export async function fetchInvoices(clientId?: number) {
  const supabase = createClientComponentClient()
  let query = supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items (*)
    `)
    .order('date', { ascending: false })
  
  if (clientId) {
    query = query.eq('client_id', clientId)
  }
  
  const { data: invoices, error } = await query
  
  if (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }

  if (invoices && invoices.length > 0) {
    // Fetch clients
    const clientIds = Array.from(new Set(invoices.map(invoice => invoice.client_id)))
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .in('id', clientIds)

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
      throw clientsError
    }

    // Fetch pets
    const petIds = Array.from(new Set(invoices.map(invoice => invoice.pet_id)))
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .in('id', petIds)

    if (petsError) {
      console.error('Error fetching pets:', petsError)
      throw petsError
    }

    return invoices.map(invoice => ({
      ...invoice,
      client: clients?.find(client => client.id === invoice.client_id),
      pet: pets?.find(pet => pet.id === invoice.pet_id),
    }))
  }

  return invoices || []
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient()
  const { items, ...invoiceData } = invoice
  
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // Start a transaction
  const { data: createdInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      user_id: user.id,
      status: invoiceData.status || 'pending'
    })
    .select()
    .single()
  
  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError)
    throw invoiceError
  }
  
  // Create invoice items
  if (items && items.length > 0) {
    const invoiceItems = items.map(item => ({
      ...item,
      invoice_id: createdInvoice.id
    }))
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)
    
    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
      throw itemsError
    }
  }
  
  // Fetch the complete invoice with items
  const { data: completeInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(*)
    `)
    .eq('id', createdInvoice.id)
    .single()
  
  if (fetchError) {
    console.error('Error fetching complete invoice:', fetchError)
    throw fetchError
  }
  
  return completeInvoice
}

export async function updateInvoice(id: number, invoice: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = createClientComponentClient()
  const { items, ...invoiceData } = invoice
  
  // Update invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)
  
  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError)
    throw invoiceError
  }
  
  // Update items if provided
  if (items) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id)
    
    if (deleteError) {
      console.error('Error deleting invoice items:', deleteError)
      throw deleteError
    }
    
    // Create new items
    const invoiceItems = items.map(item => ({
      ...item,
      invoice_id: id
    }))
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)
    
    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
      throw itemsError
    }
  }
  
  // Fetch the complete updated invoice
  const { data: updatedInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()
  
  if (fetchError) {
    console.error('Error fetching updated invoice:', fetchError)
    throw fetchError
  }
  
  return updatedInvoice
}

export async function deleteInvoice(id: number) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting invoice:', error)
    throw error
  }
}
