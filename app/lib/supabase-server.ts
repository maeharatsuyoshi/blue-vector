import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

export async function getSupabaseServer() {
  const store = await cookies();
  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set(name, value, options);
        });
      },
    },
  });
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
