-- Run AFTER you have signed up at least one account (complaints need a citizen).
do $$
declare demo_citizen uuid;
begin
  select id into demo_citizen from profiles
  where role = 'citizen' order by created_at limit 1;

  if demo_citizen is null then
    raise exception 'Sign up a user first, then run this block again';
  end if;

  insert into complaints
    (citizen_id, category, subcategory, severity, department_category,
     description, latitude, longitude, address, is_demo)
  values
    (demo_citizen, 'streetlight', 'streetlight_not_working', 'medium', 'electrical_services',
     '[DEMO] Street light near my street has not been working for 5 days.', 11.025, 77.003, 'Peelamedu (demo)', true),
    (demo_citizen, 'garbage', 'garbage_accumulation', 'medium', 'sanitation',
     '[DEMO] Garbage has piled up near the bus stop.', 11.017, 76.967, 'Gandhipuram (demo)', true),
    (demo_citizen, 'pothole', 'road_pothole', 'high', 'roads',
     '[DEMO] Deep pothole in the middle of the road.', 11.030, 76.947, 'Saibaba Colony (demo)', true),
    (demo_citizen, 'drainage', 'drainage_overflow', 'high', 'drainage_water',
     '[DEMO] Drain is overflowing onto the street.', 10.999, 77.028, 'Singanallur (demo)', true),
    (demo_citizen, 'water_leakage', 'pipe_leak', 'medium', 'drainage_water',
     '[DEMO] Water pipe is leaking near the corner shop.', 11.027, 77.006, 'Peelamedu (demo)', true);

  insert into complaint_status_history (complaint_id, event_type, message)
  select id, 'submitted', 'Complaint submitted (DEMO DATA)'
  from complaints where is_demo and status = 'Submitted';
end;
$$;
