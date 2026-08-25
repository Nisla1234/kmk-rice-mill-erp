import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  fmtKg,
  fmtLKR,
  fmtNum,
  fmtDate,
} from '../../utils/formatters';
import {
  Wheat,
  Factory,
  ReceiptText,
  Landmark,
  Users,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardModule: React.FC = () => {
  const {
    setActiveMain,
    setActiveSub,
    deliveries,
    finishedBatches,
    invoices,
    cashEntries,
    cheques,
    computeStockTotals,
    computeFinishedStock,
    computeByProductStock,
    computeFlourStock,
    salesTotals,
    chequeTotals,
    payrollSummary,
    finishedTotals,
    payrollWeek,
    supplierById,
    totalWeight,
    totalAmount,
    finishedOutputSum,
    showToast,
  } = useApp();

  // Inventory computations
  const rawStock = computeStockTotals();
  const finishedList = computeFinishedStock();
  const byProductList = computeByProductStock();
  const flourList = computeFlourStock();

  const totalFinishedKg = finishedList.reduce((s, it) => s + it.totalKg, 0);
  const totalByProductKg = byProductList.reduce((s, it) => s + it.stockKg, 0);
  const totalFlourPackets = flourList.reduce((s, it) => s + it.stockPackets, 0);

  // Sales and Finance totals
  const sales = salesTotals();
  const chequesSum = chequeTotals();
  const payroll = payrollSummary();
  const prodTotals = finishedTotals();

  // Cash in vault (calculated from cash entries)
  const cashInVault = cashEntries.reduce(
    (sum, e) => (e.type === 'Receipt' ? sum + e.amount : sum - e.amount),
    0
  );

  // Chart data: Milling input vs output
  const millingChartData = finishedBatches.slice(-6).map((b) => {
    const totalOut = finishedOutputSum(b);
    return {
      batch: b.batchNo,
      date: b.date.slice(5),
      input: b.paddyInput,
      output: totalOut,
      yield: b.paddyInput > 0 ? Math.round((totalOut / b.paddyInput) * 100) : 0,
    };
  });

  // Chart data: Stock composition
  const stockPieData = [
    { name: 'Raw Paddy', value: rawStock.total, color: '#2F5D45' },
    { name: 'Finished Rice', value: totalFinishedKg, color: '#C68A2E' },
    { name: 'By-Products', value: totalByProductKg, color: '#8EA594' },
    { name: 'Rice Flour (kg)', value: flourList.reduce((s, f) => s + f.stockKg, 0), color: '#5B7A68' },
  ];

  // Sales vs Collections by recent invoices
  const revenueChartData = invoices.slice(-5).map((inv) => ({
    name: inv.invoiceNo,
    total: inv.items.reduce((s, it) => s + it.bags * it.unitPrice, 0),
    paid: inv.settledAmount,
    outstanding: Math.max(
      0,
      inv.items.reduce((s, it) => s + it.bags * it.unitPrice, 0) - inv.settledAmount
    ),
  }));

  // Quick navigation helper
  const navigateTo = (main: any, sub?: string) => {
    setActiveMain(main);
    if (sub) setActiveSub(sub);
  };

  return (
    <div className="space-y-6">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#DEDACB] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold text-[#1B2420] m-0">
              KMK Operations Executive Dashboard
            </h1>
            <span className="bg-[#E7EFE9] text-[#2F5D45] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Live State
            </span>
          </div>
          <p className="text-[13px] text-[#4B564E] m-0 mt-1">
            Milling performance, inventory status, billing analytics, and weekly payroll overview.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-primary flex items-center gap-1.5"
            onClick={() => navigateTo('rmr', 'paddy')}
          >
            <Wheat size={14} />
            <span>+ Paddy Delivery</span>
          </button>
          <button
            type="button"
            className="btn btn-sm flex items-center gap-1.5"
            onClick={() => navigateTo('production', 'finished')}
          >
            <Factory size={14} />
            <span>+ Milling Batch</span>
          </button>
          <button
            type="button"
            className="btn btn-sm flex items-center gap-1.5"
            onClick={() => navigateTo('sales', 'billing')}
          >
            <ReceiptText size={14} />
            <span>+ Sales Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Raw Material (Paddy) */}
        <div
          onClick={() => navigateTo('production', 'stock')}
          className="bg-[#1E3E2E] text-white p-4 rounded-xl border border-[#2A523E] shadow-sm cursor-pointer hover:border-[#C68A2E] transition-all group"
        >
          <div className="flex items-center justify-between text-[#BFD1C4] text-[12px] font-medium">
            <span>Raw Material Stock (Paddy)</span>
            <Wheat size={16} className="text-[#C68A2E] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-[26px] font-bold text-[#FBF7EC] font-serif mt-2">
            {fmtKg(rawStock.total)}
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-[#A6BAAB] mt-2 pt-2 border-t border-white/10">
            <span>{deliveries.length} Deliveries on record</span>
            <span className="text-[#C68A2E] flex items-center gap-0.5">
              Stock <ArrowUpRight size={12} />
            </span>
          </div>
        </div>

        {/* Card 2: Finished Goods Stock */}
        <div
          onClick={() => navigateTo('production', 'finished')}
          className="bg-white p-4 rounded-xl border border-[#DEDACB] shadow-xs cursor-pointer hover:border-[#2F5D45] transition-all group"
        >
          <div className="flex items-center justify-between text-[#4B564E] text-[12px] font-semibold">
            <span>Finished Rice in Stock</span>
            <Factory size={16} className="text-[#2F5D45] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-[26px] font-bold text-[#1B2420] font-serif mt-2">
            {fmtKg(totalFinishedKg)}
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-[#4B564E] mt-2 pt-2 border-t border-[#EAE7DA]">
            <span>Avg Milling Yield: <strong>{prodTotals.avgYield.toFixed(1)}%</strong></span>
            <span className="text-[#2F5D45] flex items-center gap-0.5 font-medium">
              Batches <ArrowUpRight size={12} />
            </span>
          </div>
        </div>

        {/* Card 3: Total Sales & Receivables */}
        <div
          onClick={() => navigateTo('sales', 'billing')}
          className="bg-white p-4 rounded-xl border border-[#DEDACB] shadow-xs cursor-pointer hover:border-[#2F5D45] transition-all group"
        >
          <div className="flex items-center justify-between text-[#4B564E] text-[12px] font-semibold">
            <span>Invoiced Sales / Outstanding</span>
            <ReceiptText size={16} className="text-[#2F5D45] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-[24px] font-bold text-[#1B2420] font-serif mt-2">
            {fmtLKR(sales.totalSales)}
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-[#A63D2C] mt-2 pt-2 border-t border-[#EAE7DA]">
            <span>Due: <strong>{fmtLKR(sales.totalOutstanding)}</strong></span>
            <span className="text-[#2F5D45] flex items-center gap-0.5 font-medium">
              Billing <ArrowUpRight size={12} />
            </span>
          </div>
        </div>

        {/* Card 4: Finance & Cash Position */}
        <div
          onClick={() => navigateTo('finance', 'cashbook')}
          className="bg-white p-4 rounded-xl border border-[#DEDACB] shadow-xs cursor-pointer hover:border-[#2F5D45] transition-all group"
        >
          <div className="flex items-center justify-between text-[#4B564E] text-[12px] font-semibold">
            <span>Cash in Vault & Cheques</span>
            <Landmark size={16} className="text-[#2F5D45] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-[24px] font-bold text-[#1E3E2E] font-serif mt-2">
            {fmtLKR(cashInVault)}
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-[#4B564E] mt-2 pt-2 border-t border-[#EAE7DA]">
            <span>Pending Cheques: <strong>{fmtLKR(chequesSum.pendingTotal)}</strong></span>
            <span className="text-[#2F5D45] flex items-center gap-0.5 font-medium">
              Cashbook <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milling Performance Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#DEDACB] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#1B2420] m-0 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#2F5D45]" />
                Milling Yield & Output Performance
              </h3>
              <p className="text-[12px] text-[#4B564E] m-0 mt-0.5">
                Comparison of Paddy Input (kg) vs Finished Rice Output (kg) across recent batches
              </p>
            </div>
            <button
              type="button"
              className="text-[12px] text-[#2F5D45] font-semibold hover:underline"
              onClick={() => navigateTo('production', 'finished')}
            >
              View All Batches →
            </button>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={millingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8EA594" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8EA594" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F5D45" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2F5D45" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE7DA" vertical={false} />
                <XAxis dataKey="batch" stroke="#7C8F80" fontSize={11} tickLine={false} />
                <YAxis stroke="#7C8F80" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${fmtKg(Number(val))}`, '']}
                  contentStyle={{ backgroundColor: '#1E3E2E', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Area type="monotone" dataKey="input" name="Paddy Input (kg)" stroke="#8EA594" fillOpacity={1} fill="url(#colorInput)" strokeWidth={2} />
                <Area type="monotone" dataKey="output" name="Rice Output (kg)" stroke="#2F5D45" fillOpacity={1} fill="url(#colorOutput)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Composition Chart (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-[#DEDACB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[16px] font-bold text-[#1B2420] m-0 flex items-center gap-2">
                <Package size={18} className="text-[#C68A2E]" />
                Inventory Stock Distribution
              </h3>
            </div>
            <p className="text-[12px] text-[#4B564E] m-0 mb-4">
              Current breakdown of storage stock on hand
            </p>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stockPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${fmtKg(Number(val))}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#EAE7DA] text-[12px]">
            {stockPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#4B564E]">{item.name}</span>
                </div>
                <span className="font-semibold text-[#1B2420]">{fmtKg(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Status Modules & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Production Records Hub */}
        <div className="bg-white p-5 rounded-xl border border-[#DEDACB] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DA]">
            <div className="flex items-center gap-2">
              <Factory size={18} className="text-[#2F5D45]" />
              <h3 className="text-[15px] font-bold text-[#1B2420] m-0">Production Records</h3>
            </div>
            <span className="text-[11.5px] bg-[#E7EFE9] text-[#2F5D45] font-semibold px-2 py-0.5 rounded-md">
              4 Sub-pages
            </span>
          </div>

          <div className="space-y-2 mt-4">
            <button
              type="button"
              onClick={() => navigateTo('production', 'finished')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#FBFAF5] hover:bg-[#E7EFE9] border border-[#EAE7DA] transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-[13px] text-[#1B2420]">Finished Products</div>
                <div className="text-[11.5px] text-[#4B564E]">Rice varieties, milling batches & yields</div>
              </div>
              <span className="text-[12px] font-bold text-[#2F5D45]">{finishedBatches.length} Batches →</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('production', 'byproducts')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#FBFAF5] hover:bg-[#E7EFE9] border border-[#EAE7DA] transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-[13px] text-[#1B2420]">By-Products</div>
                <div className="text-[11.5px] text-[#4B564E]">Bran, Husk, and Broken Rice outputs</div>
              </div>
              <span className="text-[12px] font-bold text-[#2F5D45]">{fmtKg(totalByProductKg)} →</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('production', 'flour')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#FBFAF5] hover:bg-[#E7EFE9] border border-[#EAE7DA] transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-[13px] text-[#1B2420]">Rice Flour</div>
                <div className="text-[11.5px] text-[#4B564E]">Packet packaging & flour milling records</div>
              </div>
              <span className="text-[12px] font-bold text-[#2F5D45]">{fmtNum(totalFlourPackets)} Pkts →</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('production', 'stock')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#FBFAF5] hover:bg-[#E7EFE9] border border-[#EAE7DA] transition-colors text-left"
            >
              <div>
                <div className="font-semibold text-[13px] text-[#1B2420]">Consolidated Stock</div>
                <div className="text-[11.5px] text-[#4B564E]">Unified live inventory across all products</div>
              </div>
              <span className="text-[12px] font-bold text-[#C68A2E]">Full View →</span>
            </button>
          </div>
        </div>

        {/* Module 2: Recent Deliveries & Invoices (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#DEDACB] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DA]">
            <h3 className="text-[15px] font-bold text-[#1B2420] m-0">Recent Operational Deliveries</h3>
            <button
              type="button"
              className="text-[12px] text-[#2F5D45] font-semibold hover:underline"
              onClick={() => navigateTo('rmr', 'paddy')}
            >
              Raw Material Registry →
            </button>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-[13px] border-collapse min-w-[580px]">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-wider text-[#4B564E]">
                  <th className="p-2.5 font-semibold">Ref No</th>
                  <th className="p-2.5 font-semibold">Date</th>
                  <th className="p-2.5 font-semibold">Supplier</th>
                  <th className="p-2.5 font-semibold">Variety</th>
                  <th className="p-2.5 font-semibold text-right">Net Weight</th>
                  <th className="p-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DA]">
                {deliveries.slice(-5).map((d) => {
                  const supplier = supplierById(d.supplierId);
                  const varietyNames = d.items?.map((it) => it.variety).join(', ') || 'Paddy';
                  const weightKg = totalWeight(d);
                  const amount = totalAmount(d);

                  return (
                    <tr key={d.ref} className="hover:bg-[#FBFAF5] transition-colors">
                      <td className="p-2.5 font-mono font-medium text-[#2F5D45]">{d.ref}</td>
                      <td className="p-2.5 text-[#4B564E]">{fmtDate(d.date)}</td>
                      <td className="p-2.5 font-medium text-[#1B2420]">{supplier?.name || d.supplierId}</td>
                      <td className="p-2.5">{varietyNames}</td>
                      <td className="p-2.5 text-right font-mono">{fmtKg(weightKg)}</td>
                      <td className="p-2.5 text-right font-mono font-semibold text-[#1E3E2E]">
                        {fmtLKR(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EAE7DA] text-[12px] text-[#4B564E]">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#2F5D45]" />
              <span>Payroll Week Target: <strong>{payrollWeek}</strong></span>
            </div>
            <button
              type="button"
              className="text-[#2F5D45] font-semibold hover:underline"
              onClick={() => navigateTo('payroll')}
            >
              Open Payroll Module ({fmtLKR(payroll.allDeptsNetPay)}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
