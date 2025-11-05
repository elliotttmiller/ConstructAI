-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text not null,
  role text not null default 'team_member',
  department text not null default 'general',
  avatar_url text,
  phone text,
  location text,
  permissions text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  status text check (status in ('planning', 'design', 'construction', 'completed')) default 'planning',
  progress integer default 0 check (progress >= 0 and progress <= 100),
  start_date date not null,
  end_date date not null,
  budget bigint not null default 0,
  spent bigint not null default 0,
  location text not null,
  phase text not null,
  created_by uuid references public.users(id) on delete cascade not null,
  team_members uuid[] default array[]::uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null,
  status text check (status in ('uploaded', 'processing', 'completed', 'error')) default 'uploaded',
  size bigint not null,
  url text not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  uploaded_by uuid references public.users(id) on delete cascade not null,
  category text,
  extracted_text text,
  confidence integer check (confidence >= 0 and confidence <= 100),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  role text check (role in ('user', 'assistant')) not null,
  agent_type text,
  user_id uuid references public.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assigned_to uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bim_models table
create table public.bim_models (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null,
  url text not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  uploaded_by uuid references public.users(id) on delete cascade not null,
  version text not null default '1.0',
  status text check (status in ('uploaded', 'processing', 'ready', 'error')) default 'uploaded',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create clash_detections table
create table public.clash_detections (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('hard', 'soft', 'clearance')) not null,
  severity text check (severity in ('critical', 'major', 'minor')) not null,
  description text not null,
  elements jsonb not null,
  location text not null,
  model_id uuid references public.bim_models(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  status text check (status in ('open', 'resolved', 'ignored')) default 'open',
  resolved_by uuid references public.users(id) on delete set null,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create agent_logs table for tracking AI agent activities
create table public.agent_logs (
  id uuid default uuid_generate_v4() primary key,
  agent_type text not null,
  action text not null,
  status text check (status in ('started', 'completed', 'failed')) not null,
  input_data jsonb,
  output_data jsonb,
  error_message text,
  user_id uuid references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  execution_time_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.chat_messages enable row level security;
alter table public.tasks enable row level security;
alter table public.bim_models enable row level security;
alter table public.clash_detections enable row level security;
alter table public.agent_logs enable row level security;

-- Create policies for users table
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Create policies for projects table
create policy "Users can view projects they're assigned to" on public.projects
  for select using (
    auth.uid() = created_by or
    auth.uid() = any(team_members)
  );

create policy "Project creators can update projects" on public.projects
  for update using (auth.uid() = created_by);

create policy "Authenticated users can create projects" on public.projects
  for insert with check (auth.uid() = created_by);

-- Create policies for documents table
create policy "Users can view documents from their projects" on public.documents
  for select using (
    exists (
      select 1 from public.projects
      where id = project_id and (
        created_by = auth.uid() or
        auth.uid() = any(team_members)
      )
    )
  );

create policy "Users can upload documents to their projects" on public.documents
  for insert with check (
    exists (
      select 1 from public.projects
      where id = project_id and (
        created_by = auth.uid() or
        auth.uid() = any(team_members)
      )
    )
  );

-- Create policies for chat_messages table
create policy "Users can view their own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- Create policies for tasks table
create policy "Users can view tasks from their projects" on public.tasks
  for select using (
    exists (
      select 1 from public.projects
      where id = project_id and (
        created_by = auth.uid() or
        auth.uid() = any(team_members)
      )
    )
  );

create policy "Users can create tasks in their projects" on public.tasks
  for insert with check (
    exists (
      select 1 from public.projects
      where id = project_id and (
        created_by = auth.uid() or
        auth.uid() = any(team_members)
      )
    )
  );

create policy "Users can update tasks assigned to them" on public.tasks
  for update using (
    auth.uid() = assigned_to or
    auth.uid() = created_by or
    exists (
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );

-- Create functions for updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.documents
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.tasks
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.bim_models
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.clash_detections
  for each row execute procedure public.handle_updated_at();

-- Note: Sample data will be created automatically when users sign up via NextAuth
-- The users table is linked to auth.users and will be populated when you create accounts
