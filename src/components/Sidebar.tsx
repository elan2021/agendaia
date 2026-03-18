'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar, Users, Settings, BarChart3, MessageSquare,
  LayoutDashboard, LogOut, ReceiptText, X, Menu, Scissors,
  Layers, Sliders
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/dashboard' },
  { icon: Calendar,        label: 'Agenda',         href: '/dashboard/agenda' },
  { icon: MessageSquare,   label: 'IA Config',       href: '/dashboard/ia-config' },
  { icon: Users,           label: 'Clientes',        href: '/dashboard/clientes' },
  { icon: Scissors,        label: 'Profissionais',  href: '/dashboard/profissionais' },
  { icon: Layers,          label: 'Serviços',        href: '/dashboard/servicos' },
  { icon: ReceiptText,     label: 'Comissões',       href: '/dashboard/comissoes' },
  { icon: BarChart3,       label: 'Relatórios',      href: '/dashboard/relatorios' },
  { icon: Settings,        label: 'Configurações',   href: '/dashboard/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const NavContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-sm font-black text-white flex flex-col leading-tight uppercase tracking-tighter">
          <span className="text-brand-coral">Atendimento</span>
          <span>Inteligente</span>
        </h2>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 text-white/60 hover:text-white rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 mt-2 px-3">
        {menuItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all group ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-brand-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon
                size={20}
                className={active ? 'text-brand-coral' : 'text-brand-neutral-400 group-hover:text-brand-coral transition-colors'}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-coral" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={async () => {
            await logout();
          }}
          className="flex items-center gap-3 text-brand-neutral-500 hover:text-white transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-brand-navy h-screen text-brand-neutral-100 flex-col fixed left-0 top-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile toggle button — rendered inside Navbar via context or here as floating */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-brand-navy text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-brand-navy text-brand-neutral-100 flex flex-col z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
