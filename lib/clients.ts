import { supabase } from './supabase'

export type Client = {
  id: number
  name: string
  email: string
  phone: string
}

export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data
}

export async function addClient(client: Omit<Client, 'id'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single()

  if (error) {
    console.error('Error adding client:', error)
    throw error
  }

  return data
}

export async function updateClient(client: Client) {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', client.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    throw error
  }

  return data
}

export async function deleteClient(id: number) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    throw error
  }

  return true
}

export async function subscribeToClients(callback: (clients: Client[]) => void) {
  const channel = supabase
    .channel('clients_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clients'
      },
      async (payload) => {
        const clients = await fetchClients()
        callback(clients)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}
