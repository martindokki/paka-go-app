-- Add price field to parcels table
-- Run this in your Supabase SQL Editor to add price tracking

-- Add price field to parcels table
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;

-- Add pickup and dropoff coordinates for better price calculation
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS dropoff_latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS dropoff_longitude DECIMAL(11,8);

-- Add estimated distance field
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS estimated_distance DECIMAL(6,2);

-- Add package type field for better pricing
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS package_type TEXT CHECK (package_type IN ('documents', 'small', 'medium', 'electronics', 'clothing', 'food')) DEFAULT 'documents';

-- Add fragile and insurance flags
ALTER TABLE public.parcels 
ADD COLUMN IF NOT EXISTS is_fragile BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT FALSE;

-- Create index for price queries
CREATE INDEX IF NOT EXISTS idx_parcels_price ON public.parcels(price);
CREATE INDEX IF NOT EXISTS idx_parcels_package_type ON public.parcels(package_type);

-- Update existing parcels to have a default price (minimum charge)
UPDATE public.parcels 
SET price = 150 
WHERE price IS NULL OR price = 0;

COMMIT;