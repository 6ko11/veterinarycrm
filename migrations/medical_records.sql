-- Create the medical_records table
create table medical_records (
  id bigint primary key generated always as identity,
  pet_id bigint references pets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  diagnosis text not null,
  treatment text not null,
  notes text,
  next_appointment timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table medical_records enable row level security;

-- Create policies
create policy "Users can view their own medical records"
  on medical_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own medical records"
  on medical_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own medical records"
  on medical_records for update
  using (auth.uid() = user_id);

create policy "Users can delete their own medical records"
  on medical_records for delete
  using (auth.uid() = user_id);

-- Create indexes
create index medical_records_pet_id_idx on medical_records(pet_id);
create index medical_records_user_id_idx on medical_records(user_id);
create index medical_records_date_idx on medical_records(date);
