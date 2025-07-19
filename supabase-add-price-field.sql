-- Add price field to parcels table
-- Run this in your Supabase SQL Editor to add the missing price field

-- Add price column to parcels table
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Set default price for existing parcels (you can update this later)
UPDATE public.parcels SET price = 500.00 WHERE price IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_parcels_price ON public.parcels(price);

-- Update RLS policies to allow drivers to view all pending parcels (for available orders)
CREATE POLICY "Drivers can view all pending parcels" ON public.parcels
  FOR SELECT USING (
    status = 'pending' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'driver'
    )
  );

-- Allow drivers to update parcel status when accepting orders
CREATE POLICY "Drivers can update parcel status" ON public.parcels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'driver'
    )
  );

COMMIT;