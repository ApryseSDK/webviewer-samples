import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "";
const SUPABASE_KEY = "";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
