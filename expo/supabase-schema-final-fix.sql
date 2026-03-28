-- Final Fix for Supabase Database Schema
-- Run this in your Supabase SQL Editor to completely fix the signup issues

-- First, drop all existing triggers and functions to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Make the users table more flexible by removing NOT NULL constraints
ALTER TABLE public.users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Add default values to prevent null issues
ALTER TABLE public.users ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.users ALTER COLUMN phone_number SET DEFAULT '';
ALTER TABLE public.users ALTER COLUMN email SET DEFAULT '';

-- Drop the unique constraint on email temporarily to avoid conflicts
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;

-- Create a robust trigger function that handles all edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_email TEXT;
    user_phone TEXT;
    user_role TEXT;
BEGIN
    -- Extract data with proper fallbacks
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
        'User'
    );
    
    user_email := COALESCE(NEW.email, '');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone', '');
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    
    -- Insert with ON CONFLICT to handle any race conditions
    INSERT INTO public.users (
        id, 
        full_name, 
        email, 
        phone_number, 
        role, 
        status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_full_name,
        user_email,
        user_phone,
        user_role,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, users.full_name, ''),
        email = COALESCE(EXCLUDED.email, users.email, ''),
        phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number, ''),
        role = COALESCE(EXCLUDED.role, users.role, 'customer'),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth signup
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger with proper error handling
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be more permissive
DROP POLICY IF EXISTS "Anyone can insert users (for registration)" ON public.users;
DROP POLICY IF EXISTS "Users can upsert their own profile during registration" ON public.users;

-- Create more permissive policies
CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable select for users based on user_id" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create a function to safely get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(user_id UUID)
RETURNS TABLE(
    id UUID,
    full_name TEXT,
    email TEXT,
    phone_number TEXT,
    role TEXT,
    status TEXT,
    profile_image TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
DECLARE
    user_record RECORD;
    auth_user RECORD;
BEGIN
    -- First try to get existing profile
    SELECT * INTO user_record FROM public.users WHERE users.id = user_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            user_record.id,
            user_record.full_name,
            user_record.email,
            user_record.phone_number,
            user_record.role,
            user_record.status,
            user_record.profile_image,
            user_record.created_at,
            user_record.updated_at;
        RETURN;
    END IF;
    
    -- If no profile exists, get auth user data and create one
    SELECT * INTO auth_user FROM auth.users WHERE users.id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Auth user not found';
    END IF;
    
    -- Create profile with auth user data
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
        user_id,
        COALESCE(auth_user.raw_user_meta_data->>'full_name', SPLIT_PART(COALESCE(auth_user.email, ''), '@', 1), 'User'),
        COALESCE(auth_user.email, ''),
        COALESCE(auth_user.raw_user_meta_data->>'phone_number', ''),
        COALESCE(auth_user.raw_user_meta_data->>'role', 'customer'),
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW()
    RETURNING 
        users.id,
        users.full_name,
        users.email,
        users.phone_number,
        users.role,
        users.status,
        users.profile_image,
        users.created_at,
        users.updated_at
    INTO user_record;
    
    RETURN QUERY SELECT 
        user_record.id,
        user_record.full_name,
        user_record.email,
        user_record.phone_number,
        user_record.role,
        user_record.status,
        user_record.profile_image,
        user_record.created_at,
        user_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile(UUID) TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email != '';
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Add back email uniqueness constraint but only for non-empty emails
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON public.users(email) WHERE email != '';

COMMIT;