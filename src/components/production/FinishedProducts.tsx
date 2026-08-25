import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterFinishedProductModal,
  ViewFinishedProductsModal,
  AddFinishedBatchModal,
} from '../modals/ProductionModals';
import { FinishedBatch } from '../../types';
import { fmtDate, fmtKg, todayISO } from '../../utils/formatters';

export const FinishedProducts: React.FC = () => {
  const {
    finishedBatches,
    finishedTotals,
    finishedOutputSum,
    deleteFinishedBatch,
    showToast,
  } = useApp();

  const [methodFilter, setMethodFilter] = useState('all');
  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isViewProductsOpen, setIsViewProductsOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<FinishedBatch | null>(null);

  const t = finishedTotals();

  const filteredBatches = finishedBatches
    .filter((b) => {
      if (methodFilter !== 'all' && b.processType !== methodFilter) return false;

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
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Finished Products</h1>
        <SubTabs />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Production Stats
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Paddy Processed</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">{fmtKg(t.paddyTotal)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Nadu Rice</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(t.byVariety['Nadu'] || 0)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Samba</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(t.byVariety['Samba'] || 0)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Keeri Samba</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(t.byVariety['Keeri Samba'] || 0)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Avg. Yield</div>
          <div className="text-[26px] font-semibold text-[#7A5518] font-serif">
            {t.avgYield.toFixed(1)}
            <span className="text-[14px] text-[#4B564E] ml-[2px] font-normal">%</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button type="button" className="btn" onClick={() => setIsRegisterOpen(true)}>
          ＋ Register Product
        </button>
        <button type="button" className="btn" onClick={() => setIsViewProductsOpen(true)}>
          👁 View Products
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingBatch(null);
            setIsAddBatchOpen(true);
          }}
        >
          ＋ Add New Batch
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Finished Products…')}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Select Method</label>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
          <option value="all">All Methods</option>
          <option value="Parboiled">Parboiled</option>
          <option value="Raw">Raw</option>
        </select>

        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Select Time</label>
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

      {/* Batches Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Date</th>
              <th className="p-[12px_16px] font-semibold">Batch No</th>
              <th className="p-[12px_16px] font-semibold">Variety</th>
              <th className="p-[12px_16px] font-semibold">Method</th>
              <th className="p-[12px_16px] font-semibold">P. Input</th>
              <th className="p-[12px_16px] font-semibold">R. Output</th>
              <th className="p-[12px_16px] font-semibold">Yield</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No production batches recorded yet. Click “Add New Batch” to log the first one.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const outSum = finishedOutputSum(b);
                const yieldPct = b.paddyInput > 0 ? (outSum / b.paddyInput) * 100 : 0;
                return (
                  <tr key={b.batchNo} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(b.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{b.batchNo}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{b.variety}</td>
                    <td className="p-[14px_16px] text-[13.5px]">{b.processType}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{fmtKg(b.paddyInput)}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E]">
                      {fmtKg(outSum)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{yieldPct.toFixed(1)}%</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px]">
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
                            if (confirm(`Delete batch ${b.batchNo}?`)) deleteFinishedBatch(b.batchNo);
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
            {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
          </span>
          <span>Sends output to Stock · Finished Products</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterFinishedProductModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ViewFinishedProductsModal isOpen={isViewProductsOpen} onClose={() => setIsViewProductsOpen(false)} />
      <AddFinishedBatchModal
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
