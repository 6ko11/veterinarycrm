-- Create function to automatically update updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create invoices table
create table invoices (
    id bigint primary key generated always as identity,
    pet_id bigint references pets(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    date timestamp with time zone default timezone('utc'::text, now()) not null,
    amount decimal(10,2) not null,
    description text not null,
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table invoices enable row level security;

create policy "Users can view their own invoices"
    on invoices for select
    using (auth.uid() = user_id);

create policy "Users can insert their own invoices"
    on invoices for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own invoices"
    on invoices for update
    using (auth.uid() = user_id);

create policy "Users can delete their own invoices"
    on invoices for delete
    using (auth.uid() = user_id);

-- Create indexes
create index invoices_pet_id_idx on invoices(pet_id);
create index invoices_user_id_idx on invoices(user_id);
create index invoices_date_idx on invoices(date);

-- Set up trigger for updated_at
create trigger set_updated_at
    before update on invoices
    for each row
    execute function update_updated_at_column();
