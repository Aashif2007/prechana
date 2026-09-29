-- Row Level Security + private photo bucket.
-- Citizens get no insert/update policies on purpose: complaint creation and
-- profile edits go through validated server actions (service-role client).

alter table cities enable row level security;
alter table wards enable row level security;
alter table departments enable row level security;
alter table authorities enable row level security;
alter table authority_hierarchy enable row level security;
alter table sla_rules enable row level security;
alter table profiles enable row level security;
alter table complaints enable row level security;
alter table complaint_assignments enable row level security;
alter table complaint_status_history enable row level security;
alter table complaint_escalations enable row level security;
alter table complaint_notifications enable row level security;
alter table complaint_media enable row level security;
alter table complaint_resolution enable row level security;

-- Harmless lookup tables: any logged-in user can read
create policy cities_read on cities for select to authenticated using (true);
create policy wards_read on wards for select to authenticated using (true);
create policy departments_read on departments for select to authenticated using (true);

-- Profiles
create policy profile_read_own on profiles for select using (id = auth.uid());
create policy profile_admin on profiles for all using (current_role_name() = 'admin');

-- Authorities: see only your own row (complaint visibility depends on this)
create policy authority_own on authorities for select using (user_id = auth.uid());
create policy authority_admin on authorities for all using (current_role_name() = 'admin');

-- Admin-only tables
create policy hierarchy_admin on authority_hierarchy for all using (current_role_name() = 'admin');
create policy sla_admin on sla_rules for all using (current_role_name() = 'admin');
create policy assignments_admin on complaint_assignments for all using (current_role_name() = 'admin');

-- Complaints: citizens see their own, authorities see what is assigned to them, admins see all
create policy complaint_citizen_read on complaints for select using (citizen_id = auth.uid());
create policy complaint_authority_read on complaints for select using (
  current_authority_id in (select id from authorities where user_id = auth.uid()));
create policy complaint_admin on complaints for all using (current_role_name() = 'admin');

-- These follow whatever the user can already see on complaints
create policy history_read on complaint_status_history for select using (
  exists (select 1 from complaints c where c.id = complaint_id));
create policy escalation_read on complaint_escalations for select using (
  exists (select 1 from complaints c where c.id = complaint_id));
create policy media_read on complaint_media for select using (
  exists (select 1 from complaints c where c.id = complaint_id));
create policy resolution_read on complaint_resolution for select using (
  exists (select 1 from complaints c where c.id = complaint_id));

create policy notification_read_own on complaint_notifications for select using (user_id = auth.uid());
create policy notification_mark_read on complaint_notifications for update using (user_id = auth.uid());

-- Private bucket: photos are only served through short-lived signed URLs
insert into storage.buckets (id, name, public)
values ('complaint-photos', 'complaint-photos', false)
on conflict (id) do nothing;
