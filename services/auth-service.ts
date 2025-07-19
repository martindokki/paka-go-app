import { supabase, User } from './supabase';

export class AuthService {
  static async signUp(email: string, password: string, fullName: string, phoneNumber?: string, role: 'customer' | 'driver' = 'customer') {
    try {
      console.log('Starting signup process for:', email);
      
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber || '',
            role: role
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('Auth user created successfully:', authData.user.id);
      
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to get the profile using our safe function
      try {
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_or_create_user_profile', { user_id: authData.user.id });

        if (profileError) {
          console.warn('Profile function failed:', profileError);
        } else if (profileData && profileData.length > 0) {
          const profile = profileData[0];
          console.log('Profile retrieved/created successfully:', profile);
          return { user: authData.user, profile, error: null };
        }
      } catch (profileError) {
        console.warn('Profile retrieval failed:', profileError);
      }

      // Fallback: create profile manually if function fails
      try {
        const { data: manualProfile, error: manualError } = await supabase
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
          })
          .select()
          .single();

        if (manualProfile && !manualError) {
          console.log('Manual profile creation successful:', manualProfile);
          return { user: authData.user, profile: manualProfile, error: null };
        }
      } catch (manualError) {
        console.warn('Manual profile creation failed:', manualError);
      }

      // Final fallback: return with in-memory profile
      const fallbackProfile = {
        id: authData.user.id,
        full_name: fullName,
        email: email,
        phone_number: phoneNumber || '',
        role: role,
        status: 'active' as const,
        profile_image: null,
        created_at: authData.user.created_at,
        updated_at: authData.user.created_at
      };

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

      // Try to get profile using our safe function first
      try {
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_or_create_user_profile', { user_id: user.id });

        if (profileData && profileData.length > 0 && !profileError) {
          const profile = profileData[0];
          return { user, profile, error: null };
        }
      } catch (rpcError) {
        console.warn('RPC function failed, trying direct query:', rpcError);
      }

      // Fallback to direct query
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile exists, return it
      if (profile && !profileError) {
        return { user, profile, error: null };
      }

      // If profile doesn't exist, create a fallback from auth user metadata
      console.warn('Profile not found in database, creating fallback:', profileError);
      
      const fallbackProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone_number: user.user_metadata?.phone_number || '',
        role: (user.user_metadata?.role as 'customer' | 'driver' | 'admin') || 'customer',
        status: 'active' as const,
        profile_image: null,
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