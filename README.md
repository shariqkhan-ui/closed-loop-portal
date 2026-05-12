# Closed Loop Portal

Seven-stage issue tracker for Wiom Operations. Every signal becomes a loop. Every loop has to close.

Built from the *Zero Open Loops* operating framework — issues walk Sense → Triage → Diagnose → Design → Pilot → Rollout → Verify, with stage gates, named owners, aging clocks per stage, and auto-escalation when SLAs slip.

## Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4
- Supabase (Postgres) — schema in `SCHEMA.sql`
- NextAuth v5 (Google SSO, restricted to `@wiom.in` + `@i2e1.com`)
- Railway hosting (NIXPACKS)

## Local setup

```bash
cd "C:\Users\Shariq Raza Khan\closed-loop-portal"
npm install
cp .env.example .env.local
# fill in Supabase + Google OAuth keys
npm run dev
# → http://localhost:3000
```

Without env vars filled in, the app boots in **demo mode** (in-memory data, no auth). Useful for a quick look. To make it real, set the four blocks below.

### Supabase
1. Create a Supabase project.
2. SQL editor → paste `SCHEMA.sql` → run.
3. Project settings → API → copy `URL` and `anon` key into `.env.local`.

### Google SSO
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** → Web application.
2. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://<your-railway-domain>`
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-railway-domain>/api/auth/callback/google`
4. Copy Client ID and Secret into `.env.local` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. Generate `AUTH_SECRET`:
   ```bash
   npx auth secret
   ```

The allow-list of domains (`wiom.in`, `i2e1.com`) is hard-coded in `auth.ts`.

## Railway deploy

```bash
# from the project root
git init && git add . && git commit -m "Initial closed-loop-portal"

# create a GitHub repo (gh CLI) and push
gh repo create shariqkhan-ui/closed-loop-portal --public --source=. --remote=origin --push

# in Railway dashboard:
#   New project → Deploy from GitHub → pick closed-loop-portal
#   Variables → add:
#     NEXT_PUBLIC_SUPABASE_URL
#     NEXT_PUBLIC_SUPABASE_ANON_KEY
#     AUTH_SECRET
#     AUTH_TRUST_HOST=true
#     NEXTAUTH_URL=https://<railway-domain>
#     GOOGLE_CLIENT_ID
#     GOOGLE_CLIENT_SECRET
#   Generate a public domain → set Google OAuth redirect URI to it.
```

> ⚠️ **Use `railway variables set KEY=VAL` (subcommand, no `--`).** The legacy `railway variables --set` flag wipes all other env vars on that service.

After every env-var change: `railway redeploy` (the container holds its startup env until restart).

Pushes to `master` auto-deploy via the GitHub integration. `railway up` uploads from CLI get overwritten — push through git.

## Routes & screens

| Route | What it does |
|---|---|
| `/` | Dashboard — counts by stage and severity, recent activity, the seven-stage strip |
| `/` → Stage Board | 7-column kanban, cards open the issue drawer |
| `/` → All Issues | Searchable + filterable list |
| `/` → Stuck Loops | Issues past 1× SLA, grouped by tier (Tier 1 amber → Tier 4 stuck) |
| `/` → Framework | The 7-stage reference, rollout waves, five closure rules |
| `/login` | Google SSO landing |

The sidebar switches between these — single-page, no full page reloads.

## How a loop moves

1. **New Issue** (sidebar) → starts at Stage 01 · Sense.
2. Each stage exposes its own form panel inside the issue drawer.
3. **Advance** is gated: e.g. you cannot leave Design without success criteria, you cannot leave Pilot with a `fail` result (must rollback), you cannot leave Verify with `closed_not_fixed` (must rollback to Diagnose). These rules live in `app/components/IssueDrawer.tsx` → `checkGate()`.
4. **Rollback** sends the issue back one stage — used when the pilot fails or verification finds the detector still trips.
5. **Aging clock** uses the P1 cadence from `lib/framework.ts`. P0 runs 5× tighter, P2 runs 2× slower.

Stage history is logged automatically (DB trigger) to `stage_history` so you have a full audit of every advance/rollback.

## Files of interest

- `lib/framework.ts` — single source of truth for the 7 stages, SLAs, tier thresholds, colors.
- `lib/supabase.ts` — typed client + `Issue` / `StageHistoryRow` interfaces.
- `app/components/IssueDrawer.tsx` — per-stage forms, gate logic, advance/rollback/reopen.
- `app/components/Dashboard.tsx` — entry view; mirrors the closed-loop document's aesthetic.
- `SCHEMA.sql` — enums, `issues`, `stage_history`, auto-issue-code sequence, stage-change trigger.

## Tweaking SLAs / stages

All cadences are in `lib/framework.ts`. Edit `slaHoursP1` per stage, or `slaHoursFor()` to change the P0/P2 multipliers. Change `STAGE_COLOR` to retheme. The DB enum `loop_stage` is kept generic enough that adding a stage requires a schema migration + an entry in `STAGES`.
