import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
    
    // Проверяем что пользователь в разрешенном списке
    const { userId } = await auth();
    const allowedUsers = process.env.ALLOWED_USER_IDS?.split(',') || [];
    
    if (userId && allowedUsers.length > 0 && !allowedUsers.includes(userId)) {
      return new Response('Access Denied', { status: 403 });
    }
  }
});

export const config = {
  
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
