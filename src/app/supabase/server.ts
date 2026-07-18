import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";


// will use for server to fetch orders , user details 
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            //wont crash if i call from wrong component.
            // ive created midleware.ts to handle refresh of session
          }
        },
      },
    },
  );
}
