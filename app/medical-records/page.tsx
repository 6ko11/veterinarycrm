'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { MedicalRecord, fetchMedicalRecordsByPetId, deleteMedicalRecord, addMedicalRecord, updateMedicalRecord } from '@/lib/medical-records'
import { Pet, fetchPetsByClientId } from '@/lib/pets'
import { Client, fetchClients } from '@/lib/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { MedicalRecordForm } from '@/components/records/medical-record-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'

export default function MedicalRecordsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [medicalRecords, setMedicalRecords] = useState<(MedicalRecord & { pet: Pet & { client: Client } })[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllMedicalRecords()

    const channel = supabase
      .channel('medical-records-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medical_records'
        },
        async (payload) => {
          console.log('Change received!', payload)
          const message = payload.eventType === 'INSERT' 
            ? 'New medical record added' 
            : payload.eventType === 'DELETE' 
              ? 'Medical record removed' 
              : 'Medical record updated'
          
          toast.info(message)
          await loadAllMedicalRecords()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAllMedicalRecords = async () => {
    try {
      setLoading(true)
      // First, get all clients
      const clients = await fetchClients()
      
      // Then get all pets for each client
      const allPets: (Pet & { client: Client })[] = []
      await Promise.all(clients.map(async (client) => {
        const pets = await fetchPetsByClientId(client.id)
        allPets.push(...pets.map(pet => ({ ...pet, client })))
      }))
      
      // Finally, get all medical records for each pet
      const allRecords: (MedicalRecord & { pet: Pet & { client: Client } })[] = []
      await Promise.all(allPets.map(async (pet) => {
        const records = await fetchMedicalRecordsByPetId(pet.id)
        allRecords.push(...records.map(record => ({ ...record, pet })))
      }))
      
      // Sort records by date, newest first
      const sortedRecords = allRecords.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      setMedicalRecords(sortedRecords)
    } catch (error) {
      console.error('Error loading medical records:', error)
      toast.error('Failed to load medical records')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = medicalRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase()
    return (
      record.pet.name.toLowerCase().includes(searchLower) ||
      record.pet.client.name.toLowerCase().includes(searchLower) ||
      record.diagnosis.toLowerCase().includes(searchLower) ||
      record.treatment.toLowerCase().includes(searchLower) ||
      (record.notes?.toLowerCase() || '').includes(searchLower)
    )
  })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Button onClick={() => setSelectedRecord({} as MedicalRecord)}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading medical records...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-8">No medical records found.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                  <TableCell>{record.pet.name}</TableCell>
                  <TableCell>{record.pet.client.name}</TableCell>
                  <TableCell>{record.diagnosis}</TableCell>
                  <TableCell>{record.treatment}</TableCell>
                  <TableCell>{record.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRecord(record)}
                        title="Edit Record"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this medical record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={async () => {
                                try {
                                  await deleteMedicalRecord(record.id)
                                  // Update local state immediately
                                  setMedicalRecords(prev => prev.filter(r => r.id !== record.id))
                                  toast.success('Medical record deleted successfully')
                                } catch (error) {
                                  console.error('Error deleting medical record:', error)
                                  toast.error('Failed to delete medical record')
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MedicalRecordForm
        record={selectedRecord}
        petId={selectedRecord?.pet_id || 0}
        onClose={() => setSelectedRecord(null)}
        onSubmit={async (event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          const data = {
            pet_id: parseInt(formData.get('pet_id') as string),
            date: formData.get('date') as string,
            diagnosis: formData.get('diagnosis') as string,
            treatment: formData.get('treatment') as string,
            notes: formData.get('notes') as string || undefined,
          }

          try {
            if (selectedRecord?.id) {
              await updateMedicalRecord(selectedRecord.id, data)
              toast.success('Medical record updated successfully')
            } else {
              await addMedicalRecord(data)
              toast.success('Medical record created successfully')
            }
            setSelectedRecord(null)
            await loadAllMedicalRecords()
          } catch (error) {
            console.error('Error saving medical record:', error)
            toast.error('Failed to save medical record')
          }
        }}
      />
    </div>
  )
}
