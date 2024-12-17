'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Appointment, addAppointment, fetchAppointments, subscribeToAppointments, updateAppointment, deleteAppointment } from '@/lib/appointments'
import { toast } from 'sonner'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { format } from 'date-fns'

type ViewType = 'month' | 'week' | 'day' | 'agenda'

const localizer = momentLocalizer(moment)

// Set first day of week to Monday (1)
moment.updateLocale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4  // The week that contains Jan 4th is the first week of the year
  }
});

const DnDCalendar = withDragAndDrop(Calendar)

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
    recurrence_pattern: undefined,
  })

  const [sendReminder, setSendReminder] = useState(true)
  const [view, setView] = useState<ViewType>('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
        recurrence_pattern: undefined,
      })
    }

    if (sendReminder) {
      toast.success(`Reminder set for appointment: ${newEvent.title}`)
    }

    if (newEvent.recurring && newEvent.recurrence_pattern && addedAppointment) {
      generateRecurringAppointments(addedAppointment)
    }
  }

  const isAppointmentConflict = (appointment: Omit<Appointment, 'id'>) => {
    return events.some(event =>
      (appointment.start < event.end && appointment.end > event.start)
    );
  }

  const generateRecurringAppointments = async (appointment: Appointment) => {
    if (!appointment.recurrence_pattern) return

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
      switch (appointment.recurrence_pattern) {
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

  const handleEventDrop = async ({ event, start, end }: any) => {
    console.log('Drop event:', { event, start, end });
    
    try {
      // Create a new event object with the updated times
      const updatedEvent = {
        ...event,
        start: new Date(start),
        end: new Date(end)
      };

      console.log('Drop - prepared event:', updatedEvent);

      // Optimistically update the UI
      setEvents(prev =>
        prev.map(e => e.id === event.id ? { ...e, start: updatedEvent.start, end: updatedEvent.end } : e)
      );

      const result = await updateAppointment(updatedEvent);
      console.log('Drop - update result:', result);

      if (!result) {
        throw new Error('Failed to update appointment');
      }

      toast.success('Appointment moved successfully');
    } catch (error) {
      console.error('Error in handleEventDrop:', error);
      // Revert the optimistic update on error
      setEvents(prev =>
        prev.map(e => e.id === event.id ? event : e)
      );
      toast.error('Failed to move appointment');
    }
  };

  const handleEventResize = async ({ event, start, end }: any) => {
    console.log('Resize event:', { event, start, end });
    
    try {
      // Create a new event object with the updated times
      const updatedEvent = {
        ...event,
        start: new Date(start),
        end: new Date(end)
      };

      console.log('Resize - prepared event:', updatedEvent);

      // Optimistically update the UI
      setEvents(prev =>
        prev.map(e => e.id === event.id ? { ...e, start: updatedEvent.start, end: updatedEvent.end } : e)
      );

      const result = await updateAppointment(updatedEvent);
      console.log('Resize - update result:', result);

      if (!result) {
        throw new Error('Failed to update appointment');
      }

      toast.success('Appointment duration updated');
    } catch (error) {
      console.error('Error in handleEventResize:', error);
      // Revert the optimistic update on error
      setEvents(prev =>
        prev.map(e => e.id === event.id ? event : e)
      );
      toast.error('Failed to update appointment duration');
    }
  };

  const handleEventClick = (event: Appointment) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleEditAppointment = async (updatedEvent: Appointment) => {
    try {
      const result = await updateAppointment(updatedEvent);
      
      if (!result) {
        throw new Error('Failed to update appointment');
      }

      // Update the events list with the edited appointment
      setEvents(prev =>
        prev.map(e => e.id === updatedEvent.id ? result : e)
      );

      setEditDialogOpen(false);
      toast.success('Appointment updated successfully');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    try {
      const success = await deleteAppointment(id);
      
      if (!success) {
        throw new Error('Failed to delete appointment');
      }

      // Remove the appointment from the events list
      setEvents(prev => prev.filter(e => e.id !== id));
      setEditDialogOpen(false);
      toast.success('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const handleViewChange = (newView: string) => {
    if (newView === "month" || newView === "week" || newView === "day" || newView === "agenda") {
      setView(newView as ViewType)
    }
  }

  useEffect(() => {
    const fetchAndSetAppointments = async () => {
      const appointments = await fetchAppointments();
      setEvents(appointments);
    };

    fetchAndSetAppointments();

    const subscription = subscribeToAppointments((updatedAppointments: Appointment[]) => {
      console.log('Received updated appointments:', updatedAppointments);
      setEvents(updatedAppointments);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Tabs value={view} onValueChange={handleViewChange}>
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
                      <Label htmlFor="recurrence_pattern" className="text-right">Recurrence</Label>
                      <Select onValueChange={(value: string) => setNewEvent({ ...newEvent, recurrence_pattern: value })} required>
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
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                selectable
                resizable
                draggable
                onEventDrop={handleEventDrop}
                onEventResize={moveEvent => {
                  const { event, start, end } = moveEvent;
                  handleEventResize({ event, start, end });
                }}
                onSelectEvent={handleEventClick}
                defaultView="month"
                views={['month', 'week', 'day']}
                onNavigate={(date) => setSelectedDate(date)}
                step={15}
                timeslots={4}
                formats={{
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
                }}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 20, 0, 0)}
              />
            </div>
          </TabsContent>
          <TabsContent value="week" className="mt-4">
            <div className="h-[600px]">
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                selectable
                resizable
                draggable
                onEventDrop={handleEventDrop}
                onEventResize={moveEvent => {
                  const { event, start, end } = moveEvent;
                  handleEventResize({ event, start, end });
                }}
                onSelectEvent={handleEventClick}
                defaultView="week"
                views={['month', 'week', 'day']}
                onNavigate={(date) => setSelectedDate(date)}
                step={15}
                timeslots={4}
                formats={{
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
                }}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 20, 0, 0)}
              />
            </div>
          </TabsContent>
          <TabsContent value="day" className="mt-4">
            <div className="h-[600px]">
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                selectable
                resizable
                draggable
                onEventDrop={handleEventDrop}
                onEventResize={moveEvent => {
                  const { event, start, end } = moveEvent;
                  handleEventResize({ event, start, end });
                }}
                onSelectEvent={handleEventClick}
                defaultView="day"
                views={['month', 'week', 'day']}
                onNavigate={(date) => setSelectedDate(date)}
                step={15}
                timeslots={4}
                formats={{
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
                }}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 20, 0, 0)}
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
      {/* Edit Appointment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={selectedEvent.title}
                  className="col-span-3"
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pet" className="text-right">
                  Pet
                </Label>
                <Input
                  id="pet"
                  value={selectedEvent.pet}
                  className="col-span-3"
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, pet: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner" className="text-right">
                  Owner
                </Label>
                <Input
                  id="owner"
                  value={selectedEvent.owner}
                  className="col-span-3"
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, owner: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={selectedEvent.type}
                  onValueChange={(value: string) =>
                    setSelectedEvent({ ...selectedEvent, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Check-up</SelectItem>
                    <SelectItem value="grooming">Grooming</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start" className="text-right">
                  Start
                </Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={format(selectedEvent.start, "yyyy-MM-dd'T'HH:mm")}
                  className="col-span-3"
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      start: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end" className="text-right">
                  End
                </Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={format(selectedEvent.end, "yyyy-MM-dd'T'HH:mm")}
                  className="col-span-3"
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      end: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={selectedEvent.notes}
                  className="col-span-3"
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, notes: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => selectedEvent && handleDeleteAppointment(selectedEvent.id)}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => selectedEvent && handleEditAppointment(selectedEvent)}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  )
}
