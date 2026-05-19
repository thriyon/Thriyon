import { NextResponse } from "next/server";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const cookieStore = await cookies();
  const authCookies: Parameters<SetAllCookies>[0] = [];
  const authHeaders = new Headers();

  const redirectWithAuthCookies = (path: string) => {
    const response = NextResponse.redirect(new URL(path, requestUrl.origin));

    authCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    authHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          authCookies.splice(0, authCookies.length, ...cookiesToSet);
          Object.entries(headers).forEach(([key, value]) => {
            authHeaders.set(key, value);
          });

          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Next can reject cookie writes after a response is committed.
            // The redirect response still receives the cookies above.
          }
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    if (error) {
      console.error("OAuth callback failed:", error.message);
    }
    return redirectWithAuthCookies("/auth/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed, username")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    const metadata = data.user.user_metadata;
    const { data: createdProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          full_name:
            metadata?.full_name ?? metadata?.name ?? data.user.email?.split("@")[0] ?? null,
          avatar_url: metadata?.avatar_url ?? metadata?.picture ?? null,
          role: "client",
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("role, onboarding_completed, username")
      .maybeSingle();

    if (profileError) {
      console.error("Could not create OAuth profile:", profileError.message);
    }
    profile = createdProfile;
  }

  if (!profile || !profile.onboarding_completed || !profile.role || !profile.username) {
    return redirectWithAuthCookies("/onboarding");
  }

  if (profile.role === "client") {
    return redirectWithAuthCookies(`/${profile.username}/dashboard/client`);
  }

  return redirectWithAuthCookies(`/${profile.username}/dashboard/freelancer`);
}
