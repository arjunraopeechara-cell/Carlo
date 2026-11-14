-- Run once in the Supabase SQL editor. One row per car a person has saved.
create table public.shortlist (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  car_id text not null check (length(car_id) < 120),
  created_at timestamptz not null default now(),
  primary key (user_id, car_id)
);

alter table public.shortlist enable row level security;
grant select, insert, delete on public.shortlist to authenticated;

-- People can only see, add and remove their own rows.
create policy "read own" on public.shortlist for select to authenticated using ((select auth.uid()) = user_id);
create policy "add own" on public.shortlist for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "remove own" on public.shortlist for delete to authenticated using ((select auth.uid()) = user_id);
