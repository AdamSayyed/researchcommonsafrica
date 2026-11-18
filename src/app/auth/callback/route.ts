import {NextRequest,NextResponse} from 'next/server';
import {supabase} from '@/lib/supabase';
export async function GET(request:NextRequest){const code=request.nextUrl.searchParams.get('code');const origin=process.env.APP_URL;if(!origin)throw new Error('APP_URL must be configured');if(code){const client=await supabase();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/members',origin))}return NextResponse.redirect(new URL('/sign-in?error=link',origin))}
