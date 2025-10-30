'use client';

import { SignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasInvitationToken = useMemo(() => {
    // Поддерживаем оба варианта: старый (__clerk_invitation_token) и новый (__clerk_ticket)
    return Boolean(
      searchParams.get('__clerk_invitation_token') ||
      searchParams.get('__clerk_ticket')
    );
  }, [searchParams]);

  useEffect(() => {
    if (!hasInvitationToken) {
      router.replace('/sign-in');
    }
  }, [hasInvitationToken, router]);

  if (!hasInvitationToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Примите приглашение и завершите регистрацию</p>
        </div>
        <SignUp 
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              footerActionLink: "hidden", // скрыть ссылку Sign in/Sign up внизу
            }
          }}
        />
      </div>
    </div>
  );
}
