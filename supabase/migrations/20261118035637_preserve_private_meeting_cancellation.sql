create or replace function private.cancel_slot(slot_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare changed uuid; private_meeting boolean;
begin
 if auth.uid() is null or not private.is_verified_member() then return false;end if;
 select exists(select 1 from public.meeting_requests where meeting_requests.slot_id=cancel_slot.slot_id) into private_meeting;
 update public.mentor_slots set cancelled=case when mentor_id=auth.uid() or private_meeting then true else cancelled end,
 booked_by=case when mentor_id=auth.uid() or private_meeting then booked_by else null end
 where id=slot_id and not cancelled and (mentor_id=auth.uid() or booked_by=auth.uid()) returning id into changed;
 if changed is not null and private_meeting then
 insert into public.notifications(user_id,message,href) select mentor_id,'Research meeting cancelled: '||topic,'/mentorship' from public.mentor_slots where id=changed and mentor_id<>auth.uid();
 end if;
 return changed is not null;
end $$;
