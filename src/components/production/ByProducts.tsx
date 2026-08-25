import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterByProductModal,
  ViewByProductsModal,
  AddByProductBatchModal,
} from '../modals/ProductionModals';
import { ByProductBatch } from '../../types';
import { fmtDate, fmtKg, fmtNum, todayISO } from '../../utils/formatters';

export const ByProducts: React.FC = () => {
  const {
    byProducts,
    byProductBatches,
    deleteByProductBatch,
    showToast,
  } = useApp();

  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [productFilter, setProductFilter] = useState('all');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ByProductBatch | null>(null);

  // Compute stats safely
  const totalByProductsKg = byProductBatches.reduce((s, b) => s + (Number(b.out) || 0), 0);
  
  const branAndPolishKg = byProductBatches.reduce((s, b) => {
    const p = byProducts.find((x) => x.id === b.productId);
    if (p && (p.name.toLowerCase().includes('bran') || p.name.toLowerCase().includes('polish'))) {
      return s + (Number(b.out) || 0);
    }
    return s;
  }, 0);

  const huskKg = byProductBatches.reduce((s, b) => {
    const p = byProducts.find((x) => x.id === b.productId);
    if (p && p.name.toLowerCase().includes('husk')) {
      return s + (Number(b.out) || 0);
    }
    return s;
  }, 0);

  const brokenRiceKg = byProductBatches.reduce((s, b) => {
    const p = byProducts.find((x) => x.id === b.productId);
    if (p && p.name.toLowerCase().includes('broken')) {
      return s + (Number(b.out) || 0);
    }
    return s;
  }, 0);

  const filteredBatches = byProductBatches
    .filter((b) => {
      if (productFilter !== 'all' && b.productId !== productFilter) return false;

      const today = todayISO();
      if (dateMode === 'today' && b.date !== today) return false;
      if (dateMode === 'week') {
        const dObj = new Date(b.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 7);
        if (dObj < start) return false;
      }
      if (dateMode === 'month') {
        const dObj = new Date(b.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 30);
        if (dObj < start) return false;
      }
      if (dateMode === 'custom') {
        if (fromDate && b.date < fromDate) return false;
        if (toDate && b.date > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">By-Products</h1>
        <SubTabs />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          By-Product Production Stats
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total By-Products Output</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">{fmtKg(totalByProductsKg)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Rice Bran & Polish</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(branAndPolishKg)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Paddy Husk</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(huskKg)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Broken Rice</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(brokenRiceKg)}</div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button type="button" className="btn" onClick={() => setIsRegisterOpen(true)}>
          ＋ Register By-Product
        </button>
        <button type="button" className="btn" onClick={() => setIsViewOpen(true)}>
          👁 View By-Products
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingBatch(null);
            setIsAddBatchOpen(true);
          }}
        >
          ＋ Add By-Product Output
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of By-Products…')}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Filter By-Product</label>
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="all">All by-products</option>
          {byProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.variety})
            </option>
          ))}
        </select>

        <label className="text-[12px] text-[#4B564E] font-semibold ml-[8px] mr-[2px]">Time Period</label>
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
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Date</th>
              <th className="p-[12px_16px] font-semibold">Batch No</th>
              <th className="p-[12px_16px] font-semibold">By-Product Item</th>
              <th className="p-[12px_16px] font-semibold">Unit Price</th>
              <th className="p-[12px_16px] font-semibold text-right">Output Weight (kg)</th>
              <th className="p-[12px_16px] font-semibold text-right">Est. Value (LKR)</th>
              <th className="p-[12px_16px] font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No by-product outputs recorded yet. Click &ldquo;Add By-Product Output&rdquo; to record one.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const p = byProducts.find((x) => x.id === b.productId);
                const unitPrice = p ? p.unitPrice : 0;
                const totalValue = unitPrice * (Number(b.out) || 0);

                return (
                  <tr key={b.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(b.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{b.batchNo}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="font-medium text-[#1B2420]">{p ? p.name : 'Unknown Product'}</div>
                      <div className="text-[11.5px] text-[#4B564E]">
                        {p ? `${p.variety} · ${p.processType}` : ''}
                      </div>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono text-[#4B564E]">
                      {p ? `Rs. ${p.unitPrice}/kg` : '—'}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E] text-right">
                      {fmtKg(b.out)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-medium text-[#1B2420] text-right">
                      Rs. {fmtNum(totalValue)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] text-center">
                      <div className="flex gap-[6px] justify-center">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingBatch(b);
                            setIsAddBatchOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete by-product entry for batch ${b.batchNo}?`)) {
                              deleteByProductBatch(b.id);
                              showToast(`By-product batch ${b.batchNo} deleted`);
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
            {filteredBatches.length} record{filteredBatches.length !== 1 ? 's' : ''}
          </span>
          <span>Rice Mill ERP · By-Products</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterByProductModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ViewByProductsModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} />
      <AddByProductBatchModal
        isOpen={isAddBatchOpen}
        initialData={editingBatch}
        onClose={() => {
          setIsAddBatchOpen(false);
          setEditingBatch(null);
        }}
      />
    </div>
  );
};
