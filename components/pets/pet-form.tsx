'use client'

import { Pet } from "@/lib/pets"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PetFormProps {
  pet: Pet | null
  clientId: number
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function PetForm({ pet, clientId, onClose, onSubmit }: PetFormProps) {
  return (
    <Dialog open={!!pet || clientId > 0} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pet?.id ? 'Edit Pet' : 'Add Pet'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={pet?.name}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="species" className="text-right">Species</Label>
              <Input
                id="species"
                name="species"
                defaultValue={pet?.species}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breed" className="text-right">Breed</Label>
              <Input
                id="breed"
                name="breed"
                defaultValue={pet?.breed || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                defaultValue={pet?.age || 0}
                className="col-span-3"
                required
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
