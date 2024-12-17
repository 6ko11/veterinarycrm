'use client'

import { Client } from "@/lib/clients"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, PawPrint } from "lucide-react"
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

interface ClientListProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onAddPet: (clientId: number) => void
  onViewPets?: (clientId: number) => void
  searchTerm: string
}

export function ClientList({ 
  clients, 
  onEdit, 
  onDelete, 
  onAddPet, 
  onViewPets, 
  searchTerm 
}: ClientListProps) {
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {onViewPets && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewPets(client.id)}
                        title="View Pets"
                      >
                        <PawPrint className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(client)}
                      title="Edit Client"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAddPet(client.id)}
                      title="Add Pet"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this client? This will also delete all associated pets and records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(client)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
