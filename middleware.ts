import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Always use the same response object throughout
  let res = NextResponse.next();

  // Use SSR cookies
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore errors in server components
          }
        },
      },
    }
  );

  // This will update the response with any new cookies
  const { data: { session }, error } = await supabase.auth.getSession();

  // Log session for debugging
  console.log('Middleware session check:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    sessionId: session?.user?.id,
    sessionExpiry: session?.expires_at,
    error,
  });

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  // If user is not signed in and trying to access protected routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and trying to access auth pages
  if (session && isPublicRoute) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If user is a therapist and trying to access /therapist
  if (session && req.nextUrl.pathname.startsWith('/therapist')) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user?.role !== 'therapist') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Always return the response object you passed to Supabase
  return res;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 