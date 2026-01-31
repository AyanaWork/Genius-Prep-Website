-- Payment tracking table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  merchant_payment_id VARCHAR(255) UNIQUE,
  payfast_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB,
  CONSTRAINT check_amount_positive CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments(merchant_payment_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  queries_used INTEGER DEFAULT 0,
  queries_limit INTEGER,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMP,
  CONSTRAINT check_queries_positive CHECK (queries_used >= 0)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Tutor earnings tracking
CREATE TABLE IF NOT EXISTS tutor_earnings (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  tutor_amount DECIMAL(10, 2) NOT NULL,
  company_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_out_at TIMESTAMP,
  payout_reference VARCHAR(255),
  CONSTRAINT check_amounts_positive CHECK (
    total_amount >= 0 AND 
    tutor_amount >= 0 AND 
    company_amount >= 0
  ),
  CONSTRAINT check_amounts_sum CHECK (
    total_amount = tutor_amount + company_amount
  )
);

CREATE INDEX IF NOT EXISTS idx_tutor_earnings_tutor_id ON tutor_earnings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_booking_id ON tutor_earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_payment_id ON tutor_earnings(payment_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_status ON tutor_earnings(status);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_created_at ON tutor_earnings(created_at DESC);

-- Company revenue tracking
CREATE TABLE IF NOT EXISTS company_revenue (
  id SERIAL PRIMARY KEY,
  source_type VARCHAR(50) NOT NULL,
  source_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  CONSTRAINT check_revenue_positive CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_company_revenue_source_type ON company_revenue(source_type);
CREATE INDEX IF NOT EXISTS idx_company_revenue_created_at ON company_revenue(created_at DESC);

-- Add payment columns to bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS total_hours DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Helper functions
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND end_date > CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_remaining_queries(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT queries_limit, queries_used
  INTO v_limit, v_used
  FROM subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  AND end_date > CURRENT_TIMESTAMP;
  
  IF v_limit = -1 THEN
    RETURN -1;
  END IF;
  
  RETURN GREATEST(0, v_limit - v_used);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_query_usage(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscriptions
  SET queries_used = queries_used + 1
  WHERE user_id = p_user_id
  AND status = 'active'
  AND end_date > CURRENT_TIMESTAMP;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Auto-expire subscriptions trigger
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date <= CURRENT_TIMESTAMP AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_subscription_expiry
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION check_subscription_expiry();

-- Give all existing users a free trial subscription
INSERT INTO subscriptions (user_id, subscription_type, status, queries_used, queries_limit, end_date)
SELECT 
  id, 
  'FREE', 
  'active', 
  0, 
  5, 
  CURRENT_TIMESTAMP + INTERVAL '30 days'
FROM users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;