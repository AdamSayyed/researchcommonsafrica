import SignInSubmit from '@/components/sign-in-submit';
import {redirect} from 'next/navigation';
import {configured, supabase} from '@/lib/supabase';

async function signIn() {
  'use server';
  const origin = process.env.APP_URL;
  if (!origin) throw new Error('APP_URL must be configured');
  const client = await supabase();
  const {data, error} = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: new URL('/auth/callback', origin).toString(),
      queryParams: {prompt: 'select_account'},
    },
  });
  if (error || !data.url) {
    console.error('Google sign-in failed', {code: error?.code, status: error?.status});
    redirect('/sign-in?error=google');
  }
  redirect(data.url);
}

export default async function SignIn({searchParams}: {
  searchParams: Promise<{error?: string}>;
}) {
  const {error} = await searchParams;
  return <main>
    <a href="/">← Research Commons Africa</a>
    <h1>Your next connection starts here.</h1>
    <p>Use your Google account to join our research community or sign in.</p>
    {!configured() ? <p className="notice">Sign-in is not available yet. Please check back soon.</p> :
      <form action={signIn}>
        <SignInSubmit/>
        {error && <p role="alert">{error === 'cancelled'
          ? 'Google sign-in was cancelled. You can try again when you’re ready.'
          : 'We couldn’t complete Google sign-in. Please try again. If this continues, contact maryjoasisfoundation@gmail.com.'}</p>}
      </form>}
  </main>;
}
