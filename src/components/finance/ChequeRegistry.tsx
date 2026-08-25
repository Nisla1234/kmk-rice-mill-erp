import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterBankModal,
  AddChequeModal,
  ReturnChequeModal,
  ViewAllocationsModal,
  RescheduleChequeModal,
} from '../modals/FinanceModals';
import { Cheque } from '../../types';
import { fmtDate, fmtNum, todayISO } from '../../utils/formatters';

export const ChequeRegistry: React.FC = () => {
  const {
    chequeTab,
    setChequeTab,
    cheques,
    bankAccounts,
    clientById,
    supplierById,
    salesTeamById,
    bankAccountById,
    chequeTotals,
    allocateCheque,
    deleteCheque,
    showToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [addChequeType, setAddChequeType] = useState<'Received' | 'Issued' | null>(null);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAllocationsModalOpen, setIsAllocationsModalOpen] = useState(false);
  const [reschedulingCheque, setReschedulingCheque] = useState<Cheque | null>(null);

  const stats = chequeTotals();

  // Filter based on tab & filters
  const filteredCheques = cheques
    .filter((c) => {
      if (chequeTab === 'received' && c.type !== 'Received') return false;
      if (chequeTab === 'issued' && c.type !== 'Issued') return false;
      if (chequeTab === 'pending' && c.status !== 'Pending') return false;

      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      const today = todayISO();
      if (dateMode === 'today' && c.chequeDate !== today) return false;
      if (dateMode === 'week') {
        const dObj = new Date(c.chequeDate + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 7);
        if (dObj < start) return false;
      }
      if (dateMode === 'month') {
        const dObj = new Date(c.chequeDate + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 30);
        if (dObj < start) return false;
      }
      if (dateMode === 'custom') {
        if (fromDate && c.chequeDate < fromDate) return false;
        if (toDate && c.chequeDate > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => a.chequeDate.localeCompare(b.chequeDate));

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Cheque Registry</h1>
        <SubTabs />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Cheques Overview
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Pending Cheques Total</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">LKR {fmtNum(stats.pendingTotal)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Cheques Received</div>
          <div className="text-[26px] font-semibold text-[#1F6F63] font-serif">LKR {fmtNum(stats.receivedTotal)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Cheques Issued</div>
          <div className="text-[26px] font-semibold text-[#A63D2C] font-serif">LKR {fmtNum(stats.issuedTotal)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Count</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{cheques.length}</div>
        </div>
      </div>

      {/* Sub-Tab Navigation for Cheques */}
      <div className="flex gap-[8px] mb-[18px] flex-wrap">
        <button
          type="button"
          className={`subtab-pill ${chequeTab === 'received' ? 'active' : ''}`}
          onClick={() => setChequeTab('received')}
        >
          Received Cheques (from Clients)
        </button>
        <button
          type="button"
          className={`subtab-pill ${chequeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setChequeTab('issued')}
        >
          Issued Cheques (to Suppliers)
        </button>
        <button
          type="button"
          className={`subtab-pill ${chequeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setChequeTab('pending')}
        >
          Pending Clearance
        </button>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        {chequeTab === 'received' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingCheque(null);
              setAddChequeType('Received');
            }}
          >
            ＋ Add Cheque (Received)
          </button>
        )}
        {chequeTab === 'issued' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingCheque(null);
              setAddChequeType('Issued');
            }}
          >
            ＋ Issue Cheque (Supplier)
          </button>
        )}
        {chequeTab === 'pending' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingCheque(null);
              setAddChequeType('Received');
            }}
          >
            ＋ Add Cheque
          </button>
        )}

        <button type="button" className="btn" onClick={() => setIsBankModalOpen(true)}>
          ＋ Register Bank Account
        </button>
        <button type="button" className="btn" onClick={() => setIsAllocationsModalOpen(true)}>
          👁 View Allocations
        </button>
        <button type="button" className="btn" onClick={() => setIsReturnModalOpen(true)}>
          ↩ Return Cheque
        </button>

        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Cheques…')}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Deposited">Deposited / Allocated</option>
          <option value="Cleared">Cleared</option>
          <option value="Returned">Returned</option>
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
          <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Cheque Date</th>
              <th className="p-[12px_16px] font-semibold">Cheque No</th>
              <th className="p-[12px_16px] font-semibold">Party</th>
              <th className="p-[12px_16px] font-semibold">Bank</th>
              <th className="p-[12px_16px] font-semibold">Amount</th>
              <th className="p-[12px_16px] font-semibold">Status / Allocation</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCheques.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No cheques found matching current filters.
                </td>
              </tr>
            ) : (
              filteredCheques.map((c) => {
                const party = c.type === 'Received' ? clientById(c.partyId) : supplierById(c.partyId);
                const team = c.salesTeamId ? salesTeamById(c.salesTeamId) : null;
                const allocatedAcc = c.allocatedBankAccountId ? bankAccountById(c.allocatedBankAccountId) : null;

                return (
                  <tr key={c.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{fmtDate(c.chequeDate)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{c.chequeNo}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="font-medium">{party ? party.name : '—'}</div>
                      {team && <div className="text-[11px] text-[#9AA69C]">{team.lorryNo} · {team.salesRep}</div>}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">{c.bank}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold">
                      LKR {fmtNum(c.amount)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      {c.status === 'Pending' ? (
                        <div className="flex items-center gap-[6px]">
                          <span className="pay-chip credit">Pending</span>
                          <select
                            className="text-[11.5px] py-[3px] px-[6px] max-w-[140px]"
                            value={c.allocatedBankAccountId || ''}
                            onChange={(e) => allocateCheque(c.id, e.target.value || null)}
                          >
                            <option value="">Allocate Bank…</option>
                            {bankAccounts.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.bankName}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : c.status === 'Deposited' ? (
                        <div>
                          <span className="pay-chip cash">Allocated</span>
                          {allocatedAcc && (
                            <div className="text-[11px] text-[#1F6F63] font-medium mt-[2px]">
                              {allocatedAcc.bankName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`pay-chip ${c.status === 'Cleared' ? 'cash' : 'credit'}`}>
                          {c.status}
                        </span>
                      )}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px] flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm"
                          title="Reschedule Date"
                          onClick={() => setReschedulingCheque(c)}
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingCheque(c);
                            setAddChequeType(c.type);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete cheque ${c.chequeNo}?`)) deleteCheque(c.id);
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
            {filteredCheques.length} cheque{filteredCheques.length !== 1 ? 's' : ''}
          </span>
          <span>Rice Mill ERP · Cheque Book</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterBankModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
      <AddChequeModal
        isOpen={addChequeType !== null}
        type={addChequeType || 'Received'}
        initialData={editingCheque}
        onClose={() => {
          setAddChequeType(null);
          setEditingCheque(null);
        }}
      />
      <ReturnChequeModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
      <ViewAllocationsModal isOpen={isAllocationsModalOpen} onClose={() => setIsAllocationsModalOpen(false)} />
      <RescheduleChequeModal
        isOpen={!!reschedulingCheque}
        cheque={reschedulingCheque}
        onClose={() => setReschedulingCheque(null)}
      />
    </div>
  );
};
