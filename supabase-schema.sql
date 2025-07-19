-- Supabase Database Schema Setup
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'admin')) DEFAULT 'customer',
  status TEXT CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parcels table
CREATE TABLE IF NOT EXISTS public.parcels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  parcel_description TEXT,
  weight_kg DECIMAL(5,2),
  status TEXT CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  dropoff_time TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT CHECK (delivery_status IN ('assigned', 'picked', 'delivered', 'failed')) DEFAULT 'assigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'card', 'cash')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  transaction_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table for tracking
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'location')) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('order', 'payment', 'system', 'promotion')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT CHECK (vehicle_type IN ('motorcycle', 'bicycle', 'car', 'van')) NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  status TEXT CHECK (status IN ('active', 'maintenance', 'retired')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  feedback_type TEXT CHECK (feedback_type IN ('customer_to_driver', 'driver_to_customer')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert users (for registration)" ON public.users
  FOR INSERT WITH CHECK (true);

-- Parcels policies
CREATE POLICY "Users can view their own parcels" ON public.parcels
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can create parcels" ON public.parcels
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Drivers can view assigned parcels" ON public.parcels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deliveries 
      WHERE deliveries.parcel_id = parcels.id 
      AND deliveries.driver_id = auth.uid()
    )
  );

-- Deliveries policies
CREATE POLICY "Users can view their deliveries" ON public.deliveries
  FOR SELECT USING (
    auth.uid() = driver_id OR 
    EXISTS (
      SELECT 1 FROM public.parcels 
      WHERE parcels.id = deliveries.parcel_id 
      AND parcels.sender_id = auth.uid()
    )
  );

CREATE POLICY "System can create deliveries" ON public.deliveries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Drivers can update their deliveries" ON public.deliveries
  FOR UPDATE USING (auth.uid() = driver_id);

-- Payments policies
CREATE POLICY "Users can view their payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parcels 
      WHERE parcels.id = payments.parcel_id 
      AND parcels.sender_id = auth.uid()
    )
  );

-- Locations policies
CREATE POLICY "Users can view delivery locations" ON public.locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deliveries d
      JOIN public.parcels p ON d.parcel_id = p.id
      WHERE d.id = locations.delivery_id 
      AND (d.driver_id = auth.uid() OR p.sender_id = auth.uid())
    )
  );

CREATE POLICY "Drivers can insert location updates" ON public.locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deliveries 
      WHERE deliveries.id = locations.delivery_id 
      AND deliveries.driver_id = auth.uid()
    )
  );

-- Chats policies
CREATE POLICY "Users can view their chats" ON public.chats
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.deliveries d
      JOIN public.parcels p ON d.parcel_id = p.id
      WHERE d.id = chats.delivery_id 
      AND (d.driver_id = auth.uid() OR p.sender_id = auth.uid())
    )
  );

CREATE POLICY "Users can send chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Vehicles policies
CREATE POLICY "Drivers can view their vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can manage their vehicles" ON public.vehicles
  FOR ALL USING (auth.uid() = driver_id);

-- Support tickets policies
CREATE POLICY "Users can view their support tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view feedback for their deliveries" ON public.feedback
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.deliveries d
      JOIN public.parcels p ON d.parcel_id = p.id
      WHERE d.id = feedback.delivery_id 
      AND (d.driver_id = auth.uid() OR p.sender_id = auth.uid())
    )
  );

CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parcels_sender_id ON public.parcels(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_parcel_id ON public.deliveries(parcel_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON public.deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_payments_parcel_id ON public.payments(parcel_id);
CREATE INDEX IF NOT EXISTS idx_locations_delivery_id ON public.locations(delivery_id);
CREATE INDEX IF NOT EXISTS idx_chats_delivery_id ON public.chats(delivery_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_delivery_id ON public.feedback(delivery_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();