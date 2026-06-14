'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createAdminClient as createClient } from '@/lib/supabase/admin-client'
import {
  LayoutDashboard, Package, Tag, BookOpen, Image, Star,
  Settings, LogOut, Menu, ChevronRight, Film, Blocks, FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/evo9-admin', icon: LayoutDashboard },
  { label: 'Page Builder', href: '/evo9-admin/homepage', icon: Blocks },
  { label: 'Hero Slider', href: '/evo9-admin/hero', icon: Film },
  { label: 'Media Library', href: '/evo9-admin/media', icon: FolderOpen },
  { label: 'Products', href: '/evo9-admin/products', icon: Package },
  { label: 'Categories', href: '/evo9-admin/categories', icon: Tag },
  { label: 'Collections', href: '/evo9-admin/collections', icon: BookOpen },
  { label: 'Gallery', href: '/evo9-admin/gallery', icon: Image },
  { label: 'Testimonials', href: '/evo9-admin/testimonials', icon: Star },
  { label: 'Settings', href: '/evo9-admin/settings', icon: Settings },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/evo9-admin/login')
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <Link href="/" target="_blank" className="block">
          <span className="font-serif text-xl font-semibold text-[var(--brand-charcoal)]">
            Geethams <span className="text-[var(--brand-rose)]">Silks</span>
          </span>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mt-0.5">Admin Panel</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/evo9-admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all',
                active
                  ? 'bg-[var(--brand-rose)]/10 text-[var(--brand-rose)] font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--brand-charcoal)]'
              )}
            >
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-500 hover:text-red-500 rounded-md hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 bg-white border-r border-gray-100 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex flex-col w-72 h-full bg-white shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-gray-500 p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-xs tracking-wider text-gray-400 hover:text-[var(--brand-rose)] transition-colors">
            View Site ↗
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
