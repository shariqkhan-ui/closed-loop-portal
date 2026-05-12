-- Closed Loop Portal — Supabase schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'loop_stage') then
    create type loop_stage as enum (
      'sense', 'triage', 'diagnose', 'design', 'pilot', 'rollout', 'verify', 'closed', 'reopened'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'loop_severity') then
    create type loop_severity as enum ('P0', 'P1', 'P2');
  end if;

  if not exists (select 1 from pg_type where typname = 'loop_category') then
    create type loop_category as enum ('hardware', 'firmware', 'process', 'partner', 'customer', 'ambiguous');
  end if;

  if not exists (select 1 from pg_type where typname = 'loop_scope') then
    create type loop_scope as enum ('single_csp', 'csp_cohort', 'city_wide', 'network_wide');
  end if;

  if not exists (select 1 from pg_type where typname = 'pilot_result') then
    create type pilot_result as enum ('pending', 'pass', 'pass_with_revision', 'fail');
  end if;

  if not exists (select 1 from pg_type where typname = 'verify_status') then
    create type verify_status as enum ('pending', 'closed_fixed', 'closed_not_fixed', 'held_open');
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- issues — one row per Issue-ID, walks through 7 stages
-- ─────────────────────────────────────────────────────────────
create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  issue_code text unique not null,           -- e.g. CL-2026-0001
  title text not null,
  description text,

  -- Sense
  signal_source text,                        -- e.g. "device_offline_detector", "ticket_cluster"
  signal_evidence text,                      -- free-form: which alert, which tickets, link
  sensed_at timestamptz default now(),

  -- Triage
  severity loop_severity,
  category loop_category,
  scope loop_scope,
  scope_detail text,                         -- e.g. "14 CSPs across UP West"
  owner_name text,
  owner_team text,

  -- Diagnose
  root_cause_hypothesis text,
  evidence_attached text,                    -- links / notes

  -- Design fix
  fix_plan text,
  success_criteria text,                     -- non-negotiable to advance to Pilot
  detector text,                             -- which signal, queried how
  observation_window_days int,

  -- Pilot
  pilot_cohort text,
  pilot_started_at timestamptz,
  pilot_result pilot_result default 'pending',
  pilot_notes text,
  control_cohort text,

  -- Rollout
  rollout_wave int default 0,                -- 0=not started, 1..4
  rollout_notes text,

  -- Verify
  verify_status verify_status default 'pending',
  verify_started_at timestamptz,
  verify_closed_at timestamptz,
  verify_notes text,

  -- Stage tracking
  current_stage loop_stage not null default 'sense',
  stage_entered_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists issues_stage_idx on issues(current_stage);
create index if not exists issues_severity_idx on issues(severity);
create index if not exists issues_created_at_idx on issues(created_at desc);

-- ─────────────────────────────────────────────────────────────
-- stage_history — audit log of every advance / rollback
-- ─────────────────────────────────────────────────────────────
create table if not exists stage_history (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  from_stage loop_stage,
  to_stage loop_stage not null,
  signed_off_by text,
  rationale text,
  occurred_at timestamptz not null default now()
);

create index if not exists stage_history_issue_idx on stage_history(issue_id, occurred_at desc);

-- ─────────────────────────────────────────────────────────────
-- Auto-update updated_at on issues
-- ─────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_issues_updated on issues;
create trigger trg_issues_updated before update on issues
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Auto-generate issue_code on insert (CL-YYYY-NNNN)
-- ─────────────────────────────────────────────────────────────
create sequence if not exists issue_code_seq start 1;

create or replace function assign_issue_code()
returns trigger language plpgsql as $$
begin
  if new.issue_code is null or new.issue_code = '' then
    new.issue_code := 'CL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('issue_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_issues_code on issues;
create trigger trg_issues_code before insert on issues
  for each row execute function assign_issue_code();

-- ─────────────────────────────────────────────────────────────
-- Stage history trigger — log every change of current_stage
-- ─────────────────────────────────────────────────────────────
create or replace function log_stage_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into stage_history(issue_id, from_stage, to_stage, signed_off_by, rationale)
    values (new.id, null, new.current_stage, 'system', 'issue created');
  elsif (tg_op = 'UPDATE' and old.current_stage is distinct from new.current_stage) then
    insert into stage_history(issue_id, from_stage, to_stage, signed_off_by, rationale)
    values (new.id, old.current_stage, new.current_stage, coalesce(current_setting('app.signed_off_by', true), 'unknown'), null);
    new.stage_entered_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_issues_stage_log on issues;
create trigger trg_issues_stage_log before insert or update on issues
  for each row execute function log_stage_change();

-- ─────────────────────────────────────────────────────────────
-- Public read/write policies (lock down later if needed)
-- ─────────────────────────────────────────────────────────────
alter table issues enable row level security;
alter table stage_history enable row level security;

drop policy if exists "issues_all" on issues;
create policy "issues_all" on issues for all using (true) with check (true);

drop policy if exists "stage_history_all" on stage_history;
create policy "stage_history_all" on stage_history for all using (true) with check (true);
