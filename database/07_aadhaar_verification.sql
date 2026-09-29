-- Adds Aadhaar-based identity verification. Run after 01-04.
-- IMPORTANT: only the last 4 digits of any Aadhaar number are ever stored,
-- per UIDAI / CKYC 2.0 masking requirements. The full number is never persisted.

alter table profiles add column if not exists aadhaar_verified boolean not null default false;

create table identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  masked_aadhaar text not null,          -- e.g. "XXXX XXXX 1234"
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed')),
  provider text not null,                -- 'demo' | 'setu' | 'surepass' etc.
  provider_reference text,               -- opaque reference/txn id from the provider, never the Aadhaar number
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table identity_verifications enable row level security;

-- Citizens can see their own verification attempts. All writes go through
-- validated server actions using the service-role client.
create policy identity_read_own on identity_verifications for select using (user_id = auth.uid());
create policy identity_admin on identity_verifications for all using (current_role_name() = 'admin');
