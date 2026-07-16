import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[Supabase] Faltan variables de entorno");
}

export const supabase = createClient(
  supabaseUrl || "http://placeholder",
  supabaseKey || "placeholder"
);

export type UserRole = "deity" | "follower" | null;