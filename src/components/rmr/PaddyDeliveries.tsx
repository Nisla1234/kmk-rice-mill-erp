import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterFarmerModal,
  RegisterVarietyModal,
  RecordDeliveryModal,
  ViewDeliveryModal,
} from '../modals/RmrModals';
import { Delivery } from '../../types';
import { fmtDate, fmtNum, fmtKg, todayISO } from '../../utils/formatters';

export const PaddyDeliveries: React.FC = () => {
  const {
    suppliers,
    deliveries,
    period,
    setPeriod,
    computeStockTotals,
    supplierById,
    totalWeight,
    totalAmount,
    deleteDelivery,
    showToast,
  } = useApp();

  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals state
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [viewingDelivery, setViewingDelivery] = useState<Delivery | null>(null);

  const stock = computeStockTotals();

  // Filter deliveries
  const filteredDeliveries = deliveries
    .filter((d) => {
      if (supplierFilter !== 'all' && d.supplierId !== supplierFilter) return false;

      const today = todayISO();
      if (dateMode === 'today' && d.date !== today) return false;
      if (dateMode === 'week') {
        const dObj = new Date(d.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 7);
        if (dObj < start) return false;
      }
      if (dateMode === 'month') {
        const dObj = new Date(d.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 30);
        if (dObj < start) return false;
      }
      if (dateMode === 'custom') {
        if (fromDate && d.date < fromDate) return false;
        if (toDate && d.date > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Paddy Deliveries</h1>
        <SubTabs />
      </div>

      {/* Stats Header & Period Switch */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Raw Material Stats
        </div>
        <div className="flex items-center gap-[8px] bg-white border border-[#DEDACB] rounded-[8px] p-[4px]">
          <button
            type="button"
            className={`border-none bg-transparent py-[6px] px-[12px] rounded-[6px] text-[12.5px] font-medium cursor-pointer transition-colors ${
              period === 'daily' ? 'bg-[#2F5D45] text-white' : 'text-[#4B564E] hover:text-[#1B2420]'
            }`}
            onClick={() => setPeriod('daily')}
          >
            Daily
          </button>
          <button
            type="button"
            className={`border-none bg-transparent py-[6px] px-[12px] rounded-[6px] text-[12.5px] font-medium cursor-pointer transition-colors ${
              period === 'weekly' ? 'bg-[#2F5D45] text-white' : 'text-[#4B564E] hover:text-[#1B2420]'
            }`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`border-none bg-transparent py-[6px] px-[12px] rounded-[6px] text-[12.5px] font-medium cursor-pointer transition-colors ${
              period === 'monthly' ? 'bg-[#2F5D45] text-white' : 'text-[#4B564E] hover:text-[#1B2420]'
            }`}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
          <span className="text-[12px] text-[#4B564E] py-0 px-[8px] border-l border-[#DEDACB] ml-[2px]">
            as of {fmtDate(todayISO())}
          </span>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Raw Material</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">{fmtKg(stock.total)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Nadu Paddy</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(stock.byVariety['Nadu'] || 0)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Samba Paddy</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(stock.byVariety['Samba'] || 0)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Keeri Samba</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">
            {fmtKg(stock.byVariety['Keeri Samba'] || 0)}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingDelivery(null);
            setIsDeliveryModalOpen(true);
          }}
        >
          ＋ Record Delivery
        </button>
        <button type="button" className="btn" onClick={() => setIsFarmerModalOpen(true)}>
          ＋ Register Farmer
        </button>
        <button type="button" className="btn" onClick={() => setIsVarietyModalOpen(true)}>
          ＋ Register Variety
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Paddy Deliveries…')}
        >
          ⬇ Download CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Suppliers</label>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
          <option value="all">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Date</label>
        <select value={dateMode} onChange={(e) => setDateMode(e.target.value)}>
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="custom">Custom range</option>
        </select>

        {dateMode === 'custom' && (
          <div className="flex items-center gap-[6px] text-[12px] text-[#4B564E]">
            From <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /> → To{' '}
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        )}

        <div className="grow" />
        <button type="button" className="btn btn-sm" onClick={() => showToast('Filters applied')}>
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Date</th>
              <th className="p-[12px_16px] font-semibold">Ref No</th>
              <th className="p-[12px_16px] font-semibold">Supplier</th>
              <th className="p-[12px_16px] font-semibold">Total Weight</th>
              <th className="p-[12px_16px] font-semibold">Total Amount</th>
              <th className="p-[12px_16px] font-semibold">Payment</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No deliveries recorded yet. Click “Record Delivery” to add the first one.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((d) => {
                const sup = supplierById(d.supplierId);
                const w = totalWeight(d);
                const amt = totalAmount(d);

                return (
                  <tr key={d.ref} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(d.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{d.ref}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{sup ? sup.name : '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{fmtKg(w)}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold">LKR {fmtNum(amt)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className={`pay-chip ${d.payment === 'Cash' ? 'cash' : 'credit'}`}>{d.payment}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px] flex-wrap">
                        <button
                          type="button"
                          className="icon-btn"
                          title="View"
                          onClick={() => setViewingDelivery(d)}
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Print"
                          onClick={() => {
                            setViewingDelivery(d);
                            setTimeout(() => showToast(`Sending delivery ${d.ref} to printer…`), 150);
                          }}
                        >
                          🖨
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit"
                          onClick={() => {
                            setEditingDelivery(d);
                            setIsDeliveryModalOpen(true);
                          }}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete delivery ${d.ref}? This cannot be undone.`)) {
                              deleteDelivery(d.ref);
                            }
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        <div className="flex justify-between items-center p-[10px_16px] text-[12px] text-[#4B564E] border-t border-[#EAE7DA]">
          <span>
            {filteredDeliveries.length} record{filteredDeliveries.length !== 1 ? 's' : ''}
          </span>
          <span>Rice Mill ERP · Raw Material Registry</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterFarmerModal isOpen={isFarmerModalOpen} onClose={() => setIsFarmerModalOpen(false)} />
      <RegisterVarietyModal isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} />
      <RecordDeliveryModal
        isOpen={isDeliveryModalOpen}
        initialData={editingDelivery}
        onClose={() => {
          setIsDeliveryModalOpen(false);
          setEditingDelivery(null);
        }}
      />
      <ViewDeliveryModal
        isOpen={!!viewingDelivery}
        delivery={viewingDelivery}
        onClose={() => setViewingDelivery(null)}
      />
    </div>
  );
};
