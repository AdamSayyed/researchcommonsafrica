# Production setup status
Implemented locally: Next.js/TypeScript, branded public introduction, email-link request and callback, server-verified member access, profile onboarding/editing, member directory, and database migration with row-level permissions.
Not deployed or live-verified. Supabase, Vercel, GitHub, and production email configuration are not connected. Remaining product modules: research/discussions, bookings, maps, notifications, moderation, uploads.

## Required configuration
1. Create/select the production Supabase project. Apply supabase/migrations/202611170001_profiles.sql after database permission tests.
2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. No service-role key is needed by the app.
3. Set APP_URL to the canonical HTTPS production origin. Configure the matching Supabase Site URL and allow the exact /auth/callback URL.
4. Enable email authentication and verification; keep anonymous sign-in disabled. Configure Resend custom SMTP with a verified sending domain, appropriate auth rate limits and bot protection. Disable email link tracking. Use the default PKCE-compatible magic-link template.
5. Import repository into Vercel and set the environment variables. Run npm run build before release.
6. Before accepting members, verify with two accounts: email sign-in, expired link rejection, signed-out access denial, private emails absent from directory, and inability to update another member through the Data API. Test session refresh and profile save with live services.

## Commands
npm run dev
npm run build
npm start

No current Sites publication is replaced by this project.

Deployment preference: start on the default Vercel *.vercel.app hostname. A custom website domain can wait. Public email-link registration still requires an email provider with a verified sending domain; the Supabase built-in mailer is for restricted testing.

Validation: TypeScript check passed. Production build passed with npm run build -- --webpack. Default Turbopack build could not load the local Windows native compiler; Webpack used the WASM fallback. Live authentication and database permission tests remain pending service connections.


Cloud setup update: Supabase project qndahcqocslgfdgbengq created, profiles migration applied, RLS enabled, anonymous read denied, security advisor clean. Vercel initial deployment READY at https://researchcommonsafrica.vercel.app. Public GitHub repository AdamSayyed/researchcommonsafrica exists; source push pending Git authentication. Auth callback configuration and live email verification still pending dashboard login and sending-domain setup. This is an initial foundation, not the complete platform.

Verification update: corrected deployment dpl_B1GLSPiCLEqztgTHt9Y5UmjMKW3c is READY. Homepage HTTP 200. Signed-out /members contains the Next.js redirect to /sign-in and no member directory. SQL transactional tests passed for owner insert/update, member directory reads, and denied cross-member updates; fixtures rolled back. Source pushed to public GitHub repository. Automatic Vercel Git integration failed to connect and remains pending; CLI deployment works. Supabase dashboard login needed for Auth callback settings; real email sign-in remains unverified.
