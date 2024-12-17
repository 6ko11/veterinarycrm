import { supabase } from './supabase'

export type Pet = {
  id: number
  name: string
  species: string
  breed?: string
  age?: number
  client_id: number
  created_at?: string
}

export async function addPet(pet: Omit<Pet, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('pets')
    .insert([pet])
    .select('id, name, species, breed, age, client_id')
    .single()

  if (error) throw error
  return data
}

export async function fetchPetsByClientId(clientId: number) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updatePet(id: number, updates: Partial<Pet>) {
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePet(id: number) {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function subscribeToPets(clientId: number, callback: (pets: Pet[]) => void) {
  const subscription = supabase
    .channel(`pets:client_id=${clientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pets',
        filter: `client_id=eq.${clientId}`,
      },
      async () => {
        const { data } = await supabase
          .from('pets')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
        
        if (data) {
          callback(data)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
