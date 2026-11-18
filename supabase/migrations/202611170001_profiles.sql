begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 1 and 80),
 career_stage text not null check (career_stage in ('Master’s student','PhD student','Professor','Industry professional','Other researcher')),
 affiliation text not null check (char_length(trim(affiliation)) between 1 and 160),
 field text not null check (char_length(trim(field)) between 1 and 120),
 city text not null check (char_length(trim(city)) between 1 and 160),
 bio text not null default '' check (char_length(bio)<=1000),
 open_to_mentorship boolean not null default false,
 open_to_collaboration boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create function private.is_verified_member() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from auth.users where id=(select auth.uid()) and email_confirmed_at is not null and is_anonymous=false) $$;
revoke all on function private.is_verified_member() from public;
grant execute on function private.is_verified_member() to authenticated;
revoke all on public.profiles from anon,authenticated;
grant select,insert on public.profiles to authenticated;
grant update(name,career_stage,affiliation,field,city,bio,open_to_mentorship,open_to_collaboration) on public.profiles to authenticated;
create policy members_read on public.profiles for select to authenticated using ((select private.is_verified_member()));
create policy owner_insert on public.profiles for insert to authenticated with check(id=(select auth.uid()) and (select private.is_verified_member()));
create policy owner_update on public.profiles for update to authenticated using(id=(select auth.uid()) and (select private.is_verified_member())) with check(id=(select auth.uid()) and (select private.is_verified_member()));
create index profiles_created_at_idx on public.profiles(created_at desc);
commit;
