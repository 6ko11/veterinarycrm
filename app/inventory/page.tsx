'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InventoryPage() {
  const [inventory, setInventory] = useState([
    { id: 1, name: "Vaccine A", quantity: 100, expirationDate: "2023-12-31" },
    { id: 2, name: "Medicine B", quantity: 50, expirationDate: "2024-06-30" },
    { id: 3, name: "Supplies C", quantity: 200, expirationDate: "2025-01-15" },
  ])

  const [newItem, setNewItem] = useState({ name: '', quantity: '', expirationDate: '' })

  const handleAddItem = () => {
    setInventory([...inventory, { ...newItem, id: inventory.length + 1, quantity: parseInt(newItem.quantity) }])
    setNewItem({ name: '', quantity: '', expirationDate: '' })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Inventory Management</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventory Items</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expirationDate" className="text-right">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={newItem.expirationDate}
                    onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiration Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.expirationDate}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Update</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

