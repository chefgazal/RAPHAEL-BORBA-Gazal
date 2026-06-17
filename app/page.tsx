'use client';

import { useState, useEffect } from 'react';
import { ChefHat, ClipboardList, ArrowUpRight, BarChart2, Bell, X, Beef, Fish, Droplets, Settings, LogOut } from 'lucide-react';
import { TabId, Batch, InventoryItem, Category, MasterCategory, MasterRawProduct, MasterSubProduct, MasterOutputType } from '@/types';
import ProductionView from '@/components/ProductionView';
import InventoryView from '@/components/InventoryView';
import OutputView from '@/components/OutputView';
import AdminView from '@/components/AdminView';
import CadastrosView from '@/components/CadastrosView';
import AuthView from '@/components/AuthView';
import { useAuth } from '@/lib/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const { user, profile, isLoaded: isAuthLoaded } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [outputs, setOutputs] = useState<any[]>([]); // Added for output logs
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [masterRawProducts, setMasterRawProducts] = useState<MasterRawProduct[]>([]);
  const [masterSubProducts, setMasterSubProducts] = useState<MasterSubProduct[]>([]);
  const [masterOutputTypes, setMasterOutputTypes] = useState<MasterOutputType[]>([]);

  // Load state
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(false);
      return;
    }
    
    const loadData = async () => {
      const docRef = doc(db, 'company_data', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.batches) setBatches(data.batches);
        if (data.inventory) setInventory(data.inventory);
        if (data.outputs) setOutputs(data.outputs);
        if (data.cats) setMasterCategories(data.cats);
        if (data.raws) setMasterRawProducts(data.raws);
        if (data.subs) setMasterSubProducts(data.subs);
        if (data.outTypes) setMasterOutputTypes(data.outTypes);
      } else {
        setMasterCategories([
          { id: '1', name: 'Carne' },
          { id: '2', name: 'Peixe' },
          { id: '3', name: 'Frutos do Mar' },
        ]);
        setMasterRawProducts([
          { id: '1', categoryId: '1', name: 'Filé Mignon Inteiro' },
          { id: '2', categoryId: '2', name: 'Salmão Inteiro' },
        ]);
        setMasterSubProducts([
          { id: '1', categoryId: '1', name: 'Filé Trinchado' },
          { id: '2', categoryId: '1', name: 'Filé à la Carte' },
          { id: '3', categoryId: '1', name: 'Filé Kids' },
        ]);
        setMasterOutputTypes([
          { id: '1', name: 'Venda' },
          { id: '2', name: 'Descarte' },
          { id: '3', name: 'Degustação' },
        ]);
        setInventory([
          { id: '1', name: 'Filé Mignon Inteiro', category: 'Carne', systemStock: 45.0, physicalStock: null },
          { id: '2', name: 'Salmão (Filé)', category: 'Peixe', systemStock: 25.0, physicalStock: null },
          { id: '3', name: 'Camarão (Limpo)', category: 'Frutos do Mar', systemStock: 12.0, physicalStock: null },
        ]);
      }
      setIsLoaded(true);
    };
    loadData();
  }, [user]);

  // Save state
  useEffect(() => {
    if (isLoaded && user) {
      setDoc(doc(db, 'company_data', user.uid), {
        batches,
        inventory,
        outputs,
        cats: masterCategories,
        raws: masterRawProducts,
        subs: masterSubProducts,
        outTypes: masterOutputTypes
      }, { merge: true });
    }
  }, [batches, inventory, outputs, masterCategories, masterRawProducts, masterSubProducts, masterOutputTypes, isLoaded, user]);

  if (!isLoaded || !isAuthLoaded) return null;

  if (!user) {
    return <AuthView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <ProductionView batches={batches} setBatches={setBatches} inventory={inventory} setInventory={setInventory} masterCategories={masterCategories} masterRawProducts={masterRawProducts} masterSubProducts={masterSubProducts} />;
      case 'estoque': return <InventoryView inventory={inventory} setInventory={setInventory} />;
      case 'saida': return <OutputView inventory={inventory} setInventory={setInventory} masterOutputTypes={masterOutputTypes} outputs={outputs} setOutputs={setOutputs} />;
      case 'admin': return <AdminView batches={batches} masterCategories={masterCategories} masterSubProducts={masterSubProducts} />;
      case 'cadastros': return <CadastrosView masterCategories={masterCategories} setMasterCategories={setMasterCategories} masterRawProducts={masterRawProducts} setMasterRawProducts={setMasterRawProducts} masterSubProducts={masterSubProducts} setMasterSubProducts={setMasterSubProducts} masterOutputTypes={masterOutputTypes} setMasterOutputTypes={setMasterOutputTypes} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto md:border-x md:border-surface-dim bg-background">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-dim sticky top-0 z-10">
        <div className="flex items-center gap-2 text-primary">
          <X className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-primary-dark">GR Produção</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold truncate max-w-[100px] text-text-muted">Olá, {profile?.nickname || 'Usuário'}</span>
          <button onClick={() => auth.signOut()} className="p-2 text-text-muted hover:text-error transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-7xl bg-surface border-t border-surface-dim flex justify-around items-center px-1 py-1">
        <NavButton id="home" icon={<ChefHat size={20} />} label="Produção" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton id="estoque" icon={<ClipboardList size={20} />} label="Estoque" isActive={activeTab === 'estoque'} onClick={() => setActiveTab('estoque')} />
        <NavButton id="saida" icon={<ArrowUpRight size={20} />} label="Saída" isActive={activeTab === 'saida'} onClick={() => setActiveTab('saida')} />
        <NavButton id="admin" icon={<BarChart2 size={20} />} label="Admin" isActive={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        <NavButton id="cadastros" icon={<Settings size={20} />} label="Cadastros" isActive={activeTab === 'cadastros'} onClick={() => setActiveTab('cadastros')} />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }: { id: TabId, icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 h-16 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
    >
      <div className={`mb-1 p-1 rounded-full ${isActive ? 'bg-primary-light/20' : ''}`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
