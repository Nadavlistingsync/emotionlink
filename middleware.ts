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

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware auth error:', error);
      // If there's an auth error, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log('Middleware session check:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
    });

    // If user is not signed in and the current path is not /login or /signup
    // redirect the user to /login
    if (!session && !['/login', '/signup'].includes(req.nextUrl.pathname)) {
      console.log('No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If user is signed in and the current path is /login or /signup
    // redirect the user to /
    if (session && ['/login', '/signup'].includes(req.nextUrl.pathname)) {
      console.log('Has session, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is a therapist and trying to access /therapist
    if (session && req.nextUrl.pathname.startsWith('/therapist')) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (user?.role !== 'therapist') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 