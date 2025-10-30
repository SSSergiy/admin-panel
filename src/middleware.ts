import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
    
    // Проверяем право доступа:
    // 1) основной способ — флаг в public_metadata.allowed, выставляется через n8n/Clerk
    // 2) резервный способ — список userId в ALLOWED_USER_IDS (через ENV)
    const { userId, sessionClaims } = await auth();
    const allowedFlag = (sessionClaims as any)?.publicMetadata?.allowed === true;
    const allowedUsers = process.env.ALLOWED_USER_IDS?.split(',') || [];

    const allowedByEnv = userId && allowedUsers.length > 0 && allowedUsers.includes(userId);
    const allowed = allowedFlag || allowedByEnv;

    if (!allowed) {
      return new Response('Access Denied', { status: 403 });
    }
  }
});

export const config = {
  
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
