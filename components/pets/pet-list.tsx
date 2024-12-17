'use client'

import { Pet } from "@/lib/pets"
import { Client } from "@/lib/clients"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Stethoscope } from "lucide-react"
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

interface PetListProps {
  pets: Pet[]
  clients: Client[]
  onEdit: (clientId: number, pet: Pet) => void
  onDelete: (pet: Pet) => void
  onViewRecords: (pet: Pet) => void
  searchTerm: string
}

export function PetList({ pets, clients, onEdit, onDelete, onViewRecords, searchTerm }: PetListProps) {
  const filteredPets = pets.filter(pet => {
    const ownerName = clients.find(c => c.id === pet.client_id)?.name || ''
    return (
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No pets found.
              </TableCell>
            </TableRow>
          ) : (
            filteredPets.map((pet) => {
              const owner = clients.find(c => c.id === pet.client_id)
              return (
                <TableRow key={pet.id}>
                  <TableCell>{pet.name}</TableCell>
                  <TableCell>{pet.species}</TableCell>
                  <TableCell>{pet.breed || '-'}</TableCell>
                  <TableCell>{pet.age || '-'}</TableCell>
                  <TableCell>{owner?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewRecords(pet)}
                        title="Medical Records"
                      >
                        <Stethoscope className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(pet.client_id, pet)}
                        title="Edit Pet"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Pet"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Pet</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this pet? This will also delete all associated medical records and invoices.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(pet)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
