'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Invoice, fetchInvoicesByPetId, deleteInvoice, updateInvoice, createInvoice } from '@/lib/invoices'
import { Pet, fetchPetsByClientId } from '@/lib/pets'
import { Client, fetchClients } from '@/lib/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { InvoiceForm } from '@/components/records/invoice-form'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from '@/lib/utils'
import { AuthCheck } from '@/components/auth/auth-check'

export default function BillingPage() {
  return (
    <AuthCheck>
      <BillingContent />
    </AuthCheck>
  )
}

function BillingContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [invoices, setInvoices] = useState<(Invoice & { pet: Pet & { client: Client } })[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

  useEffect(() => {
    loadAllInvoices()

    const channel = supabase
      .channel('invoice-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        async (payload) => {
          console.log('Change received!', payload)
          const message = payload.eventType === 'INSERT' 
            ? 'New invoice added' 
            : payload.eventType === 'DELETE' 
              ? 'Invoice removed' 
              : 'Invoice updated'
          
          toast.info(message)
          await loadAllInvoices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAllInvoices = async () => {
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
      
      // Finally, get all invoices for each pet
      const allInvoices: (Invoice & { pet: Pet & { client: Client } })[] = []
      await Promise.all(allPets.map(async (pet) => {
        const invoices = await fetchInvoicesByPetId(pet.id)
        allInvoices.push(...invoices.map(invoice => ({ ...invoice, pet })))
      }))
      
      // Sort invoices by ID in descending order (newest first)
      allInvoices.sort((a, b) => b.id - a.id)
      
      setInvoices(allInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'overdue':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase()
    return (
      invoice.pet.name.toLowerCase().includes(searchLower) ||
      invoice.pet.client.name.toLowerCase().includes(searchLower) ||
      invoice.status.toLowerCase().includes(searchLower) ||
      formatCurrency(invoice.total).toLowerCase().includes(searchLower)
    )
  })

  const handleInvoiceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const items = Array.from(formData.getAll('items')).map(item => {
      const parsedItem = JSON.parse(item as string)
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
      pet_id: parseInt(formData.get('pet_id') as string),
      client_id: parseInt(formData.get('client_id') as string),
    }

    try {
      if (selectedInvoice?.id) {
        await updateInvoice(selectedInvoice.id, invoiceData, items)
        toast.success('Invoice updated successfully')
      } else {
        await createInvoice(invoiceData, items)
        toast.success('Invoice created successfully')
      }
      setSelectedInvoice(null)
      setShowInvoiceForm(false)
      await loadAllInvoices()
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error('Failed to save invoice')
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Button onClick={() => {
            setSelectedInvoice(null)
            setShowInvoiceForm(true)
          }}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-8">No invoices found.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>#{invoice.id.toString().padStart(5, '0')}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.pet.name}</TableCell>
                  <TableCell>{invoice.pet.client.name}</TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingInvoice(invoice)}
                        title="View Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedInvoice(invoice)}
                        title="Edit Invoice"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this invoice? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await deleteInvoice(invoice.id)
                                  toast.success('Invoice deleted successfully')
                                } catch (error) {
                                  console.error('Error deleting invoice:', error)
                                  toast.error('Failed to delete invoice')
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

      {showInvoiceForm && (
        <InvoiceForm
          invoice={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null)
            setShowInvoiceForm(false)
          }}
          onSubmit={handleInvoiceSubmit}
        />
      )}

      {viewingInvoice && (
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice #{viewingInvoice.id.toString().padStart(5, '0')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Date: {formatDate(viewingInvoice.date)}</p>
              <p>Pet: {viewingInvoice.pet.name}</p>
              <p>Owner: {viewingInvoice.pet.client.name}</p>
              <p>Total: {formatCurrency(viewingInvoice.total)}</p>
              <p>Status: {viewingInvoice.status}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
