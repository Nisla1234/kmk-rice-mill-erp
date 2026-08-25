import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterFlourModal,
  ViewFlourProductsModal,
  AddFlourBatchModal,
} from '../modals/ProductionModals';
import { FlourBatch } from '../../types';
import { fmtDate, fmtKg, fmtNum, todayISO } from '../../utils/formatters';

export const RiceFlour: React.FC = () => {
  const {
    flourProducts,
    flourBatches,
    flourOutputSum,
    computeFlourStock,
    deleteFlourBatch,
    showToast,
  } = useApp();

  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<FlourBatch | null>(null);

  // Compute stats safely
  const totalOutputKg = flourBatches.reduce((s, b) => s + flourOutputSum(b), 0);
  const totalPackets = flourBatches.reduce(
    (s, b) => s + b.outputs.reduce((os, o) => os + (Number(o.packets) || 0), 0),
    0
  );
  const flourStockList = computeFlourStock();
  const totalStockPackets = flourStockList.reduce((s, it) => s + it.stockPackets, 0);
  const totalStockKg = flourStockList.reduce((s, it) => s + it.totalKg, 0);

  const filteredBatches = flourBatches
    .filter((b) => {
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
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Rice Flour</h1>
        <SubTabs />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Flour Production Stats
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Flour Produced</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">{fmtKg(totalOutputKg)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Packets Produced</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtNum(totalPackets)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Flour in Stock (Packets)</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtNum(totalStockPackets)} pkts</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Flour Stock Weight</div>
          <div className="text-[26px] font-semibold text-[#7A5518] font-serif">{fmtKg(totalStockKg)}</div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button type="button" className="btn" onClick={() => setIsRegisterOpen(true)}>
          ＋ Register Flour Product
        </button>
        <button type="button" className="btn" onClick={() => setIsViewOpen(true)}>
          👁 View Flour Products
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingBatch(null);
            setIsAddBatchOpen(true);
          }}
        >
          ＋ Add Flour Batch
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Flour Production…')}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
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

      {/* Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Date</th>
              <th className="p-[12px_16px] font-semibold">Batch No</th>
              <th className="p-[12px_16px] font-semibold">Outputs Breakdown</th>
              <th className="p-[12px_16px] font-semibold text-right">Total Packets</th>
              <th className="p-[12px_16px] font-semibold text-right">Total Output (kg)</th>
              <th className="p-[12px_16px] font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No flour batches recorded yet. Click &ldquo;Add Flour Batch&rdquo; to record one.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const outSum = flourOutputSum(b);
                const totalPkts = b.outputs.reduce((s, o) => s + (Number(o.packets) || 0), 0);

                return (
                  <tr key={b.batchNo} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(b.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{b.batchNo}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex flex-wrap gap-1.5">
                        {b.outputs.map((o, idx) => {
                          const p = flourProducts.find((x) => x.id === o.productId);
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[12px] bg-[#E7EFE9] text-[#1E3E2E] font-medium"
                            >
                              {o.packets} pkts × {p ? p.name : 'Flour'}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1B2420] text-right">
                      {fmtNum(totalPkts)} pkts
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E] text-right">
                      {fmtKg(outSum)}
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
                            if (confirm(`Delete flour batch ${b.batchNo}?`)) {
                              deleteFlourBatch(b.batchNo);
                              showToast(`Flour batch ${b.batchNo} deleted`);
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
            {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
          </span>
          <span>Rice Mill ERP · Rice Flour Mill</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterFlourModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ViewFlourProductsModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} />
      <AddFlourBatchModal
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
