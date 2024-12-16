import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const patients = [
  { id: 1, name: "Max", owner: "John Doe", species: "Dog", breed: "Labrador" },
  { id: 2, name: "Whiskers", owner: "Jane Smith", species: "Cat", breed: "Siamese" },
  { id: 3, name: "Buddy", owner: "Mike Johnson", species: "Dog", breed: "Golden Retriever" },
]

export function Patients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Breed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.owner}</TableCell>
                <TableCell>{patient.species}</TableCell>
                <TableCell>{patient.breed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

