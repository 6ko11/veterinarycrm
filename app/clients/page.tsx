'use client'

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Client, addClient, deleteClient, fetchClients, updateClient } from "@/lib/clients"
import { Pet, addPet, deletePet, fetchPetsByClientId, updatePet } from "@/lib/pets"
import { MedicalRecord, addMedicalRecord, deleteMedicalRecord, fetchMedicalRecordsByPetId, updateMedicalRecord } from "@/lib/medical-records"
import { Invoice, createInvoice, deleteInvoice, fetchInvoicesByPetId, updateInvoice } from "@/lib/invoices"
import { supabase } from "@/lib/supabase"
import { AuthCheck } from '@/components/auth/auth-check'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import components
import { ClientList } from "@/components/clients/client-list"
import { ClientForm } from "@/components/clients/client-form"
import { PetList } from "@/components/pets/pet-list"
import { PetForm } from "@/components/pets/pet-form"
import { MedicalRecordsDialog } from "@/components/records/medical-records-dialog"
import { MedicalRecordForm } from "@/components/records/medical-record-form"
import { InvoiceForm } from "@/components/records/invoice-form"
import { InvoiceList } from "@/components/records/invoice-list"

export default function ClientsPage() {
  return (
    <AuthCheck>
      <ClientsContent />
    </AuthCheck>
  )
}

function ClientsContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('clients')
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedClientForPet, setSelectedClientForPet] = useState<number>(0)
  const [selectedPetForRecords, setSelectedPetForRecords] = useState<Pet | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

  const loadClients = async () => {
    try {
      const clients = await fetchClients()
      setClients(clients)
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Failed to load clients')
    }
  }

  const loadPets = async () => {
    try {
      const allPets: Pet[] = []
      await Promise.all(clients.map(async (client) => {
        const clientPets = await fetchPetsByClientId(client.id)
        allPets.push(...clientPets)
      }))
      setPets(allPets)
    } catch (error) {
      console.error('Error loading pets:', error)
      toast.error('Failed to load pets')
    }
  }

  useEffect(() => {
    loadClients()

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        async (payload) => {
          console.log('Change received!', payload)
          const message = payload.eventType === 'INSERT' 
            ? 'New client added' 
            : payload.eventType === 'DELETE' 
              ? 'Client removed' 
              : 'Client updated'
          
          toast.info(message)
          await loadClients()
        }
      )
      .subscribe()

    const clientsSubscription = supabase
      .channel('clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        await loadClients()
      })
      .subscribe()

    const petsSubscription = supabase
      .channel('pets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pets' }, async () => {
        await loadPets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clientsSubscription.unsubscribe()
      petsSubscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (clients.length > 0) {
      loadPets()
    }
  }, [clients])

  const loadMedicalRecords = async (petId: number) => {
    try {
      const records = await fetchMedicalRecordsByPetId(petId)
      setMedicalRecords(records)
    } catch (error) {
      console.error('Error loading medical records:', error)
      toast.error('Failed to load medical records')
    }
  }

  const loadInvoices = async (petId: number) => {
    try {
      const fetchedInvoices = await fetchInvoicesByPetId(petId)
      setInvoices(fetchedInvoices.map(invoice => ({
        ...invoice,
        items: invoice.invoice_items // Map invoice_items to items
      })))
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Failed to load invoices')
    }
  }

  const handleClientSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const clientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    }

    try {
      if (selectedClient?.id) {
        await updateClient({ ...clientData, id: selectedClient.id })
        toast.success('Client updated successfully')
      } else {
        await addClient(clientData)
        toast.success('Client added successfully')
      }
      setSelectedClient(null)
      await loadClients()
    } catch (error) {
      console.error('Error saving client:', error)
      toast.error('Failed to save client')
    }
  }

  const handlePetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const petData = {
      name: formData.get('name') as string,
      species: formData.get('species') as string,
      breed: formData.get('breed') as string,
      age: parseInt(formData.get('age') as string),
      client_id: selectedClientForPet,
    }

    try {
      if (selectedPet?.id) {
        await updatePet(selectedPet.id, petData)
        toast.success('Pet updated successfully')
      } else {
        await addPet(petData)
        toast.success('Pet added successfully')
      }
      setSelectedPet(null)
      setSelectedClientForPet(0)
      await loadPets()
    } catch (error) {
      console.error('Error saving pet:', error)
      toast.error('Failed to save pet')
    }
  }

  const handleMedicalRecordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const recordData = {
      date: formData.get('date') as string,
      diagnosis: formData.get('diagnosis') as string,
      treatment: formData.get('treatment') as string,
      notes: formData.get('notes') as string,
      next_appointment: formData.get('next_appointment') ? (formData.get('next_appointment') as string) : undefined,
      pet_id: parseInt(formData.get('pet_id') as string),
    }

    try {
      if (selectedMedicalRecord?.id) {
        await updateMedicalRecord(selectedMedicalRecord.id, recordData)
        toast.success('Medical record updated successfully')
      } else {
        await addMedicalRecord(recordData)
        toast.success('Medical record added successfully')
      }
      setSelectedMedicalRecord(null)
      await loadMedicalRecords(selectedPetForRecords?.id as number)
    } catch (error) {
      console.error('Error saving medical record:', error)
      toast.error('Failed to save medical record')
    }
  }

  const handleInvoiceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const items = Array.from(formData.getAll('items')).map(item => {
      const parsedItem = JSON.parse(item as string)
      // Only include fields that exist in the database table
      return {
        description: parsedItem.description,
        quantity: parsedItem.quantity,
        unit_price: parsedItem.unit_price
      }
    })
    
    const invoiceData = {
      date: formData.get('date') as string,
      total: parseFloat(formData.get('total') as string),
      status: formData.get('status') as 'pending' | 'paid' | 'cancelled',
      pet_id: selectedPetForRecords?.id as number,
      client_id: selectedPetForRecords?.client_id as number,
    }

    try {
      if (selectedInvoice?.id) {
        await updateInvoice(selectedInvoice.id, invoiceData, items)
        toast.success('Invoice updated successfully')
      } else {
        await createInvoice(invoiceData, items)
        toast.success('Invoice added successfully')
      }
      setSelectedInvoice(null)
      setShowInvoiceForm(false)
      await loadInvoices(selectedPetForRecords?.id as number)
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error('Failed to save invoice')
    }
  }

  const handleViewRecords = async (pet: Pet) => {
    setSelectedPetForRecords(pet)
    await loadMedicalRecords(pet.id)
    await loadInvoices(pet.id)
  }

  const handleEditInvoice = async (invoice: Invoice) => {
    // Fetch the complete invoice with items before editing
    try {
      const fetchedInvoices = await fetchInvoicesByPetId(invoice.pet_id)
      const completeInvoice = fetchedInvoices.find(i => i.id === invoice.id)
      if (completeInvoice) {
        setSelectedInvoice({
          ...completeInvoice,
          items: completeInvoice.invoice_items
        })
        setShowInvoiceForm(true)
      }
    } catch (error) {
      console.error('Error loading invoice for edit:', error)
      toast.error('Failed to load invoice details')
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search clients and pets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setSelectedClient({} as Client)}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Clients</h2>
            <ClientList
              clients={clients}
              onEdit={setSelectedClient}
              onDelete={async (client) => {
                try {
                  await deleteClient(client.id)
                  toast.success('Client deleted successfully')
                  await loadClients()
                } catch (error) {
                  console.error('Error deleting client:', error)
                  toast.error('Failed to delete client')
                }
              }}
              onAddPet={(clientId) => {
                setSelectedClientForPet(clientId)
                setSelectedPet({} as Pet)
              }}
              onViewPets={(clientId) => {
                setActiveTab('pets')
                setSearchTerm(clients.find(c => c.id === clientId)?.name || '')
              }}
              searchTerm={searchTerm}
            />
          </div>
        </TabsContent>

        <TabsContent value="pets" className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pets</h2>
            </div>
            <PetList
              pets={pets}
              clients={clients}
              onEdit={(clientId, pet) => {
                setSelectedClientForPet(clientId)
                setSelectedPet(pet)
              }}
              onDelete={async (pet) => {
                try {
                  await deletePet(pet.id)
                  toast.success('Pet deleted successfully')
                  await loadPets()
                } catch (error) {
                  console.error('Error deleting pet:', error)
                  toast.error('Failed to delete pet')
                }
              }}
              onViewRecords={handleViewRecords}
              searchTerm={searchTerm}
            />
          </div>
        </TabsContent>
      </Tabs>

      <ClientForm
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onSubmit={handleClientSubmit}
      />

      <PetForm
        pet={selectedPet}
        clientId={selectedClientForPet}
        onClose={() => {
          setSelectedPet(null)
          setSelectedClientForPet(0)
        }}
        onSubmit={handlePetSubmit}
      />

      <MedicalRecordsDialog
        pet={selectedPetForRecords}
        medicalRecords={medicalRecords}
        invoices={invoices}
        onClose={() => {
          setSelectedPetForRecords(null)
          setMedicalRecords([])
          setInvoices([])
        }}
        onAddRecord={() => setSelectedMedicalRecord({} as MedicalRecord)}
        onEditRecord={setSelectedMedicalRecord}
        onDeleteRecord={async (record) => {
          try {
            await deleteMedicalRecord(record.id)
            toast.success('Medical record deleted successfully')
            await loadMedicalRecords(selectedPetForRecords?.id as number)
          } catch (error) {
            console.error('Error deleting medical record:', error)
            toast.error('Failed to delete medical record')
          }
        }}
        onAddInvoice={() => {
          setSelectedInvoice({
            client_id: selectedPetForRecords?.client_id,
            pet_id: selectedPetForRecords?.id,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
          } as Invoice)
          setShowInvoiceForm(true)
        }}
        onEditInvoice={handleEditInvoice}
        onDeleteInvoice={async (invoice) => {
          try {
            await deleteInvoice(invoice.id)
            toast.success('Invoice deleted successfully')
            await loadInvoices(selectedPetForRecords?.id as number)
          } catch (error) {
            console.error('Error deleting invoice:', error)
            toast.error('Failed to delete invoice')
          }
        }}
      />

      <MedicalRecordForm
        record={selectedMedicalRecord}
        onClose={() => setSelectedMedicalRecord(null)}
        onSubmit={handleMedicalRecordSubmit}
        petId={selectedPetForRecords?.id || 0}
      />

      {showInvoiceForm && (
        <InvoiceForm
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceForm(false)
            setSelectedInvoice(null)
          }}
          onSubmit={handleInvoiceSubmit}
        />
      )}
    </div>
  )
}
