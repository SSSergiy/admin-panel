import { SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Multi-Tenant CMS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Создавайте и управляйте сайтами для ваших клиентов с помощью современной админ-панелии
          </p>

          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                  Войти
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition-colors">
                  Регистрация
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Быстрый старт</h3>
              <p className="text-gray-600">
                Создайте сайт за несколько минут с помощью интуитивного интерфейса
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Безопасность</h3>
              <p className="text-gray-600">
                Полная изоляция данных клиентов и защищенная аутентификация
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Автоматизация</h3>
              <p className="text-gray-600">
                Автоматический деплой и обновление сайтов через GitHub Actions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}