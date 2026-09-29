-- Sign up the accounts first (email + password on /signup), then replace the emails below and run.

update profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');

update profiles set role = 'councillor'
where id = (select id from auth.users where email = 'YOUR_COUNCILLOR_EMAIL');

update authorities
set user_id = (select id from auth.users where email = 'YOUR_COUNCILLOR_EMAIL')
where name = 'DEMO Ward Rep - Peelamedu';

update profiles set role = 'department'
where id = (select id from auth.users where email = 'YOUR_DEPT_EMAIL');

update authorities
set user_id = (select id from auth.users where email = 'YOUR_DEPT_EMAIL')
where name = 'DEMO Officer - DEMO Electrical Services';
