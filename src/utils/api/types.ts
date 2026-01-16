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
  profit: number | null;
  payment_method: string | null;
}

export interface TransactionCreate {
  items: TransactionItemCreate[];
  created_at?: string;
  discount_code?: string;
  payment_method?: string;
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

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: string;
  payment_method: string;
}

export interface ExpenseCreate {
  amount: number;
  description: string;
  date: string;
  category: string;
  payment_method: string;
}

export interface ExpenseUpdate {
  amount?: number | null;
  description?: string | null;
  date?: string | null;
  category?: string | null;
  payment_method?: string | null;
}

export interface SummaryChartData {
  date: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface SummaryProduct {
  product_id: number;
  product_name: string;
  total_revenue: number;
  quantity_sold: number;
}

export interface SummaryResponse {
  total_revenue: number;
  total_profit: number;
  average_transaction: number;
  total_expenses: number;
  chart_data: SummaryChartData[];
  top_5_products: SummaryProduct[];
  underperforming_products: SummaryProduct[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  emailVerified: boolean;
  image: string | null;
}

export interface UserCreate {
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface UserUpdate {
  role?: "user" | "admin";
}
