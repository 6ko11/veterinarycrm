'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([
    { id: 1, petName: "Max", ownerName: "John Doe", date: "2023-06-15", diagnosis: "Annual checkup", treatment: "Vaccinations updated" },
    { id: 2, petName: "Whiskers", ownerName: "Jane Smith", date: "2023-06-16", diagnosis: "Skin irritation", treatment: "Prescribed antihistamines" },
  ])

  const [labResults, setLabResults] = useState([
    { id: 1, petName: "Max", ownerName: "John Doe", date: "2023-06-15", testType: "Blood work", result: "Normal" },
    { id: 2, petName: "Whiskers", ownerName: "Jane Smith", date: "2023-06-16", testType: "Allergy test", result: "Positive for pollen" },
  ])

  const [newRecord, setNewRecord] = useState({
    petName: '',
    ownerName: '',
    date: '',
    diagnosis: '',
    treatment: '',
  })

  const [newLabResult, setNewLabResult] = useState({
    petName: '',
    ownerName: '',
    date: '',
    testType: '',
    result: '',
  })

  const handleAddRecord = () => {
    setRecords([...records, { ...newRecord, id: records.length + 1 }])
    setNewRecord({ petName: '', ownerName: '', date: '', diagnosis: '', treatment: '' })
  }

  const handleAddLabResult = () => {
    setLabResults([...labResults, { ...newLabResult, id: labResults.length + 1 }])
    setNewLabResult({ petName: '', ownerName: '', date: '', testType: '', result: '' })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Medical Records</h1>
      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Patient Records</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Patient Records</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Record</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Medical Record</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="petName" className="text-right">Pet Name</Label>
                      <Input
                        id="petName"
                        value={newRecord.petName}
                        onChange={(e) => setNewRecord({ ...newRecord, petName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ownerName" className="text-right">Owner Name</Label>
                      <Input
                        id="ownerName"
                        value={newRecord.ownerName}
                        onChange={(e) => setNewRecord({ ...newRecord, ownerName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="diagnosis" className="text-right">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={newRecord.diagnosis}
                        onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="treatment" className="text-right">Treatment</Label>
                      <Textarea
                        id="treatment"
                        value={newRecord.treatment}
                        onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddRecord}>Add Record</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet Name</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.petName}</TableCell>
                      <TableCell>{record.ownerName}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>{record.treatment}</TableCell>
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
        <TabsContent value="lab-results">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lab Results</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Lab Result</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Lab Result</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="labPetName" className="text-right">Pet Name</Label>
                      <Input
                        id="labPetName"
                        value={newLabResult.petName}
                        onChange={(e) => setNewLabResult({ ...newLabResult, petName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="labOwnerName" className="text-right">Owner Name</Label>
                      <Input
                        id="labOwnerName"
                        value={newLabResult.ownerName}
                        onChange={(e) => setNewLabResult({ ...newLabResult, ownerName: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="labDate" className="text-right">Date</Label>
                      <Input
                        id="labDate"
                        type="date"
                        value={newLabResult.date}
                        onChange={(e) => setNewLabResult({ ...newLabResult, date: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="testType" className="text-right">Test Type</Label>
                      <Input
                        id="testType"
                        value={newLabResult.testType}
                        onChange={(e) => setNewLabResult({ ...newLabResult, testType: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="result" className="text-right">Result</Label>
                      <Textarea
                        id="result"
                        value={newLabResult.result}
                        onChange={(e) => setNewLabResult({ ...newLabResult, result: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddLabResult}>Add Lab Result</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet Name</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.petName}</TableCell>
                      <TableCell>{result.ownerName}</TableCell>
                      <TableCell>{result.date}</TableCell>
                      <TableCell>{result.testType}</TableCell>
                      <TableCell>{result.result}</TableCell>
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
      </Tabs>
    </div>
  )
}

