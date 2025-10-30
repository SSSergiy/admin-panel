'use client';

import { SignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Если ссылка инвайта пришла на /sign-in, перенаправим на /sign-up с токеном
  useEffect(() => {
    const token = searchParams.get('__clerk_invitation_token');
    if (token) {
      router.replace(`/sign-up?__clerk_invitation_token=${encodeURIComponent(token)}`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Войдите в систему для управления сайтом</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            }
          }}
        />
      </div>
    </div>
  );
}
