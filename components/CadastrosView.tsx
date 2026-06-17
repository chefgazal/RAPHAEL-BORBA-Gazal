'use client';

import { useState } from 'react';
import { MasterCategory, MasterRawProduct, MasterSubProduct, MasterOutputType } from '@/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Props {
  masterCategories: MasterCategory[];
  setMasterCategories: React.Dispatch<React.SetStateAction<MasterCategory[]>>;
  masterRawProducts: MasterRawProduct[];
  setMasterRawProducts: React.Dispatch<React.SetStateAction<MasterRawProduct[]>>;
  masterSubProducts: MasterSubProduct[];
  setMasterSubProducts: React.Dispatch<React.SetStateAction<MasterSubProduct[]>>;
  masterOutputTypes: MasterOutputType[];
  setMasterOutputTypes: React.Dispatch<React.SetStateAction<MasterOutputType[]>>;
}

export default function CadastrosView({ 
  masterCategories, setMasterCategories, 
  masterRawProducts, setMasterRawProducts, 
  masterSubProducts, setMasterSubProducts,
  masterOutputTypes, setMasterOutputTypes
}: Props) {
  const [activeTab, setActiveTab] = useState<'categories' | 'raws' | 'subs' | 'outTypes'>('categories');

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-primary-dark">Cadastros Base</h2>
        <p className="text-text-muted text-sm">Gerencie as categorias e produtos disponíveis para lançamento.</p>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-surface-dim rounded-xl border border-surface-dim">
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
        >
          Categorias
        </button>
        <button 
          onClick={() => setActiveTab('raws')}
          className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'raws' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
        >
          Produto Origem
        </button>
        <button 
          onClick={() => setActiveTab('subs')}
          className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'subs' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
        >
          Subprodutos
        </button>
        <button 
          onClick={() => setActiveTab('outTypes')}
          className={`flex-1 py-2 px-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'outTypes' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
        >
          Tipos Saída
        </button>
      </div>

      {activeTab === 'categories' && (
        <CategoriesList data={masterCategories} onSave={(v) => setMasterCategories(v)} />
      )}
      {activeTab === 'raws' && (
        <RawsList data={masterRawProducts} categories={masterCategories} onSave={(v) => setMasterRawProducts(v)} />
      )}
      {activeTab === 'subs' && (
        <SubsList data={masterSubProducts} categories={masterCategories} onSave={(v) => setMasterSubProducts(v)} />
      )}
      {activeTab === 'outTypes' && (
        <OutputTypesList data={masterOutputTypes} onSave={(v) => setMasterOutputTypes(v)} />
      )}

    </div>
  );
}

function OutputTypesList({ data, onSave }: { data: MasterOutputType[], onSave: (v: MasterOutputType[]) => void }) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onSave([...data, { id: Math.random().toString(36).substr(2, 9), name: newName.trim() }]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    if(confirm('Tem certeza que deseja remover este tipo de saída?'))
      onSave(data.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
          placeholder="Novo Tipo de Saída (Ex: Venda, Descarte)" 
          className="flex-1 p-3 rounded-lg border border-surface-dim bg-surface focus:outline-none focus:border-primary font-medium"
        />
        <button onClick={handleAdd} className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark">
          <Plus />
        </button>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-surface-dim bg-surface">
            <span className="font-semibold text-text-main">{item.name}</span>
            <button onClick={() => handleRemove(item.id)} className="text-text-muted hover:text-error p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesList({ data, onSave }: { data: MasterCategory[], onSave: (v: MasterCategory[]) => void }) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onSave([...data, { id: Math.random().toString(36).substr(2, 9), name: newName.trim() }]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    if(confirm('Tem certeza? Remover pode quebrar o histórico vinculado.'))
      onSave(data.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
          placeholder="Nova Categoria" 
          className="flex-1 p-3 rounded-lg border border-surface-dim bg-surface focus:outline-none focus:border-primary font-medium"
        />
        <button onClick={handleAdd} className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark">
          <Plus />
        </button>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-surface-dim bg-surface">
            <span className="font-semibold text-text-main">{item.name}</span>
            <button onClick={() => handleRemove(item.id)} className="text-text-muted hover:text-error p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RawsList({ data, categories, onSave }: { data: MasterRawProduct[], categories: MasterCategory[], onSave: (v: MasterRawProduct[]) => void }) {
  const [newName, setNewName] = useState('');
  const [catId, setCatId] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !catId) return alert('Selecione uma categoria e informe o nome.');
    onSave([...data, { id: Math.random().toString(36).substr(2, 9), categoryId: catId, name: newName.trim() }]);
    setNewName('');
  };

  const handleRemove = (id: string) => {
    if(confirm('Tem certeza?')) onSave(data.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 bg-surface p-4 border border-surface-dim rounded-xl">
        <select value={catId} onChange={e => setCatId(e.target.value)} className="p-3 rounded-lg border border-surface-dim bg-background focus:outline-none font-medium">
          <option value="">Selecione a Categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            placeholder="Nome do Produto Origem (ex: Salmão Inteiro)" 
            className="flex-1 p-3 rounded-lg border border-surface-dim bg-background focus:outline-none focus:border-primary font-medium"
          />
          <button onClick={handleAdd} className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark">
            <Plus />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {data.map(item => {
          const cat = categories.find(c => c.id === item.categoryId);
          return (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-surface-dim bg-surface">
              <div>
                <span className="font-semibold text-text-main">{item.name}</span>
                <span className="block text-xs uppercase text-text-muted mt-1">{cat?.name || 'Sem Categoria'}</span>
              </div>
              <button onClick={() => handleRemove(item.id)} className="text-text-muted hover:text-error p-2">
                <Trash2 size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function SubsList({ data, categories, onSave }: { data: MasterSubProduct[], categories: MasterCategory[], onSave: (v: MasterSubProduct[]) => void }) {
  const [newName, setNewName] = useState('');
  const [catId, setCatId] = useState('');
  const [minStock, setMinStock] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !catId) return alert('Selecione uma categoria e informe o nome.');
    onSave([...data, { id: Math.random().toString(36).substr(2, 9), categoryId: catId, name: newName.trim(), minStock: parseFloat(minStock) || undefined }]);
    setNewName('');
    setMinStock('');
  };

  const handleRemove = (id: string) => {
    if(confirm('Tem certeza?')) onSave(data.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 bg-surface p-4 border border-surface-dim rounded-xl">
        <select value={catId} onChange={e => setCatId(e.target.value)} className="p-3 rounded-lg border border-surface-dim bg-background focus:outline-none font-medium">
          <option value="">Selecione a Categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="grid grid-cols-[1fr_100px_auto] gap-2">
          <input 
            type="text" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            placeholder="Subproduto (ex: Medalhão)" 
            className="w-full p-3 rounded-lg border border-surface-dim bg-background focus:outline-none focus:border-primary font-medium"
          />
          <input 
            type="number" 
            value={minStock} 
            onChange={e => setMinStock(e.target.value)} 
            placeholder="Mín. (Un.)" 
            className="w-full p-3 rounded-lg border border-surface-dim bg-background focus:outline-none focus:border-primary font-medium text-center"
          />
          <button onClick={handleAdd} className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark flex items-center justify-center min-w-[48px]">
            <Plus />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {data.map(item => {
          const cat = categories.find(c => c.id === item.categoryId);
          return (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-surface-dim bg-surface">
              <div>
                <div className="font-semibold text-text-main flex items-center gap-2">
                  {item.name}
                  {item.minStock !== undefined && (
                    <span className="text-[10px] bg-background text-text-muted border border-surface-dim px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Mín: {item.minStock}kg</span>
                  )}
                </div>
                <span className="block text-xs uppercase text-text-muted mt-1">{cat?.name || 'Sem Categoria'}</span>
              </div>
              <button onClick={() => handleRemove(item.id)} className="text-text-muted hover:text-error p-2">
                <Trash2 size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
