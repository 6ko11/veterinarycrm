'use client'

import { MedicalRecord } from "@/lib/medical-records"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

interface MedicalRecordsListProps {
  records: MedicalRecord[]
  onEdit: (record: MedicalRecord) => void
  onDelete: (record: MedicalRecord) => void
}

export function MedicalRecordsList({ records, onEdit, onDelete }: MedicalRecordsListProps) {
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null)

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <CardTitle>{formatDate(record.date)}</CardTitle>
            <CardDescription>Next Appointment: {record.next_appointment ? formatDate(record.next_appointment) : 'Not scheduled'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
              <p><strong>Treatment:</strong> {record.treatment}</p>
              <p><strong>Notes:</strong> {record.notes}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(record)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog open={recordToDelete?.id === record.id} onOpenChange={() => setRecordToDelete(null)}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRecordToDelete(record)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this medical record? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    onDelete(record)
                    setRecordToDelete(null)
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
