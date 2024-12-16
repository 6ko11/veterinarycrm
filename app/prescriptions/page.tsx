'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, petName: "Max", ownerName: "John Doe", medication: "Antibiotic", dosage: "1 pill twice daily", startDate: "2023-06-15", endDate: "2023-06-22" },
    { id: 2, petName: "Whiskers", ownerName: "Jane Smith", medication: "Pain reliever", dosage: "1/2 pill once daily", startDate: "2023-06-16", endDate: "2023-06-23" },
  ])

  const [newPrescription, setNewPrescription] = useState({
    petName: '',
    ownerName: '',
    medication: '',
    dosage: '',
    startDate: '',
    endDate: '',
  })

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { ...newPrescription, id: prescriptions.length + 1 }])
    setNewPrescription({ petName: '', ownerName: '', medication: '', dosage: '', startDate: '', endDate: '' })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Prescriptions</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Prescriptions</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Prescription</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Prescription</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="petName" className="text-right">Pet Name</Label>
                  <Input
                    id="petName"
                    value={newPrescription.petName}
                    onChange={(e) => setNewPrescription({ ...newPrescription, petName: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ownerName" className="text-right">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={newPrescription.ownerName}
                    onChange={(e) => setNewPrescription({ ...newPrescription, ownerName: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="medication" className="text-right">Medication</Label>
                  <Input
                    id="medication"
                    value={newPrescription.medication}
                    onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dosage" className="text-right">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPrescription.startDate}
                    onChange={(e) => setNewPrescription({ ...newPrescription, startDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPrescription.endDate}
                    onChange={(e) => setNewPrescription({ ...newPrescription, endDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddPrescription}>Add Prescription</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.petName}</TableCell>
                  <TableCell>{prescription.ownerName}</TableCell>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.startDate}</TableCell>
                  <TableCell>{prescription.endDate}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View</Button>
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

