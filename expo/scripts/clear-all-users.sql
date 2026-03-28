-- Clear all users from the database
-- This will remove all user accounts and related data

-- First, delete from dependent tables
DELETE FROM payments;
DELETE FROM deliveries;
DELETE FROM parcels;

-- Then delete from users table
DELETE FROM users;

-- Clear auth.users table (this requires admin privileges)
-- Note: This should be run in Supabase SQL editor with admin access
DELETE FROM auth.users;

-- Reset any sequences if needed
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;