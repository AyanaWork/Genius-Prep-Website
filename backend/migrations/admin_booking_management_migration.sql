-- Add columns to bookings table for admin management tracking

-- Add columns if they don't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS accepted_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS declined_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_action_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Create index for faster queries on pending bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status_created 
ON bookings(status, created_at DESC);

-- Create index for admin action tracking
CREATE INDEX IF NOT EXISTS idx_bookings_admin_actions 
ON bookings(accepted_by_admin, declined_by_admin) 
WHERE accepted_by_admin = true OR declined_by_admin = true;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('accepted_by_admin', 'declined_by_admin', 'admin_action_date', 'decline_reason')
ORDER BY column_name;