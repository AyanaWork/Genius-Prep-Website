const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ptnesqkhsjyowydmksjq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('⚠️  SUPABASE_ANON_KEY not found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;