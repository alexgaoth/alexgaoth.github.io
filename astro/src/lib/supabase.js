import { createClient } from '@supabase/supabase-js';

// Astro flavor of the old React app's lib/supabase.js: PUBLIC_-prefixed vars are
// the Vite/Astro equivalent of CRA's REACT_APP_ ones. Null when missing so
// pages degrade to an offline state instead of crashing at import time.
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
