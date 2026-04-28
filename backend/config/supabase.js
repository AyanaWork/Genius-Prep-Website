const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase client (used by uploadController for storage).
 *
 * Previously this file would crash at startup when SUPABASE_SERVICE_ROLE_KEY
 * was missing because createClient() throws "supabaseKey is required."
 * That meant a single misconfigured env var took down the whole API,
 * including features that don't need Supabase at all.
 *
 * Now we return a stub client whose methods reject with a clear error
 * message at call-time, so the server still boots and image-upload
 * routes are the only thing that fails — visibly.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://ptnesqkhsjyowydmksjq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set — image uploads will be disabled.');
  console.warn('   Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env to enable.');

  // Lazy stub — same surface area as the real client, but every call
  // throws a clear error instead of crashing the import.
  const fail = () => {
    throw new Error('Supabase is not configured. Set SUPABASE_SERVICE_ROLE_KEY in your environment.');
  };
  supabase = {
    storage: {
      from: () => ({
        upload: fail,
        remove: fail,
        getPublicUrl: fail
      })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = supabase;
