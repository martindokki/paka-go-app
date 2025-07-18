import { supabase, User } from './supabase';

export class AuthService {
  static async signUp(email: string, password: string, fullName: string, phoneNumber?: string, role: 'customer' | 'driver' = 'customer') {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the user profile in the public.users table
        const { error: profileError } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            phone_number: phoneNumber,
            role: role,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      return { user: authData.user, error: null };
    } catch (error) {
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