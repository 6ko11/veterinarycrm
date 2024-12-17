import { supabase } from './supabase'

export interface InventoryItem {
  id: string  // This is a UUID string
  name: string
  type: 'medication' | 'vaccine' | 'supply'
  description?: string | null
  sku: string
  quantity: number
  minimum_quantity: number
  purchase_price: number
  sale_price: number
  expiry_date?: string | null
  manufacturer?: string | null
  supplier?: string | null
  storage_conditions?: string | null
  created_at: string
  updated_at: string
  user_id: string  // This is a UUID string
}

export async function fetchInventoryItems() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data) {
      return []
    }

    return data as InventoryItem[]
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    throw error
  }
}

export async function searchInventory(query: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .or(`name.ilike.%${query}%, sku.ilike.%${query}%`)
      .order('name')
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    return data as InventoryItem[]
  } catch (error) {
    console.error('Error searching inventory:', error)
    throw error
  }
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Clean up undefined values to null
    const cleanedItem = Object.fromEntries(
      Object.entries(item).map(([key, value]) => [key, value === undefined ? null : value])
    )

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{ ...cleanedItem, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data) {
      throw new Error('No data returned from insert')
    }

    return data as InventoryItem
  } catch (error) {
    console.error('Error adding inventory item:', error)
    throw error
  }
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('inventory_items')
      .update(item)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    return data as InventoryItem
  } catch (error) {
    console.error('Error updating inventory item:', error)
    throw error
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    throw error
  }
}

export async function updateInventoryQuantity(id: string, quantity: number) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error updating inventory quantity:', error)
    throw error
  }
}
