import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import { SettleInvoiceModal } from '../modals/SalesModals';
import { Invoice } from '../../types';
import { fmtDate, fmtNum, todayISO } from '../../utils/formatters';

export const Settlements: React.FC = () => {
  const {
    settlements,
    invoices,
    clients,
    clientById,
    invoiceById,
    salesTotals,
    deleteSettlement,
    showToast,
  } = useApp();

  const [clientFilter, setClientFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [settlingInvoice, setSettlingInvoice] = useState<Invoice | null>(null);

  const stats = salesTotals();

  const filteredSettlements = settlements
    .filter((s) => {
      const inv = invoiceById(s.invoiceNo);
      if (clientFilter !== 'all' && inv?.clientId !== clientFilter) return false;
      if (methodFilter !== 'all' && s.method !== methodFilter) return false;

      const today = todayISO();
      if (dateMode === 'today' && s.date !== today) return false;
      if (dateMode === 'week') {
        const dObj = new Date(s.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 7);
        if (dObj < start) return false;
      }
      if (dateMode === 'month') {
        const dObj = new Date(s.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 30);
        if (dObj < start) return false;
      }
      if (dateMode === 'custom') {
        if (fromDate && s.date < fromDate) return false;
        if (toDate && s.date > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Settlements</h1>
        <SubTabs />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Collections Summary
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Collected</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">LKR {fmtNum(stats.totalCollected)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Remaining Receivables</div>
          <div className="text-[26px] font-semibold text-[#A63D2C] font-serif">
            LKR {fmtNum(stats.totalOutstanding)}
          </div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Payment Receipts</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{settlements.length}</div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const firstUnpaid = invoices.find((i) => i.totalAmount > 0);
            if (firstUnpaid) setSettlingInvoice(firstUnpaid);
            else showToast('All invoices settled');
          }}
        >
          ＋ Record Payment
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Settlements…')}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Client</label>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Method</label>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
          <option value="all">All Methods</option>
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
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

      {/* Settlements Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Payment Date</th>
              <th className="p-[12px_16px] font-semibold">Invoice No</th>
              <th className="p-[12px_16px] font-semibold">Client</th>
              <th className="p-[12px_16px] font-semibold">Method</th>
              <th className="p-[12px_16px] font-semibold">Cheque No</th>
              <th className="p-[12px_16px] font-semibold">Amount Paid</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSettlements.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No settlements recorded yet.
                </td>
              </tr>
            ) : (
              filteredSettlements.map((s) => {
                const inv = invoiceById(s.invoiceNo);
                const client = inv ? clientById(inv.clientId) : null;

                return (
                  <tr key={s.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(s.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{s.invoiceNo}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{client ? client.name : '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className={`pay-chip ${s.method === 'Cash' ? 'cash' : 'credit'}`}>{s.method}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      {s.chequeNo ? <span className="ref-badge">{s.chequeNo}</span> : '—'}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1F6F63]">
                      LKR {fmtNum(s.amount)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <button
                        type="button"
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => {
                          if (confirm('Delete this settlement payment?')) deleteSettlement(s.id);
                        }}
                      >
                        🗑
                      </button>
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
            {filteredSettlements.length} settlement{filteredSettlements.length !== 1 ? 's' : ''}
          </span>
          <span>Automatically updates Cashbook &amp; Cheque Registry</span>
        </div>
      </div>

      {/* Settle Modal */}
      <SettleInvoiceModal
        isOpen={!!settlingInvoice}
        invoice={settlingInvoice}
        onClose={() => setSettlingInvoice(null)}
      />
    </div>
  );
};
