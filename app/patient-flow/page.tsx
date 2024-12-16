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
import { toast } from '@/hooks/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Owner = {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  owner_id: number;
}

type MedicalRecord = {
  id: number;
  pet_id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
}

type Invoice = {
  id: number;
  owner_id: number;
  pet_id: number;
  date: string;
  items: InvoiceItem[];
  total: number;
}

export default function PatientFlowPage() {
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
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
    owner_id: 0,
    pet_id: 0,
    date: new Date().toISOString().split('T')[0],
    items: [],
    total: 0,
  })
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id'>>({
    description: '',
    quantity: 1,
    unit_price: 0,
  })
  const [owners, setOwners] = useState<Owner[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    fetchOwners()
    fetchPets()
    fetchMedicalRecords()
    fetchInvoices()
  }, [])

  const fetchOwners = async () => {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from('owners').select('*')
    if (error) console.error('Error fetching owners:', error)
    else setOwners(data)
  }

  const fetchPets = async () => {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from('pets').select('*')
    if (error) console.error('Error fetching pets:', error)
    else setPets(data)
  }

  const fetchMedicalRecords = async () => {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from('medical_records').select('*')
    if (error) console.error('Error fetching medical records:', error)
    else setMedicalRecords(data)
  }

  const fetchInvoices = async () => {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from('invoices').select('*')
    if (error) console.error('Error fetching invoices:', error)
    else setCreatedInvoices(data)
  }

  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.phone.includes(searchTerm)
  )

  const handleOwnerSelect = (owner: Owner) => {
    setSelectedOwner(owner)
    setStep(2)
  }

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet)
    setStep(3)
  }

  const handleRecordSelect = (record: MedicalRecord) => {
    setSelectedRecord(record)
  }

  const handleCreateRecord = () => {
    if (selectedPet) {
      setNewRecord(prev => ({ ...prev, pet_id: selectedPet.id }))
    }
    setSelectedRecord(null)
  }

  const handleSaveRecord = async () => {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase.from('medical_records').insert(newRecord)
    if (error) {
      console.error('Error saving record:', error)
      toast({
        title: "Error",
        description: "Failed to save medical record.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Medical Record Saved",
        description: "The medical record has been successfully saved.",
      })
      fetchMedicalRecords()
      setStep(4)
    }
  }

  const handleAddInvoiceItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.unit_price > 0) {
      setInvoice(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem, id: prev.items.length + 1 }],
        total: prev.total + newItem.quantity * newItem.unit_price,
      }))
      setNewItem({ description: '', quantity: 1, unit_price: 0 })
    }
  }

  const handleCreateInvoice = async () => {
    const supabase = createClientComponentClient()
    if (selectedOwner && selectedPet) {
      const newInvoice: Omit<Invoice, 'id'> = {
        owner_id: selectedOwner.id,
        pet_id: selectedPet.id,
        date: invoice.date,
        items: invoice.items,
        total: invoice.total,
      }
      
      const { data, error } = await supabase.from('invoices').insert(newInvoice)
      if (error) {
        console.error('Error creating invoice:', error)
        toast({
          title: "Error",
          description: "Failed to create invoice.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Invoice Created",
          description: `Invoice has been created and saved.`,
        })
        fetchInvoices()
        // Reset the flow
        setStep(1)
        setSelectedOwner(null)
        setSelectedPet(null)
        setSelectedRecord(null)
        setNewRecord({
          pet_id: 0,
          date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          treatment: '',
          notes: '',
        })
        setInvoice({
          owner_id: 0,
          pet_id: 0,
          date: new Date().toISOString().split('T')[0],
          items: [],
          total: 0,
        })
      }
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Patient Flow</h1>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Find Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>{owner.name}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.phone}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleOwnerSelect(owner)}>Select</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Select Pet for {selectedOwner.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pets.filter(pet => pet.owner_id === selectedOwner.id).map((pet) => (
                  <TableRow key={pet.id}>
                    <TableCell>{pet.name}</TableCell>
                    <TableCell>{pet.species}</TableCell>
                    <TableCell>{pet.breed}</TableCell>
                    <TableCell>{pet.age}</TableCell>
                    <TableCell>
                      <Button onClick={() => handlePetSelect(pet)}>Select</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {step === 3 && selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle>Medical Records for {selectedPet.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="view">
              <TabsList>
                <TabsTrigger value="view">View Records</TabsTrigger>
                <TabsTrigger value="create">Create Record</TabsTrigger>
              </TabsList>
              <TabsContent value="view">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalRecords.filter(record => record.pet_id === selectedPet.id).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleRecordSelect(record)}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="create">
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      id="date"
                      value={newRecord.date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRecord({ ...newRecord, date: e.target.value })}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      type="text"
                      id="diagnosis"
                      value={newRecord.diagnosis}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="treatment">Treatment</Label>
                    <Input
                      type="text"
                      id="treatment"
                      value={newRecord.treatment}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      type="text"
                      id="notes"
                      value={newRecord.notes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSaveRecord}>Save Record</Button>
                </div>
              </TabsContent>
            </Tabs>
            {selectedRecord && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">View Full Record</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Medical Record for {selectedPet.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p><strong>Date:</strong> {selectedRecord.date}</p>
                    <p><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
                    <p><strong>Treatment:</strong> {selectedRecord.treatment}</p>
                    <p><strong>Notes:</strong> {selectedRecord.notes}</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button className="mt-4" onClick={() => setStep(4)}>Proceed to Invoice</Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && selectedOwner && selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle>Create Invoice for {selectedOwner.name}'s pet {selectedPet.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  type="date"
                  id="invoiceDate"
                  value={invoice.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoice({ ...invoice, date: e.target.value })}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell>${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex space-x-4">
                <Input
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Unit Price"
                  value={newItem.unit_price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) })}
                />
                <Button onClick={handleAddInvoiceItem}>Add Item</Button>
              </div>
              <p><strong>Total:</strong> ${invoice.total.toFixed(2)}</p>
              <Button onClick={handleCreateInvoice}>Create Invoice</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {createdInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {createdInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{owners.find(o => o.id === invoice.owner_id)?.name}</TableCell>
                    <TableCell>{pets.find(p => p.id === invoice.pet_id)?.name}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
