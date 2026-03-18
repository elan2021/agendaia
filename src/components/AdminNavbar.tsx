import { Bell, Search, Globe2 } from 'lucide-react'

export function AdminNavbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 ml-64 shadow-sm">
      <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 w-96 group focus-within:ring-2 focus-within:ring-brand-coral/20 focus-within:border-brand-coral transition-all">
        <Search className="text-slate-400 mr-2" size={16} />
        <input 
          type="text" 
          placeholder="Buscar estabelecimento por nome ou slug..." 
          className="bg-transparent text-sm w-full outline-none text-slate-600"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 text-xs font-bold border border-slate-200">
           <Globe2 size={12} className="text-brand-coral" />
           PAINEL GLOBAL
        </div>

        <button className="text-slate-500 hover:text-slate-900 relative p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-coral rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  )
}
