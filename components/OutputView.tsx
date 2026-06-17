'use client';

import { useState } from 'react';
import { InventoryItem, MasterOutputType, OutputLog } from '@/types';
import { ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface Props {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  masterOutputTypes: MasterOutputType[];
  outputs: OutputLog[];
  setOutputs: React.Dispatch<React.SetStateAction<OutputLog[]>>;
}

export default function OutputView({ inventory, setInventory, masterOutputTypes, outputs, setOutputs }: Props) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [outputType, setOutputType] = useState('');
  const { profile } = useAuth();

  const selectedProduct = inventory.find(i => i.id === selectedProductId);
  const subProductsInInventory = inventory.filter(i => i.unit === 'Unid.');

  const handleDispatch = () => {
    const numAmount = parseFloat(amount);
    if (!selectedProductId || !outputType || isNaN(numAmount) || numAmount <= 0) return;

    if (selectedProduct && numAmount > selectedProduct.systemStock) {
      alert('Quantidade excede o estoque em sistema!');
      return;
    }

    setInventory(inventory.map(item => {
      if (item.id === selectedProductId) {
        return { ...item, systemStock: Math.max(0, item.systemStock - numAmount) };
      }
      return item;
    }));

    const newOutput: OutputLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      productId: selectedProductId,
      productName: selectedProduct?.name || '',
      amount: numAmount,
      outputType,
      operatorNickname: profile?.nickname || 'Usuário'
    };

    setOutputs([newOutput, ...outputs]);

    setAmount('');
    setSelectedProductId('');
    setOutputType('');
    alert(`Saída (${outputType}) registrada com sucesso!`);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-primary-dark">Lançamento de Saída</h2>
        <p className="text-text-muted text-sm">Registre a retirada de produtos em estoque.</p>
      </div>

      <div className="bg-surface p-5 rounded-2xl border border-surface-dim shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted uppercase">Tipo de Saída</label>
          <select 
            value={outputType} 
            onChange={(e) => setOutputType(e.target.value)}
            className="w-full p-3 bg-background border border-surface-dim rounded-lg focus:outline-none focus:border-primary text-text-main font-medium"
          >
            <option value="">-- Selecione --</option>
            {masterOutputTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-text-muted uppercase">Selecionar Produto</label>
          <select 
            value={selectedProductId} 
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full p-3 bg-background border border-surface-dim rounded-lg focus:outline-none focus:border-primary text-text-main font-medium"
          >
            <option value="">-- Selecione --</option>
            {subProductsInInventory.map(item => (
              <option key={item.id} value={item.id}>{item.name} ({item.systemStock.toFixed(0)} disponíveis)</option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-muted uppercase flex justify-between">
               Quantidade (Unid.)
               <span className="text-primary-dark">Max: {selectedProduct.systemStock.toFixed(0)} Unid.</span>
            </label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-right p-4 bg-background border border-surface-dim rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono font-bold text-2xl text-text-main"
            />
          </div>
        )}

        <button 
          onClick={handleDispatch}
          disabled={!selectedProductId || !outputType || parseFloat(amount) <= 0 || (selectedProduct && parseFloat(amount) > selectedProduct.systemStock)}
          className="w-full mt-4 bg-secondary hover:bg-secondary/90 disabled:bg-surface-dim flex items-center justify-center gap-2 disabled:text-text-muted text-white font-bold text-lg p-4 rounded-xl transition-colors shadow-sm"
        >
          <ArrowDownRight /> Confirmar Saída
        </button>
      </div>

    </div>
  );
}
