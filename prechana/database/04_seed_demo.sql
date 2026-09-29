-- ALL ROWS BELOW ARE DEMO DATA (is_demo = true). Ward shapes are simple rectangles, not real boundaries.

insert into cities (name, state, is_demo) values ('Coimbatore', 'Tamil Nadu', true);

-- ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, srid)
insert into wards (city_id, name, boundary, is_demo)
select id, 'Peelamedu', ST_Multi(ST_MakeEnvelope(76.995, 11.017, 77.011, 11.033, 4326)), true
from cities where name = 'Coimbatore';

insert into wards (city_id, name, boundary, is_demo)
select id, 'Gandhipuram', ST_Multi(ST_MakeEnvelope(76.959, 11.009, 76.975, 11.025, 4326)), true
from cities where name = 'Coimbatore';

insert into wards (city_id, name, boundary, is_demo)
select id, 'Saibaba Colony', ST_Multi(ST_MakeEnvelope(76.939, 11.022, 76.955, 11.038, 4326)), true
from cities where name = 'Coimbatore';

insert into wards (city_id, name, boundary, is_demo)
select id, 'Singanallur', ST_Multi(ST_MakeEnvelope(77.020, 10.991, 77.036, 11.007, 4326)), true
from cities where name = 'Coimbatore';

insert into departments (city_id, name, category, is_demo)
select c.id, v.name, v.category, true
from cities c,
  (values
    ('DEMO Roads Department', 'roads'),
    ('DEMO Electrical Services', 'electrical_services'),
    ('DEMO Sanitation Department', 'sanitation'),
    ('DEMO Drainage and Water Department', 'drainage_water'),
    ('DEMO Horticulture Department', 'horticulture')
  ) as v(name, category)
where c.name = 'Coimbatore';

-- Level 1: one demo representative per ward
insert into authorities (city_id, ward_id, name, title, is_demo)
select city_id, id, 'DEMO Ward Rep - ' || name, 'Ward-level authority (DEMO DATA)', true
from wards where is_demo;

-- Level 2: one demo officer per department
insert into authorities (city_id, department_id, name, title, is_demo)
select city_id, id, 'DEMO Officer - ' || name, 'Department officer (DEMO DATA)', true
from departments where is_demo;

-- Level 3: one demo higher authority for the city
insert into authorities (city_id, name, title, is_demo)
select id, 'DEMO Zonal Officer', 'Higher authority (DEMO DATA)', true
from cities where name = 'Coimbatore';

-- Hierarchy level 1: ward rep for every ward and category
insert into authority_hierarchy (city_id, ward_id, category, level, authority_id)
select w.city_id, w.id, d.category, 1, a.id
from wards w
join departments d on d.city_id = w.city_id
join authorities a on a.ward_id = w.id
where w.is_demo;

-- Hierarchy level 2: department officer (city-wide)
insert into authority_hierarchy (city_id, ward_id, category, level, authority_id)
select d.city_id, null, d.category, 2, a.id
from departments d
join authorities a on a.department_id = d.id;

-- Hierarchy level 3: zonal officer (city-wide)
insert into authority_hierarchy (city_id, ward_id, category, level, authority_id)
select d.city_id, null, d.category, 3, a.id
from departments d
join authorities a on a.name = 'DEMO Zonal Officer' and a.city_id = d.city_id;

-- DEMO SLA CONFIGURATION: about 3 and 6 minutes, NOT real response times
insert into sla_rules (city_id, category, severity, level, reminder_after_hours, hours_to_act, is_demo)
select c.id, null, null, l.level, 0.05, 0.1, true
from cities c, (values (1), (2), (3)) as l(level)
where c.name = 'Coimbatore';
