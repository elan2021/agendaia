'use client';

import { Bell, UserCircle } from 'lucide-react';

interface NavbarProps {
  tenantName?: string;
  planName?: string;
}

export function Navbar({ tenantName = 'Empresa', planName = 'Plano' }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-brand-neutral-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 lg:ml-64">
      {/* Left — spacer for mobile hamburger */}
      <div className="flex items-center gap-2 ml-10 lg:ml-0">
        <h1 className="text-brand-navy font-semibold text-base sm:text-lg truncate max-w-[180px] sm:max-w-none">
          Painel de Controle
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button className="text-brand-neutral-500 hover:text-brand-navy relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-coral rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-brand-neutral-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-brand-navy truncate max-w-[150px]">{tenantName}</p>
            <p className="text-xs text-brand-neutral-500 capitalize">{planName}</p>
          </div>
          <UserCircle size={32} className="text-brand-neutral-300" />
        </div>
      </div>
    </header>
  );
}
