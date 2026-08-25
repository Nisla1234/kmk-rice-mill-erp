export type MainNavKey = 'dashboard' | 'rmr' | 'production' | 'sales' | 'finance' | 'payroll' | 'ai';

export type RmrSubKey = 'paddy' | 'outstanding' | 'ledger';
export type ProductionSubKey = 'finished' | 'byproducts' | 'flour' | 'stock';
export type SalesSubKey = 'billing' | 'settlements' | 'custledger';
export type FinanceSubKey = 'cashbook' | 'cheque';

export type SubNavKey = RmrSubKey | ProductionSubKey | SalesSubKey | FinanceSubKey | string;

export interface NavItem {
  key: MainNavKey;
  label: string;
  pending: boolean;
  sub: { key: string; label: string }[];
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  nic: string;
  location: string;
}

export interface Variety {
  id: string;
  name: string;
  price: number; // LKR / kg
}

export interface DeliveryItem {
  variety: string;
  weight: number; // kg
  price: number;  // LKR / kg
}

export interface Delivery {
  ref: string;
  date: string;
  supplierId: string;
  payment: 'Cash' | 'Credit';
  items: DeliveryItem[];
  note: string;
}

export interface Payment {
  ref: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Bank Transfer' | 'Cheque';
  refNo: string;
  desc: string;
}

/* Production Types */
export interface FinishedProduct {
  id: string;
  name: string;
  processType: 'Parboiled' | 'Raw';
  variety: string;
  unitPrice: number; // LKR / kg
  weight: number;    // kg per bag
}

export interface FinishedBatchOutput {
  productId: string;
  packets: number;
}

export interface FinishedBatch {
  batchNo: string;
  date: string;
  variety: string;
  paddyInput: number; // kg
  processType: 'Parboiled' | 'Raw';
  operator: string;
  outputs: FinishedBatchOutput[];
}

export interface ByProduct {
  id: string;
  name: string;
  variety: string;
  processType: 'Parboiled' | 'Raw';
  unitPrice: number; // LKR / kg
}

export interface ByProductBatch {
  id: number;
  batchNo: string;
  date: string;
  productId: string;
  out: number; // kg
}

export interface FlourProduct {
  id: string;
  name: string;
  packetSize: number; // kg
  unitPrice: number;  // LKR / kg
}

export interface FlourBatchOutput {
  productId: string;
  packets: number;
}

export interface FlourBatch {
  batchNo: string;
  date: string;
  variety?: string;
  brokenRiceInput?: number;
  outputs: FlourBatchOutput[];
}

/* Sales & Billing Types */
export interface ClientBranch {
  name: string;
  location: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  location: string;
  type: 'Finished Product' | 'By-Product';
  branchType: 'Single' | 'Multiple';
  branches: ClientBranch[];
  openingOutstanding: number;
}

export interface SalesTeam {
  id: string;
  lorryNo: string;
  salesRep: string;
  driver: string;
  helper: string;
}

export interface InvoiceItem {
  category: 'Finished Products' | 'Rice Flour' | 'By-Products';
  productId: string;
  productName: string;
  unitPrice: number;
  weight?: number;
  qty: number;
  total: number;
}

export interface Invoice {
  invoiceNo: string;
  date: string;
  clientId: string;
  branch: string;
  salesTeamId: string;
  items: InvoiceItem[];
  totalAmount: number;
}

export interface Settlement {
  id: number;
  invoiceNo: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Cheque';
  chequeNo: string;
}

/* Finance Types */
export interface CashCategory {
  id: string;
  name: string;
  type: 'Income' | 'Expense';
}

export interface CashEntry {
  id: number;
  date: string;
  categoryId: string;
  description: string;
  paymentMethod: 'Cash' | 'Cheque';
  amount: number;
  type: 'Income' | 'Expense';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Cheque {
  id: string;
  date: string;
  type: 'Received' | 'Issued';
  partyId: string; // client or supplier id
  salesTeamId?: string | null;
  bank: string;
  chequeNo: string;
  chequeDate: string;
  amount: number;
  status: 'Pending' | 'Allocated' | 'Returned';
  allocatedBankAccountId?: string | null;
}

/* Payroll Types */
export interface Employee {
  id: string;
  name: string;
  phone: string;
  joinedDate: string;
  workType: string;
  department: 'Rice Mill' | 'Flour Mill' | 'Sales Team';
}

export interface Deduction {
  reason: string;
  amount: number;
}

export interface PayrollEntry {
  id: number;
  weekEnding: string;
  department: 'Rice Mill' | 'Flour Mill' | 'Sales Team';
  employeeId: string;
  grossPay: number;
  deductions: Deduction[];
  netPay: number;
}

/* AI Assistant */
export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}
