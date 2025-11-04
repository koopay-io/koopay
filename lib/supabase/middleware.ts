import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabaseEnvVars } from '../utils';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/callback'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname)) return supabaseResponse;

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasSupabaseEnvVars) return supabaseResponse;

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && !PUBLIC_ROUTES.includes(request.nextUrl.pathname))
    return NextResponse.redirect(new URL('/', request.url));

  // Fetch user organization
  const { data: userOrganization, error: userOrganizationError } = await supabase
    .from('user_organization')
    .select('*')
    .eq('user_id', user?.sub)
    .is('deleted_at', null)
    .is('deleted_by', null)
    .single();

  // If user is authenticated and does not have a user organization, redirect to onboarding
  if (
    user &&
    (userOrganizationError || !userOrganization) &&
    !request.nextUrl.pathname.startsWith('/onboarding')
  )
    return NextResponse.redirect(new URL('/onboarding', request.url));

  // Check if user is authenticated and trying to access onboarding
  if (user && userOrganization && request.nextUrl.pathname.startsWith('/onboarding'))
    return NextResponse.redirect(new URL('/platform', request.url));

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
