export interface Product {
  id: number;
  name: string;
  price: number;
  cogs: number;
  description: string;
  stock: number;
  bundle_quantity: number;
  bundle_price: number;
}

export interface ProductCreate {
  name: string;
  price: number;
  cogs: number;
  description: string;
  stock: number;
  bundle_quantity: number;
  bundle_price: number;
}

export interface ProductUpdate {
  name?: string | null;
  price?: number | null;
  cogs?: number | null;
  description?: string | null;
  stock?: number | null;
  bundle_quantity?: number | null;
  bundle_price?: number | null;
}

export interface TransactionItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  transaction_id: number;
  product_name: string;
}

export interface TransactionItemCreate {
  product_id: number;
  quantity: number;
}

export interface Transaction {
  id: number;
  items: TransactionItem[];
  total_amount: number;
  created_at: string;
}

export interface TransactionCreate {
  items: TransactionItemCreate[];
  created_at?: string;
}
