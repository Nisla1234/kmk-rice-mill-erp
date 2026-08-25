import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import { fmtDate, fmtNum } from '../../utils/formatters';

export const SupplierLedger: React.FC = () => {
  const { suppliers, supplierById, ledgerEntries, showToast } = useApp();
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');

  const activeSupplier = supplierById(selectedSupplierId) || suppliers[0];
  const rows = activeSupplier ? ledgerEntries(activeSupplier.id) : [];

  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const net = totalCredit - totalDebit;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Supplier Ledger</h1>
        <SubTabs />
      </div>

      {/* Account Selector Panel */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] mb-[20px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E] mb-[14px]">
          Select Account · Supplier Ledger
        </div>
        <select
          value={selectedSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
          className="min-w-[280px]"
        >
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.location || 'Local'})
            </option>
          ))}
        </select>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-[14px] mb-[20px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Account</div>
          <div className="text-[18px] font-semibold text-[#FBF7EC] font-serif truncate">
            {activeSupplier ? activeSupplier.name : '—'}
          </div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Credit</div>
          <div className="text-[26px] font-semibold text-[#A63D2C] font-serif">LKR {fmtNum(totalCredit)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Debit</div>
          <div className="text-[26px] font-semibold text-[#1F6F63] font-serif">LKR {fmtNum(totalDebit)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Net Balance</div>
          <div className="text-[26px] font-semibold text-[#C68A2E] font-serif">LKR {fmtNum(net)}</div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button type="button" className="btn" onClick={() => showToast('Preparing CSV export…')}>
          ⬇ Export CSV
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => showToast('Sending ledger to printer…')}
        >
          🖨 Print Ledger
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Date</th>
              <th className="p-[12px_16px] font-semibold">Ref No</th>
              <th className="p-[12px_16px] font-semibold">Debit</th>
              <th className="p-[12px_16px] font-semibold">Credit</th>
              <th className="p-[12px_16px] font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No ledger activity yet for this supplier.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                  <td className="p-[14px_16px] text-[13.5px]">{fmtDate(r.date)}</td>
                  <td className="p-[14px_16px] text-[13.5px]">
                    <span className="ref-badge">{r.ref}</span>
                  </td>
                  <td className="p-[14px_16px] text-[13.5px] font-mono text-[#1F6F63]">
                    {r.debit ? `LKR ${fmtNum(r.debit)}` : '—'}
                  </td>
                  <td className="p-[14px_16px] text-[13.5px] font-mono text-[#A63D2C]">
                    {r.credit ? `LKR ${fmtNum(r.credit)}` : '—'}
                  </td>
                  <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1B2420]">
                    LKR {fmtNum(r.balance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <div className="flex justify-between items-center p-[10px_16px] text-[12px] text-[#4B564E] border-t border-[#EAE7DA]">
          <span>{rows.length} ledger entries</span>
          <span>Auto-updated from Paddy Deliveries &amp; Outstanding Payments</span>
        </div>
      </div>
    </div>
  );
};
