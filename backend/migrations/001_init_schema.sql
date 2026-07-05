-- Captures the schema currently live in Supabase (introspected via the
-- PostgREST root spec), so it can be recreated if the project is ever
-- rebuilt or moved to a fresh Supabase instance.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_number integer not null,
  members integer not null,
  aadhaar_number text not null,
  aadhaar_image text,
  check_in timestamptz not null,
  check_out timestamptz,
  cost numeric not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  guest_name text not null default 'Guest',
  phone_number text,
  status text not null default 'active'
);

-- Speeds up overlap checks in bookingController.createBooking, which
-- filters by room_number and status on every new booking.
create index if not exists bookings_room_number_status_idx
  on public.bookings (room_number, status);

-- Speeds up the daily/weekly/monthly/trends revenue queries, which all
-- filter by created_at.
create index if not exists bookings_created_at_idx
  on public.bookings (created_at);

-- Storage: Aadhaar card photos are kept in the "aadhaar-images" bucket.
-- This bucket must stay PRIVATE. The backend uploads with the service-role
-- key and serves images via short-lived signed URLs (see
-- resolveAadhaarImage in bookingController.js) rather than public URLs.
-- To recreate: Supabase Dashboard > Storage > New bucket > "aadhaar-images"
-- with Public bucket = OFF.
