'use client';

import { useState } from 'react';
import { InventoryItem } from '@/types';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function InventoryView({ inventory, setInventory }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handlePhysicalStockChange = (id: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setInventory(inventory.map(item => item.id === id ? { ...item, physicalStock: numValue } : item));
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-primary-dark">Estoque Físico</h2>
        <p className="text-text-muted text-sm">Compare o estoque do sistema com a contagem real.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Buscar produto..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-dim rounded-xl focus:outline-none focus:border-primary shadow-sm"
        />
      </div>

      <div className="space-y-3">
        {filteredInventory.length === 0 ? (
          <p className="text-center py-8 text-text-muted">Nenhum produto encontrado.</p>
        ) : (
          filteredInventory.map(item => {
            const hasDifference = item.physicalStock !== null && item.physicalStock !== item.systemStock;
            const diffAmount = item.physicalStock !== null ? item.physicalStock - item.systemStock : 0;
            
            return (
              <div key={item.id} className="bg-surface p-4 rounded-xl border border-surface-dim shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-text-main flex items-center gap-2">
                       {item.name}
                       {item.minStock !== undefined && item.systemStock < item.minStock && (
                         <span className="text-[10px] bg-warning text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Abaixo do Mín.</span>
                       )}
                    </h3>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-0.5 bg-surface-dim text-text-muted border border-surface-dim rounded-full mt-1 inline-block">
                        {item.category}
                      </span>
                      {item.minStock !== undefined && (
                        <span className="text-xs px-2 py-0.5 bg-background text-text-muted border border-surface-dim rounded-full mt-1 inline-block">
                          Mín: {item.minStock}{item.unit || 'Kg'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Sistema</div>
                    <div className={`font-mono font-bold ${item.minStock !== undefined && item.systemStock < item.minStock ? 'text-warning' : 'text-text-main'}`}>
                      {item.systemStock.toFixed(item.unit === 'Unid.' ? 0 : 2)} {item.unit || 'Kg'}
                    </div>
                  </div>
                </div>

                <div className="bg-background p-3 rounded-lg flex items-center justify-between border border-surface-dim">
                  <span className="text-sm font-semibold text-text-muted">Contagem Real ({item.unit || 'Kg'})</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={item.physicalStock === null ? '' : item.physicalStock}
                      onChange={(e) => handlePhysicalStockChange(item.id, e.target.value)}
                      placeholder="0.00"
                      className="w-24 text-right p-2 rounded border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary font-mono bg-surface font-bold text-lg"
                    />
                  </div>
                </div>

                {item.physicalStock !== null && (
                  <div className={`flex items-center gap-2 text-sm font-medium p-2 rounded-lg ${hasDifference ? 'bg-warning/10 text-error' : 'bg-primary-light/10 text-primary-dark'}`}>
                    {hasDifference ? (
                      <>
                        <AlertCircle size={16} />
                        Diferença: {diffAmount > 0 ? '+' : ''}{diffAmount.toFixed(item.unit === 'Unid.' ? 0 : 2)} {item.unit || 'Kg'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Estoque Bate!
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
