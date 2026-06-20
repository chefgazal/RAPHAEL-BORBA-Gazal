'use client';

import { useState, useMemo } from 'react';
import { Calendar, Filter, Trash2, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { Batch, MasterCategory, MasterSubProduct } from '@/types';

interface Props {
  batches: Batch[];
  masterCategories: MasterCategory[];
  masterSubProducts: MasterSubProduct[];
}

export default function AdminView({ batches, masterCategories, masterSubProducts }: Props) {
  const [filter, setFilter] = useState('Tudo');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subProductFilter, setSubProductFilter] = useState('Tudo');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      let match = true;
      if (filter !== 'Tudo' && b.category !== filter) match = false;
      if (startDate && new Date(b.date) < new Date(startDate)) match = false;
      if (endDate) {
        const endD = new Date(endDate);
        endD.setHours(23, 59, 59, 999);
        if (new Date(b.date) > endD) match = false;
      }
      if (subProductFilter !== 'Tudo' && !b.subProducts.some(sp => sp.name === subProductFilter)) match = false;
      return match;
    });
  }, [batches, filter, startDate, endDate, subProductFilter]);

  // Calculations for mock data or batches integration
  const currentTotalWastePercent = filteredBatches.length > 0 
    ? filteredBatches.reduce((acc, b) => acc + b.wastePercent, 0) / filteredBatches.length 
    : 14.2; // default mock if no data
  
  const totalVolume = filteredBatches.length > 0
    ? filteredBatches.reduce((acc, b) => acc + b.rawWeight, 0)
    : 8420;

  const averageYield = filteredBatches.length > 0
    ? 100 - currentTotalWastePercent
    : 85.8;

  const exportToCSV = () => {
    const headers = ['Lote ID', 'Categoria', 'Entrada (kg)', 'Subprodutos (kg)', 'Aparas (kg)', 'Desperdício (%)', 'Data'];
    const rows = filteredBatches.map(b => [
      b.id,
      b.category,
      b.rawWeight.toFixed(2),
      b.subProducts.reduce((acc, sp) => acc + sp.weight, 0).toFixed(2),
      b.wasteWeight.toFixed(2),
      b.wastePercent.toFixed(2),
      new Date(b.date).toLocaleDateString()
    ]);
    
    if (filteredBatches.length === 0) {
      rows.push(['#LOT-8271', 'Carnes', '120.00', '100.00', '20.00', '16.67', new Date().toLocaleDateString()]);
      rows.push(['#LOT-8269', 'Peixes', '50.00', '42.00', '8.00', '16.00', new Date().toLocaleDateString()]);
      rows.push(['#LOT-8265', 'Frutos do Mar', '85.00', '65.00', '20.00', '23.53', new Date().toLocaleDateString()]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_producao_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-background text-text-main">
      
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Análise Administrativa</h2>
          <p className="text-sm text-text-muted">Visão geral de eficiência de produção.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-surface-dim text-text-main text-sm font-bold rounded-xl hover:bg-surface-dim transition-colors shrink-0"
        >
          <FileText size={18} />
          <span className="hidden sm:inline">Exportar CSV</span>
        </button>
      </div>

      <div className="flex gap-2 w-full overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex bg-surface rounded-xl border border-surface-dim p-1 shrink-0">
           <button className="px-4 py-2 text-sm font-semibold flex gap-2 items-center text-text-main bg-surface-dim rounded-lg"><Calendar size={16}/> Este Mês</button>
        </div>
        <button 
          onClick={() => {
            if (isFilterOpen) {
              setStartDate('');
              setEndDate('');
              setSubProductFilter('Tudo');
            }
            setIsFilterOpen(!isFilterOpen);
          }}
          className={`px-5 py-2 text-sm font-semibold flex gap-2 items-center rounded-xl shrink-0 ${isFilterOpen ? 'bg-primary-dark text-white' : 'bg-primary text-white'}`}
        >
          <Filter size={16}/> Filtrar
        </button>
      </div>

      {isFilterOpen && (
        <div className="flex flex-col gap-3 w-full bg-surface p-4 rounded-xl border border-surface-dim animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Data Inicial</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-background border border-surface-dim rounded-lg text-sm text-text-main focus:outline-none focus:border-primary" />
            </div>
            <div>
               <label className="block text-xs font-bold text-text-muted uppercase mb-1">Data Final</label>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-background border border-surface-dim rounded-lg text-sm text-text-main focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Subproduto</label>
            <select value={subProductFilter} onChange={e => setSubProductFilter(e.target.value)} className="w-full p-2 bg-background border border-surface-dim rounded-lg text-sm text-text-main focus:outline-none focus:border-primary">
              <option value="Tudo">Todos</option>
              {masterSubProducts.map(sp => <option key={sp.id} value={sp.name}>{sp.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['Tudo', ...masterCategories.map(c => c.name)].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-1.5 rounded-full text-sm font-bold shrink-0 border border-surface-dim transition-colors ${
              filter === f ? 'bg-primary-light/30 border-primary-light/50 text-primary-dark' : 'bg-surface text-text-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Waste Card */}
      <div className="bg-surface rounded-2xl border border-surface-dim p-5 pb-6 border-l-4 border-l-warning shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <Trash2 className="text-warning" size={24} />
          <span className="text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">+2.4% vs mês ant.</span>
        </div>
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">TAXA DE APARAS (DESPERDÍCIO)</div>
        <div className="text-4xl font-bold text-primary-dark">{currentTotalWastePercent.toFixed(1)}%</div>
        <div className="mt-4 h-2 bg-surface-dim rounded-full overflow-hidden flex">
          <div className="h-full bg-warning" style={{ width: `${currentTotalWastePercent}%` }}></div>
        </div>
      </div>

      {/* Volume Card */}
      <div className="bg-surface rounded-2xl border border-surface-dim p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <TrendingUp className="text-text-muted" size={24} />
          <span className="text-xs font-bold text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">+12% vs mês ant.</span>
        </div>
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">VOLUME MENSAL PROCESSADO</div>
        <div className="text-4xl font-bold text-primary-dark mb-6">{totalVolume.toLocaleString()} kg</div>
        <div className="h-16 flex items-end gap-1">
          {/* Mock bars */}
          {[30, 40, 45, 35, 60, 50, 80].map((h, i) => (
            <div key={i} className={`flex-1 rounded-t-sm ${i === 6 ? 'bg-primary-dark' : 'bg-primary-light/30'}`} style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>

      {/* Average Yield Card */}
      <div className="bg-surface rounded-2xl border border-surface-dim p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <TrendingUp className="text-text-muted" size={24} />
          <span className="text-xs font-bold text-primary-dark bg-primary-light/30 px-2 py-0.5 rounded-full">Ideal</span>
        </div>
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">RENDIMENTO MÉDIO</div>
        <div className="text-4xl font-bold text-primary-dark mb-4">{averageYield.toFixed(1)}%</div>
        <div className="flex justify-between items-center text-sm border-t border-surface-dim pt-4 text-text-main font-medium">
          <span>Eficiência Operacional</span>
          <span>Alta</span>
        </div>
      </div>

      {/* Top Yielding Products */}
      <div className="bg-surface rounded-2xl border border-surface-dim p-5 shadow-sm space-y-5">
        <h3 className="font-bold text-lg text-text-main">Melhores Rendimentos</h3>
        
        <YieldItem name="Filé de Salmão (Limpo)" percentage={91} image="bg-orange-500/20" />
        <YieldItem name="Filé Mignon (Aparado)" percentage={84} image="bg-red-500/20" />
        <YieldItem name="Camarão Pistola (Descascado)" percentage={78} image="bg-blue-500/20" />
      </div>

      {/* Batch History */}
      <div className="bg-surface rounded-2xl border border-surface-dim overflow-hidden shadow-sm">
        <div className="p-5 font-bold text-lg text-text-main">Histórico de Lotes & Rentabilidade</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted bg-surface/50 border-b border-surface-dim">
              <tr>
                <th className="px-5 py-3 font-bold uppercase">LOTE ID</th>
                <th className="px-5 py-3 font-bold uppercase">CATEGORIA</th>
                <th className="px-5 py-3 font-bold uppercase text-right">ENTRADA (KG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim">
              {filteredBatches.slice(0, showAllHistory ? undefined : 2).map((b) => (
                <tr key={b.id}>
                  <td className="px-5 py-4 font-bold text-primary-dark">{b.id}</td>
                  <td className="px-5 py-4 text-text-main">{b.category}</td>
                  <td className="px-5 py-4 text-right font-mono">{b.rawWeight.toFixed(1)}</td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <>
                  <MockRow id="#LOT-8271" cat="Carnes" vol="120.0" />
                  <MockRow id="#LOT-8269" cat="Peixes" vol="50.0" />
                  <MockRow id="#LOT-8265" cat="Frutos do Mar" vol="85.0" />
                </>
              )}
            </tbody>
          </table>
        </div>
        {filteredBatches.length > 2 && (
          <button 
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full py-4 text-sm font-bold text-primary border-t border-surface-dim hover:bg-surface-dim/30 transition-colors"
          >
            {showAllHistory ? 'Ocultar Histórico Completo' : 'Ver Histórico Completo'}
          </button>
        )}
      </div>

    </div>
  );
}

function YieldItem({ name, percentage, image }: { name: string, percentage: number, image: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl ${image} shrink-0 flex items-center justify-center text-3xl shadow-sm border border-surface-dim`}>
        {name.includes('Salmão') ? '🐟' : name.includes('Mignon') ? '🥩' : '🦐'}
      </div>
      <div className="flex-1 w-full space-y-1 block">
        <div className="flex justify-between font-bold text-sm text-text-main">
          <span>{name}</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2.5 w-full bg-surface-dim rounded-full overflow-hidden mt-2">
          <div className="h-full bg-primary" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function MockRow({ id, cat, vol }: { id: string, cat: string, vol: string }) {
  return (
    <tr>
      <td className="px-5 py-4 font-bold text-primary-dark">{id}</td>
      <td className="px-5 py-4 text-text-main">{cat}</td>
      <td className="px-5 py-4 text-right font-mono">{vol}</td>
    </tr>
  );
}
