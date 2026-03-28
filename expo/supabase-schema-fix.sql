-- Fix for Supabase Database Schema
-- Run this in your Supabase SQL Editor to fix the signup issues

-- Drop the existing trigger that's causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Make the users table more flexible
ALTER TABLE public.users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Update the users table to handle missing data better
ALTER TABLE public.users ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.users ALTER COLUMN phone_number SET DEFAULT '';

-- Create a simpler trigger function that doesn't fail on missing data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone_number, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.email, ''), ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    email = COALESCE(EXCLUDED.email, users.email),
    phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger with error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policy to be more permissive for user creation
DROP POLICY IF EXISTS "Anyone can insert users (for registration)" ON public.users;
CREATE POLICY "Anyone can insert users (for registration)" ON public.users
  FOR INSERT WITH CHECK (true);

-- Add a policy for upserts during registration
CREATE POLICY "Users can upsert their own profile during registration" ON public.users
  FOR UPDATE USING (auth.uid() = id OR id IS NULL);

-- Create an index to improve performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);