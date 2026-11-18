begin;
create table public.meeting_requests(
id uuid primary key default gen_random_uuid(),
post_id uuid references public.posts(id) on delete set null,
post_title text not null,
requester_id uuid not null references public.profiles(id) on delete cascade,
recipient_id uuid not null references public.profiles(id) on delete cascade,
starts_at timestamptz not null, ends_at timestamptz not null,
note text not null default '' check(length(note)<=1000),
status text not null default 'Pending' check(status in ('Pending','Confirmed','Declined','Withdrawn')),
slot_id uuid references public.mentor_slots(id) on delete set null,
created_at timestamptz not null default now(),
check(requester_id<>recipient_id),check(ends_at>starts_at and ends_at<=starts_at+interval '90 minutes')
);
create index meeting_request_recipient on public.meeting_requests(recipient_id,status);
create index meeting_request_requester on public.meeting_requests(requester_id,status);
create index meeting_request_post on public.meeting_requests(post_id);
create index meeting_request_slot on public.meeting_requests(slot_id);
create unique index one_pending_request_per_post on public.meeting_requests(post_id,requester_id) where status='Pending';
alter table public.meeting_requests enable row level security;
revoke all on public.meeting_requests from anon,authenticated;
grant select on public.meeting_requests to authenticated;
create policy participants_read on public.meeting_requests for select to authenticated using((requester_id=(select auth.uid()) or recipient_id=(select auth.uid())) and (select private.is_verified_member()));

create function private.request_post_meeting(post uuid,starts timestamptz,minutes integer,message text) returns uuid language plpgsql security definer set search_path='' as $$
declare p public.posts; result uuid;
begin
 if auth.uid() is null or not private.is_verified_member() then raise exception 'Sign in required';end if;
 select * into p from public.posts where id=post;
 if p.id is null or p.author_id=auth.uid() or p.status<>'Open' or starts is null or starts<=now() or minutes not in (30,60,90) or minutes is null or length(coalesce(message,''))>1000 then raise exception 'Invalid request';end if;
 update public.meeting_requests set status='Withdrawn' where post_id=post and requester_id=auth.uid() and status='Pending' and starts_at<=now();
 insert into public.meeting_requests(post_id,post_title,requester_id,recipient_id,starts_at,ends_at,note)
 values(p.id,p.title,auth.uid(),p.author_id,starts,starts+minutes*interval '1 minute',coalesce(message,'')) returning id into result;
 insert into public.notifications(user_id,message,href) values(p.author_id,'Meeting request for: '||p.title,'/mentorship');
 return result;
end $$;
create function private.respond_post_meeting(request_id uuid,decision text) returns boolean language plpgsql security definer set search_path='' as $$
declare r public.meeting_requests; meeting uuid;
begin
 if auth.uid() is null or not private.is_verified_member() then return false;end if;
 select * into r from public.meeting_requests where id=request_id for update;
 if r.id is null or r.status<>'Pending' then return false;end if;
 if decision='Withdrawn' and r.requester_id=auth.uid() then
 update public.meeting_requests set status='Withdrawn' where id=r.id;
 insert into public.notifications(user_id,message,href) values(r.recipient_id,'Meeting request withdrawn: '||r.post_title,'/mentorship');
 return true;
 end if;
 if r.recipient_id<>auth.uid() or decision not in ('Confirmed','Declined') then return false;end if;
 if decision='Confirmed' then
 if r.starts_at<=now() then return false;end if;
 -- Serialize participant schedules, including existing availability/booking operations.
 perform 1 from public.profiles where id in (r.requester_id,r.recipient_id) order by id for update;
 if exists(select 1 from public.mentor_slots where not cancelled and
 (mentor_id in (r.requester_id,r.recipient_id) or booked_by in (r.requester_id,r.recipient_id))
 and starts_at<r.ends_at and ends_at>r.starts_at) then return false;end if;
 insert into public.mentor_slots(mentor_id,booked_by,starts_at,ends_at,topic)
 values(r.recipient_id,r.requester_id,r.starts_at,r.ends_at,r.post_title) returning id into meeting;
 end if;
 update public.meeting_requests set status=decision,slot_id=meeting where id=r.id;
 insert into public.notifications(user_id,message,href) values(r.requester_id,'Meeting '||lower(decision)||': '||r.post_title,'/mentorship');
 if decision='Confirmed' then insert into public.notifications(user_id,message,href) values(r.recipient_id,'Meeting confirmed: '||r.post_title,'/mentorship');end if;
 return true;
end $$;
revoke all on function private.request_post_meeting(uuid,timestamptz,integer,text),private.respond_post_meeting(uuid,text) from public;
grant execute on function private.request_post_meeting(uuid,timestamptz,integer,text),private.respond_post_meeting(uuid,text) to authenticated;
create function public.request_post_meeting(post uuid,starts timestamptz,minutes integer,message text) returns uuid language sql security invoker set search_path='' as $$select private.request_post_meeting(post,starts,minutes,message)$$;
create function public.respond_post_meeting(request_id uuid,decision text) returns boolean language sql security invoker set search_path='' as $$select private.respond_post_meeting(request_id,decision)$$;
revoke all on function public.request_post_meeting(uuid,timestamptz,integer,text),public.respond_post_meeting(uuid,text) from public;
grant execute on function public.request_post_meeting(uuid,timestamptz,integer,text),public.respond_post_meeting(uuid,text) to authenticated;
commit;
