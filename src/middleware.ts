import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
    
    // Проверяем право доступа:
    // 1) основной способ — флаг в public_metadata.allowed, выставляется через n8n/Clerk
    // 2) резервный способ — список userId в ALLOWED_USER_IDS (через ENV)
    const { sessionClaims } = await auth();
    const allowed = (sessionClaims as any)?.publicMetadata?.allowed === true;

    if (!allowed) {
      return new Response('Access Denied', { status: 403 });
    }
  }
});

export const config = {
  
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
