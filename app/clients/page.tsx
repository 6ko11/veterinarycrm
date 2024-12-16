'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from '@/lib/supabase'
import { ChangeEvent } from 'react'

type Client = {
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
  clientId: number | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [newClient, setNewClient] = useState<Client>({ id: 0, name: '', email: '', phone: '' })
  const [newPet, setNewPet] = useState<Pet>({ id: 0, name: '', species: '', breed: '', age: 0, clientId: null })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
      if (error) {
        console.error('Error fetching clients:', error)
      } else {
        setClients(data || [])
      }
    }

    const fetchPets = async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
      if (error) {
        console.error('Error fetching pets:', error)
      } else {
        setPets(data || [])
      }
    }

    fetchClients()
    fetchPets()
    
    // Refetch pets after a short delay to refresh schema cache
    setTimeout(() => {
      fetchPets();
    }, 1000);
  }, [])


  const handleAddClient = async () => {
    if (newClient.name && newClient.email && newClient.phone) {
      const { error } = await supabase
        .from('clients')
        .insert([newClient])
      if (error) {
        console.error('Error adding client:', error)
      } else {
        setClients(prevClients => [...prevClients, newClient])
        setNewClient({ id: 0, name: '', email: '', phone: '' })
      }
    } else {
      alert('Please fill in all client fields')
    }
  }

  const handleAddPet = async () => {
    if (newPet.name && newPet.species && newPet.breed && newPet.age && newPet.clientId != null) {
      const { error } = await supabase
        .from('pets')
        .insert([newPet])
      if (error) {
        console.error('Error adding pet:', error)
      } else {
        setPets(prevPets => [...prevPets, newPet])
        setNewPet({ id: 0, name: '', species: '', breed: '', age: 0, clientId: null })
      }
    } else {
      alert('Please fill in all pet fields')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Clients & Pets</h1>
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search clients or pets..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Tabs defaultValue="clients">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
        </TabsList>
        <TabsContent value="clients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clients</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Client</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, email: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newClient.phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddClient}>Add Client</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
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
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pets</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Pet</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Pet</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="petName" className="text-right">Name</Label>
                      <Input
                        id="petName"
                        value={newPet.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPet({ ...newPet, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="species" className="text-right">Species</Label>
                      <Input
                        id="species"
                        value={newPet.species}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPet({ ...newPet, species: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="breed" className="text-right">Breed</Label>
                      <Input
                        id="breed"
                        value={newPet.breed}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPet({ ...newPet, breed: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="age" className="text-right">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={newPet.age}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPet({ ...newPet, age: parseInt(e.target.value) })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="clientId" className="text-right">Client</Label>
                      <select
                        id="clientId"
                        value={newPet.clientId == null ? "" : newPet.clientId}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewPet({ ...newPet, clientId: e.target.value === "" ? null : parseInt(e.target.value) })}
                        className="col-span-3"
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleAddPet}>Add Pet</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell>{pet.name}</TableCell>
                      <TableCell>{pet.species}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{pet.age}</TableCell>
                      <TableCell>{clients.find(c => c.id === pet.clientId)?.name}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
