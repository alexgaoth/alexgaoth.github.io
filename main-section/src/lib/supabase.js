import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Null when the env vars are missing (e.g. not set locally or on the deploy
// host). createClient(undefined, ...) throws at import time and would crash
// every page that imports this module — consumers must null-check instead
// and degrade to an offline state.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
