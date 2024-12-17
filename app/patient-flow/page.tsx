'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  Client,
  Pet,
  MedicalRecord,
  InvoiceItem,
  Invoice,
  fetchClients,
  fetchPets,
  fetchMedicalRecords,
  fetchInvoices,
  createMedicalRecord,
  createInvoice,
  updateMedicalRecord,
  updateInvoice,
  deleteMedicalRecord,
  deleteInvoice
} from '@/lib/patient-flow'

export default function PatientFlowPage() {
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [newRecord, setNewRecord] = useState<Omit<MedicalRecord, 'id'>>({
    pet_id: 0,
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: '',
  })
  const [invoice, setInvoice] = useState<Omit<Invoice, 'id'>>({
    client_id: 0,
    pet_id: 0,
    date: new Date().toISOString().split('T')[0],
    total: 0,
    status: 'pending',
    items: [] as InvoiceItem[],
  })
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id' | 'invoice_id'>>({
    description: '',
    quantity: 1,
    unit_price: 0,
  })
  const [clients, setClients] = useState<Client[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInitialData()

    // Set up real-time subscriptions
    const channel = supabase
      .channel('patient-flow-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => loadClients()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pets' },
        () => loadPets()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medical_records' },
        () => loadMedicalRecords()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => loadInvoices()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadClients(),
        loadPets(),
        loadMedicalRecords(),
        loadInvoices(),
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load initial data')
    }
    setLoading(false)
  }

  const loadClients = async () => {
    try {
      const data = await fetchClients()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Failed to load clients')
    }
  }

  const loadPets = async () => {
    try {
      const data = await fetchPets(selectedClient?.id)
      setPets(data)
    } catch (error) {
      console.error('Error loading pets:', error)
      toast.error('Failed to load pets')
    }
  }

  const loadMedicalRecords = async () => {
    try {
      const data = await fetchMedicalRecords(selectedPet?.id)
      setMedicalRecords(data)
    } catch (error) {
      console.error('Error loading medical records:', error)
      toast.error('Failed to load medical records')
    }
  }

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices(selectedClient?.id)
      setCreatedInvoices(data)
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Failed to load invoices')
    }
  }

  const handleClientSelect = async (clientId: string) => {
    const client = clients.find(c => c.id === parseInt(clientId))
    setSelectedClient(client || null)
    setSelectedPet(null)
    setSelectedRecord(null)
    if (client) {
      try {
        const pets = await fetchPets(client.id)
        setPets(pets)
      } catch (error) {
        console.error('Error loading pets:', error)
        toast.error('Failed to load pets')
      }
    } else {
      setPets([])
    }
  }

  const handlePetSelect = async (petId: string) => {
    const pet = pets.find(p => p.id === parseInt(petId))
    setSelectedPet(pet || null)
    setSelectedRecord(null)
    if (pet) {
      setNewRecord(prev => ({ ...prev, pet_id: pet.id }))
      setInvoice(prev => ({ ...prev, client_id: pet.client_id, pet_id: pet.id }))
      try {
        const records = await fetchMedicalRecords(pet.id)
        setMedicalRecords(records)
      } catch (error) {
        console.error('Error loading medical records:', error)
        toast.error('Failed to load medical records')
      }
    } else {
      setMedicalRecords([])
    }
  }

  const handleCreateRecord = async () => {
    if (!selectedPet) return
    try {
      await createMedicalRecord(newRecord)
      setNewRecord({
        pet_id: selectedPet.id,
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        notes: '',
      })
      toast.success('Medical record created successfully')
    } catch (error) {
      console.error('Error creating medical record:', error)
      toast.error('Failed to create medical record')
    }
  }

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return
    try {
      await updateMedicalRecord(selectedRecord.id, selectedRecord)
      setSelectedRecord(null)
      toast.success('Medical record updated successfully')
    } catch (error) {
      console.error('Error updating medical record:', error)
      toast.error('Failed to update medical record')
    }
  }

  const handleDeleteRecord = async (recordId: number) => {
    try {
      await deleteMedicalRecord(recordId)
      toast.success('Medical record deleted successfully')
    } catch (error) {
      console.error('Error deleting medical record:', error)
      toast.error('Failed to delete medical record')
    }
  }

  const handleAddItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unit_price) return
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, id: 0, invoice_id: 0 }],
      total: prev.total + (newItem.quantity * newItem.unit_price)
    }))
    setNewItem({
      description: '',
      quantity: 1,
      unit_price: 0,
    })
  }

  const handleRemoveItem = (index: number) => {
    setInvoice(prev => {
      const items = [...prev.items]
      const removed = items.splice(index, 1)[0]
      return {
        ...prev,
        items,
        total: prev.total - (removed.quantity * removed.unit_price)
      }
    })
  }

  const handleCreateInvoice = async () => {
    if (!selectedClient || !selectedPet || invoice.items.length === 0) return
    try {
      const invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
        ...invoice,
        client_id: selectedClient.id,
        pet_id: selectedPet.id,
        status: 'pending' as const,
      }
      await createInvoice(invoiceData)
      setInvoice({
        client_id: selectedClient.id,
        pet_id: selectedPet.id,
        date: new Date().toISOString().split('T')[0],
        total: 0,
        status: 'pending' as const,
        items: [],
      })
      toast.success('Invoice created successfully')
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
    }
  }

  const isValidInvoiceStatus = (status: string): status is 'pending' | 'paid' | 'cancelled' => {
    return ['pending', 'paid', 'cancelled'].includes(status)
  }

  const handleUpdateInvoice = async (invoiceId: number, status: string) => {
    if (!isValidInvoiceStatus(status)) {
      toast.error('Invalid invoice status')
      return
    }
    try {
      await updateInvoice(invoiceId, { status })
      toast.success('Invoice status updated successfully')
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast.error('Failed to update invoice')
    }
  }

  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await deleteInvoice(invoiceId)
      toast.success('Invoice deleted successfully')
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Failed to delete invoice')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClient?.id?.toString()} onValueChange={handleClientSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {filteredClients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPet?.id?.toString()} onValueChange={handlePetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id.toString()}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedPet && (
        <Tabs defaultValue="records" className="mt-6">
          <TabsList>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Add Medical Record</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Medical Record</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newRecord.date}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Diagnosis</Label>
                        <Input
                          value={newRecord.diagnosis}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Treatment</Label>
                        <Input
                          value={newRecord.treatment}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, treatment: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={newRecord.notes || ''}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleCreateRecord}>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create Invoice</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>New Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={invoice.date}
                          onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={newItem.description}
                            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={newItem.quantity}
                              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              value={newItem.unit_price}
                              onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddItem}>Add Item</Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoice.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                              <TableCell>${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="text-right">
                        <p className="text-lg font-bold">Total: ${invoice.total.toFixed(2)}</p>
                      </div>
                      <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {createdInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.items.length}</TableCell>
                        <TableCell>${invoice.total.toFixed(2)}</TableCell>
                        <TableCell>{invoice.status}</TableCell>
                        <TableCell>
                          <Select
                            value={invoice.status}
                            onValueChange={(value) => handleUpdateInvoice(invoice.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
