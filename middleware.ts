import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard", "/report", "/complaints", "/notifications",
  "/profile", "/authority", "/department", "/admin",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const item of cookiesToSet) {
            request.cookies.set(item.name, item.value);
          }
          response = NextResponse.next({ request });
          for (const item of cookiesToSet) {
            response.cookies.set(item.name, item.value, item.options);
          }
        },
      },
    }
  );

  // getUser() checks the token with Supabase; getSession() does not
  const { data } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  let needsLogin = false;
  for (const prefix of PROTECTED) {
    if (path === prefix || path.startsWith(prefix + "/")) {
      needsLogin = true;
    }
  }

  if (needsLogin && !data.user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
