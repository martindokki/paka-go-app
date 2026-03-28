-- Create Test Users for Development
-- Run this in your Supabase SQL Editor to create test accounts

-- Note: These users need to be created through Supabase Auth first
-- This script only creates the profile records
-- You must manually create the auth users in Supabase Dashboard or through signup

-- Test Client User
INSERT INTO public.users (
  id,
  full_name,
  email,
  phone_number,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Test Client',
  'client@test.com',
  '+254700000001',
  'customer',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Test Driver User
INSERT INTO public.users (
  id,
  full_name,
  email,
  phone_number,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Test Driver',
  'driver@test.com',
  '+254700000002',
  'driver',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Test Admin User
INSERT INTO public.users (
  id,
  full_name,
  email,
  phone_number,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Test Admin',
  'admin@test.com',
  '+254700000003',
  'admin',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Create a test vehicle for the driver
INSERT INTO public.vehicles (
  id,
  driver_id,
  plate_number,
  vehicle_type,
  brand,
  model,
  year,
  color,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'KCA 123A',
  'motorcycle',
  'Honda',
  'CB 150R',
  2023,
  'Red',
  'active',
  NOW()
) ON CONFLICT (plate_number) DO NOTHING;

COMMIT;