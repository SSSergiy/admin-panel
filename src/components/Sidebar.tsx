'use client';

import {
	Eye,
	FileText,
	Home,
	Menu,
	Rocket,
	Settings,
	Upload,
	Wand2,
	X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  userSiteUrl?: string;
}

const navigation = [
  { name: 'Главная', href: '/dashboard', icon: Home },
  { name: 'Конструктор', href: '/dashboard/builder', icon: Wand2 },
  { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
  { name: 'Контент', href: '/dashboard/content', icon: FileText },
  { name: 'Изображения', href: '/dashboard/images', icon: Upload },
];

export default function Sidebar({ userSiteUrl }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-700/50 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ADMIN-PANEL</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* View Site Button */}
          {userSiteUrl && (
            <div className="p-4 border-t border-gray-800">
              <Link
                href={userSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105"
              >
                <Eye className="h-5 w-5" />
                <span>Посмотреть сайт</span>
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 text-center">
              Powered by ADMIN-PANEL
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
