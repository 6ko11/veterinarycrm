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
  recurrence_pattern?: string;
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
        recurrence_pattern: appointment.recurrence_pattern,
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
  console.log('Starting appointment update:', {
    id: appointment.id,
    title: appointment.title,
    start: appointment.start.toISOString(),
    end: appointment.end.toISOString()
  });
  
  try {
    // First verify the appointment exists
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select()
      .eq('id', appointment.id)
      .single();

    if (fetchError) {
      console.error('Error fetching existing appointment:', fetchError);
      throw new Error(`Failed to fetch appointment: ${fetchError.message}`);
    }

    if (!existing) {
      console.error('Appointment not found:', appointment.id);
      throw new Error('Appointment not found');
    }

    console.log('Found existing appointment:', existing);

    // Prepare the update data
    const updateData = {
      title: appointment.title,
      start: appointment.start.toISOString(),
      end: appointment.end.toISOString(),
      pet: appointment.pet,
      owner: appointment.owner,
      type: appointment.type,
      notes: appointment.notes,
      recurring: appointment.recurring,
      recurrence_pattern: appointment.recurrence_pattern,
    };

    console.log('Updating with data:', updateData);

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointment.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }

    if (!data) {
      console.error('No data returned from update');
      throw new Error('No data returned from update');
    }

    console.log('Successfully updated appointment:', data);
    
    const updatedAppointment = {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
    } as Appointment;

    return updatedAppointment;
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    throw error;
  }
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
  console.log('Setting up appointment subscription');
  
  const channel = supabase
    .channel('appointments')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'appointments' 
      },
      async (payload) => {
        console.log('Received database change:', payload);
        // Fetch the latest appointments
        const appointments = await fetchAppointments();
        console.log('Fetched updated appointments:', appointments);
        callback(appointments);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return {
    unsubscribe: () => {
      console.log('Unsubscribing from appointments');
      channel.unsubscribe();
    }
  };
};
