import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const appointments = [
  { id: 1, patient: "Max", owner: "John Doe", date: "2023-06-15", time: "10:00 AM" },
  { id: 2, patient: "Whiskers", owner: "Jane Smith", date: "2023-06-15", time: "11:30 AM" },
  { id: 3, patient: "Buddy", owner: "Mike Johnson", date: "2023-06-16", time: "2:00 PM" },
]

export function RecentAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patient}</TableCell>
                <TableCell>{appointment.owner}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

