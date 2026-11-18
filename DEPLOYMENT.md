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

## Google sign-in migration (2026-11-17)
The local sign-in page now uses Supabase Google OAuth with PKCE and the existing server-side session callback. Email-link requests have been removed from the sign-in UI. Provider cancellation and code-exchange failures return actionable sign-in errors without exposing tokens.

Pending external configuration before deployment:
- User is creating a dedicated Google Cloud project, Research Commons Africa.
- Configure Google Auth Platform for external users with only openid, email and profile scopes.
- Create a Web application OAuth client. Origin: https://researchcommonsafrica.vercel.app
- Google authorized redirect URI: https://qndahcqocslgfdgbengq.supabase.co/auth/v1/callback
- Store the Google client ID and client secret only in Supabase Authentication > Providers > Google; enable the provider.
- Supabase Site URL and app callback allowlist are already saved and verified: https://researchcommonsafrica.vercel.app and https://researchcommonsafrica.vercel.app/auth/callback.
- Deploy after provider setup, then verify a real Google sign-in, member onboarding, sign-out and signed-out access denial. Google OAuth has not yet been tested end-to-end.

Validation for Google migration: TypeScript passed. ESLint could not start because the existing local install is missing es-abstract/2025/ToString. The Windows build uses the WASM compiler fallback; live OAuth validation awaits Google project setup.

Google OAuth update: client Research Commons Africa Web created in Google project research-commons-515101; credentials stored only in Supabase Google provider, which is enabled. Production deployment dpl_CuN4UdL4pUK9vLER6xSmasBuzXJp is READY. Live Continue with Google reaches the Google account chooser with correct Supabase callback. End-to-end session test awaits user sign-in. Google audience is External/Testing; Publish app is disabled pending branding configuration. Public launch is not yet verified. Production build passed; local ESLint dependency issue remains.

Public sign-in update: user approved privacy policy and terms, deployed and verified at /privacy and /terms in deployment dpl_BBL5TRV1tKm8WCyPfZEL2h2DtxP4. Saved both links in Google branding. User confirmed public sign-in launch; Google Audience now visibly reports In production and External. User previously confirmed successful Google sign-in through profile onboarding.
