-- Add new columns to bookings table for multi-hour booking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS number_of_hours INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint to ensure minimum 3 hours
ALTER TABLE bookings 
ADD CONSTRAINT check_minimum_hours 
CHECK (number_of_hours >= 3);

-- Update existing bookings to have default values
UPDATE bookings 
SET number_of_hours = 1, 
    total_amount = 0, 
    payment_status = 'pending' 
WHERE number_of_hours IS NULL;