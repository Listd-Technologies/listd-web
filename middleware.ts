import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getUserData } from './apis/user/get-user-data';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/manage-listings(.*)', 
  '/dashboard(.*)',
  // Add other protected routes as needed
]);

// Define auth routes (to redirect away from when logged in)
const isAuthRoute = createRouteMatcher(['/login(.*)', '/signup(.*)']);

export default clerkMiddleware(async (auth, req) => {
  
  // const data = await getUserData({ authToken: req.headers.get('Authorization') });
  // Check if user is authenticated using a try-catch
  // let isAuthenticated = false;
  const isAuthenticated = (await auth()).userId ? true : false;
  // try {
  //   await auth.protect();
  //   isAuthenticated = true;
  // } catch {
  //   isAuthenticated = false;
  // }

  if(isAuthenticated) {
    const test = await (await auth()).getToken();
    const data = await getUserData(test ?? undefined);
    
    if(data.address === "No address provided" && !req.nextUrl.pathname.startsWith('/update-profile')) {
      return NextResponse.redirect(new URL('/update-profile', req.url));
    }
  }
  
  // Redirect authenticated users away from login/signup
  if (isAuthRoute(req) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  else {
    return NextResponse.next();
  }
  
  // // Only protect non-auth routes that require authentication
  // if (isProtectedRoute(req) && !isAuthenticated) {
  //   await auth.protect();
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
