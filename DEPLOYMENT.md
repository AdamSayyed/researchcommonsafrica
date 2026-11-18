# Production deployment status

## Services
- Live app: https://researchcommonsafrica.vercel.app
- Public repository: https://github.com/AdamSayyed/researchcommonsafrica
- Supabase project: qndahcqocslgfdgbengq, eu-west-1, AdamSayyed’s Org.
- Google project: research-commons-515101. Google provider enabled in Supabase. Google Audience verified as External / In production. User confirmed successful sign-in.
- Latest MVP deployment: dpl_C6SH39zDXZu1XM3AMZvLh1YfbZxV, READY.
- APP_URL and Supabase redirect allowlist use the production origin and /auth/callback.

## Validation
- TypeScript and local production build passed (Webpack/WASM fallback for local Windows SWC issue).
- Vercel production build and deployment passed.
- Live signed-in browser checks passed for directory, research board, mentorship form, Google Map, notifications and expanded profile form.
- HTTP requests without a session confirmed sign-in redirects for research, mentorship, map and notifications.
- Transactional SQL tests passed for own-author edits, denied cross-author edits, booking, double-booking prevention, participant-only meeting links, cancellation, denied third-party cancellation, private notifications, mentor opt-in field alerts, overlapping availability, overlapping learner bookings, anonymous table/RPC access denial and column-level meeting-link protection. All test fixtures rolled back.
- Supabase security advisor reports no new schema findings. Existing leaked-password-protection warning remains; this app currently uses Google sign-in.
- Local ESLint could not start due to a pre-existing incomplete es-abstract installation. TypeScript, build and database tests passed.

## Boundaries
See README for deliberate MVP limits. Automatic email, Google Meet creation, file storage, private messaging and administrator tooling are not implemented. The original Sites prototype remains separate. Vercel Git integration is not connected; deployments are made through CLI.

## Schema
Migrations are additive to existing profiles. RLS protects every new public table. Privileged booking helpers are in the private schema with explicit verified-user checks; public RPCs are invoker wrappers. Meeting URLs are excluded from table SELECT grants and retrieved only by checked participant RPC. No elevated database key is used by application code.

Post meeting verification: TypeScript passed. Transactional tests passed for request privacy, sender self-approval denial, third-party approval denial, pending/upcoming separation, exact-once acceptance, schedule conflict denial, decline, withdrawal and private cancellation. Test fixtures rolled back. Security advisor has no new findings.
