-- ============================================================
-- gastrowerke – Supabase Datenbank-Setup
-- Führe dieses SQL im Supabase Dashboard → SQL Editor aus
-- ============================================================

-- 1. PROFILES-TABELLE (erweiterte User-Daten)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone default now()
);

-- 2. ORDERS-TABELLE (Bestellungen)
create table if not exists orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  items jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  shipping_address jsonb,
  billing_address jsonb,
  payment_method text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- 3. ADDRESSES-TABELLE (gespeicherte Adressen)
create table if not exists addresses (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  label text default 'Heimadresse',
  firstname text,
  lastname text,
  street text,
  zip text,
  city text,
  country text default 'Deutschland',
  phone text,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- 4. WISHLIST-TABELLE (Wunschliste)
create table if not exists wishlists (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id integer not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) – PFLICHT für Sicherheit!
-- ============================================================

-- Profiles: Nur eigene Daten lesen/schreiben
alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Orders: Nur eigene Bestellungen
alter table orders enable row level security;

create policy "orders_select_own" on orders
  for select using (auth.uid() = user_id);

create policy "orders_insert_own" on orders
  for insert with check (auth.uid() = user_id);

-- Addresses: Nur eigene Adressen
alter table addresses enable row level security;

create policy "addresses_select_own" on addresses
  for select using (auth.uid() = user_id);

create policy "addresses_insert_own" on addresses
  for insert with check (auth.uid() = user_id);

create policy "addresses_update_own" on addresses
  for update using (auth.uid() = user_id);

create policy "addresses_delete_own" on addresses
  for delete using (auth.uid() = user_id);

-- Wishlists: Nur eigene Wunschliste
alter table wishlists enable row level security;

create policy "wishlists_select_own" on wishlists
  for select using (auth.uid() = user_id);

create policy "wishlists_insert_own" on wishlists
  for insert with check (auth.uid() = user_id);

create policy "wishlists_delete_own" on wishlists
  for delete using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Profil automatisch beim Registrieren anlegen
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MIGRATION: company-Spalte zu profiles hinzufügen
-- (Falls die Tabelle bereits existierte ohne diese Spalte)
-- ============================================================
alter table profiles add column if not exists company text;
