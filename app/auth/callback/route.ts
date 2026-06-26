import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { getClientEnv } from "@/src/lib/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const { nextPublicSupabaseUrl, nextPublicSupabaseAnonKey } = getClientEnv();
    const supabase = createServerClient(
      nextPublicSupabaseUrl,
      nextPublicSupabaseAnonKey,
      {
        cookies: {
          get: (name: string) => {
            return cookieStore.get(name)?.value;
          },
          set: (name: string, value: string, options: CookieOptions) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name: string, options: CookieOptions) => {
            cookieStore.set({
              name,
              value: "",
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin`);
}
