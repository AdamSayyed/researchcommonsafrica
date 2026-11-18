# Research Commons Africa

Production MVP built with Next.js, React, TypeScript and Supabase. Hosted on Vercel.

Live: https://researchcommonsafrica.vercel.app

## Implemented
- Google sign-in, verified-member access, profile onboarding and editing.
- Searchable member directory, member detail pages, mentor/collaborator filters and pagination.
- Research questions, project and mentorship posts; search, type/status filters; author editing, deletion and resolved/reopen state; responses with author editing/deletion.
- Mentorship availability, timezone-aware booking, overlap protection, cancellation, participant-only meeting links and calendar downloads.
- Private in-app notifications for replies and booking changes. Optional mentor alerts for posts matching the profile research field (case-insensitive exact match).
- Google Maps city explorer with opt-in member locations. Curated city suggestions plus free-text locations.
- Optional shared contact email, expertise and website/CV links.
- Responsive blue/gold branding, public privacy/terms pages.

## Local setup
Copy `.env.example` to `.env.local` and configure the public Supabase URL/key and canonical `APP_URL`. Never put Google client secrets or a service-role key in frontend environment variables. Google OAuth credentials belong in Supabase provider settings.

Run `npm ci`, then `npm run dev`. Build with `npm run build`. This Windows environment currently needs `npm run build -- --webpack` for the SWC WASM fallback. Vercel builds normally.

Migrations in `supabase/migrations` create the shared data model and row-level permissions. No service-role key is used by the app. Run security checks before changing policies or RPCs.

## Deliberate MVP limits
- Notifications are in-app. Email alerts need an email provider and verified sending domain.
- Mentors paste Google Meet/Zoom URLs. Creating meetings automatically requires a calendar/video integration and authorization.
- CVs use external links; file uploads are not implemented.
- Map shows a selected city and its members rather than simultaneous member pins. City suggestions are curated, not a global geocoding service.
- Session lists show up to 200 upcoming slots, responses up to 200 per post, notifications the latest 100, and map members up to 1,000. Member and research search are paginated.
- No administrator moderation console or private messaging. Support/reporting goes to the foundation contact address.

## Deployment
Use the existing Vercel project `researchcommonsafrica`. CLI deployments work; Vercel Git integration has not been connected, so a GitHub push alone does not deploy.
