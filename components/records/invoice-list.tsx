'use client'

import { Invoice } from "@/lib/patient-flow"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

interface InvoiceListProps {
  invoices: Invoice[]
  onEdit: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
}

export function InvoiceList({ invoices, onEdit, onDelete }: InvoiceListProps) {
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)

  const getStatusBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                ${invoice.total.toFixed(2)}
              </CardTitle>
              <CardDescription>
                {formatDate(invoice.date)}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {invoice.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {invoice.items?.length || 0} items
            </p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(invoice)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog open={invoiceToDelete?.id === invoice.id} onOpenChange={() => setInvoiceToDelete(null)}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInvoiceToDelete(invoice)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this invoice? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    onDelete(invoice)
                    setInvoiceToDelete(null)
                  }}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
