export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface ProductCreate {
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface ProductUpdate {
  name?: string | null;
  price?: number | null;
  description?: string | null;
  stock?: number | null;
}

export interface TransactionItem {
  product_id: number;
  quantity: number;
}

export interface Transaction {
  id: number;
  items: TransactionItem[];
  total?: number;
  created_at?: string;
}

export interface TransactionCreate {
  items: TransactionItem[];
  created_at?: string;
}
