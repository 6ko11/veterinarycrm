'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Invoice } from '@/lib/invoices'
import { Pet, fetchPetsByClientId } from '@/lib/pets'
import { Client, fetchClients } from '@/lib/clients'
import { InventoryItem, searchInventory } from '@/lib/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from '@/lib/utils'

interface InvoiceFormProps {
  invoice?: Invoice | null
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

interface InvoiceItem {
  inventory_id?: number
  description: string
  quantity: number
  unit_price: number
  name?: string // for display only
}

export function InvoiceForm({ invoice, onClose, onSubmit }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadClients()
    if (invoice?.client_id) {
      setSelectedClientId(invoice.client_id.toString())
      loadPets(invoice.client_id)
    }
    // Initialize selected items if editing an invoice
    if (invoice?.items) {
      setSelectedItems(invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        name: item.description // Use description as name for display
      })))
    }
  }, [invoice])

  useEffect(() => {
    if (selectedClientId) {
      loadPets(parseInt(selectedClientId))
    } else {
      setPets([])
    }
  }, [selectedClientId])

  useEffect(() => {
    const newTotal = selectedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    setTotal(newTotal)
  }, [selectedItems])

  const loadClients = async () => {
    try {
      const fetchedClients = await fetchClients()
      setClients(fetchedClients)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadPets = async (clientId: number) => {
    try {
      const fetchedPets = await fetchPetsByClientId(clientId)
      setPets(fetchedPets)
    } catch (error) {
      console.error('Error loading pets:', error)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.length >= 2) {
      try {
        const results = await searchInventory(term)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching inventory:', error)
        setSearchResults([])
      }
    } else {
      setSearchResults([])
    }
  }

  const addItem = (item: InventoryItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.inventory_id === item.id)
      if (existing) {
        return prev.map(i => 
          i.inventory_id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, {
        inventory_id: item.id,
        description: item.name,
        quantity: 1,
        unit_price: item.sale_price,
        name: item.name // for display only
      }]
    })
    setSearchTerm('')
    setSearchResults([])
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    setSelectedItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{invoice?.id ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="total" value={total} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                name="client_id"
                value={selectedClientId}
                onValueChange={setSelectedClientId}
                disabled={!!invoice?.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pet</label>
              <Select 
                name="pet_id" 
                defaultValue={invoice?.pet_id?.toString()}
                disabled={!!invoice?.pet_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              name="date"
              defaultValue={invoice?.date || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select name="status" defaultValue={invoice?.status || 'pending'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md p-2 space-y-2">
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => addItem(item)}
                  >
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.sale_price)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Selected Items</h3>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-gray-500">No items selected</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="hidden"
                        name="items"
                        value={JSON.stringify({
                          description: item.description,
                          quantity: item.quantity,
                          unit_price: item.unit_price
                        })}
                      />
                      <span className="flex-1">{item.name || item.description}</span>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                        className="w-20"
                        min="1"
                      />
                      <span className="w-24 text-right">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4 border-t">
                    <span className="font-medium">Total: {formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {invoice?.id ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
