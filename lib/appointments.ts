import { supabase } from './supabase';

export type Appointment = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  pet: string;
  owner: string;
  type: string;
  notes: string;
  recurring: boolean;
  recurrencePattern?: string;
};

export const fetchAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('start', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
  return data.map(item => ({
    ...item,
    start: new Date(item.start),
    end: new Date(item.end),
  })) as Appointment[];
};

export const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          ...appointment,
          start: appointment.start.toISOString(),
          end: appointment.end.toISOString(),
        },
      ])
      .select()
      .single();
  
    if (error) {
      console.error('Error adding appointment:', error);
      return null;
    }
    return {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
    } as Appointment;
  };
  
  export const updateAppointment = async (appointment: Appointment) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...appointment,
        start: appointment.start.toISOString(),
        end: appointment.end.toISOString(),
      })
      .eq('id', appointment.id)
      .select()
      .single();
  
    if (error) {
      console.error('Error updating appointment:', error);
      return null;
    }
    return {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
    } as Appointment;
  };
  
  export const deleteAppointment = async (id: number) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
    return true;
  };
  
  export const subscribeToAppointments = (callback: (appointments: Appointment[]) => void) => {
    const channel = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        async (payload) => {
          console.log('Change received', payload);
          const appointments = await fetchAppointments();
          callback(appointments);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  };
