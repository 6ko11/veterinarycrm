'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { InventoryItem, fetchInventoryItems, deleteInventoryItem, addInventoryItem, updateInventoryItem } from '@/lib/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { InventoryForm } from '@/components/inventory/inventory-form'
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
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from '@/lib/utils'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInventory()

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        async (payload) => {
          console.log('Change received!', payload)
          const message = payload.eventType === 'INSERT' 
            ? 'New item added' 
            : payload.eventType === 'DELETE' 
              ? 'Item removed' 
              : 'Item updated'
          
          toast.info(message)
          await loadInventory()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const items = await fetchInventoryItems()
      setItems(items)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedItem(null) // Ensure we clear any selected item
    setIsFormOpen(true)
  }

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setSelectedItem(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      console.log('Submitting inventory item:', data)
      console.log('Selected item:', selectedItem) // Debug log
      
      const formattedData = {
        ...data,
        quantity: Number(data.quantity),
        minimum_quantity: Number(data.minimum_quantity),
        purchase_price: Number(data.purchase_price),
        sale_price: Number(data.sale_price),
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : null
      }

      if (selectedItem?.id) { // Check specifically for id
        await updateInventoryItem(selectedItem.id, formattedData)
        toast.success('Item updated successfully')
      } else {
        await addInventoryItem(formattedData)
        toast.success('Item added successfully')
      }
      handleClose() // Close the form after successful submission
      await loadInventory()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medication':
        return 'bg-blue-500'
      case 'vaccine':
        return 'bg-green-500'
      case 'supply':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const isLowStock = (item: InventoryItem) => {
    return item.quantity <= item.minimum_quantity
  }

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expiry_date) return false
    const expiryDate = new Date(item.expiry_date)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    return expiryDate <= threeMonthsFromNow
  }

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower) ||
      item.manufacturer?.toLowerCase().includes(searchLower) ||
      item.supplier?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">No items found.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className={cn(
                    isLowStock(item) && "text-red-500 font-medium"
                  )}>
                    {item.quantity}
                    {isLowStock(item) && (
                      <AlertTriangle className="inline ml-2 h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(item.purchase_price)}</TableCell>
                  <TableCell>{formatCurrency(item.sale_price)}</TableCell>
                  <TableCell className={cn(
                    isExpiringSoon(item) && "text-red-500 font-medium"
                  )}>
                    {formatDate(item.expiry_date)}
                    {isExpiringSoon(item) && (
                      <AlertTriangle className="inline ml-2 h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell>
                    {isLowStock(item) && (
                      <Badge variant="destructive">Low Stock</Badge>
                    )}
                    {isExpiringSoon(item) && (
                      <Badge variant="destructive" className="ml-2">Expiring Soon</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        title="Edit Item"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this item? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={async () => {
                                try {
                                  await deleteInventoryItem(item.id)
                                  toast.success('Item deleted successfully')
                                } catch (error) {
                                  console.error('Error deleting item:', error)
                                  toast.error('Failed to delete item')
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

      <InventoryForm
        item={selectedItem}
        open={isFormOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
