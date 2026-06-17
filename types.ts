export type Category = string;

export interface SubProduct {
  id: string;
  name: string;
  weight: number;
  portions: number;
  minStock?: number;
}

export interface Batch {
  id: string;
  date: string; // ISO String
  category: Category;
  rawItemName: string;
  rawWeight: number; // kg
  subProducts: SubProduct[];
  wasteWeight: number; // kg
  wastePercent: number; // %
  operatorNickname?: string; // Appended
}

export interface OutputLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  amount: number;
  outputType: string;
  operatorNickname: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  systemStock: number; // qt
  physicalStock: number | null; // qt
  minStock?: number; // qt
  unit?: string; // 'Kg' | 'Unid.' | 'g'
}

export interface MasterCategory {
  id: string;
  name: string;
}

export interface MasterRawProduct {
  id: string;
  categoryId: string; // references MasterCategory
  name: string;
}

export interface MasterSubProduct {
  id: string;
  categoryId: string; // references MasterCategory
  name: string;
  minStock?: number;
}

export interface MasterOutputType {
  id: string;
  name: string;
}

export type TabId = 'home' | 'estoque' | 'saida' | 'admin' | 'cadastros';
