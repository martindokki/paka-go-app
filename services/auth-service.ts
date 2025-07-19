import { supabase, User } from './supabase';

export class AuthService {
  static async signUp(email: string, password: string, fullName: string, phoneNumber?: string, role: 'customer' | 'driver' = 'customer') {
    try {
      console.log('Starting signup process for:', email);
      
      // Create a fallback profile that we'll use regardless of database issues
      const fallbackProfile = {
        id: '', // Will be set after auth user creation
        full_name: fullName,
        email: email,
        phone_number: phoneNumber || '',
        role: role,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // First, sign up the user with Supabase Auth with minimal metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('Auth user created successfully:', authData.user.id);
      
      // Update fallback profile with actual user ID
      fallbackProfile.id = authData.user.id;

      // Try to create profile in database with a delay to avoid trigger conflicts
      setTimeout(async () => {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              full_name: fullName,
              email: email,
              phone_number: phoneNumber || '',
              role: role,
              status: 'active'
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.warn('Profile upsert failed:', profileError);
          } else {
            console.log('User profile created/updated successfully in database');
          }
        } catch (dbError) {
          console.warn('Database profile creation failed:', dbError);
        }
      }, 1000);

      // Always return success immediately with fallback profile
      console.log('Using fallback profile for user:', authData.user.id);
      return { user: authData.user, profile: fallbackProfile, error: null };
      
    } catch (error: any) {
      console.error('SignUp error:', error);
      return { user: null, profile: null, error };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return { user: null, profile: null, error: null };

      // Get user profile from public.users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create a fallback from auth user metadata
      if (profileError || !profile) {
        console.warn('Profile not found in database, creating fallback:', profileError);
        
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone_number: user.user_metadata?.phone_number || '',
          role: (user.user_metadata?.role as 'customer' | 'driver' | 'admin') || 'customer',
          status: 'active' as const,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        };

        // Try to create the profile in the database
        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .upsert(fallbackProfile, { onConflict: 'id' })
            .select()
            .single();

          if (createdProfile && !createError) {
            return { user, profile: createdProfile, error: null };
          }
        } catch (createError) {
          console.warn('Failed to create profile in database:', createError);
        }

        // Return fallback profile if database creation fails
        return { user, profile: fallbackProfile, error: null };
      }

      return { user, profile, error: null };
    } catch (error) {
      return { user: null, profile: null, error };
    }
  }

  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}