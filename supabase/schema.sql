create table if not exists public.novels (
  id text primary key,
  title text not null,
  slug text not null unique,
  user_id uuid references auth.users(id) default null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scenes (
  id text primary key,
  novel_id text not null references public.novels(id) on delete cascade,
  title text not null,
  order_index integer not null check (order_index >= 0),
  metadata_json jsonb not null default '{}'::jsonb,
  unique (novel_id, order_index)
);

create table if not exists public.beats (
  id text primary key,
  scene_id text not null references public.scenes(id) on delete cascade,
  order_index integer not null check (order_index >= 0),
  text text not null,
  speaker text not null,
  resonance_weights_json jsonb not null default '{}'::jsonb,
  hyper_prompts_json jsonb not null default '{}'::jsonb,
  choices_json jsonb not null default '[]'::jsonb,
  unique (scene_id, order_index)
);

create index if not exists scenes_novel_id_order_idx on public.scenes (novel_id, order_index);
create index if not exists beats_scene_id_order_idx on public.beats (scene_id, order_index);

create or replace function public.save_story_archive(
  p_novel jsonb,
  p_scenes jsonb,
  p_beats jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_novel_id text := p_novel->>'id';
begin
  insert into public.novels (id, title, slug, user_id, created_at)
  values (
    v_novel_id,
    p_novel->>'title',
    p_novel->>'slug',
    auth.uid(),
    coalesce((p_novel->>'created_at')::timestamptz, timezone('utc', now()))
  )
  on conflict (id) do update
    set title = excluded.title,
        slug = excluded.slug,
        user_id = coalesce(public.novels.user_id, excluded.user_id);

  delete from public.scenes
  where novel_id = v_novel_id;

  insert into public.scenes (id, novel_id, title, order_index, metadata_json)
  select id, novel_id, title, order_index, coalesce(metadata_json, '{}'::jsonb)
  from jsonb_to_recordset(coalesce(p_scenes, '[]'::jsonb)) as scene(
    id text,
    novel_id text,
    title text,
    order_index integer,
    metadata_json jsonb
  );

  insert into public.beats (
    id,
    scene_id,
    order_index,
    text,
    speaker,
    resonance_weights_json,
    hyper_prompts_json,
    choices_json
  )
  select
    id,
    scene_id,
    order_index,
    text,
    speaker,
    resonance_weights_json,
    hyper_prompts_json,
    coalesce(choices_json, '[]'::jsonb)
  from jsonb_to_recordset(coalesce(p_beats, '[]'::jsonb)) as beat(
    id text,
    scene_id text,
    order_index integer,
    text text,
    speaker text,
    resonance_weights_json jsonb,
    hyper_prompts_json jsonb,
    choices_json jsonb
  );
end;
$$;

revoke all on function public.save_story_archive(jsonb, jsonb, jsonb) from public;
grant execute on function public.save_story_archive(jsonb, jsonb, jsonb) to authenticated;

alter table public.novels enable row level security;
alter table public.scenes enable row level security;
alter table public.beats enable row level security;

drop policy if exists "public read novels" on public.novels;
create policy "public read novels"
on public.novels
for select
to anon, authenticated
using (true);

drop policy if exists "public write novels" on public.novels;
create policy "public write novels"
on public.novels
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public read scenes" on public.scenes;
create policy "public read scenes"
on public.scenes
for select
to anon, authenticated
using (true);

drop policy if exists "public write scenes" on public.scenes;
create policy "public write scenes"
on public.scenes
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public read beats" on public.beats;
create policy "public read beats"
on public.beats
for select
to anon, authenticated
using (true);

drop policy if exists "public write beats" on public.beats;
create policy "public write beats"
on public.beats
for all
to anon, authenticated
using (true)
with check (true);
