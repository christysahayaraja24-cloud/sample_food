-- A COOKED AGAIN - Supabase schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin','user');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.assign_profile_role()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare has_admin boolean;
begin
  perform pg_advisory_xact_lock(78123456);
  select exists(select 1 from public.profiles where role='admin') into has_admin;
  if not has_admin then new.role := 'admin'; end if;
  return new;
end; $$;

drop trigger if exists trg_assign_profile_role on public.profiles;
create trigger trg_assign_profile_role before insert on public.profiles
for each row execute function public.assign_profile_role();

create table if not exists public.menu_categories (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  note text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.menu_categories(id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  image_url text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists idx_menu_items_category_order on public.menu_items(category_id, sort_order);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null default '',
  caption text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists idx_gallery_items_order on public.gallery_items(sort_order);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  reservation_date date not null,
  reservation_time time not null,
  guests_count integer not null check (guests_count between 1 and 20),
  seating text not null,
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now()
);
create index if not exists idx_reservations_date_time on public.reservations(reservation_date,reservation_time);
create index if not exists idx_reservations_user on public.reservations(user_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  table_number text not null,
  customer_name text not null,
  phone text not null,
  notes text not null default '',
  total_amount integer not null check (total_amount >= 0),
  status text not null default 'received' check (status in ('received','preparing','served','cancelled')),
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 30),
  notes text not null default ''
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.gallery_items enable row level security;
alter table public.reservations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.feedback enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid());

drop policy if exists menu_categories_public_read on public.menu_categories;
create policy menu_categories_public_read on public.menu_categories for select using (true);
drop policy if exists menu_categories_admin_write on public.menu_categories;
create policy menu_categories_admin_write on public.menu_categories for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists menu_items_public_read on public.menu_items;
create policy menu_items_public_read on public.menu_items for select using (true);
drop policy if exists menu_items_admin_write on public.menu_items;
create policy menu_items_admin_write on public.menu_items for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists gallery_public_read on public.gallery_items;
create policy gallery_public_read on public.gallery_items for select using (true);
drop policy if exists gallery_admin_write on public.gallery_items;
create policy gallery_admin_write on public.gallery_items for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- Guests may create reservations/orders/feedback; only the owner or admin may read them.
drop policy if exists reservations_insert_public on public.reservations;
create policy reservations_insert_public on public.reservations for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists reservations_select_owner_admin on public.reservations;
create policy reservations_select_owner_admin on public.reservations for select using (user_id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists reservations_update_admin on public.reservations;
create policy reservations_update_admin on public.reservations for update using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists orders_insert_public on public.orders;
create policy orders_insert_public on public.orders for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists orders_select_owner_admin on public.orders;
create policy orders_select_owner_admin on public.orders for select using (user_id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders for update using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists order_items_insert_public on public.order_items;
create policy order_items_insert_public on public.order_items for insert with check (exists(select 1 from public.orders o where o.id=order_id and (o.user_id is null or o.user_id=auth.uid())));
drop policy if exists order_items_select_owner_admin on public.order_items;
create policy order_items_select_owner_admin on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'))));

 drop policy if exists feedback_insert_public on public.feedback;
create policy feedback_insert_public on public.feedback for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists feedback_select_admin on public.feedback;
create policy feedback_select_admin on public.feedback for select using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare nm text;
begin
  nm := trim(coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(coalesce(new.email,''),'@',1)));
  if char_length(nm) < 2 then nm := 'Guest'; end if;
  insert into public.profiles(id, full_name) values(new.id, nm) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Backfill profiles for any auth users created before the trigger existed.
insert into public.profiles(id, full_name)
select u.id, case when char_length(trim(coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,''),'@',1)))) >= 2
                  then trim(coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,''),'@',1))) else 'Guest' end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
order by u.created_at;

-- Seed the original menu structure. Existing image URLs can be replaced in the admin panel.
insert into public.menu_categories(id,title,subtitle,note,sort_order) values
('breakfast','Breakfast Specials','Dawn delights, steamed, crisp & golden','Served fresh every morning from 06:00 AM',0),
('lunch','Lunch Combos','Hearty plates that heal the day''s damage','Generous meals, served with love',1),
('dinner','Dinner Delights','Evening feasts worth staying up for','Served until 10:00 PM',2),
('desserts','Desserts & Beverages','Sweet endings & sips of joy','Life is short — dessert first',3)
on conflict (id) do nothing;

insert into public.menu_items(category_id,name,price,sort_order) values
('breakfast','Idli with Sambar & Chutney',40,0),('breakfast','Medu Vada',12,1),('breakfast','Idiyappam with Coconut Milk',30,2),('breakfast','Upma',35,3),('breakfast','Poori Masala',45,4),('breakfast','Dosa',55,5),('breakfast','Poori Masala (Royal Portion)',55,6),('breakfast','Masala Dosa',80,7),
('lunch','Curd Rice',50,0),('lunch','South Indian Veg-Meals',90,1),('lunch','North Indian Veg-Meals',90,2),('lunch','Non-veg Meals',150,3),('lunch','Fish Meals (2 pcs of fish)',150,4),('lunch','Chicken Biriyani & Chicken 65',180,5),('lunch','Mutton Biriyani & Mutton gravy',300,6),
('dinner','Chapati (3pcs) with Vegetable Curry',40,0),('dinner','Idli with Sambar & Chutney',40,1),('dinner','Ghee Roast',90,2),('dinner','Veg Fried Rice',90,3),('dinner','Veg Noodles',90,4),('dinner','Parotta with Beef Curry',110,5),('dinner','Combo (Chicken 65, Mutton Soup, Half-Boil Egg)',120,6),('dinner','Chicken Noodles',120,7),('dinner','Chicken Fried Rice',120,8),
('desserts','Tea',15,0),('desserts','Coffee',25,1),('desserts','Lemon Juice',20,2),('desserts','Rose Milk',35,3),('desserts','Badam Milk',35,4),('desserts','Oreo Milkshake',55,5),('desserts','Falooda',80,6),('desserts','Sweet Bun',20,7),('desserts','Carrot Halwa',35,8),('desserts','Chocolate Cake',35,9),('desserts','Black Forest Cake',60,10),('desserts','White Forest Cake',60,11),('desserts','Red Velvet Cake',80,12)
on conflict do nothing;

-- Explicit Data API grants. RLS remains the authorization boundary.
grant usage on schema public to anon, authenticated;
grant select on public.menu_categories, public.menu_items, public.gallery_items to anon, authenticated;
grant insert on public.reservations, public.orders, public.order_items, public.feedback to anon, authenticated;
grant select on public.profiles, public.reservations, public.orders, public.order_items, public.feedback to authenticated;
grant update on public.reservations, public.orders to authenticated;
grant insert, update, delete on public.menu_categories, public.menu_items, public.gallery_items to authenticated;

-- Keep trigger-only functions inaccessible to ordinary clients.
revoke all on function public.assign_profile_role() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
