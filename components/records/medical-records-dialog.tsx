'use client'

import { Pet } from "@/lib/pets"
import { MedicalRecord } from "@/lib/medical-records"
import { Invoice } from "@/lib/patient-flow"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicalRecordsList } from "./medical-records-list"
import { InvoiceList } from "./invoice-list"

interface MedicalRecordsDialogProps {
  pet: Pet | null
  medicalRecords: MedicalRecord[]
  invoices: Invoice[]
  onClose: () => void
  onAddRecord: () => void
  onEditRecord: (record: MedicalRecord) => void
  onDeleteRecord: (record: MedicalRecord) => void
  onAddInvoice: () => void
  onEditInvoice: (invoice: Invoice) => void
  onDeleteInvoice: (invoice: Invoice) => void
}

export function MedicalRecordsDialog({
  pet,
  medicalRecords,
  invoices,
  onClose,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice
}: MedicalRecordsDialogProps) {
  return (
    <Dialog open={!!pet} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{pet?.name}'s Records</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="records">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medical Records</h3>
                <Button onClick={onAddRecord}>Add Record</Button>
              </div>
              <MedicalRecordsList
                records={medicalRecords}
                onEdit={onEditRecord}
                onDelete={onDeleteRecord}
              />
            </div>
          </TabsContent>
          <TabsContent value="invoices">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Invoices</h3>
                <Button onClick={onAddInvoice}>Add Invoice</Button>
              </div>
              <InvoiceList
                invoices={invoices}
                onEdit={onEditInvoice}
                onDelete={onDeleteInvoice}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
