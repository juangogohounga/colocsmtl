-- ColocsMTL database schema for Supabase.
-- Tables mirror the entity schemas in src/entities/*.json.
-- Every table keeps the same built-in columns the app code already uses:
-- id, created_date, updated_date, created_by.

create extension if not exists pgcrypto;

-- Helper: email of the signed-in user (null when signed out).
create or replace function public.current_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- Keep updated_date current on every update.
create or replace function public.touch_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete cascade,

  user_email text not null unique,
  full_name text not null,
  age double precision,
  gender text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  phone text,
  bio text,
  profile_image_url text,
  occupation text check (occupation in ('student', 'professional', 'freelancer', 'entrepreneur', 'other')),
  budget_min double precision,
  budget_max double precision,
  preferred_neighborhoods text[] not null default '{}',
  move_in_date date,
  sleep_schedule text check (sleep_schedule in ('early_bird', 'night_owl', 'flexible')),
  cleanliness_level double precision check (cleanliness_level between 1 and 5),
  noise_tolerance double precision check (noise_tolerance between 1 and 5),
  social_level text check (social_level in ('introvert', 'ambivert', 'extrovert')),
  guests_frequency text check (guests_frequency in ('never', 'rarely', 'sometimes', 'often')),
  smoking boolean,
  pets boolean,
  pet_types text[] not null default '{}',
  diet_preferences text[] not null default '{}',
  languages text[] not null default '{}',
  interests text[] not null default '{}',
  vibe_tags text[] not null default '{}',
  work_from_home boolean,
  looking_for text check (looking_for in ('room', 'roommate', 'both')),
  is_premium boolean not null default false,
  is_verified boolean not null default false,
  compatibility_preferences jsonb
);

create trigger user_profiles_touch before update on public.user_profiles
  for each row execute function public.touch_updated_date();

alter table public.user_profiles enable row level security;

create policy "Signed-in users can read profiles" on public.user_profiles
  for select to authenticated using (true);
create policy "Users create their own profile" on public.user_profiles
  for insert to authenticated with check (lower(user_email) = public.current_email());
create policy "Users update their own profile" on public.user_profiles
  for update to authenticated
  using (lower(user_email) = public.current_email())
  with check (lower(user_email) = public.current_email());
create policy "Users delete their own profile" on public.user_profiles
  for delete to authenticated using (lower(user_email) = public.current_email());

-- Users can't mark themselves premium or verified.
create or replace function public.protect_profile_flags()
returns trigger
language plpgsql
as $$
begin
  -- Requests from the app run as the "authenticated" role; the dashboard and
  -- service role keep full control over these flags.
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_premium = false;
      new.is_verified = false;
    else
      new.is_premium = old.is_premium;
      new.is_verified = old.is_verified;
    end if;
  end if;
  return new;
end;
$$;

create trigger user_profiles_protect_flags before insert or update on public.user_profiles
  for each row execute function public.protect_profile_flags();

-- ---------------------------------------------------------------------------
-- room_listings
-- ---------------------------------------------------------------------------
create table public.room_listings (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete cascade,

  title text not null,
  description text,
  owner_email text not null,
  listing_type text not null check (listing_type in ('private_room', 'shared_room', 'entire_apartment')),
  rent_amount double precision not null,
  utilities_included boolean,
  deposit_required double precision,
  neighborhood text not null check (neighborhood in (
    'le_plateau', 'rosemont', 'ndg', 'mile_end', 'verdun', 'hochelaga',
    'villeray', 'downtown', 'outremont', 'griffintown', 'other')),
  address text,
  available_from date not null,
  lease_duration text check (lease_duration in ('1_month', '3_months', '6_months', '12_months', 'flexible')),
  bedrooms double precision,
  bathrooms double precision,
  square_feet double precision,
  furnished boolean,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  rules text[] not null default '{}',
  current_roommates jsonb not null default '[]',
  status text not null default 'available' check (status in ('available', 'pending', 'rented')),
  views_count double precision not null default 0,
  is_featured boolean not null default false
);

create index room_listings_status_idx on public.room_listings (status);

create trigger room_listings_touch before update on public.room_listings
  for each row execute function public.touch_updated_date();

alter table public.room_listings enable row level security;

create policy "Anyone can read listings" on public.room_listings
  for select to anon, authenticated using (true);
create policy "Users create their own listings" on public.room_listings
  for insert to authenticated with check (lower(owner_email) = public.current_email());
create policy "Owners update their listings" on public.room_listings
  for update to authenticated
  using (lower(owner_email) = public.current_email())
  with check (lower(owner_email) = public.current_email());
create policy "Owners delete their listings" on public.room_listings
  for delete to authenticated using (lower(owner_email) = public.current_email());

-- ---------------------------------------------------------------------------
-- matches
-- ---------------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete cascade,

  user1_email text not null,
  user2_email text not null,
  compatibility_score double precision not null check (compatibility_score between 0 and 100),
  compatibility_breakdown jsonb,
  match_status text not null default 'suggested' check (match_status in (
    'suggested', 'liked_by_user1', 'liked_by_user2', 'mutual', 'passed')),
  last_message_date timestamptz,
  is_archived boolean not null default false
);

create index matches_user1_idx on public.matches (user1_email);
create index matches_user2_idx on public.matches (user2_email);

create trigger matches_touch before update on public.matches
  for each row execute function public.touch_updated_date();

alter table public.matches enable row level security;

create policy "Users read their own matches" on public.matches
  for select to authenticated
  using (public.current_email() in (lower(user1_email), lower(user2_email)));
create policy "Users create matches they start" on public.matches
  for insert to authenticated with check (lower(user1_email) = public.current_email());
create policy "Either user can update a match" on public.matches
  for update to authenticated
  using (public.current_email() in (lower(user1_email), lower(user2_email)))
  with check (public.current_email() in (lower(user1_email), lower(user2_email)));

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete cascade,

  match_id uuid not null references public.matches (id) on delete cascade,
  sender_email text not null,
  receiver_email text not null,
  message_text text not null,
  is_read boolean not null default false,
  sent_at timestamptz default now()
);

create index messages_match_idx on public.messages (match_id, created_date);

create trigger messages_touch before update on public.messages
  for each row execute function public.touch_updated_date();

alter table public.messages enable row level security;

create policy "Users read their own messages" on public.messages
  for select to authenticated
  using (public.current_email() in (lower(sender_email), lower(receiver_email)));
create policy "Users send messages in their mutual matches" on public.messages
  for insert to authenticated
  with check (
    lower(sender_email) = public.current_email()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.match_status = 'mutual'
        and lower(receiver_email) in (lower(m.user1_email), lower(m.user2_email))
        and public.current_email() in (lower(m.user1_email), lower(m.user2_email))
    )
  );
create policy "Receivers mark messages as read" on public.messages
  for update to authenticated
  using (lower(receiver_email) = public.current_email())
  with check (lower(receiver_email) = public.current_email());

-- ---------------------------------------------------------------------------
-- Compatibility score cache (written only by the `compatibility` Edge Function)
-- ---------------------------------------------------------------------------
create table public.compatibility_cache (
  user_a text not null,
  user_b text not null,
  profiles_hash text not null,
  score double precision not null,
  breakdown jsonb,
  created_date timestamptz not null default now(),
  primary key (user_a, user_b)
);

alter table public.compatibility_cache enable row level security;
-- No policies: only the service role (used by the Edge Function) can access it.

-- ---------------------------------------------------------------------------
-- Public stats for the home page (counts only, safe for signed-out visitors)
-- ---------------------------------------------------------------------------
create or replace function public.public_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'users', (select count(*) from public.user_profiles),
    'listings', (select count(*) from public.room_listings),
    'matches', (select count(*) from public.matches where match_status = 'mutual')
  )
$$;

grant execute on function public.public_stats() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for profile and listing photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Anyone can view images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'images');
create policy "Users upload images to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete their own images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
