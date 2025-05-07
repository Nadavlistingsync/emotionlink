import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      }
    );

    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Add detailed session logging
    console.log('Middleware session check:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      sessionId: session?.user?.id,
      sessionExpiry: session?.expires_at,
    });

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

    // If user is not signed in and trying to access protected routes
    if (!session && !isPublicRoute) {
      console.log('No session, redirecting to login from:', req.nextUrl.pathname);
      const redirectUrl = new URL('/login', req.url);
      // Add the original path as a query parameter
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is signed in and trying to access auth pages
    if (session && isPublicRoute) {
      console.log('Has session, redirecting to dashboard from:', req.nextUrl.pathname);
      return NextResponse.redirect(new URL('/dashboard', req.url));
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

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 