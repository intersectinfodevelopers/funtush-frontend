# Wiring the agency dashboard to the real API

**Status: funtush-frontend no longer uses any mock data.** All 22 agency-dashboard sections, login, agency + trekker registration,
forgot/reset password, the admin "View agency dashboard" support-session hand-off, the public white-label site (`/site/*`) and the
trekker area all run on the real API. `data/*.json`, `lib/mock`, `/api/site-data` and the mock hooks were deleted. Remaining gaps are
backend/product decisions, listed under "Known gaps" below.

The agency dashboard started life as a prototype: every section read `data/*.json` and `localStorage`, login compared a plaintext
password from a JSON file, and `agencyId` was hard-coded to `ag-001`.

## Done
- **Session + API client** — `src/lib/api/{session,client,auth}.ts`. Real login (`/auth/agency/login`, `/auth/trekker/login`),
  token rotation on 401 (single-flight), real logout (revokes the refresh token). Sends **both** `Authorization: Bearer`
  and `x-refresh-token` — different API routes use different ones.
- **Support session storage** — `session.ts` keeps an admin-acting-as-agency session in `sessionStorage` (tab-scoped), which
  `getSession()`/the API client prefer over a normal login. (Hand-off page not built yet — see below.)
- **Dashboard home** — all widgets, sidebar (agency name, working Logout), topbar (real user, real notifications).
  Removed fabricated data: fake SOS banner, fake weather, invented growth %, "Active Treks = 1", fake notifications/quick stats.
- **Bookings** (list, detail, create) — all on the real API. List: server-side status tabs (several API statuses per tab), search,
  departure-date range, paging, CSV export (up to 1000, formula-injection safe). Detail: rebuilt around the real state machine
  (accept → payment link, reject with reason, propose date, confirm, assign guide, check-in/out, cancel). The mock's invented
  features (undo snapshots, per-booking "services", restore-cancelled, agency-written reviews) were dropped — the API has none of them.
  Create: real packages/departures/seats/add-ons, server-side pricing (estimate shown).
- **Shared fixes:** `AnalyticsSummaryCard` no longer invents "+12.5% from last month"; `Pagination` windows pages (was a button per page);
  `exportToCsv` neutralises spreadsheet formulas; `useAuth` no longer causes a hydration mismatch (uses `useSyncExternalStore`).
- **Backend:** `GET /agencies/me/dashboard` (was 404, never mounted); `GET /bookings` gained multi-status/`search`/`from`/`to`
  and rejects the non-existent `PENDING` status (was a 500); new `GET /agencies/packages/:id` (itinerary, departures with seat
  counts, add-ons); package list rejects unknown `status` (was a 500).

## Conventions (follow these for every section)
1. **Data layer** in `src/lib/api/agency/<section>.ts`: typed fetchers + an adapter to the UI's existing shape when the UI
   is built on the mock schema (see `toUiBooking`). Keep the JSX; replace the data source.
2. **Hooks** in `src/hooks/` with React Query; export query keys so mutations invalidate exactly what they change.
3. **Never** import `data/*.json`, read `localStorage` for domain data, or hard-code an agency id. Money via `useMoney()`.
4. **No invented numbers.** If the API has no source for a figure, remove it or say what it really counts.
5. Verify each section in a real browser against a real agency, and check for console/HTTP errors.

## API response envelopes are inconsistent — adapt per endpoint
| shape | example |
|---|---|
| `{success, data:{items…,total,page,limit}}` | `GET /bookings` → `data.bookings` |
| `{success, data:[…], meta}` / `pagination` | packages, finance transactions |
| `{success, result:{data, meta}}` | `GET /agencies/me/customers` |
| `{success, guides, total…}` | `GET /agencies/me/guides` |
| bare object | `GET /agencies/me/analytics` |

Enums/field names differ from the mock: booking status is UPPER_CASE with 9 values; package difficulty is
`EASY|MODERATE|CHALLENGING|DIFFICULT`; the guides API returns `name` (not fullName) and **lower-case** status
`available|on_trek|unavailable`, lists ACTIVE guides only, and a booking references a guide by `guideRef`.
Always read the real response before typing it — two of my own first guesses (guide fields) were wrong.

## Also done (each browser-tested against the live API)
Packages (list/detail/builder incl. itinerary, departures, add-ons, publish checklist; backend: `GET /agencies/packages/:id`, list search/sort/counts/next departure) ·
Customers (list/analytics/profile/notes; backend: profile 500→404) · Staff (invite shows the one-time temp password) · Roles (grouped permission catalog) ·
Guides (list/detail/create/edit incl. photo + certification-document upload) · Reviews (server-side star/responded/sort filters, reply once, flag).
Shared: `uploadFile`/`FileUploadField` (POST /upload), `useDebouncedValue`, windowed pagination.

## Known backend gaps found while wiring (need a decision)
- A staff member's role can be changed but not cleared (`roleId` required).
- Local dev has no object storage configured (`STORAGE_ENDPOINT` points at a non-existent host) — uploads 500 locally. Tests use a tiny fake S3.
- Guide status is not updated automatically by check-in/check-out.

## Done since (all browser-tested against the live API, with backend hardening + e2e tests where the API was deficient)
Safety · Blog + Categories (HTML sanitised, photo-preserving update) · Destinations · Gallery · Videos (YouTube-link validation) · Coupons (validation,
DELETE) · Branches (mass-assignment fix, per-agency name uniqueness migration, DELETE) · Advertisements · **Appearance** (Branding, SEO, Navigation, Social,
Widgets, Templates + page editor, Components = site-config, Domain & Publish) · **Settings** (Agency Info + KYC, Subscription, Payments, API keys,
Notifications, Email, Security = change password) · Support (bug reports) · Profile (real account info) · Analytics (recharts) · **Finance** (overview, income,
expenses, payroll, invoices, reports; the chart of accounts is now seeded lazily on first use) · forgot/reset password.
Shared: `useApiForm` (server data + edits → changed-keys PATCH), `formatError` surfaces zod field errors, `lib/api/agency/{site,settings,finance,analytics,…}.ts`.

## The admin hand-off (done)
funtush-admin → agency page → **View agency dashboard** (reason required; agency emailed; audit-logged) → the admin app calls
`POST /admin/agencies/:id/impersonate`, which now also returns a **one-time `handoffCode`** (Redis, 60 s, single use, only its hash is stored) →
a new tab opens `funtush-frontend/support-session?code=…` → the page strips the code from the URL, `POST /auth/support-session/exchange`s it for the
session tokens, keeps them in that **tab's sessionStorage only**, and lands on `/dashboard` under a permanent yellow **Support session** banner
(agency name, countdown, End session). Every mutating request is audit-logged (`IMPERSONATION_ACTION`, actor = the admin). The admin's
"End active session" (or a newer session) revokes it instantly. Password change is refused during a support session. The support access token now lasts as
long as the session (a support session cannot refresh). funtush-admin's old in-admin "workspace" pages were removed.
Config: `NEXT_PUBLIC_AGENCY_DASHBOARD_URL` (admin, default `http://localhost:3001`), `NEXT_PUBLIC_ADMIN_URL` (frontend, default `http://localhost:3000`),
`PASSWORD_RESET_URL` (API — points reset emails at funtush-frontend `/reset-password`).

## Registration, public site, trekker area (done)
- **Registration** — `/register` (role) → `/register/agency` (name, email, Nepali mobile, strong password; OTP step if the platform toggle is on; signs in on
  success) and `/register/trekker`. Backend fixes: the welcome email no longer contains the password; trekker `POST /auth/register` no longer returns the
  User row (password hash); agency names/passwords validated. A brand-new agency's 28 dashboard pages render without errors (browser-checked).
- **Public site** — `src/lib/site/*` + `src/components/site/*` + `src/app/site/*`. The agency is resolved from the subdomain (`{slug}.funtush.io|.com|.localhost`) or
  `?site={slug}` (preview/dev; remembered per tab). It renders the agency's own header/navigation, announcement bar, popup, footer, WhatsApp button, SEO tags and the
  template's sections (hero, packages, destinations, blog, gallery, videos, reviews, ads…) from new public read-only endpoints
  `GET /site/:slug/{packages,packages/:id,destinations,destinations/:slug,blog,blog/:id,gallery,videos,reviews,ads,about}` (published only, live-gated, first names only for
  reviews, blog HTML re-sanitised). Booking uses `POST /bookings/inquiry` + emailed code (now validated, rate-limited per email, and the code is burned after 5 wrong
  guesses). CORS is open to any origin for `/site/*` and `/bookings/inquiry` only (no credentials).
- **Trekker area** — discovery (marketplace search; results link to the agency's site), my treks + detail (mobile dashboard + offline package), profile (new
  `GET/PATCH /trekker/me`) with change-password, reviews page, and a public `/review?token=` form for the emailed invitation (the API now validates before uploading
  photos, and the invitation link points at this page).

## More known gaps (need a decision)
- **Plan checkout** is wired for eSewa and Khalti (Settings → Subscription → Pay; return pages under `/dashboard/billing/return/*`; API `subscriptionPayments.service.ts`).
  It was only tested with mocked gateway HTTP (no sandbox accounts) — do one live sandbox payment before launch. Stripe is not wired. Plan prices are USD; the gateways charge
  NPR = ceil(price × `USD_NPR_RATE`, default 140), and the plan cards show that exact NPR figure (`monthlyPriceNpr`). Env: `USD_NPR_RATE`, `BILLING_RETURN_URL`, `ESEWA_MERCHANT_CODE`, `KHALTI_SECRET_KEY`, `ESEWA_BASE_URL`, `KHALTI_BASE_URL`.
- Saved **payment-gateway credentials** (Settings → Payments) are stored encrypted, but nothing reads them yet.
- Live-chat embed code (LARGE tier) is published on the agency's own site by design — keep it to trusted providers.
- Trekker email OTP is now emailed (registration + "Send code" on the profile page); verification is optional for login.
- Trekker in-app notifications now exist (`TrekkerNotification` table, `/trekker/notifications*`, bell + page). Live tracking/SOS live in the mobile app.
- **Package builder** (`/dashboard/packages/new` and `/[id]/edit` are the SAME single-page form, `PackageBuilderForm.tsx`): basics (destination, category, difficulty, duration min/max,
  altitude min/max, region, best time, activities, routes, short pitch, description), up to 5 photos (first = featured; drag & drop), itinerary, departures, pricing (currency +
  volume-discount tiers), add-ons, Published/Featured toggles. One Save syncs everything: PATCH the package, then diffs itinerary/departures/add-ons against the server.
  Backend: `TrekPackage` builder columns (migration `20260921100000_package_builder_fields`), validation in `utils/validator.ts` (`parsePackageDetails`), `POST /agencies/packages/:id/unpublish`,
  volume discounts applied server-side to booking prices (`discountedPricePerPerson`), featured packages sort first on the public site. Package currency is display-only (bookings are not converted).
  Package list: S.No column (continues across pages), search over title/destination/region/category, 8 sort orders, brand-coloured pagination. Past departure dates are refused (picker `min` + server).
  **Who did what:** every mutating `/agencies/packages*` call is written to `package_activity` by `packageActivityLogger` (actor = owner email / staff name / "Funtush support"; bursts of edits merge);
  shown as the Activity card on the package detail page and as topbar notifications for OTHER people's actions (`GET /agencies/packages/:id/activity`, `GET /agencies/me/package-activity`).
  Archived packages are editable; `DELETE ?permanent=true` removes an archived, never-booked package.
- On a tenant subdomain the whole page (tags AND body: shell, home sections, lists, package/destination/blog detail) is server-rendered: `site/layout.tsx` prefetches via `lib/site/serverPrefetch.ts`
  (path from the `x-site-path` header set in `proxy.ts`) and `SiteSeed` seeds the query cache. Preview URLs (`?site=`) stay client-rendered. Public content can be up to ~2 min stale (API 60 s + Next fetch cache 60 s).
- Marketplace search needs Meilisearch indexed (`npm run search:reindex`); FREE-tier agencies are intentionally hidden from it.

## Staff login (done)
Invited staff (role `STAFF`) can sign in through the Agency tab. Access is enforced server-side, default-deny, by `services/staffAccess.service.ts` (path → permission map,
applied in `authenticateWithRefreshToken`, plus `requireStaffPermission` on Bearer routes such as bookings) and re-read on every request, so changing a role or deactivating
the member bites immediately. Owner-only areas: staff, roles, payment methods, API keys, KYC, domain, publish, ad campaigns, billing, admin. The `staff` permission lets a member manage the team (staff + roles), limited by `staffDelegationGuard`: they can only
grant/assign roles whose permissions they hold themselves, can't touch their own membership/role or anyone above their level. Payment methods, API keys, KYC, domain, publish, ad campaigns and billing stay owner-only. `GET /agencies/me/access` feeds the sidebar / dashboard widgets / topbar notifications in the UI (`useAgencyAccess`).

## Running locally
API `:4000` (`SKIP_ADMIN_IP_CHECK=true NODE_ENV=development npx tsx --env-file=.env src/cluster.ts`), funtush-admin `:3000`, funtush-frontend `:3001`
(`next dev -p 3001`). CORS allows both origins. For uploads locally, point `STORAGE_ENDPOINT`/`CDN_BASE_URL`/`AWS_BUCKET_NAME` at any S3-compatible endpoint.
- Validation: package API errors are `{message, errors:{field:msg}}` (`fieldError`); builder shows them under the field, red * on required inputs, toasts name the package.
- One departure per package; `archiveCompletedPackages` (hourly job + on every agency list) archives a package once its date has passed. List shows days-left (>10 green, 3-10 yellow, <3 red).
