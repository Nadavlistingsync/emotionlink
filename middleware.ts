import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Always use the same response object throughout
  let res = NextResponse.next();

  // Log all cookies for debugging
  console.log('All cookies:', req.cookies.getAll());

  // Create Supabase client with req and res
  const supabase = createMiddlewareClient({ req, res });

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
    const redirectRes = NextResponse.redirect(redirectUrl);
    // Copy cookies from the original response
    res.cookies.getAll().forEach(cookie => {
      redirectRes.cookies.set(cookie);
    });
    return redirectRes;
  }

  // If user is signed in and trying to access auth pages
  if (session && isPublicRoute) {
    const dashboardUrl = new URL('/dashboard', req.url);
    const redirectRes = NextResponse.redirect(dashboardUrl);
    res.cookies.getAll().forEach(cookie => {
      redirectRes.cookies.set(cookie);
    });
    return redirectRes;
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