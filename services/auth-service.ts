import { supabase, User } from './supabase';

export class AuthService {
  static async signUp(email: string, password: string, fullName: string, phoneNumber?: string, role: 'customer' | 'driver' = 'customer') {
    try {
      console.log('🔐 AuthService.signUp - Starting signup process for:', { email, fullName, role });
      
      // Validate inputs
      if (!email || !password || !fullName) {
        console.error('❌ AuthService.signUp - Missing required fields');
        throw new Error('Email, password, and full name are required');
      }

      if (password.length < 6) {
        console.error('❌ AuthService.signUp - Password too short');
        throw new Error('Password must be at least 6 characters long');
      }

      // First, sign up the user with Supabase Auth
      console.log('📞 AuthService.signUp - Calling supabase.auth.signUp...');
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

      console.log('📞 AuthService.signUp - Supabase response:', { 
        hasData: !!authData, 
        hasUser: !!authData?.user, 
        userId: authData?.user?.id,
        hasError: !!authError,
        errorMessage: authError?.message,
        errorCode: (authError as any)?.code
      });

      if (authError) {
        console.error('❌ AuthService.signUp - Auth signup error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        console.error('❌ AuthService.signUp - No user returned from signup');
        throw new Error('No user returned from signup');
      }

      console.log('✅ AuthService.signUp - Auth user created successfully:', authData.user.id);
      
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
      console.log('🔐 AuthService.signIn - Attempting sign in for:', email);
      
      if (!email || !password) {
        console.error('❌ AuthService.signIn - Missing credentials');
        throw new Error('Email and password are required');
      }

      console.log('📞 AuthService.signIn - Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('📞 AuthService.signIn - Supabase response:', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        userId: data?.user?.id,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: (error as any)?.code
      });

      if (error) {
        console.error('❌ AuthService.signIn - Supabase auth error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('❌ AuthService.signIn - No user returned from authentication');
        throw new Error('No user returned from authentication');
      }

      console.log('✅ AuthService.signIn - Sign in successful for user:', data.user.id);
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('❌ AuthService.signIn - Sign in error:', error);
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
      console.log('👤 AuthService.getCurrentUser - Starting...');
      
      // Get the current session
      console.log('📞 AuthService.getCurrentUser - Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ AuthService.getCurrentUser - Session error:', sessionError);
        return { user: null, profile: null, error: sessionError };
      }

      if (!session || !session.user) {
        console.log('❌ AuthService.getCurrentUser - No active session');
        return { user: null, profile: null, error: new Error('No active session') };
      }

      const user = session.user;
      console.log('👤 AuthService.getCurrentUser - Getting profile for user:', user.id);

      // Try multiple approaches to get the profile
      let profile = null;

      // Approach 1: Use our safe RPC function
      try {
        console.log('📞 AuthService.getCurrentUser - Trying RPC function...');
        const { data: profileData, error: rpcError } = await supabase
          .rpc('get_or_create_user_profile', { user_id: user.id });

        console.log('📞 AuthService.getCurrentUser - RPC result:', { 
          hasData: !!profileData, 
          dataLength: profileData?.length,
          hasError: !!rpcError,
          errorMessage: rpcError?.message
        });

        if (!rpcError && profileData && profileData.length > 0) {
          profile = profileData[0];
          console.log('✅ AuthService.getCurrentUser - Profile retrieved via RPC:', profile);
        } else {
          console.warn('⚠️ AuthService.getCurrentUser - RPC function failed:', rpcError);
        }
      } catch (rpcError) {
        console.warn('⚠️ AuthService.getCurrentUser - RPC function exception:', rpcError);
      }

      // Approach 2: Direct database query if RPC failed
      if (!profile) {
        try {
          console.log('📞 AuthService.getCurrentUser - Trying direct query...');
          const { data: directProfile, error: directError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          console.log('📞 AuthService.getCurrentUser - Direct query result:', { 
            hasData: !!directProfile, 
            hasError: !!directError,
            errorMessage: directError?.message,
            errorCode: (directError as any)?.code
          });

          if (!directError && directProfile) {
            profile = directProfile;
            console.log('✅ AuthService.getCurrentUser - Profile retrieved via direct query:', profile);
          } else {
            console.warn('⚠️ AuthService.getCurrentUser - Direct query failed:', directError);
          }
        } catch (directError) {
          console.warn('⚠️ AuthService.getCurrentUser - Direct query exception:', directError);
        }
      }

      // Approach 3: Create profile from auth metadata if still no profile
      if (!profile) {
        console.log('🔧 AuthService.getCurrentUser - Creating profile from auth metadata...');
        
        const profileData = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone_number: user.user_metadata?.phone_number || '',
          role: (user.user_metadata?.role || 'customer') as 'customer' | 'driver' | 'admin',
          status: 'active' as const
        };

        console.log('🔧 AuthService.getCurrentUser - Profile data to create:', profileData);

        try {
          console.log('📞 AuthService.getCurrentUser - Upserting profile...');
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .upsert(profileData, { onConflict: 'id' })
            .select()
            .single();

          console.log('📞 AuthService.getCurrentUser - Upsert result:', { 
            hasData: !!createdProfile, 
            hasError: !!createError,
            errorMessage: createError?.message,
            errorCode: (createError as any)?.code
          });

          if (!createError && createdProfile) {
            profile = createdProfile;
            console.log('✅ AuthService.getCurrentUser - Profile created from metadata:', profile);
          } else {
            console.warn('⚠️ AuthService.getCurrentUser - Failed to create profile from metadata:', createError);
          }
        } catch (createError) {
          console.warn('⚠️ AuthService.getCurrentUser - Profile creation exception:', createError);
        }
      }

      // Approach 4: Use fallback profile if all else fails
      if (!profile) {
        console.log('🔧 AuthService.getCurrentUser - Using fallback profile...');
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
        console.log('🔧 AuthService.getCurrentUser - Fallback profile:', profile);
      }

      console.log('✅ AuthService.getCurrentUser - Success! Returning user and profile');
      return { user, profile, error: null };
    } catch (error) {
      console.error('❌ AuthService.getCurrentUser - Error:', error);
      return { user: null, profile: null, error };
    }
  }

  static async updateProfile(userId: string, updates: { full_name?: string; email?: string; phone_number?: string }) {
    try {
      console.log('Updating profile for user:', userId, 'with updates:', updates);
      
      // Filter out undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      
      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error('No valid updates provided');
      }
      
      // Approach 1: Try direct table update first
      try {
        console.log('Attempting direct table update...');
        const { data, error } = await supabase
          .from('users')
          .update(cleanUpdates)
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          console.log('Profile updated successfully via direct update:', data);
          return { data, error: null };
        } else {
          console.warn('Direct update failed:', error);
        }
      } catch (directError) {
        console.warn('Direct update exception:', directError);
      }

      // Approach 2: Use RPC function as fallback
      try {
        console.log('Attempting RPC function update...');
        const { data, error } = await supabase
          .rpc('update_user_profile', {
            user_id: userId,
            new_full_name: cleanUpdates.full_name || null,
            new_email: cleanUpdates.email || null,
            new_phone_number: cleanUpdates.phone_number || null,
          });

        if (!error && data && data.length > 0) {
          console.log('Profile updated successfully via RPC:', data[0]);
          return { data: data[0], error: null };
        } else {
          console.warn('RPC update failed:', error);
        }
      } catch (rpcError) {
        console.warn('RPC update exception:', rpcError);
      }

      // Approach 3: Manual update without updated_at field
      try {
        console.log('Attempting manual update without updated_at...');
        const updateData = { ...cleanUpdates };
        delete (updateData as any).updated_at; // Remove updated_at if it exists
        
        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          console.log('Profile updated successfully via manual update:', data);
          return { data, error: null };
        } else {
          console.error('Manual update also failed:', error);
          throw error || new Error('Manual update failed');
        }
      } catch (manualError) {
        console.error('All update approaches failed:', manualError);
        throw manualError;
      }

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