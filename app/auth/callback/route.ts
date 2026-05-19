import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    let response = NextResponse.redirect(new URL(next, requestUrl.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Set cookies on the cookie store (for immediate use if needed)
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set({ name, value, ...options, httpOnly: false });
              });
            } catch {
              // Ignore
            }
            // And CRITICALLY, attach them directly to the response object we will return!
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({ name, value, ...options, httpOnly: false });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Fetch profile to check onboarding status and role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed, username")
        .eq("id", data.user.id)
        .single();

      // If no profile, or onboarding not done, or no role assigned → go onboard
      if (!profile || !profile.onboarding_completed || !profile.role) {
        response = NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
        // Need to re-apply cookies to the NEW response object!
        const allCookies = cookieStore.getAll();
        allCookies.forEach((cookie) => {
          response.cookies.set({ ...cookie, httpOnly: false });
        });
        return response;
      }

      // Onboarded → go to correct dashboard
      if (profile.role === "client") {
        response = NextResponse.redirect(new URL(`/${profile.username || 'user'}/dashboard/client`, requestUrl.origin));
      } else {
        response = NextResponse.redirect(new URL(`/${profile.username || 'user'}/dashboard/freelancer`, requestUrl.origin));
      }
      
      const allCookies = cookieStore.getAll();
      allCookies.forEach((cookie) => {
        response.cookies.set({ ...cookie, httpOnly: false });
      });
      return response;
    }
    
    // If error or no user, just return the fallback response
    return response;
  }

  // Default fallback redirect if no code
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

