CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL, -- 'gpa_subscription' or 'tutor_booking'
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'complete', 'failed', 'cancelled'
  merchant_payment_id VARCHAR(255) UNIQUE, -- Our generated payment ID
  payfast_payment_id VARCHAR(255), -- PayFast's payment ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB, -- Store additional payment data
  CONSTRAINT check_amount_positive CHECK (amount >= 0)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments(merchant_payment_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL, -- 'FREE', 'BASIC', 'PREMIUM', 'UNLIMITED'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  queries_used INTEGER DEFAULT 0,
  queries_limit INTEGER, -- -1 for unlimited
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP, -- When subscription expires (monthly renewal)
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMP,
  CONSTRAINT check_queries_positive CHECK (queries_used >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);


CREATE TABLE IF NOT EXISTS tutor_earnings (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL, -- Total amount student paid
  tutor_amount DECIMAL(10, 2) NOT NULL, -- Amount tutor receives (70%)
  company_amount DECIMAL(10, 2) NOT NULL, -- Company commission (30%)
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'complete', 'paid_out', 'withdrawn'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_out_at TIMESTAMP, -- When tutor received the money
  payout_reference VARCHAR(255), -- Reference for payout transaction
  CONSTRAINT check_amounts_positive CHECK (
    total_amount >= 0 AND 
    tutor_amount >= 0 AND 
    company_amount >= 0
  ),
  CONSTRAINT check_amounts_sum CHECK (
    total_amount = tutor_amount + company_amount
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_tutor_id ON tutor_earnings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_booking_id ON tutor_earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_payment_id ON tutor_earnings(payment_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_status ON tutor_earnings(status);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_created_at ON tutor_earnings(created_at DESC);

CREATE TABLE IF NOT EXISTS company_revenue (
  id SERIAL PRIMARY KEY,
  source_type VARCHAR(50) NOT NULL, -- 'gpa_subscription' or 'booking_commission'
  source_id INTEGER NOT NULL, -- payment_id or booking_id
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  CONSTRAINT check_revenue_positive CHECK (amount >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_revenue_source_type ON company_revenue(source_type);
CREATE INDEX IF NOT EXISTS idx_company_revenue_created_at ON company_revenue(created_at DESC);

-- payment related columns to existing bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS total_hours DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- View: Total company revenue by source
CREATE OR REPLACE VIEW v_company_revenue_summary AS
SELECT 
  source_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_revenue,
  AVG(amount) as average_transaction,
  MIN(created_at) as first_transaction,
  MAX(created_at) as last_transaction
FROM company_revenue
GROUP BY source_type;

-- View: Tutor earnings summary
CREATE OR REPLACE VIEW v_tutor_earnings_summary AS
SELECT 
  t.id as tutor_id,
  t.name as tutor_name,
  t.email as tutor_email,
  COUNT(te.id) as total_bookings,
  SUM(te.total_amount) as total_revenue,
  SUM(te.tutor_amount) as total_earnings,
  SUM(te.company_amount) as total_commission,
  SUM(CASE WHEN te.status = 'pending' THEN te.tutor_amount ELSE 0 END) as pending_earnings,
  SUM(CASE WHEN te.status = 'complete' THEN te.tutor_amount ELSE 0 END) as completed_earnings,
  SUM(CASE WHEN te.status = 'paid_out' THEN te.tutor_amount ELSE 0 END) as withdrawn_earnings
FROM users t
LEFT JOIN tutor_earnings te ON t.id = te.tutor_id
WHERE t.role = 'tutor'
GROUP BY t.id, t.name, t.email;

-- View: Active subscriptions summary
CREATE OR REPLACE VIEW v_subscription_summary AS
SELECT 
  subscription_type,
  COUNT(*) as active_subscriptions,
  SUM(queries_used) as total_queries_used,
  AVG(queries_used) as avg_queries_per_user
FROM subscriptions
WHERE status = 'active' AND end_date > CURRENT_TIMESTAMP
GROUP BY subscription_type;

-- View: Monthly revenue summary
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  source_type,
  COUNT(*) as transactions,
  SUM(amount) as revenue
FROM company_revenue
GROUP BY DATE_TRUNC('month', created_at), source_type
ORDER BY month DESC;

-- Function: Check if user has active subscription
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

-- Function: Get remaining queries for user
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
    RETURN -1; -- Unlimited
  END IF;
  
  RETURN GREATEST(0, v_limit - v_used);
END;
$$ LANGUAGE plpgsql;

-- Function: Increment query usage
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

-- Function: Calculate total company revenue
CREATE OR REPLACE FUNCTION get_total_company_revenue(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(amount), 0)
    FROM company_revenue
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date)
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-expire subscriptions
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

-- Insert free subscription for all existing users without subscriptions
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


COMMENT ON TABLE payments IS 'Stores all payment transactions (GPA subscriptions and tutor bookings)';
COMMENT ON TABLE subscriptions IS 'Manages GPA AI subscription plans and usage limits';
COMMENT ON TABLE tutor_earnings IS 'Tracks tutor earnings from bookings with revenue split';
COMMENT ON TABLE company_revenue IS 'Aggregates all company revenue from subscriptions and commissions';

COMMENT ON COLUMN payments.metadata IS 'Stores additional payment data as JSON (booking details, subscription info, etc.)';
COMMENT ON COLUMN subscriptions.queries_limit IS 'Maximum queries allowed per month. -1 means unlimited';
COMMENT ON COLUMN tutor_earnings.tutor_amount IS 'Amount tutor receives (typically 70% of total)';
COMMENT ON COLUMN tutor_earnings.company_amount IS 'Company commission (typically 30% of total)';
