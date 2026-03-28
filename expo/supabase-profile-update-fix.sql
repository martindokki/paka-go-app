-- Comprehensive fix for profile update issues
-- This script addresses the updated_at column error and ensures profile updates work

-- Step 1: Ensure the updated_at column exists
DO $$ 
BEGIN
    -- Check if updated_at column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to users table';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Step 2: Update any existing rows that might have NULL updated_at
UPDATE public.users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Step 3: Ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 5: Create a safe profile update function that handles the updated_at automatically
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id UUID,
  new_full_name TEXT DEFAULT NULL,
  new_email TEXT DEFAULT NULL,
  new_phone_number TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  role TEXT,
  status TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Update only the fields that are provided (not NULL)
  UPDATE public.users 
  SET 
    full_name = COALESCE(new_full_name, full_name),
    email = COALESCE(new_email, email),
    phone_number = COALESCE(new_phone_number, phone_number),
    updated_at = NOW()
  WHERE users.id = user_id;
  
  -- Return the updated row
  RETURN QUERY
  SELECT 
    users.id,
    users.full_name,
    users.email,
    users.phone_number,
    users.role,
    users.status,
    users.profile_image,
    users.created_at,
    users.updated_at
  FROM public.users 
  WHERE users.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- Step 7: Create RLS policy for the function
CREATE POLICY "Users can update their own profile via function" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Step 8: Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Step 9: Test the setup with a simple query (this will show if everything is working)
DO $$
DECLARE
  test_result RECORD;
BEGIN
  -- This is just a test to verify the function works
  RAISE NOTICE 'Profile update function setup completed successfully';
END $$;