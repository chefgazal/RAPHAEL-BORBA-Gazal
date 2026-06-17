'use client';

import { useState } from 'react';
import { Beef, Fish, Droplets, Plus, X } from 'lucide-react';
import { Batch, Category, InventoryItem, SubProduct, MasterCategory, MasterRawProduct, MasterSubProduct } from '@/types';
import { useAuth } from '@/lib/AuthContext';

interface Props {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  masterCategories: MasterCategory[];
  masterRawProducts: MasterRawProduct[];
  masterSubProducts: MasterSubProduct[];
}

export default function ProductionView({ 
  batches, setBatches, inventory, setInventory,
  masterCategories, masterRawProducts, masterSubProducts
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { profile } = useAuth();

  if (isFormOpen) {
    return (
      <NewBatchForm 
        masterCategories={masterCategories}
        masterRawProducts={masterRawProducts}
        masterSubProducts={masterSubProducts}
        operatorNickname={profile?.nickname || 'Usuário'}
        onClose={() => setIsFormOpen(false)}
        onSave={(newBatch) => {
          setBatches([newBatch, ...batches]);
          // Update inventory implicitly based on subproducts
          const updatedInventory = [...inventory];
          newBatch.subProducts.forEach(sp => {
            const existing = updatedInventory.find(i => i.name.toLowerCase() === sp.name.toLowerCase());
            if (existing) {
              existing.systemStock += sp.portions;
              if (sp.minStock) existing.minStock = sp.minStock;
              existing.unit = 'Unid.';
            } else {
              updatedInventory.push({
                id: Math.random().toString(36).substr(2, 9),
                name: sp.name,
                category: newBatch.category as Category,
                systemStock: sp.portions,
                physicalStock: null,
                minStock: sp.minStock,
                unit: 'Unid.'
              });
            }
          });
          setInventory(updatedInventory);
          setIsFormOpen(false);
        }}
      />
    );
  }

  const openForm = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-primary-dark">Lançamento Rápido</h2>
        <p className="text-text-muted text-sm">Selecione a categoria para iniciar a produção.</p>
      </div>

      <div className="pt-2 pb-4">
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg p-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus size={24} /> Nova Produção
        </button>
      </div>

      <div className="pt-4">
        <h3 className="font-semibold text-lg mb-4 text-text-main">Últimos Lançamentos</h3>
        {batches.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-xl border border-surface-dim">
            <p className="text-text-muted">Nenhum lançamento no histórico recente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.slice(0, 5).map(b => (
              <div key={b.id} className="p-4 bg-surface rounded-xl border border-surface-dim flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-main flex items-center gap-2">
                    {b.rawItemName} 
                    <span className="text-xs px-2 py-0.5 bg-primary-light/20 text-primary-dark rounded-full">
                      {b.category}
                    </span>
                  </div>
                  <div className="text-sm text-text-muted mt-1 space-y-1">
                    <div className="flex gap-2 items-center">
                      <span>Entrada: {b.rawWeight}kg</span> 
                      <span>•</span>
                      <span>Aparas: {b.wastePercent.toFixed(1)}%</span>
                      {b.operatorNickname && (
                        <>
                           <span>•</span>
                           <span className="bg-surface-dim px-1.5 py-0.5 rounded text-text-main font-medium text-xs">Por: {b.operatorNickname}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-text-muted/80">
                      Cortes: {b.subProducts.map(sp => `${sp.portions}x ${sp.name} (${sp.weight}g)`).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">{new Date(b.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewBatchForm({ 
  onClose, 
  onSave,
  masterCategories,
  masterRawProducts,
  masterSubProducts,
  operatorNickname
}: { 
  onClose: () => void, 
  onSave: (b: Batch) => void,
  masterCategories: MasterCategory[],
  masterRawProducts: MasterRawProduct[],
  masterSubProducts: MasterSubProduct[],
  operatorNickname: string
}) {
  const [category, setCategory] = useState('');
  const [rawItemName, setRawItemName] = useState('');
  const [rawWeight, setRawWeight] = useState('');
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);

  const totalSubWeightInKg = subProducts.reduce((acc, curr) => acc + (((curr.weight || 0) * (curr.portions || 0)) / 1000), 0);
  const rawWeightNum = parseFloat(rawWeight) || 0;
  const wasteWeight = Math.max(0, rawWeightNum - totalSubWeightInKg);
  const wastePercent = rawWeightNum > 0 ? (wasteWeight / rawWeightNum) * 100 : 0;

  const handleAddSubProduct = () => {
    setSubProducts([...subProducts, { id: Math.random().toString(), name: '', weight: 0, portions: 0 }]);
  };

  const updateSubProduct = (index: number, field: keyof SubProduct, value: string | number) => {
    const updated = [...subProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSubProducts(updated);
  };

  const handleSave = () => {
    if (!rawItemName || rawWeightNum <= 0) return alert('Preencha o nome e peso inicial válidos.');
    
    const newBatch: Batch = {
      id: `LOTE-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      category,
      rawItemName,
      rawWeight: rawWeightNum,
      subProducts: subProducts.filter(sp => sp.name && sp.weight > 0),
      wasteWeight,
      wastePercent,
      operatorNickname
    };
    onSave(newBatch);
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold bg-primary-light/20 text-primary-dark px-3 py-1 rounded-lg">Novo Lote: {category}</h2>
        <button onClick={onClose} className="text-text-muted hover:text-text-main font-medium">Cancelar</button>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <div className="p-4 bg-surface rounded-xl border border-surface-dim shadow-sm space-y-4">
          <h3 className="font-semibold text-text-main">1. Entrada Bruta</h3>
          <div>
            <label className="block text-sm font-semibold mb-1 text-text-muted uppercase tracking-wider">Categoria</label>
            <select 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setRawItemName(''); // reset raw item when category changes
              }}
              className="w-full p-3 bg-background border border-surface-dim rounded-lg focus:outline-none focus:border-primary transition-colors text-lg"
            >
              <option value="">Selecione...</option>
              {masterCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-text-muted uppercase tracking-wider">Produto Origem</label>
            <select 
              value={rawItemName}
              onChange={(e) => setRawItemName(e.target.value)}
              className="w-full p-3 bg-background border border-surface-dim rounded-lg focus:outline-none focus:border-primary transition-colors text-lg"
              disabled={!category}
            >
              <option value="">Selecione...</option>
              {masterRawProducts
                .filter(r => masterCategories.find(c => c.id === r.categoryId)?.name === category)
                .map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-text-muted uppercase tracking-wider">Peso Recebido (Kg)</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={rawWeight}
              onChange={(e) => setRawWeight(e.target.value)}
              className="w-full p-3 bg-background border border-surface-dim rounded-lg focus:outline-none focus:border-primary transition-colors text-lg font-mono"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-4 bg-surface rounded-xl border border-surface-dim shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-text-main">2. Subprodutos Gerados</h3>
            <button onClick={handleAddSubProduct} className="text-primary font-medium text-sm flex items-center gap-1 bg-primary-light/10 px-2 py-1 rounded-md">
              <Plus size={16} /> Adicionar
            </button>
          </div>
          
          {subProducts.length === 0 && (
            <p className="text-sm text-text-muted italic text-center py-4">Nenhum subproduto adicionado.</p>
          )}

          <div className="space-y-3">
            {subProducts.map((sp, idx) => (
              <div key={sp.id} className="flex flex-col gap-2 p-3 bg-background border border-surface-dim rounded-lg relative">
                <button 
                  onClick={() => setSubProducts(subProducts.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 text-text-muted hover:text-error"
                >
                  <X size={16} />
                </button>
                <select 
                  value={sp.name}
                  onChange={(e) => {
                    const selectedSp = masterSubProducts.find(x => x.name === e.target.value);
                    const updated = [...subProducts];
                    updated[idx] = { ...updated[idx], name: e.target.value, minStock: selectedSp?.minStock };
                    setSubProducts(updated);
                  }}
                  className="w-full p-2 bg-transparent border-b border-surface-dim focus:outline-none focus:border-primary font-medium"
                >
                  <option value="">Selecione o corte...</option>
                  {masterSubProducts
                    .filter(s => masterCategories.find(c => c.id === s.categoryId)?.name === category)
                    .map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase text-text-muted font-bold mb-1">Peso (g)</label>
                    <input 
                      type="number" 
                      value={sp.weight || ''}
                      onChange={(e) => updateSubProduct(idx, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-surface rounded focus:outline-none ring-1 ring-surface-dim focus:ring-primary font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-text-muted font-bold mb-1">Porções</label>
                    <input 
                      type="number" 
                      value={sp.portions || ''}
                      onChange={(e) => updateSubProduct(idx, 'portions', parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-surface rounded focus:outline-none ring-1 ring-surface-dim focus:ring-primary font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-text-muted font-bold mb-1">Estoque Mín. (Un.)</label>
                    <input 
                      type="number" 
                      value={sp.minStock || ''}
                      onChange={(e) => updateSubProduct(idx, 'minStock', parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-surface rounded focus:outline-none ring-1 ring-surface-dim focus:ring-primary font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-4 bg-surface rounded-xl border border-surface-dim shadow-sm space-y-3">
          <h3 className="font-semibold text-text-main">3. Resumo e Aparas</h3>
          
          <div className="flex justify-between items-center text-sm border-b border-surface-dim pb-2">
            <span className="text-text-muted">Total Processado</span>
            <span className="font-mono font-medium">{totalSubWeightInKg.toFixed(2)} kg</span>
          </div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-text-main flex items-center gap-2">
              Aparas (Desperdício)
              {wastePercent > 20 && <span className="bg-error/10 text-error text-xs px-2 py-0.5 rounded-full">Alto</span>}
            </span>
            <span className="font-mono text-warning">{wasteWeight.toFixed(2)} kg <span className="text-sm">({wastePercent.toFixed(1)}%)</span></span>
          </div>

          {rawWeightNum > 0 && totalSubWeightInKg > rawWeightNum && (
            <p className="text-error text-sm font-medium mt-2">Atenção: A soma dos subprodutos é maior que a entrada bruta!</p>
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={rawWeightNum <= 0 || totalSubWeightInKg > rawWeightNum}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-surface-dim disabled:text-text-muted text-white font-bold text-lg p-4 rounded-xl transition-colors shadow-sm"
        >
          Confirmar Produção
        </button>
      </div>
    </div>
  );
}
