import { supabase, User } from './supabase';

export class AuthService {
  static async signUp(email: string, password: string, fullName: string, phoneNumber?: string, role: 'customer' | 'driver' = 'customer') {
    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            role: role,
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      // Wait a moment for the trigger to potentially create the user record
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user record exists in public.users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        throw checkError;
      }

      if (existingUser) {
        // Update existing user record
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            phone_number: phoneNumber,
            role: role,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          throw updateError;
        }
      } else {
        // Create new user record manually
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: fullName,
            email: email,
            phone_number: phoneNumber,
            role: role,
          });

        if (insertError) {
          console.error('Error inserting user profile:', insertError);
          throw insertError;
        }
      }

      // Verify the user was created successfully
      const { data: finalUser, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (verifyError || !finalUser) {
        console.error('Error verifying user creation:', verifyError);
        throw new Error('Failed to create user profile in database');
      }

      console.log('User successfully created:', finalUser);
      return { user: authData.user, error: null };
    } catch (error: any) {
      console.error('SignUp error:', error);
      return { user: null, error };
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

      if (profileError) throw profileError;

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