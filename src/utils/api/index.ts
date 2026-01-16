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
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  SummaryResponse,
  SummaryChartData,
  SummaryProduct,
  User,
  UserCreate,
  UserUpdate,
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

// Re-export expense functions
export {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "./expenses";

// Re-export summary functions
export { getSummary } from "./summary";

// Re-export user functions
export {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "./users";
