import { createClient } from "@supabase/supabase-js";

// Both values are safe to ship to the browser: the publishable key only allows what the row-level rules allow.
// With neither set, accounts are off and the shortlist stays in the browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
