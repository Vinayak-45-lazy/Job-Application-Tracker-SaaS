-- 1. Enable RLS (Row Level Security) and create base tables

-- Create Profiles table (linked to Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create Job Applications table
create table public.job_applications (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade default auth.uid() not null,
  company_name text not null,
  job_title text not null,
  job_description text,
  job_url text,
  location text,
  salary_range text,
  status text check (status in ('applied', 'interview', 'offer', 'rejected', 'saved')) default 'saved' not null,
  applied_date date,
  notes text,
  resume_url text,
  cover_letter_url text,
  ai_match_score integer,
  ai_missing_keywords text[] default '{}'::text[] not null,
  ai_suggestions text[] default '{}'::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on job_applications
alter table public.job_applications enable row level security;

-- Create Interviews table
create table public.interviews (
  id uuid default gen_random_uuid() not null primary key,
  application_id uuid references public.job_applications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade default auth.uid() not null,
  interview_date timestamp with time zone not null,
  interview_type text check (interview_type in ('phone', 'technical', 'hr', 'final')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on interviews
alter table public.interviews enable row level security;

-- 2. Row Level Security Policies

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow insert on user profiles during registration"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Job Applications Policies
create policy "Users can view their own job applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own job applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own job applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own job applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- Interviews Policies
create policy "Users can view their own interviews"
  on public.interviews for select
  using (auth.uid() = user_id);

create policy "Users can insert their own interviews"
  on public.interviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own interviews"
  on public.interviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own interviews"
  on public.interviews for delete
  using (auth.uid() = user_id);

-- 3. Automatic Profile Creation on User Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Automatic update of updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_job_applications_updated_at
    before update on public.job_applications
    for each row execute procedure update_updated_at_column();
