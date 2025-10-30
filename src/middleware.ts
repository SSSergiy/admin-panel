import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sign-out(.*)', // разрешаем выход без проверки
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();

    const { userId, sessionClaims } = await auth();

    // Пытаемся прочитать флаг из разных возможных структур клеймов
    const claims = sessionClaims as any;
    const allowedFromClaims = (
      claims?.publicMetadata?.allowed === true ||
      claims?.metadata?.public?.allowed === true ||
      claims?.claims?.metadata?.public?.allowed === true
    );

    if (allowedFromClaims) return;

    // Если в клеймах нет — делаем точный запрос пользователя в Clerk
    if (userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const allowedUser = (user.publicMetadata as any)?.allowed === true;
        if (allowedUser) return;
      } catch {
        // игнорируем детали — ниже вернём 403
      }
    }

    return new Response('Access Denied', { status: 403 });
  }
});

export const config = {
  
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
