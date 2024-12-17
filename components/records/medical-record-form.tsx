'use client'

import { MedicalRecord } from "@/lib/medical-records"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface MedicalRecordFormProps {
  record: MedicalRecord | null
  petId: number
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function MedicalRecordForm({ record, petId, onClose, onSubmit }: MedicalRecordFormProps) {
  return (
    <Dialog open={!!record} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record?.id ? 'Edit Medical Record' : 'Add Medical Record'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <input type="hidden" name="pet_id" value={petId} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={record?.date?.split('T')[0]}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="diagnosis" className="text-right">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                defaultValue={record?.diagnosis}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="treatment" className="text-right">Treatment</Label>
              <Textarea
                id="treatment"
                name="treatment"
                defaultValue={record?.treatment}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={record?.notes}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="next_appointment" className="text-right">Next Appointment</Label>
              <Input
                id="next_appointment"
                name="next_appointment"
                type="date"
                defaultValue={record?.next_appointment?.split('T')[0]}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
