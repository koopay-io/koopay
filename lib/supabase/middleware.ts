import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_OR_ANON_KEY, SUPABASE_URL } from "../constants";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/callback"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) return supabaseResponse;

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
    console.error('Missing Supabase environment variables. SUPABASE_URL:', !!SUPABASE_URL, 'SUPABASE_PUBLISHABLE_OR_ANON_KEY:', !!SUPABASE_PUBLISHABLE_OR_ANON_KEY);
    // For public routes, allow access; for protected routes, redirect to login
    if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  let user = null;
  try {
    const { data } = await supabase.auth.getClaims();
    user = data?.claims;
  } catch (error) {
    // Handle SSL/connection errors gracefully
    // Only log if it's not a known SSL error (which can be intermittent)
    const isSSLError = error instanceof Error && 
      (error.message.includes('SSL') || 
       error.message.includes('tls_get_more_records') ||
       error.cause && typeof error.cause === 'object' && 
       'code' in error.cause && error.cause.code === 'ERR_SSL_PACKET_LENGTH_TOO_LONG');
    
    if (!isSSLError) {
      console.error('Error getting auth claims in middleware:', error);
    }
    
    // If it's a public route, allow access; otherwise redirect to login
    if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return supabaseResponse;
  }

  // Protect all routes except public ones
  if (!user && !PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Fetch user organization (only if user is authenticated)
  let userOrganization = null;
  let userOrganizationError = null;
  let organizationDeleted = false;

  if (user?.sub) {
    try {
      // Get all active user organizations (user can have multiple)
      const { data: userOrganizations, error } = await supabase
        .from("user_organization")
        .select("organization_id")
        .eq("user_id", user.sub)
        .is("deleted_at", null)
        .is("deleted_by", null)
        .limit(1); // Just need to check if any exists, take first one
      
      if (error) {
        userOrganizationError = error;
      } else if (userOrganizations && userOrganizations.length > 0) {
        // Use the first active user organization
        userOrganization = userOrganizations[0];

        // If user organization exists, check if the related organization is not deleted
        if (userOrganization?.organization_id) {
          try {
            const { data: organization } = await supabase
              .from("organizations")
              .select("deleted_at, deleted_by")
              .eq("id", userOrganization.organization_id)
              .single();
            
            organizationDeleted = organization ? 
              (organization.deleted_at !== null || organization.deleted_by !== null) : 
              true;
          } catch (orgError) {
            console.error('Error fetching organization in middleware:', orgError);
            // If we can't fetch the organization, assume it's deleted to be safe
            organizationDeleted = true;
          }
        }
      } else {
        // No active user organizations found
        userOrganization = null;
      }
    } catch (error) {
      console.error('Error fetching user organization in middleware:', error);
      userOrganizationError = error as Error;
    }
  }

  // If user is authenticated and does not have a user organization, or organization is deleted, redirect to onboarding
  if (
    user &&
    (userOrganizationError || !userOrganization || organizationDeleted) &&
    !request.nextUrl.pathname.startsWith("/onboarding")
  )
    return NextResponse.redirect(new URL("/onboarding", request.url));

  // Check if user is authenticated and trying to access onboarding
  // Only redirect to platform if user has an active organization (not deleted)
  if (
    user &&
    userOrganization &&
    !organizationDeleted &&
    request.nextUrl.pathname.startsWith("/onboarding")
  )
    return NextResponse.redirect(new URL("/platform", request.url));

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
