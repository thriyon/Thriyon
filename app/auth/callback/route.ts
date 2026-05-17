import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
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
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component — cookies may be read-only
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Fetch profile to check onboarding status and role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", data.user.id)
        .single();

      // If no profile, or onboarding not done, or no role assigned → go onboard
      if (!profile || !profile.onboarding_completed || !profile.role) {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }

      // Onboarded → go to correct dashboard
      if (profile.role === "client") {
        return NextResponse.redirect(new URL("/user/dashboard/client", requestUrl.origin));
      } else {
        return NextResponse.redirect(new URL("/user/dashboard/freelancer", requestUrl.origin));
      }
    }
  }

  // Default fallback redirect
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

