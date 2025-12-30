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
  discount: string | null;
}

export interface TransactionCreate {
  items: TransactionItemCreate[];
  created_at?: string;
  discount_code?: string;
}

export interface Discount {
  id: number;
  name: string;
  code: string;
  type: "individual_item" | "for_all_item";
  percentage: number;
  product_id: number;
}

export interface DiscountCreate {
  name: string;
  code: string;
  type: "individual_item" | "for_all_item";
  percentage: number;
  product_id?: number;
}

export interface DiscountUpdate {
  name?: string | null;
  code?: string | null;
  type?: "individual_item" | "for_all_item" | null;
  percentage?: number | null;
  product_id?: number | null;
}
