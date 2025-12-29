// Re-export types
export type {
  Product,
  ProductCreate,
  ProductUpdate,
  Transaction,
  TransactionCreate,
  TransactionItem,
  TransactionItemCreate,
  Discount,
  DiscountCreate,
  DiscountUpdate,
} from "./types";

// Re-export product functions
export {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "./products";

// Re-export transaction functions
export {
  createTransaction,
  getTransaction,
  getTransactions,
} from "./transactions";

// Re-export discount functions
export {
  createDiscount,
  deleteDiscount,
  getDiscount,
  getDiscountByCode,
  getDiscounts,
  updateDiscount,
} from "./discounts";
