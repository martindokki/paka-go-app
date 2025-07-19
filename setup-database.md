# Database Setup Instructions

## Setting up Supabase Database

To fix the "Database error saving new user" issue, you need to set up the proper database schema in your Supabase project.

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to your project: https://supabase.com/dashboard/project/yrokteacdihxfcrpgotz
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Schema Setup

1. Copy the entire content from `supabase-schema.sql` file
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

This will create:
- All required tables (users, parcels, deliveries, payments, etc.)
- Row Level Security (RLS) policies
- Database triggers for automatic user profile creation
- Proper indexes for performance

### Step 2.1: Apply the Fix (IMPORTANT)

If you're still getting "Database error saving new user" errors after Step 2:

1. Copy the entire content from `supabase-schema-fix.sql` file
2. Paste it into the SQL Editor
3. Click "Run" to execute the fix script

This fix will:
- Remove the problematic trigger that causes signup failures
- Create a more robust trigger with error handling
- Make the users table more flexible
- Add better RLS policies for user registration

### Step 3: Verify Setup

After running the script, you should see these tables in your database:
- `public.users`
- `public.parcels`
- `public.deliveries`
- `public.payments`
- `public.locations`
- `public.chats`
- `public.notifications`
- `public.vehicles`
- `public.support_tickets`
- `public.feedback`

### Step 4: Test the App

1. Try registering a new user in the app
2. The registration should now work without the "Database error saving new user" error
3. User profiles will be automatically created when users sign up

## What This Fixes

- **Database error saving new user**: Creates the proper `users` table with correct schema
- **RLS Policies**: Ensures users can only access their own data
- **Automatic Profile Creation**: Database trigger creates user profiles automatically
- **Data Relationships**: Proper foreign key relationships between tables
- **Performance**: Indexes for faster queries

## Troubleshooting

If you still get errors after running the schema:

1. **Check RLS Policies**: Make sure Row Level Security is properly configured
2. **Verify Triggers**: Ensure the `handle_new_user()` function and trigger are created
3. **Check Permissions**: Verify that the anon role has proper permissions
4. **Clear Cache**: Try clearing your app cache and restarting

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Drivers can only see parcels assigned to them
- Admin functions require proper role-based access