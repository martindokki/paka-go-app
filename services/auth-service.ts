import { supabase, User } from './supabase';

export class AuthService {
  static async signUp(email: string, password: string, fullName: string, phoneNumber?: string, role: 'customer' | 'driver' = 'customer') {
    try {
      console.log('Starting signup process for:', { email, fullName, role });
      
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('Email, password, and full name are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phoneNumber?.trim() || '',
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
      
      // Wait for the database trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try multiple approaches to get/create the profile
      let profile = null;
      let profileError = null;

      // Approach 1: Use our safe RPC function
      try {
        console.log('Attempting to get profile via RPC function...');
        const { data: profileData, error: rpcError } = await supabase
          .rpc('get_or_create_user_profile', { user_id: authData.user.id });

        if (!rpcError && profileData && profileData.length > 0) {
          profile = profileData[0];
          console.log('Profile retrieved via RPC:', profile);
        } else {
          console.warn('RPC function failed or returned no data:', rpcError);
        }
      } catch (rpcError) {
        console.warn('RPC function exception:', rpcError);
      }

      // Approach 2: Direct database query if RPC failed
      if (!profile) {
        try {
          console.log('Attempting direct database query...');
          const { data: directProfile, error: directError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (!directError && directProfile) {
            profile = directProfile;
            console.log('Profile retrieved via direct query:', profile);
          } else {
            console.warn('Direct query failed:', directError);
          }
        } catch (directError) {
          console.warn('Direct query exception:', directError);
        }
      }

      // Approach 3: Manual profile creation if still no profile
      if (!profile) {
        try {
          console.log('Attempting manual profile creation...');
          const profileData = {
            id: authData.user.id,
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone_number: phoneNumber?.trim() || '',
            role: role,
            status: 'active' as const
          };

          const { data: manualProfile, error: manualError } = await supabase
            .from('users')
            .upsert(profileData, { onConflict: 'id' })
            .select()
            .single();

          if (!manualError && manualProfile) {
            profile = manualProfile;
            console.log('Profile created manually:', profile);
          } else {
            console.warn('Manual profile creation failed:', manualError);
            profileError = manualError;
          }
        } catch (manualError) {
          console.warn('Manual profile creation exception:', manualError);
          profileError = manualError;
        }
      }

      // Approach 4: Create fallback profile if all else fails
      if (!profile) {
        console.log('Creating fallback profile...');
        profile = {
          id: authData.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phoneNumber?.trim() || '',
          role: role,
          status: 'active' as const,
          profile_image: null,
          created_at: authData.user.created_at,
          updated_at: authData.user.created_at
        };
        console.log('Using fallback profile:', profile);
      }

      return { user: authData.user, profile, error: null };
      
    } catch (error: any) {
      console.error('SignUp error:', error);
      const errorMessage = error?.message || String(error);
      return { 
        user: null, 
        profile: null, 
        error: new Error(`Registration failed: ${errorMessage}`)
      };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from authentication');
      }

      console.log('Sign in successful for user:', data.user.id);
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
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
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session || !session.user) {
        console.log('No active session found');
        return { user: null, profile: null, error: null };
      }

      const user = session.user;
      console.log('Getting profile for user:', user.id);

      // Try multiple approaches to get the profile
      let profile = null;

      // Approach 1: Use our safe RPC function
      try {
        const { data: profileData, error: rpcError } = await supabase
          .rpc('get_or_create_user_profile', { user_id: user.id });

        if (!rpcError && profileData && profileData.length > 0) {
          profile = profileData[0];
          console.log('Profile retrieved via RPC:', profile);
        } else {
          console.warn('RPC function failed:', rpcError);
        }
      } catch (rpcError) {
        console.warn('RPC function exception:', rpcError);
      }

      // Approach 2: Direct database query if RPC failed
      if (!profile) {
        try {
          const { data: directProfile, error: directError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!directError && directProfile) {
            profile = directProfile;
            console.log('Profile retrieved via direct query:', profile);
          } else {
            console.warn('Direct query failed:', directError);
          }
        } catch (directError) {
          console.warn('Direct query exception:', directError);
        }
      }

      // Approach 3: Create profile from auth metadata if still no profile
      if (!profile) {
        console.log('Creating profile from auth metadata...');
        
        const profileData = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone_number: user.user_metadata?.phone_number || '',
          role: (user.user_metadata?.role || 'customer') as 'customer' | 'driver' | 'admin',
          status: 'active' as const
        };

        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .upsert(profileData, { onConflict: 'id' })
            .select()
            .single();

          if (!createError && createdProfile) {
            profile = createdProfile;
            console.log('Profile created from metadata:', profile);
          } else {
            console.warn('Failed to create profile from metadata:', createError);
          }
        } catch (createError) {
          console.warn('Profile creation exception:', createError);
        }
      }

      // Approach 4: Use fallback profile if all else fails
      if (!profile) {
        console.log('Using fallback profile...');
        profile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone_number: user.user_metadata?.phone_number || '',
          role: (user.user_metadata?.role || 'customer') as 'customer' | 'driver' | 'admin',
          status: 'active' as const,
          profile_image: null,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        };
      }

      return { user, profile, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, profile: null, error };
    }
  }

  static async updateProfile(userId: string, updates: { full_name?: string; email?: string; phone_number?: string }) {
    try {
      console.log('Updating profile for user:', userId, 'with updates:', updates);
      
      // Update the users table
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.full_name,
          email: updates.email,
          phone_number: updates.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { data: null, error };
    }
  }

  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        throw error;
      }

      return { session: data.session, error: null };
    } catch (error) {
      console.error('Session refresh exception:', error);
      return { session: null, error };
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}