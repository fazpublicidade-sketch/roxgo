-- ROXGO: várias provas por atleta + histórico de treinos gravados
-- Rodar uma vez no Supabase: Dashboard → SQL Editor → colar e executar.

-- Provas ----------------------------------------------------------------
create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  race_date date not null,
  city text,
  category text,
  created_at timestamptz not null default now()
);

create index if not exists races_athlete_date_idx on public.races (athlete_id, race_date);

alter table public.races enable row level security;

drop policy if exists "races_select_own" on public.races;
drop policy if exists "races_insert_own" on public.races;
drop policy if exists "races_update_own" on public.races;
drop policy if exists "races_delete_own" on public.races;

create policy "races_select_own" on public.races for select using (athlete_id = auth.uid());
create policy "races_insert_own" on public.races for insert with check (athlete_id = auth.uid());
create policy "races_update_own" on public.races for update using (athlete_id = auth.uid());
create policy "races_delete_own" on public.races for delete using (athlete_id = auth.uid());

-- Traz a prova cadastrada no onboarding para a nova tabela
insert into public.races (athlete_id, name, race_date, category)
select a.id, a.next_race, a.race_date::date, a.category
from public.athletes a
where a.next_race is not null
  and a.race_date is not null
  and not exists (select 1 from public.races r where r.athlete_id = a.id);

-- Treinos gravados ------------------------------------------------------
-- type: 'simulado' (16 etapas) ou 'estacao' (teste isolado de uma estação)
-- splits: [{ "key": "ski_erg", "ms": 245000 }, ...]
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('simulado', 'estacao')),
  station text,
  total_ms integer not null check (total_ms > 0),
  splits jsonb not null default '[]'::jsonb,
  performed_at timestamptz not null default now()
);

create index if not exists workouts_athlete_date_idx on public.workouts (athlete_id, performed_at desc);

alter table public.workouts enable row level security;

drop policy if exists "workouts_select_own" on public.workouts;
drop policy if exists "workouts_insert_own" on public.workouts;
drop policy if exists "workouts_delete_own" on public.workouts;

create policy "workouts_select_own" on public.workouts for select using (athlete_id = auth.uid());
create policy "workouts_insert_own" on public.workouts for insert with check (athlete_id = auth.uid());
create policy "workouts_delete_own" on public.workouts for delete using (athlete_id = auth.uid());
