'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Appointment, addAppointment, fetchAppointments, subscribeToAppointments } from '@/lib/appointments'
import { toast } from 'sonner'

const localizer = momentLocalizer(moment)


export default function AppointmentsPage() {
  const [events, setEvents] = useState<Appointment[]>([])
  const [newEvent, setNewEvent] = useState<Omit<Appointment, 'id'>>({
    title: '',
    start: new Date(),
    end: new Date(),
    pet: '',
    owner: '',
    type: 'Check-up',
    notes: '',
    recurring: false,
    recurrencePattern: undefined,
  })

    const [sendReminder, setSendReminder] = useState(true)
    const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
    const [selectedDate, setSelectedDate] = useState(new Date())


  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setNewEvent({
      ...newEvent,
      start: slotInfo.start,
      end: slotInfo.end,
    })
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.pet || !newEvent.owner || !newEvent.type) {
        toast.error('Please fill in all required fields (Title, Pet, Owner, and Type).')
      return
    }

    if (isAppointmentConflict(newEvent)) {
        toast.error('There is a scheduling conflict. Please choose a different time.')
      return
    }

    const addedAppointment = await addAppointment(newEvent);

    if (addedAppointment) {
      setNewEvent({
        title: '',
        start: new Date(),
        end: new Date(),
        pet: '',
        owner: '',
        type: 'Check-up',
        notes: '',
        recurring: false,
        recurrencePattern: undefined,
      })
    }

    if (sendReminder) {
      toast.success(`Reminder set for appointment: ${newEvent.title}`)
    }

    if (newEvent.recurring && newEvent.recurrencePattern && addedAppointment) {
      generateRecurringAppointments(addedAppointment)
    }
  }

  const isAppointmentConflict = (appointment: Omit<Appointment, 'id'>) => {
      return events.some(event =>
          (appointment.start < event.end && appointment.end > event.start)
      );
  }


  const generateRecurringAppointments = async (appointment: Appointment) => {
    if (!appointment.recurrencePattern) return

    const recurringEvents: Omit<Appointment, 'id'>[] = []
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1) // Generate appointments for one year

    let currentDate = new Date(appointment.start)

    while (currentDate <= endDate) {
      const newAppointment = {
        ...appointment,
        start: new Date(currentDate),
          end: new Date(currentDate.getTime() + (appointment.end.getTime() - appointment.start.getTime())),
      }

      if (!isAppointmentConflict(newAppointment)) {
        recurringEvents.push(newAppointment)
      }

      // Move to the next occurrence based on the recurrence pattern
      const nextDate = new Date(currentDate);
      switch (appointment.recurrencePattern) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          break
      }
      currentDate = nextDate;
    }

    for (const recurringEvent of recurringEvents) {
      await addAppointment(recurringEvent)
    }
  }


  const getDailyAppointments = (date: Date): Appointment[] => {
    return events.filter(event =>
      event.start.toDateString() === date.toDateString()
    )
  }

  useEffect(() => {
    const fetchAndSetAppointments = async () => {
      const appointments = await fetchAppointments();
      setEvents(appointments);
    };

    fetchAndSetAppointments();

    const unsubscribe = subscribeToAppointments((updatedAppointments: Appointment[]) => {
      setEvents(updatedAppointments);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Appointments</h1>
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Book Appointment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pet" className="text-right">Pet</Label>
                  <Input
                    id="pet"
                    value={newEvent.pet}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, pet: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="owner" className="text-right">Owner</Label>
                  <Input
                    id="owner"
                    value={newEvent.owner}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, owner: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select onValueChange={(value: string) => setNewEvent({ ...newEvent, type: value })} value={newEvent.type} required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Check-up">Check-up</SelectItem>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start" className="text-right">Start</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end" className="text-right">End</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Input
                    id="notes"
                    value={newEvent.notes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={newEvent.recurring}
                    onCheckedChange={(checked: boolean) => setNewEvent({ ...newEvent, recurring: checked })}
                  />
                  <Label htmlFor="recurring">Recurring appointment</Label>
                </div>
                {newEvent.recurring && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recurrencePattern" className="text-right">Recurrence</Label>
                    <Select onValueChange={(value: string) => setNewEvent({ ...newEvent, recurrencePattern: value })} required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select recurrence pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="send-reminder"
                    checked={sendReminder}
                    onCheckedChange={setSendReminder}
                  />
                  <Label htmlFor="send-reminder">Send reminder</Label>
                </div>
              </div>
              <Button onClick={handleAddEvent}>Book Appointment</Button>
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="month" className="mt-4">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              views={['month']}
              onNavigate={(date) => setSelectedDate(date)}
            />
          </div>
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              views={['week']}
              onNavigate={(date) => setSelectedDate(date)}
            />
          </div>
        </TabsContent>
        <TabsContent value="day" className="mt-4">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              views={['day']}
              onNavigate={(date) => setSelectedDate(date)}
            />
          </div>
        </TabsContent>
        <TabsContent value="agenda" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments for {selectedDate.toDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDailyAppointments(selectedDate).map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.start ? moment(appointment.start).format('HH:mm') : 'N/A'} - {appointment.end ? moment(appointment.end).format('HH:mm') : 'N/A'}</TableCell>
                      <TableCell>{appointment.pet || 'N/A'}</TableCell>
                      <TableCell>{appointment.owner || 'N/A'}</TableCell>
                      <TableCell>{appointment.type || 'N/A'}</TableCell>
                      <TableCell>{appointment.notes || 'N/A'}</TableCell>
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
