import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrokteacdihxfcrpgotz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb2t0ZWFjZGloeGZjcnBnb3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5NTksImV4cCI6MjA2ODQyNTk1OX0.hahF2k3TeBmvVXHN5LXf_8zOcchpIL8F7cMKOM48wGw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on your Supabase schema
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: 'customer' | 'driver' | 'admin';
  status?: 'active' | 'suspended' | 'pending';
  profile_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface Parcel {
  id: string;
  sender_id: string;
  receiver_name: string;
  receiver_phone?: string;
  pickup_address: string;
  dropoff_address: string;
  parcel_description?: string;
  weight_kg?: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface Delivery {
  id: string;
  parcel_id: string;
  driver_id?: string;
  pickup_time?: string;
  dropoff_time?: string;
  delivery_status: 'assigned' | 'picked' | 'delivered' | 'failed';
  created_at: string;
  parcel?: Parcel;
  driver?: User;
}

export interface Payment {
  id: string;
  parcel_id: string;
  amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  transaction_reference?: string;
  paid_at?: string;
  created_at: string;
}