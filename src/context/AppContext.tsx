import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  MainNavKey,
  Supplier,
  Variety,
  Delivery,
  Payment,
  FinishedProduct,
  FinishedBatch,
  ByProduct,
  ByProductBatch,
  FlourProduct,
  FlourBatch,
  Client,
  SalesTeam,
  Invoice,
  Settlement,
  CashCategory,
  CashEntry,
  BankAccount,
  Cheque,
  Employee,
  PayrollEntry,
  ChatMessage,
} from '../types';
import { todayISO, fmtDate, fmtNum, fmtKg, daysBetween, upcomingSaturdayISO } from '../utils/formatters';

interface AppContextType {
  // Navigation
  activeMain: MainNavKey;
  activeSub: string;
  setActiveMain: (key: MainNavKey) => void;
  setActiveSub: (key: string) => void;
  period: 'daily' | 'weekly' | 'monthly';
  setPeriod: (p: 'daily' | 'weekly' | 'monthly') => void;
  stockTab: 'finished' | 'flour' | 'byproducts';
  setStockTab: (tab: 'finished' | 'flour' | 'byproducts') => void;
  chequeTab: 'received' | 'issued' | 'pending';
  setChequeTab: (tab: 'received' | 'issued' | 'pending') => void;
  cashDate: string;
  setCashDate: (d: string) => void;
  payrollWeek: string;
  setPayrollWeek: (w: string) => void;
  payrollDept: 'Rice Mill' | 'Flour Mill' | 'Sales Team';
  setPayrollDept: (d: 'Rice Mill' | 'Flour Mill' | 'Sales Team') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Current User (Ready for Supabase Auth)
  currentUser: {
    name: string;
    role: string;
    email: string;
    avatar: string;
    branch: string;
    millName: string;
  };
  setCurrentUser: React.Dispatch<
    React.SetStateAction<{
      name: string;
      role: string;
      email: string;
      avatar: string;
      branch: string;
      millName: string;
    }>
  >;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Data
  suppliers: Supplier[];
  varieties: Variety[];
  deliveries: Delivery[];
  payments: Payment[];
  finishedProducts: FinishedProduct[];
  finishedBatches: FinishedBatch[];
  byProducts: ByProduct[];
  byProductBatches: ByProductBatch[];
  flourProducts: FlourProduct[];
  flourBatches: FlourBatch[];
  clients: Client[];
  salesTeams: SalesTeam[];
  invoices: Invoice[];
  settlements: Settlement[];
  cashCategories: CashCategory[];
  cashEntries: CashEntry[];
  bankAccounts: BankAccount[];
  cheques: Cheque[];
  employees: Employee[];
  payrollEntries: PayrollEntry[];
  chatMessages: ChatMessage[];
  aiTyping: boolean;

  // Helpers
  supplierById: (id: string) => Supplier | undefined;
  varietyById: (id: string) => Variety | undefined;
  clientById: (id: string) => Client | undefined;
  invoiceById: (invoiceNo: string) => Invoice | undefined;
  salesTeamById: (id: string) => SalesTeam | undefined;
  cashCategoryById: (id: string) => CashCategory | undefined;
  bankAccountById: (id: string) => BankAccount | undefined;
  chequeById: (id: string) => Cheque | undefined;
  employeeById: (id: string) => Employee | undefined;
  totalWeight: (d: Delivery) => number;
  totalAmount: (d: Delivery) => number;
  computeStockTotals: () => { total: number; byVariety: Record<string, number> };
  computeFinishedStock: () => (FinishedProduct & { stockBags: number; totalKg: number })[];
  computeByProductStock: () => (ByProduct & { stockKg: number })[];
  computeFlourStock: () => (FlourProduct & { stockPackets: number; stockKg: number; totalKg: number })[];
  salesTotals: () => { totalSales: number; totalCollected: number; totalOutstanding: number };
  chequeTotals: () => { pendingTotal: number; receivedTotal: number; issuedTotal: number };
  payrollSummary: () => { deptGrossPay: number; deptDeductions: number; deptNetPay: number; allDeptsNetPay: number };
  customerLedgerEntries: (clientId: string) => { date: string; ref: string; debit: number; credit: number; balance: number }[];
  outstandingList: () => { d: Delivery; paid: number; bal: number; days: number }[];
  ledgerEntries: (supplierId: string) => { date: string; ref: string; debit: number; credit: number; balance: number }[];
  finishedProductWeight: (productId: string) => number;
  finishedOutputSum: (b: FinishedBatch) => number;
  flourOutputSum: (b: FlourBatch) => number;
  finishedTotals: () => { paddyTotal: number; byVariety: Record<string, number>; avgYield: number };
  byProductTotals: () => { product: ByProduct; total: number }[];
  flourTotals: () => { product: FlourProduct; weight: number; packets: number }[];
  flourFlatRows: () => { batchNo: string; date: string; product?: FlourProduct; weight: number; packets: number; outIdx: number }[];
  stockRows: () => { date: string; batchNo: string; item: string; qtyKg: number; qtyPackets: number | null; type: string }[];
  invoiceSettledAmount: (invoiceNo: string) => number;
  invoiceOutstanding: (invoiceNo: string) => number;
  clientOutstandingTotal: (clientId: string) => number;
  previousOutstanding: (clientId: string, excludeInvoiceNo?: string) => number;
  invoiceGrandTotal: (inv: Invoice) => number;
  custLedgerRowsFor: (clientId: string) => { date: string; ref: string; debit: number; credit: number; balance: number }[];
  cashBalancesAsOf: (dateExclusive: string) => { cash: number; cheque: number };
  payrollWeekTotals: (week: string) => Record<string, { gross: number; deductions: number; net: number }> & { grandNet: number };

  // CRUD Actions
  saveFarmer: (name: string, phone: string, nic: string, location: string) => void;
  saveVariety: (name: string, price: number) => void;
  saveDelivery: (delivery: Delivery, isEdit: boolean) => void;
  deleteDelivery: (ref: string) => void;
  savePayment: (payment: Payment) => void;
  
  saveFinishedProduct: (p: Omit<FinishedProduct, 'id'>) => void;
  updateFinishedProductPrice: (id: string, price: number) => void;
  deleteFinishedProduct: (id: string) => void;
  saveFinishedBatch: (b: FinishedBatch, isEdit: boolean) => void;
  deleteFinishedBatch: (batchNo: string) => void;

  saveByProduct: (p: Omit<ByProduct, 'id'>) => void;
  updateByProductPrice: (id: string, price: number) => void;
  deleteByProduct: (id: string) => void;
  saveByProductBatch: (b: ByProductBatch, isEdit: boolean) => void;
  deleteByProductBatch: (id: number) => void;

  saveFlourProduct: (p: Omit<FlourProduct, 'id'>) => void;
  updateFlourProductPrice: (id: string, price: number) => void;
  deleteFlourProduct: (id: string) => void;
  saveFlourBatch: (b: FlourBatch, isEdit: boolean) => void;
  deleteFlourBatch: (batchNo: string) => void;

  saveClient: (client: Client, isEdit: boolean) => void;
  deleteClient: (id: string) => void;
  saveSalesTeam: (team: SalesTeam, isEdit: boolean) => void;
  deleteSalesTeam: (id: string) => void;
  saveInvoice: (invoice: Invoice, isEdit: boolean) => void;
  deleteInvoice: (invoiceNo: string) => void;
  saveSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  deleteSettlement: (id: number) => void;

  saveCashCategory: (name: string, type: 'Income' | 'Expense') => void;
  saveCashEntry: (entry: CashEntry, isEdit: boolean) => void;
  deleteCashEntry: (id: number) => void;

  saveBankAccount: (name: string, accNo: string, accName: string) => void;
  saveCheque: (cheque: Cheque, isEdit: boolean) => void;
  deleteCheque: (id: string) => void;
  allocateCheque: (chequeId: string, bankAccountId: string) => void;
  returnCheque: (chequeId: string) => void;
  rescheduleCheque: (chequeId: string, newDate: string) => void;

  saveEmployee: (employee: Employee, isEdit: boolean) => void;
  deleteEmployee: (id: string) => void;
  savePayrollEntry: (entry: PayrollEntry, isEdit: boolean) => void;
  deletePayrollEntry: (id: number) => void;

  sendAIMessage: (text: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMain, setActiveMain] = useState<MainNavKey>('rmr');
  const [activeSub, setActiveSub] = useState<string>('paddy');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stockTab, setStockTab] = useState<'finished' | 'flour' | 'byproducts'>('finished');
  const [chequeTab, setChequeTab] = useState<'received' | 'issued' | 'pending'>('received');
  const [cashDate, setCashDate] = useState<string>(todayISO());
  const [payrollWeek, setPayrollWeek] = useState<string>(upcomingSaturdayISO());
  const [payrollDept, setPayrollDept] = useState<'Rice Mill' | 'Flour Mill' | 'Sales Team'>('Rice Mill');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Super Admin',
    role: 'Super Admin',
    email: 'admin@kmkricemill.lk',
    avatar: 'SA',
    branch: 'Kurunegala Mill HQ',
    millName: 'KMK Rice Mill (Pvt) Ltd',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Initial State from Reference Data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 'S-01', name: 'Senarathna Bandara', phone: '071 234 5678', nic: '861234567V', location: 'Wariyapola' },
    { id: 'S-02', name: 'Sunil Perera', phone: '077 345 1122', nic: '752233441V', location: 'Polgahawela' },
    { id: 'S-03', name: 'Kamal Silva', phone: '070 998 2211', nic: '690112233V', location: 'Kurunegala' },
  ]);

  const [varieties, setVarieties] = useState<Variety[]>([
    { id: 'V-01', name: 'Nadu', price: 98 },
    { id: 'V-02', name: 'Samba', price: 112 },
    { id: 'V-03', name: 'Keeri Samba', price: 135 },
  ]);

  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      ref: 'GRN-0001',
      date: '2026-06-06',
      supplierId: 'S-01',
      payment: 'Cash',
      items: [{ variety: 'Samba', weight: 2500, price: 100 }],
      note: '',
    },
    {
      ref: 'GRN-0002',
      date: '2026-06-06',
      supplierId: 'S-01',
      payment: 'Credit',
      items: [{ variety: 'Nadu', weight: 1250, price: 100 }],
      note: 'Balance to be settled within 7 days',
    },
    {
      ref: 'GRN-0003',
      date: '2026-06-04',
      supplierId: 'S-02',
      payment: 'Cash',
      items: [
        { variety: 'Keeri Samba', weight: 750, price: 135 },
        { variety: 'Nadu', weight: 500, price: 98 },
      ],
      note: '',
    },
  ]);

  const [payments, setPayments] = useState<Payment[]>([]);

  // Production State
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([
    { id: 'FP-01', name: 'Nadu Rice 25kg', processType: 'Parboiled', variety: 'Nadu', unitPrice: 118, weight: 25 },
    { id: 'FP-02', name: 'Samba Rice 25kg', processType: 'Raw', variety: 'Samba', unitPrice: 132, weight: 25 },
    { id: 'FP-03', name: 'Keeri Samba 25kg', processType: 'Parboiled', variety: 'Keeri Samba', unitPrice: 155, weight: 25 },
  ]);

  const [finishedBatches, setFinishedBatches] = useState<FinishedBatch[]>([
    {
      batchNo: 'B-002',
      date: '2026-02-01',
      variety: 'Nadu',
      paddyInput: 12000,
      processType: 'Parboiled',
      operator: 'K. Fernando',
      outputs: [{ productId: 'FP-01', packets: 324 }],
    },
    {
      batchNo: 'B-003',
      date: '2026-02-02',
      variety: 'Samba',
      paddyInput: 5000,
      processType: 'Raw',
      operator: 'N. Silva',
      outputs: [{ productId: 'FP-02', packets: 125 }],
    },
    {
      batchNo: 'B-004',
      date: '2026-02-03',
      variety: 'Keeri Samba',
      paddyInput: 8000,
      processType: 'Parboiled',
      operator: 'R. Perera',
      outputs: [{ productId: 'FP-03', packets: 224 }],
    },
  ]);

  const [byProducts, setByProducts] = useState<ByProduct[]>([
    { id: 'BP-01', name: 'Rice Polish', variety: 'Nadu', processType: 'Parboiled', unitPrice: 45 },
    { id: 'BP-02', name: 'Rice Bran', variety: 'Samba', processType: 'Raw', unitPrice: 38 },
    { id: 'BP-03', name: 'Black Rice', variety: 'Keeri Samba', processType: 'Parboiled', unitPrice: 210 },
    { id: 'BP-04', name: 'Paddy Husk', variety: 'Nadu', processType: 'Raw', unitPrice: 8 },
    { id: 'BP-05', name: 'Broken Rice', variety: 'Samba', processType: 'Raw', unitPrice: 60 },
  ]);

  const [byProductBatches, setByProductBatches] = useState<ByProductBatch[]>([
    { id: 1, batchNo: 'B-002', date: '2026-01-02', productId: 'BP-02', out: 1200 },
    { id: 2, batchNo: 'B-005', date: '2026-01-03', productId: 'BP-01', out: 1200 },
  ]);

  const [flourProducts, setFlourProducts] = useState<FlourProduct[]>([
    { id: 'RF-01', name: 'Rice Flour 10kg', packetSize: 10, unitPrice: 95 },
    { id: 'RF-02', name: 'Rice Flour 5kg', packetSize: 5, unitPrice: 98 },
    { id: 'RF-03', name: 'Rice Flour 1kg', packetSize: 1, unitPrice: 110 },
  ]);

  const [flourBatches, setFlourBatches] = useState<FlourBatch[]>([
    { batchNo: 'B-0009', date: '2026-02-02', outputs: [{ productId: 'RF-01', packets: 120 }] },
  ]);

  // Sales State
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'C-01',
      name: 'Sunil Stores',
      phone: '077 212 4455',
      location: 'Kurunegala',
      type: 'Finished Product',
      branchType: 'Single',
      branches: [],
      openingOutstanding: 0,
    },
    {
      id: 'C-02',
      name: 'Mahesh Traders',
      phone: '071 998 3321',
      location: 'Kegalle',
      type: 'By-Product',
      branchType: 'Single',
      branches: [],
      openingOutstanding: 0,
    },
    {
      id: 'C-03',
      name: 'Lanka Super Mart',
      phone: '076 445 2210',
      location: 'Colombo',
      type: 'Finished Product',
      branchType: 'Multiple',
      branches: [
        { name: 'Colombo 07 Branch', location: 'Colombo 07' },
        { name: 'Nugegoda Branch', location: 'Nugegoda' },
      ],
      openingOutstanding: 0,
    },
  ]);

  const [salesTeams, setSalesTeams] = useState<SalesTeam[]>([
    { id: 'ST-01', lorryNo: 'LH-4521', salesRep: 'D. Rathnayake', driver: 'S. Kumara', helper: 'P. Nimal' },
    { id: 'ST-02', lorryNo: 'NA-7789', salesRep: 'C. Wijesekara', driver: 'A. Bandara', helper: '' },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      invoiceNo: 'INV-0056',
      date: '2026-02-02',
      clientId: 'C-01',
      branch: '',
      salesTeamId: 'ST-01',
      items: [
        { category: 'Finished Products', productId: 'FP-01', productName: 'Nadu Rice 25kg', unitPrice: 118, weight: 25, qty: 20, total: 59000 },
      ],
      totalAmount: 59000,
    },
    {
      invoiceNo: 'INV-0057',
      date: '2026-02-02',
      clientId: 'C-02',
      branch: '',
      salesTeamId: 'ST-02',
      items: [
        { category: 'By-Products', productId: 'BP-02', productName: 'Rice Bran', unitPrice: 38, qty: 1000, total: 38000 },
        { category: 'By-Products', productId: 'BP-01', productName: 'Rice Polish', unitPrice: 45, qty: 600, total: 27000 },
      ],
      totalAmount: 65000,
    },
  ]);

  const [settlements, setSettlements] = useState<Settlement[]>([
    { id: 1, invoiceNo: 'INV-0056', date: '2026-02-04', amount: 34000, method: 'Cash', chequeNo: '' },
  ]);

  // Finance State
  const [cashCategories, setCashCategories] = useState<CashCategory[]>([
    { id: 'CAT-01', name: 'Sales', type: 'Income' },
    { id: 'CAT-02', name: 'By-Product Sales', type: 'Income' },
    { id: 'CAT-03', name: 'Paddy Purchase', type: 'Expense' },
    { id: 'CAT-04', name: 'Electricity', type: 'Expense' },
    { id: 'CAT-05', name: 'Transport', type: 'Expense' },
    { id: 'CAT-06', name: 'Wages', type: 'Expense' },
  ]);

  const [cashEntries, setCashEntries] = useState<CashEntry[]>([
    { id: 1, date: '2026-02-02', categoryId: 'CAT-01', description: 'Sales', paymentMethod: 'Cash', amount: 500000, type: 'Income' },
    { id: 2, date: '2026-02-02', categoryId: 'CAT-02', description: 'Mahesh', paymentMethod: 'Cash', amount: 75000, type: 'Income' },
    { id: 3, date: '2026-02-02', categoryId: 'CAT-03', description: 'B-0056', paymentMethod: 'Cash', amount: 359000, type: 'Expense' },
    { id: 4, date: '2026-02-02', categoryId: 'CAT-04', description: 'Ch-que 0071', paymentMethod: 'Cheque', amount: 25000, type: 'Expense' },
  ]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { id: 'BA-01', bankName: 'Bank of Ceylon', accountNumber: '8801234567', accountName: 'KMK Rice Mill' },
    { id: 'BA-02', bankName: 'Sampath Bank', accountNumber: '0123456789', accountName: 'KMK Rice Mill' },
  ]);

  const [cheques, setCheques] = useState<Cheque[]>([
    {
      id: 'CHQ-01',
      date: '2026-02-02',
      type: 'Received',
      partyId: 'C-01',
      salesTeamId: 'ST-01',
      bank: 'BOC',
      chequeNo: '092975',
      chequeDate: '2026-09-03',
      amount: 75000,
      status: 'Pending',
      allocatedBankAccountId: null,
    },
  ]);

  // Payroll State
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'EMP-01', name: 'K. Sunil', phone: '071 222 3344', joinedDate: '2024-03-01', workType: 'Mill Operator', department: 'Rice Mill' },
    { id: 'EMP-02', name: 'N. Priyantha', phone: '077 556 7788', joinedDate: '2023-11-15', workType: 'Packing Assistant', department: 'Flour Mill' },
    { id: 'EMP-03', name: 'D. Rathnayake', phone: '077 212 4455', joinedDate: '2022-06-10', workType: 'Sales Representative', department: 'Sales Team' },
  ]);

  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([
    {
      id: 1,
      weekEnding: '2026-02-07',
      department: 'Rice Mill',
      employeeId: 'EMP-01',
      grossPay: 18000,
      deductions: [{ reason: 'Loan Repayment', amount: 2000 }],
      netPay: 16000,
    },
  ]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: "Hello! I'm the KMK Rice Mill AI Assistant. In production I'm connected to your full Supabase database through an n8n agent, so you can ask me anything about deliveries, sales, outstanding balances, cash position, stock, cheques, or payroll — in plain English.\n\nThis preview simulates real answers using your current sample data. Try a question below to see it in action.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [aiTyping, setAiTyping] = useState<boolean>(false);

  // Lookups
  const supplierById = (id: string) => suppliers.find((s) => s.id === id);
  const varietyById = (id: string) => varieties.find((v) => v.id === id);
  const clientById = (id: string) => clients.find((c) => c.id === id);
  const invoiceById = (invoiceNo: string) => invoices.find((i) => i.invoiceNo === invoiceNo);
  const salesTeamById = (id: string) => salesTeams.find((t) => t.id === id);
  const cashCategoryById = (id: string) => cashCategories.find((c) => c.id === id);
  const bankAccountById = (id: string) => bankAccounts.find((b) => b.id === id);
  const chequeById = (id: string) => cheques.find((c) => c.id === id);
  const employeeById = (id: string) => employees.find((e) => e.id === id);

  const totalWeight = (d: Delivery) => d.items.reduce((s, i) => s + Number(i.weight || 0), 0);
  const totalAmount = (d: Delivery) => d.items.reduce((s, i) => s + Number(i.weight || 0) * Number(i.price || 0), 0);

  const computeStockTotals = () => {
    let total = 0;
    const byVariety: Record<string, number> = {};
    deliveries.forEach((d) => {
      d.items.forEach((it) => {
        const w = Number(it.weight || 0);
        total += w;
        byVariety[it.variety] = (byVariety[it.variety] || 0) + w;
      });
    });
    return { total, byVariety };
  };

  const outstandingList = () => {
    return deliveries
      .filter((d) => d.payment === 'Credit')
      .map((d) => {
        const paid = payments.filter((p) => p.ref === d.ref).reduce((s, p) => s + Number(p.amount || 0), 0);
        const bal = totalAmount(d) - paid;
        const days = Math.max(0, daysBetween(d.date, todayISO()));
        return { d, paid, bal, days };
      })
      .filter((x) => x.bal > 0.001);
  };

  const ledgerEntries = (supplierId: string) => {
    const rows: { date: string; ref: string; debit: number; credit: number; sort: string; balance?: number }[] = [];
    deliveries
      .filter((d) => d.supplierId === supplierId && d.payment === 'Credit')
      .forEach((d) => {
        rows.push({ date: d.date, ref: d.ref, debit: 0, credit: totalAmount(d), sort: d.date + 'a' });
      });
    payments
      .filter((p) => {
        const d = deliveries.find((x) => x.ref === p.ref);
        return d && d.supplierId === supplierId;
      })
      .forEach((p) => {
        rows.push({ date: p.date, ref: p.ref, debit: p.amount, credit: 0, sort: p.date + 'b' });
      });
    rows.sort((a, b) => a.sort.localeCompare(b.sort));
    let bal = 0;
    return rows.map((r) => {
      bal += r.credit - r.debit;
      return { date: r.date, ref: r.ref, debit: r.debit, credit: r.credit, balance: bal };
    });
  };

  const finishedProductWeight = (productId: string) => {
    const p = finishedProducts.find((x) => x.id === productId);
    return p ? Number(p.weight) || 0 : 0;
  };

  const finishedOutputSum = (b: FinishedBatch) => {
    return b.outputs.reduce((s, o) => s + finishedProductWeight(o.productId) * Number(o.packets || 0), 0);
  };

  const flourOutputSum = (b: FlourBatch) => {
    return b.outputs.reduce((s, o) => {
      const p = flourProducts.find((x) => x.id === o.productId);
      return s + (p ? p.packetSize * Number(o.packets || 0) : 0);
    }, 0);
  };

  const computeFinishedStock = () => {
    return finishedProducts.map((p) => {
      let producedBags = 0;
      finishedBatches.forEach((b) => {
        b.outputs.filter((o) => o.productId === p.id).forEach((o) => (producedBags += Number(o.packets || 0)));
      });
      let billedBags = 0;
      invoices.forEach((inv) => {
        inv.items.filter((it) => it.productId === p.id).forEach((it) => (billedBags += Number(it.qty || 0)));
      });
      const stockBags = Math.max(0, producedBags - billedBags);
      const totalKg = stockBags * p.weight;
      return {
        ...p,
        stockBags,
        totalKg,
      };
    });
  };

  const computeByProductStock = () => {
    return byProducts.map((p) => {
      const producedKg = byProductBatches
        .filter((b) => b.productId === p.id)
        .reduce((s, b) => s + Number(b.out || 0), 0);
      let billedKg = 0;
      invoices.forEach((inv) => {
        inv.items.filter((it) => it.productId === p.id).forEach((it) => (billedKg += Number(it.qty || 0)));
      });
      const stockKg = Math.max(0, producedKg - billedKg);
      return {
        ...p,
        stockKg,
      };
    });
  };

  const computeFlourStock = () => {
    return flourProducts.map((p) => {
      let producedPackets = 0;
      flourBatches.forEach((b) => {
        b.outputs.filter((o) => o.productId === p.id).forEach((o) => (producedPackets += Number(o.packets || 0)));
      });
      let billedPackets = 0;
      invoices.forEach((inv) => {
        inv.items.filter((it) => it.productId === p.id).forEach((it) => (billedPackets += Number(it.qty || 0)));
      });
      const stockPackets = Math.max(0, producedPackets - billedPackets);
      const stockKg = stockPackets * p.packetSize;
      return {
        ...p,
        stockPackets,
        stockKg,
        totalKg: stockKg,
      };
    });
  };

  const salesTotals = () => {
    const totalSales = invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const totalCollected = settlements.reduce((s, set) => s + Number(set.amount || 0), 0);
    const totalOpening = clients.reduce((s, c) => s + (Number(c.openingOutstanding) || 0), 0);
    const totalOutstanding = totalOpening + totalSales - totalCollected;
    return { totalSales, totalCollected, totalOutstanding };
  };

  const chequeTotals = () => {
    const pendingTotal = cheques
      .filter((c) => c.status === 'Pending')
      .reduce((s, c) => s + Number(c.amount || 0), 0);
    const receivedTotal = cheques
      .filter((c) => c.type === 'Received')
      .reduce((s, c) => s + Number(c.amount || 0), 0);
    const issuedTotal = cheques
      .filter((c) => c.type === 'Issued')
      .reduce((s, c) => s + Number(c.amount || 0), 0);
    return { pendingTotal, receivedTotal, issuedTotal };
  };

  const payrollSummary = () => {
    const currentEntries = payrollEntries.filter(
      (e) => e.weekEnding === payrollWeek && e.department === payrollDept
    );
    const deptGrossPay = currentEntries.reduce((s, e) => s + Number(e.grossPay || 0), 0);
    const deptDeductions = currentEntries.reduce(
      (s, e) => s + (e.deductions?.reduce((ds, d) => ds + Number(d.amount || 0), 0) || 0),
      0
    );
    const deptNetPay = deptGrossPay - deptDeductions;

    const allWeekEntries = payrollEntries.filter((e) => e.weekEnding === payrollWeek);
    const allGross = allWeekEntries.reduce((s, e) => s + Number(e.grossPay || 0), 0);
    const allDed = allWeekEntries.reduce(
      (s, e) => s + (e.deductions?.reduce((ds, d) => ds + Number(d.amount || 0), 0) || 0),
      0
    );
    const allDeptsNetPay = allGross - allDed;

    return { deptGrossPay, deptDeductions, deptNetPay, allDeptsNetPay };
  };

  const finishedTotals = () => {
    let paddyTotal = 0;
    let outputTotal = 0;
    const byVariety: Record<string, number> = {};
    finishedBatches.forEach((b) => {
      paddyTotal += Number(b.paddyInput || 0);
      const outSum = finishedOutputSum(b);
      outputTotal += outSum;
      byVariety[b.variety] = (byVariety[b.variety] || 0) + outSum;
    });
    const avgYield = paddyTotal > 0 ? (outputTotal / paddyTotal) * 100 : 0;
    return { paddyTotal, byVariety, avgYield };
  };

  const byProductTotals = () => {
    return byProducts.map((p) => ({
      product: p,
      total: byProductBatches.filter((b) => b.productId === p.id).reduce((s, b) => s + Number(b.out || 0), 0),
    }));
  };

  const flourTotals = () => {
    return flourProducts.map((p) => {
      let packets = 0;
      flourBatches.forEach((b) =>
        b.outputs.filter((o) => o.productId === p.id).forEach((o) => (packets += Number(o.packets || 0)))
      );
      const weight = packets * p.packetSize;
      return { product: p, weight, packets };
    });
  };

  const flourFlatRows = () => {
    const rows: { batchNo: string; date: string; product?: FlourProduct; weight: number; packets: number; outIdx: number }[] = [];
    flourBatches.forEach((b) => {
      b.outputs.forEach((o, i) => {
        const p = flourProducts.find((x) => x.id === o.productId);
        const weight = p ? p.packetSize * Number(o.packets || 0) : 0;
        rows.push({ batchNo: b.batchNo, date: b.date, product: p, weight, packets: Number(o.packets || 0), outIdx: i });
      });
    });
    return rows;
  };

  const stockRows = () => {
    const rows: { date: string; batchNo: string; item: string; qtyKg: number; qtyPackets: number | null; type: string }[] = [];
    finishedBatches.forEach((b) =>
      b.outputs.forEach((o) => {
        const p = finishedProducts.find((x) => x.id === o.productId);
        const w = p ? p.weight * Number(o.packets || 0) : 0;
        rows.push({ date: b.date, batchNo: b.batchNo, item: p ? p.name : '—', qtyKg: w, qtyPackets: o.packets, type: 'Finished Products' });
      })
    );
    byProductBatches.forEach((b) => {
      const p = byProducts.find((x) => x.id === b.productId);
      rows.push({ date: b.date, batchNo: b.batchNo, item: p ? p.name : '—', qtyKg: Number(b.out || 0), qtyPackets: null, type: 'By-Products' });
    });
    flourFlatRows().forEach((r) => {
      rows.push({ date: r.date, batchNo: r.batchNo, item: r.product ? r.product.name : '—', qtyKg: r.weight, qtyPackets: r.packets, type: 'Rice Flour' });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  };

  const invoiceSettledAmount = (invoiceNo: string) => {
    return settlements.filter((s) => s.invoiceNo === invoiceNo).reduce((s, x) => s + Number(x.amount || 0), 0);
  };

  const invoiceOutstanding = (invoiceNo: string) => {
    const inv = invoices.find((i) => i.invoiceNo === invoiceNo);
    if (!inv) return 0;
    return inv.totalAmount - invoiceSettledAmount(invoiceNo);
  };

  const clientOutstandingTotal = (clientId: string) => {
    const c = clientById(clientId);
    let total = c ? Number(c.openingOutstanding) || 0 : 0;
    invoices.filter((i) => i.clientId === clientId).forEach((i) => (total += invoiceOutstanding(i.invoiceNo)));
    return total;
  };

  const previousOutstanding = (clientId: string, excludeInvoiceNo?: string) => {
    const c = clientById(clientId);
    let total = c ? Number(c.openingOutstanding) || 0 : 0;
    invoices
      .filter((i) => i.clientId === clientId && i.invoiceNo !== excludeInvoiceNo)
      .forEach((i) => (total += invoiceOutstanding(i.invoiceNo)));
    return total;
  };

  const invoiceGrandTotal = (inv: Invoice) => {
    return inv.totalAmount + previousOutstanding(inv.clientId, inv.invoiceNo);
  };

  const custLedgerRowsFor = (clientId: string) => {
    const rows: { date: string; ref: string; debit: number; credit: number; sort: string; balance?: number }[] = [];
    invoices
      .filter((i) => i.clientId === clientId)
      .forEach((inv) => {
        rows.push({ date: inv.date, ref: inv.invoiceNo, debit: inv.totalAmount, credit: 0, sort: inv.date + 'a' });
      });
    settlements
      .filter((s) => {
        const inv = invoices.find((i) => i.invoiceNo === s.invoiceNo);
        return inv && inv.clientId === clientId;
      })
      .forEach((s) => {
        rows.push({ date: s.date, ref: s.invoiceNo, debit: 0, credit: s.amount, sort: s.date + 'b' });
      });
    rows.sort((a, b) => a.sort.localeCompare(b.sort));
    const client = clientById(clientId);
    let bal = client ? Number(client.openingOutstanding) || 0 : 0;
    return rows.map((r) => {
      bal += r.debit - r.credit;
      return { date: r.date, ref: r.ref, debit: r.debit, credit: r.credit, balance: bal };
    });
  };

  const customerLedgerEntries = (clientId: string) => custLedgerRowsFor(clientId);

  const cashBalancesAsOf = (dateExclusive: string) => {
    let cash = 0;
    let cheque = 0;
    cashEntries
      .filter((e) => e.date < dateExclusive)
      .forEach((e) => {
        const sign = e.type === 'Income' ? 1 : -1;
        if (e.paymentMethod === 'Cash') cash += sign * Number(e.amount || 0);
        else cheque += sign * Number(e.amount || 0);
      });
    return { cash, cheque };
  };

  const PAYROLL_DEPARTMENTS = ['Rice Mill', 'Flour Mill', 'Sales Team'] as const;
  const payrollWeekTotals = (week: string) => {
    const result: any = {};
    let grandNet = 0;
    PAYROLL_DEPARTMENTS.forEach((d) => {
      const entries = payrollEntries.filter((e) => e.weekEnding === week && e.department === d);
      const gross = entries.reduce((s, e) => s + Number(e.grossPay || 0), 0);
      const deductions = entries.reduce(
        (s, e) => s + e.deductions.reduce((ds, ded) => ds + Number(ded.amount || 0), 0),
        0
      );
      const net = gross - deductions;
      result[d] = { gross, deductions, net };
      grandNet += net;
    });
    result.grandNet = grandNet;
    return result;
  };

  // CRUD Implementations
  const saveFarmer = (name: string, phone: string, nic: string, location: string) => {
    const id = 'S-' + String(suppliers.length + 1).padStart(2, '0');
    setSuppliers([...suppliers, { id, name, phone, nic, location }]);
    showToast(`Farmer "${name}" registered`);
  };

  const saveVariety = (name: string, price: number) => {
    const id = 'V-' + String(varieties.length + 1).padStart(2, '0');
    setVarieties([...varieties, { id, name, price }]);
    showToast(`Variety "${name}" registered`);
  };

  const saveDelivery = (delivery: Delivery, isEdit: boolean) => {
    if (isEdit) {
      setDeliveries(deliveries.map((d) => (d.ref === delivery.ref ? delivery : d)));
      showToast(`Delivery ${delivery.ref} updated`);
    } else {
      setDeliveries([...deliveries, delivery]);
      showToast(`Delivery ${delivery.ref} saved`);
    }
  };

  const deleteDelivery = (ref: string) => {
    setDeliveries(deliveries.filter((d) => d.ref !== ref));
    setPayments(payments.filter((p) => p.ref !== ref));
    showToast(`Delivery ${ref} deleted`);
  };

  const savePayment = (payment: Payment) => {
    setPayments([...payments, payment]);
    showToast(`Payment recorded · Supplier Ledger updated`);
  };

  const saveFinishedProduct = (p: Omit<FinishedProduct, 'id'>) => {
    const id = 'FP-' + String(finishedProducts.length + 1).padStart(2, '0');
    setFinishedProducts([...finishedProducts, { ...p, id }]);
    showToast(`Product "${p.name}" registered`);
  };

  const updateFinishedProductPrice = (id: string, price: number) => {
    setFinishedProducts(finishedProducts.map((p) => (p.id === id ? { ...p, unitPrice: price } : p)));
    showToast(`Price updated`);
  };

  const deleteFinishedProduct = (id: string) => {
    setFinishedProducts(finishedProducts.filter((p) => p.id !== id));
    showToast(`Product deleted`);
  };

  const saveFinishedBatch = (b: FinishedBatch, isEdit: boolean) => {
    if (isEdit) {
      setFinishedBatches(finishedBatches.map((item) => (item.batchNo === b.batchNo ? b : item)));
      showToast(`Batch ${b.batchNo} updated`);
    } else {
      setFinishedBatches([...finishedBatches, b]);
      showToast(`Batch ${b.batchNo} saved · sent to Stock`);
    }
  };

  const deleteFinishedBatch = (batchNo: string) => {
    setFinishedBatches(finishedBatches.filter((b) => b.batchNo !== batchNo));
    showToast(`Batch ${batchNo} deleted`);
  };

  const saveByProduct = (p: Omit<ByProduct, 'id'>) => {
    const id = 'BP-' + String(byProducts.length + 1).padStart(2, '0');
    setByProducts([...byProducts, { ...p, id }]);
    showToast(`By-product "${p.name}" registered`);
  };

  const updateByProductPrice = (id: string, price: number) => {
    setByProducts(byProducts.map((p) => (p.id === id ? { ...p, unitPrice: price } : p)));
    showToast(`Price updated`);
  };

  const deleteByProduct = (id: string) => {
    setByProducts(byProducts.filter((p) => p.id !== id));
    showToast(`By-product deleted`);
  };

  const saveByProductBatch = (b: ByProductBatch, isEdit: boolean) => {
    if (isEdit) {
      setByProductBatches(byProductBatches.map((item) => (item.id === b.id ? b : item)));
      showToast(`Batch ${b.batchNo} updated`);
    } else {
      const id = byProductBatches.length > 0 ? Math.max(...byProductBatches.map((x) => x.id)) + 1 : 1;
      setByProductBatches([...byProductBatches, { ...b, id }]);
      showToast(`Batch ${b.batchNo} saved · sent to Stock`);
    }
  };

  const deleteByProductBatch = (id: number) => {
    setByProductBatches(byProductBatches.filter((b) => b.id !== id));
    showToast(`Batch deleted`);
  };

  const saveFlourProduct = (p: Omit<FlourProduct, 'id'>) => {
    const id = 'RF-' + String(flourProducts.length + 1).padStart(2, '0');
    setFlourProducts([...flourProducts, { ...p, id }]);
    showToast(`Product "${p.name}" registered`);
  };

  const updateFlourProductPrice = (id: string, price: number) => {
    setFlourProducts(flourProducts.map((p) => (p.id === id ? { ...p, unitPrice: price } : p)));
    showToast(`Price updated`);
  };

  const deleteFlourProduct = (id: string) => {
    setFlourProducts(flourProducts.filter((p) => p.id !== id));
    showToast(`Product deleted`);
  };

  const saveFlourBatch = (b: FlourBatch, isEdit: boolean) => {
    if (isEdit) {
      setFlourBatches(flourBatches.map((item) => (item.batchNo === b.batchNo ? b : item)));
      showToast(`Batch ${b.batchNo} updated`);
    } else {
      setFlourBatches([...flourBatches, b]);
      showToast(`Batch ${b.batchNo} saved · sent to Stock`);
    }
  };

  const deleteFlourBatch = (batchNo: string) => {
    setFlourBatches(flourBatches.filter((b) => b.batchNo !== batchNo));
    showToast(`Batch ${batchNo} deleted`);
  };

  const saveClient = (client: Client, isEdit: boolean) => {
    if (isEdit) {
      setClients(clients.map((c) => (c.id === client.id ? client : c)));
      showToast(`Client "${client.name}" updated`);
    } else {
      const id = 'C-' + String(clients.length + 1).padStart(2, '0');
      setClients([...clients, { ...client, id }]);
      showToast(`Client "${client.name}" registered`);
    }
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    showToast(`Client deleted`);
  };

  const saveSalesTeam = (team: SalesTeam, isEdit: boolean) => {
    if (isEdit) {
      setSalesTeams(salesTeams.map((t) => (t.id === team.id ? team : t)));
      showToast(`Sales team updated`);
    } else {
      const id = 'ST-' + String(salesTeams.length + 1).padStart(2, '0');
      setSalesTeams([...salesTeams, { ...team, id }]);
      showToast(`Sales team registered`);
    }
  };

  const deleteSalesTeam = (id: string) => {
    setSalesTeams(salesTeams.filter((t) => t.id !== id));
    showToast(`Sales team deleted`);
  };

  const saveInvoice = (invoice: Invoice, isEdit: boolean) => {
    if (isEdit) {
      setInvoices(invoices.map((i) => (i.invoiceNo === invoice.invoiceNo ? invoice : i)));
      showToast(`Invoice ${invoice.invoiceNo} updated`);
    } else {
      setInvoices([...invoices, invoice]);
      showToast(`Invoice ${invoice.invoiceNo} saved`);
    }
  };

  const deleteInvoice = (invoiceNo: string) => {
    setInvoices(invoices.filter((i) => i.invoiceNo !== invoiceNo));
    setSettlements(settlements.filter((s) => s.invoiceNo !== invoiceNo));
    showToast(`Invoice ${invoiceNo} deleted`);
  };

  const saveSettlement = (settlement: Omit<Settlement, 'id'>) => {
    const id = settlements.length > 0 ? Math.max(...settlements.map((s) => s.id)) + 1 : 1;
    setSettlements([...settlements, { ...settlement, id }]);
    showToast(`Payment recorded · Customer Ledger updated`);
  };

  const deleteSettlement = (id: number) => {
    setSettlements(settlements.filter((s) => s.id !== id));
    showToast(`Payment deleted · Customer Ledger updated`);
  };

  const saveCashCategory = (name: string, type: 'Income' | 'Expense') => {
    const id = 'CAT-' + String(cashCategories.length + 1).padStart(2, '0');
    setCashCategories([...cashCategories, { id, name, type }]);
    showToast(`Category "${name}" registered`);
  };

  const saveCashEntry = (entry: CashEntry, isEdit: boolean) => {
    if (isEdit) {
      setCashEntries(cashEntries.map((e) => (e.id === entry.id ? entry : e)));
      showToast(`${entry.type} entry updated`);
    } else {
      const id = cashEntries.length > 0 ? Math.max(...cashEntries.map((e) => e.id)) + 1 : 1;
      setCashEntries([...cashEntries, { ...entry, id }]);
      showToast(`${entry.type} recorded`);
    }
  };

  const deleteCashEntry = (id: number) => {
    setCashEntries(cashEntries.filter((e) => e.id !== id));
    showToast(`Entry deleted`);
  };

  const saveBankAccount = (name: string, accNo: string, accName: string) => {
    const id = 'BA-' + String(bankAccounts.length + 1).padStart(2, '0');
    setBankAccounts([...bankAccounts, { id, bankName: name, accountNumber: accNo, accountName: accName }]);
    showToast(`Bank account registered`);
  };

  const saveCheque = (cheque: Cheque, isEdit: boolean) => {
    if (isEdit) {
      setCheques(cheques.map((c) => (c.id === cheque.id ? cheque : c)));
      showToast(`Cheque updated`);
    } else {
      const id = 'CHQ-' + String(cheques.length + 1).padStart(2, '0');
      setCheques([...cheques, { ...cheque, id }]);
      showToast(`Cheque saved`);
    }
  };

  const deleteCheque = (id: string) => {
    setCheques(cheques.filter((c) => c.id !== id));
    showToast(`Cheque deleted`);
  };

  const allocateCheque = (chequeId: string, bankAccountId: string) => {
    setCheques(
      cheques.map((c) =>
        c.id === chequeId ? { ...c, allocatedBankAccountId: bankAccountId, status: 'Allocated' } : c
      )
    );
    showToast(`Cheque allocated`);
  };

  const returnCheque = (chequeId: string) => {
    setCheques(
      cheques.map((c) =>
        c.id === chequeId ? { ...c, status: 'Returned', allocatedBankAccountId: null } : c
      )
    );
    showToast(`Cheque marked as returned`);
  };

  const rescheduleCheque = (chequeId: string, newDate: string) => {
    setCheques(cheques.map((c) => (c.id === chequeId ? { ...c, chequeDate: newDate } : c)));
    showToast(`Cheque rescheduled to ${fmtDate(newDate)}`);
  };

  const saveEmployee = (employee: Employee, isEdit: boolean) => {
    if (isEdit) {
      setEmployees(employees.map((e) => (e.id === employee.id ? employee : e)));
      showToast(`Employee updated`);
    } else {
      const id = 'EMP-' + String(employees.length + 1).padStart(2, '0');
      setEmployees([...employees, { ...employee, id }]);
      showToast(`Employee registered`);
    }
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id));
    showToast(`Employee deleted`);
  };

  const savePayrollEntry = (entry: PayrollEntry, isEdit: boolean) => {
    if (isEdit) {
      setPayrollEntries(payrollEntries.map((e) => (e.id === entry.id ? entry : e)));
      showToast(`Payroll entry updated`);
    } else {
      const id = payrollEntries.length > 0 ? Math.max(...payrollEntries.map((e) => e.id)) + 1 : 1;
      setPayrollEntries([...payrollEntries, { ...entry, id }]);
      showToast(`Payroll entry saved`);
    }
  };

  const deletePayrollEntry = (id: number) => {
    setPayrollEntries(payrollEntries.filter((e) => e.id !== id));
    showToast(`Payroll entry deleted`);
  };

  // Local AI Query Resolver (mirroring the reference)
  const answerAIQuery = (raw: string): string => {
    const q = raw.toLowerCase().trim();

    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)) {
      return "Hello! Ask me about sales, outstanding balances, cash position, stock, cheques, or payroll — try one of the suggestions below.";
    }
    if (q.includes('help') || q.includes('what can you')) {
      return "I can help with things like:\n• \"What were my sales last month?\"\n• \"What's the outstanding balance for Sunil Stores?\"\n• \"What was the last invoice for Mahesh Traders?\"\n• \"What's today's cash balance?\"\n• \"How many cheques are pending?\"\n• \"How much Nadu Rice stock do we have?\"\n• \"What's this week's payroll total?\"\nIn production I'll be able to answer anything in your Supabase database — this preview covers the questions above using your current sample data.";
    }

    // Sales
    if (q.includes('sales') || q.includes('sold') || q.includes('revenue')) {
      const total = invoices.reduce((s, i) => s + i.totalAmount, 0);
      return `Total sales across all invoices on file: LKR ${fmtNum(total)} across ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}.`;
    }

    // Outstanding balances
    if (q.includes('outstanding')) {
      const client = clients.find((c) => q.includes(c.name.toLowerCase()) || q.includes(c.name.toLowerCase().split(' ')[0]));
      if (client) {
        const amt = clientOutstandingTotal(client.id);
        return `${client.name} currently has an outstanding balance of LKR ${fmtNum(amt)}.`;
      }
      const total = clients.reduce((s, c) => s + clientOutstandingTotal(c.id), 0);
      return `Total outstanding across all clients: LKR ${fmtNum(total)}.`;
    }

    // Last invoice
    if (q.includes('last invoice') || q.includes('recent invoice')) {
      const client = clients.find((c) => q.includes(c.name.toLowerCase()) || q.includes(c.name.toLowerCase().split(' ')[0]));
      if (client) {
        const clientInvoices = invoices.filter((i) => i.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
        if (clientInvoices.length === 0) return `I couldn't find any invoices for ${client.name}.`;
        const inv = clientInvoices[0];
        return `${client.name}'s last invoice was ${inv.invoiceNo} on ${fmtDate(inv.date)} for LKR ${fmtNum(inv.totalAmount)}.`;
      }
      if (invoices.length === 0) return 'There are no invoices recorded yet.';
      const inv = [...invoices].sort((a, b) => b.date.localeCompare(a.date))[0];
      const c = clientById(inv.clientId);
      return `The most recent invoice on file is ${inv.invoiceNo} for ${c ? c.name : '—'} on ${fmtDate(inv.date)}, LKR ${fmtNum(inv.totalAmount)}.`;
    }

    // Cash balance
    if (q.includes('cash') && (q.includes('balance') || q.includes('in hand') || q.includes('how much'))) {
      const today = todayISO();
      const opening = cashBalancesAsOf(today);
      const todays = cashEntries.filter((e) => e.date === today);
      let cash = opening.cash;
      let cheque = opening.cheque;
      todays.forEach((e) => {
        const sign = e.type === 'Income' ? 1 : -1;
        if (e.paymentMethod === 'Cash') cash += sign * Number(e.amount || 0);
        else cheque += sign * Number(e.amount || 0);
      });
      return `As of today (${fmtDate(today)}): cash balance is LKR ${fmtNum(cash)} and cheque balance is LKR ${fmtNum(cheque)}.`;
    }

    // Cheques
    if (q.includes('cheque')) {
      const pending = cheques.filter((c) => c.status !== 'Allocated');
      const total = pending.reduce((s, c) => s + Number(c.amount || 0), 0);
      return `There ${pending.length === 1 ? 'is' : 'are'} ${pending.length} cheque${pending.length !== 1 ? 's' : ''} pending, totalling LKR ${fmtNum(total)}.`;
    }

    // Stock
    if (q.includes('stock')) {
      const rows = stockRows();
      if (rows.length === 0) return "There's no stock recorded yet.";
      const match = rows.find((r) => q.includes(r.item.toLowerCase()));
      if (match) {
        const totalForItem = rows.filter((r) => r.item === match.item).reduce((s, r) => s + r.qtyKg, 0);
        return `Current stock on record for ${match.item}: ${fmtKg(totalForItem)}.`;
      }
      const byType: Record<string, number> = {};
      rows.forEach((r) => (byType[r.type] = (byType[r.type] || 0) + r.qtyKg));
      const lines = Object.entries(byType)
        .map(([t, kg]) => `${t}: ${fmtKg(kg)}`)
        .join(', ');
      return `Stock on record — ${lines}.`;
    }

    // Payroll
    if (q.includes('payroll') || q.includes('net pay') || q.includes('salary') || q.includes('salaries')) {
      const week = payrollWeek || upcomingSaturdayISO();
      const totals = payrollWeekTotals(week);
      return `Payroll for the week ending ${fmtDate(week)}: total net pay across all departments is LKR ${fmtNum(totals.grandNet)} (Rice Mill LKR ${fmtNum(totals['Rice Mill'].net)}, Flour Mill LKR ${fmtNum(totals['Flour Mill'].net)}, Sales Team LKR ${fmtNum(totals['Sales Team'].net)}).`;
    }

    // Paddy / suppliers
    if (q.includes('paddy') || q.includes('supplier')) {
      const supplier = suppliers.find((s) => q.includes(s.name.toLowerCase()) || q.includes(s.name.toLowerCase().split(' ')[0]));
      if (supplier) {
        const supplierDeliveries = deliveries.filter((d) => d.supplierId === supplier.id);
        const totalWeightSum = supplierDeliveries.reduce((s, d) => s + totalWeight(d), 0);
        const totalAmountSum = supplierDeliveries.reduce((s, d) => s + totalAmount(d), 0);
        return `${supplier.name} has delivered ${fmtKg(totalWeightSum)} of paddy across ${supplierDeliveries.length} deliver${supplierDeliveries.length !== 1 ? 'ies' : 'y'}, worth LKR ${fmtNum(totalAmountSum)}.`;
      }
      const totalWeightSum = deliveries.reduce((s, d) => s + totalWeight(d), 0);
      return `Total paddy received on record: ${fmtKg(totalWeightSum)} across ${deliveries.length} delivery${deliveries.length !== 1 ? 'ies' : ''}.`;
    }

    return "I don't have a wired-up answer for that in this preview yet — once connected to Supabase via the n8n agent, I'll be able to query the full database and answer anything about your mill's operations. Try one of the suggested questions below, or rephrase using words like \"sales\", \"outstanding\", \"cash\", \"cheques\", \"stock\", or \"payroll\".";
  };

  const sendAIMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setAiTyping(true);

    setTimeout(() => {
      const reply = answerAIQuery(text);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: reply,
        timestamp: new Date().toISOString(),
      };
      setAiTyping(false);
      setChatMessages((prev) => [...prev, assistantMsg]);
    }, 650 + Math.random() * 300);
  };

  const value = useMemo(
    () => ({
      activeMain,
      activeSub,
      setActiveMain,
      setActiveSub,
      period,
      setPeriod,
      stockTab,
      setStockTab,
      chequeTab,
      setChequeTab,
      cashDate,
      setCashDate,
      payrollWeek,
      setPayrollWeek,
      payrollDept,
      setPayrollDept,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      currentUser,
      setCurrentUser,
      toastMessage,
      showToast,
      suppliers,
      varieties,
      deliveries,
      payments,
      finishedProducts,
      finishedBatches,
      byProducts,
      byProductBatches,
      flourProducts,
      flourBatches,
      clients,
      salesTeams,
      invoices,
      settlements,
      cashCategories,
      cashEntries,
      bankAccounts,
      cheques,
      employees,
      payrollEntries,
      chatMessages,
      aiTyping,
      supplierById,
      varietyById,
      clientById,
      invoiceById,
      salesTeamById,
      cashCategoryById,
      bankAccountById,
      chequeById,
      employeeById,
      totalWeight,
      totalAmount,
      computeStockTotals,
      computeFinishedStock,
      computeByProductStock,
      computeFlourStock,
      salesTotals,
      chequeTotals,
      payrollSummary,
      customerLedgerEntries,
      outstandingList,
      ledgerEntries,
      finishedProductWeight,
      finishedOutputSum,
      flourOutputSum,
      finishedTotals,
      byProductTotals,
      flourTotals,
      flourFlatRows,
      stockRows,
      invoiceSettledAmount,
      invoiceOutstanding,
      clientOutstandingTotal,
      previousOutstanding,
      invoiceGrandTotal,
      custLedgerRowsFor,
      cashBalancesAsOf,
      payrollWeekTotals,
      saveFarmer,
      saveVariety,
      saveDelivery,
      deleteDelivery,
      savePayment,
      saveFinishedProduct,
      updateFinishedProductPrice,
      deleteFinishedProduct,
      saveFinishedBatch,
      deleteFinishedBatch,
      saveByProduct,
      updateByProductPrice,
      deleteByProduct,
      saveByProductBatch,
      deleteByProductBatch,
      saveFlourProduct,
      updateFlourProductPrice,
      deleteFlourProduct,
      saveFlourBatch,
      deleteFlourBatch,
      saveClient,
      deleteClient,
      saveSalesTeam,
      deleteSalesTeam,
      saveInvoice,
      deleteInvoice,
      saveSettlement,
      deleteSettlement,
      saveCashCategory,
      saveCashEntry,
      deleteCashEntry,
      saveBankAccount,
      saveCheque,
      deleteCheque,
      allocateCheque,
      returnCheque,
      rescheduleCheque,
      saveEmployee,
      deleteEmployee,
      savePayrollEntry,
      deletePayrollEntry,
      sendAIMessage,
    }),
    [
      activeMain,
      activeSub,
      period,
      stockTab,
      chequeTab,
      cashDate,
      payrollWeek,
      payrollDept,
      isMobileMenuOpen,
      currentUser,
      toastMessage,
      suppliers,
      varieties,
      deliveries,
      payments,
      finishedProducts,
      finishedBatches,
      byProducts,
      byProductBatches,
      flourProducts,
      flourBatches,
      clients,
      salesTeams,
      invoices,
      settlements,
      cashCategories,
      cashEntries,
      bankAccounts,
      cheques,
      employees,
      payrollEntries,
      chatMessages,
      aiTyping,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
