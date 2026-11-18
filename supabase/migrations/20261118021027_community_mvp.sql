begin;
alter table public.profiles add column website text not null default '' check(length(website)<=500 and (website='' or website ~ '^https://')),
add column contact_email text not null default '' check(length(contact_email)<=254),
add column interests text not null default '' check(length(interests)<=500),
add column show_on_map boolean not null default false;
grant update(website,contact_email,interests,show_on_map) on public.profiles to authenticated;

create table public.posts (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check(length(trim(title)) between 5 and 160),
 body text not null check(length(trim(body)) between 20 and 10000),
 field text not null check(length(trim(field)) between 1 and 120),
 kind text not null check(kind in ('Question','Project','Mentorship')),
 status text not null default 'Open' check(status in ('Open','Resolved')),
 availability text not null default '' check(length(availability)<=500),
 created_at timestamptz not null default now()
);
create table public.responses (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(length(trim(body)) between 2 and 5000),
 created_at timestamptz not null default now()
);
create table public.mentor_slots (
 id uuid primary key default gen_random_uuid(), mentor_id uuid not null references public.profiles(id) on delete cascade,
 starts_at timestamptz not null, ends_at timestamptz not null,
 topic text not null check(length(trim(topic)) between 3 and 160),
 booked_by uuid references public.profiles(id) on delete set null,
 cancelled boolean not null default false,
 meeting_url text not null default '' check(length(meeting_url)<=500 and (meeting_url='' or meeting_url ~ '^https://')),
 created_at timestamptz not null default now(),
 check(ends_at>starts_at and ends_at<=starts_at+interval '4 hours'), check(booked_by is null or booked_by<>mentor_id)
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 message text not null, href text not null, is_read boolean not null default false, created_at timestamptz not null default now()
);
create index posts_created_idx on public.posts(created_at desc);
create index posts_author_idx on public.posts(author_id);
create index responses_post_idx on public.responses(post_id,created_at);
create index responses_author_idx on public.responses(author_id);
create index slots_time_idx on public.mentor_slots(starts_at);
create index slots_mentor_idx on public.mentor_slots(mentor_id);
create index slots_booked_idx on public.mentor_slots(booked_by);
create index notifications_user_idx on public.notifications(user_id,created_at desc);
alter table public.posts enable row level security;
alter table public.responses enable row level security;
alter table public.mentor_slots enable row level security;
alter table public.notifications enable row level security;
revoke all on public.posts,public.responses,public.mentor_slots,public.notifications from anon,authenticated;
grant select,insert,delete on public.posts,public.responses to authenticated;
grant update(title,body,field,kind,status,availability) on public.posts to authenticated;
grant update(body) on public.responses to authenticated;
create policy read_posts on public.posts for select to authenticated using((select private.is_verified_member()));
create policy write_posts on public.posts for insert to authenticated with check(author_id=(select auth.uid()) and (select private.is_verified_member()));
create policy edit_posts on public.posts for update to authenticated using(author_id=(select auth.uid()) and (select private.is_verified_member())) with check(author_id=(select auth.uid()));
create policy delete_posts on public.posts for delete to authenticated using(author_id=(select auth.uid()) and (select private.is_verified_member()));
create policy read_responses on public.responses for select to authenticated using((select private.is_verified_member()));
create policy write_responses on public.responses for insert to authenticated with check(author_id=(select auth.uid()) and (select private.is_verified_member()) and exists(select 1 from public.posts where id=post_id and status='Open'));
create policy edit_responses on public.responses for update to authenticated using(author_id=(select auth.uid()) and (select private.is_verified_member())) with check(author_id=(select auth.uid()));
create policy delete_responses on public.responses for delete to authenticated using(author_id=(select auth.uid()) and (select private.is_verified_member()));
grant select(id,mentor_id,starts_at,ends_at,topic,booked_by,cancelled,created_at) on public.mentor_slots to authenticated;
grant insert(id,mentor_id,starts_at,ends_at,topic,meeting_url) on public.mentor_slots to authenticated;
grant update(meeting_url) on public.mentor_slots to authenticated;
create policy read_slots on public.mentor_slots for select to authenticated using((select private.is_verified_member()));
create policy create_slots on public.mentor_slots for insert to authenticated with check(mentor_id=(select auth.uid()) and starts_at>now() and (select private.is_verified_member()) and exists(select 1 from public.profiles where id=mentor_id and open_to_mentorship));
create policy edit_slot_link on public.mentor_slots for update to authenticated using(mentor_id=(select auth.uid()) and (select private.is_verified_member())) with check(mentor_id=(select auth.uid()));
grant select on public.notifications to authenticated;
grant update(is_read) on public.notifications to authenticated;
create policy read_notifications on public.notifications for select to authenticated using(user_id=(select auth.uid()) and (select private.is_verified_member()));
create policy mark_notifications on public.notifications for update to authenticated using(user_id=(select auth.uid()) and (select private.is_verified_member())) with check(user_id=(select auth.uid()));

-- Private privileged implementation with small invoker-only RPC wrappers.
create function private.book_slot(slot_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare changed uuid;
begin
 if auth.uid() is null or not private.is_verified_member() then return false; end if;
 update public.mentor_slots set booked_by=auth.uid() where id=slot_id and booked_by is null and not cancelled and starts_at>now() and mentor_id<>auth.uid() returning id into changed;
 return changed is not null;
end $$;
create function private.cancel_slot(slot_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare changed uuid;
begin
 if auth.uid() is null or not private.is_verified_member() then return false; end if;
 update public.mentor_slots set cancelled=case when mentor_id=auth.uid() then true else cancelled end,
 booked_by=case when mentor_id=auth.uid() then booked_by else null end
 where id=slot_id and not cancelled and (mentor_id=auth.uid() or booked_by=auth.uid()) returning id into changed;
 return changed is not null;
end $$;
create function private.slot_link(slot_id uuid) returns text language sql stable security definer set search_path='' as $$
 select meeting_url from public.mentor_slots where id=slot_id and not cancelled and (mentor_id=auth.uid() or booked_by=auth.uid()) and private.is_verified_member()
$$;
revoke all on function private.book_slot(uuid),private.cancel_slot(uuid),private.slot_link(uuid) from public;
grant execute on function private.book_slot(uuid),private.cancel_slot(uuid),private.slot_link(uuid) to authenticated;
create function public.book_slot(slot_id uuid) returns boolean language sql security invoker set search_path='' as $$select private.book_slot(slot_id)$$;
create function public.cancel_slot(slot_id uuid) returns boolean language sql security invoker set search_path='' as $$select private.cancel_slot(slot_id)$$;
create function public.slot_link(slot_id uuid) returns text language sql stable security invoker set search_path='' as $$select private.slot_link(slot_id)$$;
revoke all on function public.book_slot(uuid),public.cancel_slot(uuid),public.slot_link(uuid) from public;
grant execute on function public.book_slot(uuid),public.cancel_slot(uuid),public.slot_link(uuid) to authenticated;

create function private.notify_response() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(user_id,message,href)
 select author_id,'A member responded to: '||title,'/research/'||id from public.posts where id=new.post_id and author_id<>new.author_id;
 return new;
end $$;
create trigger response_notification after insert on public.responses for each row execute function private.notify_response();
create function private.notify_booking() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.booked_by is distinct from old.booked_by then
   insert into public.notifications(user_id,message,href) values(new.mentor_id,case when new.booked_by is null then 'A mentorship booking was cancelled: ' else 'Your mentorship session was booked: ' end||new.topic,'/mentorship');
   if new.booked_by is not null then
     insert into public.notifications(user_id,message,href) values(new.booked_by,'Your mentorship booking is confirmed: '||new.topic,'/mentorship');
   end if;
 end if;
 if new.cancelled and not old.cancelled and new.booked_by is not null then
   insert into public.notifications(user_id,message,href) values(new.booked_by,'Your mentor cancelled this session: '||new.topic,'/mentorship');
 end if;
 if new.meeting_url is distinct from old.meeting_url and new.booked_by is not null then
   insert into public.notifications(user_id,message,href) values(new.booked_by,'Meeting details updated: '||new.topic,'/mentorship');
 end if;
 return new;
end $$;
create trigger booking_notification after update on public.mentor_slots for each row execute function private.notify_booking();
revoke all on function private.notify_response(),private.notify_booking() from public;
commit;
