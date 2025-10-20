import { SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Code, Globe, Rocket, Shield, Users, Zap } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                ADMIN-PANEL
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Создавайте и управляйте сайтами для ваших клиентов с помощью современной админ-панели в стиле Decup
            </p>

            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <SignInButton mode="modal">
                  <button className="gradient-button text-white font-semibold py-4 px-8 rounded-2xl text-lg">
                    Войти в систему
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="glass text-white font-semibold py-4 px-8 rounded-2xl text-lg hover:bg-gray-800/50 transition-all duration-200">
                    Начать работу
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="glass p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Быстрый старт</h3>
                <p className="text-gray-400 leading-relaxed">
                  Создайте сайт за несколько минут с помощью интуитивного интерфейса в стиле Decup
                </p>
              </div>

              <div className="glass p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Безопасность</h3>
                <p className="text-gray-400 leading-relaxed">
                  Полная изоляция данных клиентов и защищенная аутентификация через Clerk
                </p>
              </div>

              <div className="glass p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Автоматизация</h3>
                <p className="text-gray-400 leading-relaxed">
                  Автоматический деплой и обновление сайтов через GitHub Actions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-24 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Почему ADMIN-PANEL?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Современная платформа для создания и управления сайтами клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Мультитенантность</h3>
              <p className="text-gray-400 text-sm">Каждый клиент имеет изолированную среду</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Современный стек</h3>
              <p className="text-gray-400 text-sm">Next.js 15, TypeScript, Tailwind CSS</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Масштабируемость</h3>
              <p className="text-gray-400 text-sm">Поддержка неограниченного количества клиентов</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Производительность</h3>
              <p className="text-gray-400 text-sm">Быстрая загрузка и отзывчивый интерфейс</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 DecupCMS. Создано с ❤️ для современных веб-разработчиков
          </p>
        </div>
      </div>
    </div>
  );
}