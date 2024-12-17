'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { CalendarIcon } from 'lucide-react'
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InventoryItem } from '@/lib/inventory'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['medication', 'vaccine', 'supply']),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  minimum_quantity: z.coerce.number().min(0, 'Minimum quantity must be 0 or greater'),
  purchase_price: z.coerce.number().min(0, 'Purchase price must be 0 or greater'),
  sale_price: z.coerce.number().min(0, 'Sale price must be 0 or greater'),
  expiry_date: z.date().optional().nullable(),
  manufacturer: z.string().optional(),
  supplier: z.string().optional(),
  storage_conditions: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface InventoryFormProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void
}

export function InventoryForm({ item, open, onClose, onSubmit }: InventoryFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'medication',
      description: '',
      sku: '',
      quantity: 0,
      minimum_quantity: 0,
      purchase_price: 0,
      sale_price: 0,
      expiry_date: null,
      manufacturer: '',
      supplier: '',
      storage_conditions: '',
    },
  })

  useEffect(() => {
    if (item) {
      const formData: FormData = {
        name: item.name,
        type: item.type,
        description: item.description || '',
        sku: item.sku,
        quantity: item.quantity,
        minimum_quantity: item.minimum_quantity,
        purchase_price: item.purchase_price,
        sale_price: item.sale_price,
        expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
        manufacturer: item.manufacturer || '',
        supplier: item.supplier || '',
        storage_conditions: item.storage_conditions || '',
      }
      form.reset(formData)
    } else {
      form.reset({
        name: '',
        type: 'medication',
        description: '',
        sku: '',
        quantity: 0,
        minimum_quantity: 0,
        purchase_price: 0,
        sale_price: 0,
        expiry_date: null,
        manufacturer: '',
        supplier: '',
        storage_conditions: '',
      })
    }
  }, [item, form])

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      expiry_date: data.expiry_date?.toISOString().split('T')[0] || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="vaccine">Vaccine</SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ReactDatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date)}
                          dateFormat="PPP"
                          isClearable
                          minDate={new Date()}
                          placeholderText="Pick a date"
                          className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          )}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minimum_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      Alert when stock falls below this number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storage_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Conditions</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {item ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
