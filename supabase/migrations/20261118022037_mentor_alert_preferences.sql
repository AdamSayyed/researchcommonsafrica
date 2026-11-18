begin;
alter table public.profiles add column research_alerts boolean not null default false;
grant update(research_alerts) on public.profiles to authenticated;
create function private.notify_research() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(user_id,message,href)
 select id,'New research in your field: '||new.title,'/research/'||new.id from public.profiles
 where id<>new.author_id and open_to_mentorship and research_alerts and lower(trim(field))=lower(trim(new.field));
 return new;
end $$;
revoke all on function private.notify_research() from public;
create trigger research_notification after insert on public.posts for each row execute function private.notify_research();
create function private.prevent_overlapping_availability() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.profiles where id=new.mentor_id for update;
 if exists(select 1 from public.mentor_slots where mentor_id=new.mentor_id and not cancelled and starts_at<new.ends_at and ends_at>new.starts_at)
 then raise exception 'This time overlaps an existing mentorship session'; end if;
 return new;
end $$;
revoke all on function private.prevent_overlapping_availability() from public;
create trigger no_overlapping_availability before insert on public.mentor_slots for each row execute function private.prevent_overlapping_availability();
create or replace function private.book_slot(slot_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare target public.mentor_slots; changed uuid;
begin
 if auth.uid() is null or not private.is_verified_member() then return false; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into target from public.mentor_slots where id=slot_id;
 if target.id is null then return false; end if;
 if exists(select 1 from public.mentor_slots where not cancelled and (booked_by=auth.uid() or mentor_id=auth.uid()) and starts_at<target.ends_at and ends_at>target.starts_at) then return false; end if;
 update public.mentor_slots set booked_by=auth.uid() where id=slot_id and booked_by is null and not cancelled and starts_at>now() and mentor_id<>auth.uid() returning id into changed;
 return changed is not null;
end $$;
commit;
