import { supabase } from './supabase'

export interface MedicalRecord {
  id: number
  pet_id: number
  user_id: string
  date: string
  diagnosis: string
  treatment: string
  notes?: string
  next_appointment?: string
  created_at: string
  updated_at: string
}

export async function fetchMedicalRecordsByPetId(petId: number) {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false })

  if (error) throw error
  return data as MedicalRecord[]
}

export async function addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('medical_records')
    .insert([{ ...record, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return data as MedicalRecord
}

export async function updateMedicalRecord(id: number, record: Partial<MedicalRecord>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('medical_records')
    .update({ ...record, user_id: user.id })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MedicalRecord
}

export async function deleteMedicalRecord(id: number) {
  const { error } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function subscribeMedicalRecords(petId: number, callback: (records: MedicalRecord[]) => void) {
  const subscription = supabase
    .channel(`medical_records_${petId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'medical_records',
        filter: `pet_id=eq.${petId}`
      },
      async () => {
        const records = await fetchMedicalRecordsByPetId(petId)
        callback(records)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
