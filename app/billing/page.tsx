'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

type Invoice = {
  id: number;
  invoiceNumber: string;
  client: string;
  pet: string;
  items: InvoiceItem[];
  discount: number;
  total: number;
  date: string;
  status: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: "INV-001",
      client: "John Doe",
      pet: "Max",
      items: [
        { id: 1, description: "Annual check-up", quantity: 1, unitPrice: 100 },
        { id: 2, description: "Vaccinations", quantity: 2, unitPrice: 25 },
      ],
      discount: 0,
      total: 150,
      date: "2023-06-10",
      status: "Paid"
    },
    {
      id: 2,
      invoiceNumber: "INV-002",
      client: "Jane Smith",
      pet: "Whiskers",
      items: [
        { id: 1, description: "Dental cleaning", quantity: 1, unitPrice: 200 },
      ],
      discount: 10,
      total: 180,
      date: "2023-06-12",
      status: "Pending"
    },
  ])

  const [newInvoice, setNewInvoice] = useState<Invoice>({
    id: 0,
    invoiceNumber: "",
    client: "",
    pet: "",
    items: [],
    discount: 0,
    total: 0,
    date: "",
    status: "Pending",
  })

  const [newItem, setNewItem] = useState<InvoiceItem>({
    id: 0,
    description: "",
    quantity: 1,
    unitPrice: 0,
  })

  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    setNewInvoice(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
    }))
  }, [])

  const generateInvoiceNumber = () => {
    const prefix = "INV-"
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix}${number}`
  }

  const calculateTotal = (items: InvoiceItem[], discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const discountAmount = subtotal * (discount / 100)
    return subtotal - discountAmount
  }

  const handleAddItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.unitPrice > 0) {
      setNewInvoice(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem, id: prev.items.length + 1 }],
      }))
      setNewItem({ id: 0, description: "", quantity: 1, unitPrice: 0 })
    }
  }

  const handleRemoveItem = (id: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }))
  }

  const handleAddInvoice = () => {
    if (newInvoice.client && newInvoice.pet && newInvoice.items.length > 0) {
      const total = calculateTotal(newInvoice.items, newInvoice.discount)
      const finalInvoice = { ...newInvoice, id: invoices.length + 1, total }
      setInvoices([...invoices, finalInvoice])
      setNewInvoice({
        id: 0,
        invoiceNumber: generateInvoiceNumber(),
        client: "",
        pet: "",
        items: [],
        discount: 0,
        total: 0,
        date: new Date().toISOString().split('T')[0],
        status: "Pending",
      })
      setPreviewMode(false)
    } else {
      alert("Please fill in all required fields and add at least one item.")
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Billing</h1>
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.pet}</TableCell>
                      <TableCell>${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
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
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input id="invoiceNumber" value={newInvoice.invoiceNumber} disabled />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      value={newInvoice.client}
                      onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pet">Pet</Label>
                    <Input
                      id="pet"
                      value={newInvoice.pet}
                      onChange={(e) => setNewInvoice({ ...newInvoice, pet: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <Input
                      placeholder="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                    />
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={newInvoice.discount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, discount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      value={`$${calculateTotal(newInvoice.items, newInvoice.discount).toFixed(2)}`}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setPreviewMode(true)}>Preview</Button>
                  <Button onClick={handleAddInvoice}>Create Invoice</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {previewMode && (
        <Dialog open={previewMode} onOpenChange={setPreviewMode}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Invoice Number:</strong> {newInvoice.invoiceNumber}
                </div>
                <div>
                  <strong>Date:</strong> {newInvoice.date}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Client:</strong> {newInvoice.client}
                </div>
                <div>
                  <strong>Pet:</strong> {newInvoice.pet}
                </div>
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
                  {newInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Discount:</strong> {newInvoice.discount}%
                </div>
                <div>
                  <strong>Total:</strong> ${calculateTotal(newInvoice.items, newInvoice.discount).toFixed(2)}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

