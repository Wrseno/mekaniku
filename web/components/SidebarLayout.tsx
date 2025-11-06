'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  MessageSquare,
  Star,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Order & Konsultasi',
    href: '/dashboard/orders',
    icon: ClipboardList,
  },
  {
    title: 'Manajemen Bengkel',
    href: '/dashboard/workshop',
    icon: Wrench,
  },
  {
    title: 'Laporan & Keuangan',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    title: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-full bg-gradient-primary text-white shadow-[var(--shadow-mekaniku-lg)] flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <Wrench className="w-8 h-8 text-[var(--color-accent)]" />
                <span className="font-bold text-xl">MekaniKu</span>
              </div>
            )}
            {!isSidebarOpen && (
              <Wrench className="w-8 h-8 text-[var(--color-accent)] mx-auto" />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-[var(--radius-mekaniku)] transition-all',
                    isActive
                      ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-mekaniku)]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-12 flex items-center justify-center border-t border-white/10 hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={clsx(
          'transition-all duration-300',
          isSidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[var(--color-background-dark)] sticky top-0 z-30 shadow-[var(--shadow-mekaniku)]">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]" />
                <input
                  type="text"
                  placeholder="Cari order, pelanggan, atau layanan..."
                  className="w-full pl-10 pr-4 py-2 border border-[var(--color-background-dark)] rounded-[var(--radius-mekaniku)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-[var(--color-background)] rounded-[var(--radius-mekaniku)] transition-colors">
                <Bell className="w-5 h-5 text-[var(--color-charcoal)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-[var(--color-background)] rounded-[var(--radius-mekaniku)] transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-[var(--color-charcoal)]">Admin</p>
                    <p className="text-xs text-[var(--color-secondary)]">MekaniKu</p>
                  </div>
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-[var(--radius-mekaniku)] shadow-[var(--shadow-mekaniku-lg)] py-2">
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-[var(--color-charcoal)] hover:bg-[var(--color-background)] transition-colors"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-[var(--color-charcoal)] hover:bg-[var(--color-background)] transition-colors"
                    >
                      Pengaturan
                    </Link>
                    <hr className="my-2 border-[var(--color-background-dark)]" />
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-background)] transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
