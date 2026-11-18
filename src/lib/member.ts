import 'server-only';import {redirect} from 'next/navigation';import {configured,supabase} from './supabase';
export async function requireMember(){if(!configured())redirect('/sign-in');const client=await supabase();const {data:{user},error}=await client.auth.getUser();if(error||!user?.email_confirmed_at)redirect('/sign-in');return {client,user}}
