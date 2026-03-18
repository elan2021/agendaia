"use client";

import { useState, useEffect, useTransition } from 'react';
import {
  ReceiptText, DollarSign, Users, TrendingUp, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, Search, Award, Download, Banknote, RotateCcw, Info
} from 'lucide-react';
import { getCommissionsData, marcarComissaoPaga, desmarcarComissaoPaga, type CommissionEntry } from '@/app/actions/commissions';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

export default function ComissoesPage() {
  const now = new Date();
  const [mes, setMes]       = useState(now.getMonth() + 1);
  const [ano, setAno]       = useState(now.getFullYear());
  const [entries, setEntries] = useState<CommissionEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => { load(); }, [mes, ano]);

  function load() {
    setIsLoading(true);
    startTransition(async () => {
      try { setEntries(await getCommissionsData(mes, ano)); }
      catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    });
  }

  function prevMes() { if (mes === 1) { setMes(12); setAno(a => a - 1); } else setMes(m => m - 1); }
  function nextMes() { if (mes === 12) { setMes(1); setAno(a => a + 1); } else setMes(m => m + 1); }

  async function handleMarcar(entry: CommissionEntry) {
    if (!confirm(`Confirmar pagamento de R$ ${entry.comissao_calculada.toFixed(2)} para ${entry.profissional_nome}?`)) return;
    setActioning(entry.profissional_id);
    try {
      await marcarComissaoPaga(entry.profissional_id, mes, ano, entry.comissao_calculada);
      await load();
    } finally { setActioning(null); }
  }

  async function handleDesmarcar(entry: CommissionEntry) {
    if (!entry.pagamento_id) return;
    if (!confirm('Desfazer este pagamento?')) return;
    setActioning(entry.profissional_id);
    try {
      await desmarcarComissaoPaga(entry.pagamento_id);
      await load();
    } finally { setActioning(null); }
  }

  const filtered = entries.filter(e =>
    e.profissional_nome.toLowerCase().includes(search.toLowerCase()) ||
    (e.especialidade ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalAtendimentos = entries.reduce((s, e) => s + e.total_atendimentos, 0);
  const totalFaturamento  = entries.reduce((s, e) => s + e.faturamento_total, 0);
  const totalComissoes    = entries.reduce((s, e) => s + e.comissao_calculada, 0);
  const totalPago         = entries.filter(e => e.ja_pago).reduce((s, e) => s + e.comissao_calculada, 0);
  const totalPendente     = totalComissoes - totalPago;
  const topEarner         = [...entries].sort((a, b) => b.faturamento_total - a.faturamento_total)[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans flex items-center gap-3">
            <ReceiptText className="text-brand-coral" size={26} />
            Comissões
          </h2>
          <p className="text-brand-neutral-500 mt-1">Gerencie e pague as comissões da sua equipe.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-brand-neutral-100 rounded-xl shadow-sm px-2 py-1.5">
            <button onClick={prevMes} className="p-1.5 hover:bg-brand-cream rounded-lg transition-colors text-brand-neutral-400 hover:text-brand-navy">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-brand-navy px-3 min-w-[130px] text-center">
              {MESES[mes - 1]} {ano}
            </span>
            <button onClick={nextMes} className="p-1.5 hover:bg-brand-cream rounded-lg transition-colors text-brand-neutral-400 hover:text-brand-navy">
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-neutral-100 text-brand-navy rounded-xl text-sm font-bold hover:bg-brand-cream/50 transition-colors shadow-sm">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Atendimentos', value: totalAtendimentos.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Faturamento Bruto', value: `R$ ${totalFaturamento.toFixed(2)}`, icon: DollarSign, color: 'text-brand-coral', bg: 'bg-brand-coral/10' },
          { label: 'Comissões a Pagar', value: `R$ ${totalPendente.toFixed(2)}`, icon: ReceiptText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Pago', value: `R$ ${totalPago.toFixed(2)}`, icon: Banknote, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-brand-neutral-50 rounded-full group-hover:bg-brand-cream/50 transition-colors" />
            <div className="relative z-10">
              <div className={`inline-flex p-2.5 rounded-xl ${card.bg} ${card.color} mb-4`}>
                <card.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-neutral-50 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-brand-navy">Detalhamento por Profissional</h3>
          <div className="relative w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-300" />
            <input type="text" placeholder="Buscar profissional..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm bg-brand-cream/20 border border-brand-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-neutral-50/50">
                {['Profissional','Atendimentos','Faturamento','Taxa de Comissão','Comissão','Status','Ação'].map(col => (
                  <th key={col} className="px-6 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-50">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-brand-neutral-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brand-neutral-400">
                    <div className="flex flex-col items-center gap-3">
                      <Clock size={36} className="text-brand-neutral-200" />
                      <p>Nenhum dado em {MESES[mes - 1]} {ano}.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(entry => {
                const isBusy = actioning === entry.profissional_id;

                return (
                  <tr key={entry.profissional_id} className={`transition-colors group ${entry.ja_pago ? 'bg-emerald-50/30' : 'hover:bg-brand-cream/5'}`}>
                    {/* Profissional */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-cream text-brand-navy flex items-center justify-center font-black text-sm flex-shrink-0">
                          {entry.profissional_nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy text-sm">{entry.profissional_nome}</p>
                          <p className="text-[10px] text-brand-neutral-400 font-medium">{entry.especialidade}</p>
                        </div>
                      </div>
                    </td>

                    {/* Atendimentos */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-cream/60 text-brand-navy rounded-full text-xs font-bold">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        {entry.total_atendimentos}
                      </span>
                    </td>

                    {/* Faturamento */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-brand-navy">R$ {entry.faturamento_total.toFixed(2)}</span>
                    </td>

                    {/* Taxa */}
                    <td className="px-6 py-4">
                      {entry.comissao_tipo && entry.comissao_valor != null ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          entry.comissao_tipo === 'porcentagem' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {entry.comissao_tipo === 'porcentagem' ? `${entry.comissao_valor}%` : `R$ ${entry.comissao_valor.toFixed(2)}/atend.`}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-brand-neutral-300">
                          <Info size={12} />
                          <span className="text-[10px] font-bold">Não configurada</span>
                        </div>
                      )}
                    </td>

                    {/* Comissão calculada */}
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${entry.comissao_calculada > 0 ? 'text-brand-navy' : 'text-brand-neutral-300'}`}>
                        {entry.comissao_calculada > 0 ? `R$ ${entry.comissao_calculada.toFixed(2)}` : '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {entry.ja_pago ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          <CheckCircle2 size={12} /> Pago
                        </span>
                      ) : entry.comissao_calculada > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                          <Clock size={12} /> Pendente
                        </span>
                      ) : (
                        <span className="text-[10px] text-brand-neutral-300 font-bold">—</span>
                      )}
                    </td>

                    {/* Ação */}
                    <td className="px-6 py-4">
                      {entry.ja_pago ? (
                        <button onClick={() => handleDesmarcar(entry)} disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-neutral-500 bg-white border border-brand-neutral-100 hover:border-red-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50">
                          <RotateCcw size={12} />
                          Desfazer
                        </button>
                      ) : entry.comissao_calculada > 0 ? (
                        <button onClick={() => handleMarcar(entry)} disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy/80 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                          <Banknote size={12} />
                          {isBusy ? 'Salvando...' : 'Marcar pago'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-brand-neutral-300 pl-3">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-brand-neutral-50 flex items-center justify-between flex-wrap gap-4 bg-brand-neutral-50/30">
            <span className="text-xs text-brand-neutral-400">{filtered.length} profissionais · {totalAtendimentos} atendimentos</span>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] text-brand-neutral-400 font-black uppercase tracking-widest">Faturamento Total</p>
                <p className="text-sm font-black text-brand-navy">R$ {totalFaturamento.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-brand-neutral-400 font-black uppercase tracking-widest">Total Pago</p>
                <p className="text-sm font-black text-emerald-600">R$ {totalPago.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-brand-neutral-400 font-black uppercase tracking-widest">A Pagar</p>
                <p className="text-sm font-black text-brand-coral">R$ {totalPendente.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
