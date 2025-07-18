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
            phone_number: phoneNumber,
            role: role,
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

      // Create user profile in public.users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email: email,
          phone_number: phoneNumber,
          role: role,
          status: 'active'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log('User profile created successfully:', profileData);
      return { user: authData.user, profile: profileData, error: null };
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