import NextAuth from "next-auth";
import authConfig from "./src/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') || 
                          nextUrl.pathname.startsWith('/chat') || 
                          nextUrl.pathname.startsWith('/analytics') || 
                          nextUrl.pathname.startsWith('/budgets') || 
                          nextUrl.pathname.startsWith('/settings') ||
                          nextUrl.pathname.startsWith('/transactions') ||
                          nextUrl.pathname.startsWith('/profile');
                          
  const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }
  
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/analytics/:path*',
    '/budgets/:path*',
    '/settings/:path*',
    '/transactions/:path*',
    '/profile/:path*',
    '/login',
    '/register'
  ],
};
