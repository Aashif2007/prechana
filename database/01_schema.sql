-- PRECHANA schema. Run first in the Supabase SQL editor.
create extension if not exists postgis;
create extension if not exists pgcrypto;

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table wards (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  name text not null,
  boundary geometry(MultiPolygon, 4326),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index wards_boundary_idx on wards using gist (boundary);

create table departments (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  name text not null,
  category text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table authorities (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  ward_id uuid references wards(id),
  department_id uuid references departments(id),
  user_id uuid references auth.users(id),
  name text not null,
  title text not null,
  email text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Who handles a category at each escalation level. ward_id null = city-wide.
create table authority_hierarchy (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  ward_id uuid references wards(id),
  category text not null,
  level int not null check (level >= 1),
  authority_id uuid not null references authorities(id)
);

-- Admin-configured. Null category/severity = matches anything.
create table sla_rules (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id),
  category text,
  severity text check (severity in ('low','medium','high')),
  level int not null check (level >= 1),
  reminder_after_hours numeric not null,
  hours_to_act numeric not null,
  is_demo boolean not null default true
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'citizen'
    check (role in ('citizen','councillor','department','admin')),
  created_at timestamptz not null default now()
);

create sequence complaint_seq;

create table complaints (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null default
    ('PCH-' || extract(year from now())::int || '-' || lpad(nextval('complaint_seq')::text, 6, '0')),
  citizen_id uuid not null references auth.users(id),
  category text not null,
  subcategory text,
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  department_category text not null,
  description text not null,
  ai_summary text,
  ai_confidence numeric,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  ward_id uuid references wards(id),
  status text not null default 'Submitted' check (status in (
    'Submitted','Acknowledged','Assigned','In Progress','Awaiting Action',
    'Overdue','Escalated','Pending Confirmation','Resolved','Reopened')),
  current_authority_id uuid references authorities(id),
  current_level int not null default 0,
  level_started_at timestamptz,
  reminder_at timestamptz,
  last_reminder_at timestamptz,
  sla_due_at timestamptz,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table complaint_assignments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  authority_id uuid not null references authorities(id),
  level int not null,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz
);

-- The timeline shown to the citizen
create table complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table complaint_escalations (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  from_authority_id uuid references authorities(id),
  to_authority_id uuid not null references authorities(id),
  from_level int not null,
  to_level int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table complaint_notifications (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  user_id uuid references auth.users(id),
  authority_id uuid references authorities(id),
  type text not null,
  message text not null,
  channel text not null default 'in_app',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table complaint_media (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  storage_path text not null,
  kind text not null default 'complaint' check (kind in ('complaint','evidence','completion')),
  created_at timestamptz not null default now()
);

create table complaint_resolution (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  authority_id uuid references authorities(id),
  description text not null,
  completed_on date not null,
  citizen_confirmed boolean,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Ward lookup from coordinates
create or replace function find_ward(p_lat double precision, p_lng double precision)
returns uuid language sql stable as $$
  select id from wards
  where boundary is not null
    and ST_Contains(boundary, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326))
  limit 1;
$$;

create or replace function current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;
