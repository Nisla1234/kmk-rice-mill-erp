import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterCashCategoryModal,
  RecordCashEntryModal,
  SettleCashModal,
} from '../modals/FinanceModals';
import { CashEntry } from '../../types';
import { fmtDate, fmtNum, todayISO } from '../../utils/formatters';

export const Cashbook: React.FC = () => {
  const {
    cashDate,
    setCashDate,
    cashEntries,
    cashBalancesAsOf,
    cashCategoryById,
    deleteCashEntry,
    showToast,
  } = useApp();

  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [recordType, setRecordType] = useState<'Income' | 'Expense' | null>(null);
  const [editingEntry, setEditingEntry] = useState<CashEntry | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  const selDate = cashDate || todayISO();
  const balances = cashBalancesAsOf(selDate);

  // Filter entries for selected date
  const dayEntries = cashEntries
    .filter((e) => e.date === selDate)
    .filter((e) => (paymentMethodFilter === 'all' ? true : e.paymentMethod === paymentMethodFilter))
    .sort((a, b) => a.id - b.id);

  const totalIncomeCash = dayEntries
    .filter((e) => e.type === 'Income' && e.paymentMethod === 'Cash')
    .reduce((s, e) => s + e.amount, 0);

  const totalExpenseCash = dayEntries
    .filter((e) => e.type === 'Expense' && e.paymentMethod === 'Cash')
    .reduce((s, e) => s + e.amount, 0);

  const closingCash = balances.cash + totalIncomeCash - totalExpenseCash;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Cash Book</h1>
        <SubTabs />
      </div>

      {/* Date Bar */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[20px]">
        <label className="text-[12px] font-semibold text-[#4B564E]">Selected Date</label>
        <input
          type="date"
          value={cashDate}
          onChange={(e) => setCashDate(e.target.value)}
          className="font-medium"
        />
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setCashDate(todayISO())}
        >
          Today
        </button>

        <label className="text-[12px] font-semibold text-[#4B564E] ml-[14px]">Payment Method</label>
        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
        >
          <option value="all">All (Cash &amp; Cheque)</option>
          <option value="Cash">Cash Only</option>
          <option value="Cheque">Cheque Only</option>
        </select>

        <div className="grow" />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => showToast(`Printing Cashbook for ${fmtDate(selDate)}…`)}
        >
          🖨 Print Day Sheet
        </button>
      </div>

      {/* Daily Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Opening Cash in Hand</div>
          <div className="text-[24px] font-semibold text-[#FBF7EC] font-serif">LKR {fmtNum(balances.cash)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Cash Inflow (Today)</div>
          <div className="text-[24px] font-semibold text-[#1F6F63] font-serif">LKR {fmtNum(totalIncomeCash)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Cash Outflow (Today)</div>
          <div className="text-[24px] font-semibold text-[#A63D2C] font-serif">LKR {fmtNum(totalExpenseCash)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Calculated Closing Cash</div>
          <div className="text-[24px] font-semibold text-[#7A5518] font-serif">LKR {fmtNum(closingCash)}</div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingEntry(null);
            setRecordType('Income');
          }}
        >
          ＋ Record Income
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditingEntry(null);
            setRecordType('Expense');
          }}
        >
          ＋ Record Expense
        </button>
        <button type="button" className="btn" onClick={() => setIsCategoryModalOpen(true)}>
          ＋ Register Category
        </button>
        <button
          type="button"
          className="btn btn-gold ml-auto"
          onClick={() => setIsSettleModalOpen(true)}
        >
          🪙 Settle Cash in Hand
        </button>
      </div>

      {/* Cash Entries Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Time / Date</th>
              <th className="p-[12px_16px] font-semibold">Type</th>
              <th className="p-[12px_16px] font-semibold">Category</th>
              <th className="p-[12px_16px] font-semibold">Description</th>
              <th className="p-[12px_16px] font-semibold">Method</th>
              <th className="p-[12px_16px] font-semibold">Amount</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dayEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No income or expense entries logged for {fmtDate(selDate)}.
                </td>
              </tr>
            ) : (
              dayEntries.map((e) => {
                const cat = cashCategoryById(e.categoryId);
                return (
                  <tr key={e.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{fmtDate(e.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className={`pay-chip ${e.type === 'Income' ? 'cash' : 'credit'}`}>{e.type}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{cat ? cat.name : '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px]">{e.description || '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="pay-chip cash">{e.paymentMethod}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold">
                      <span className={e.type === 'Income' ? 'text-[#1F6F63]' : 'text-[#A63D2C]'}>
                        {e.type === 'Income' ? '+' : '-'} LKR {fmtNum(e.amount)}
                      </span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px]">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingEntry(e);
                            setRecordType(e.type);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => {
                            if (confirm('Delete this cashbook entry?')) deleteCashEntry(e.id);
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
            {dayEntries.length} transaction{dayEntries.length !== 1 ? 's' : ''} on {fmtDate(selDate)}
          </span>
          <span>Day Sheet · Cash in Hand Book</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterCashCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <RecordCashEntryModal
        isOpen={recordType !== null}
        type={recordType || 'Income'}
        initialData={editingEntry}
        onClose={() => {
          setRecordType(null);
          setEditingEntry(null);
        }}
      />
      <SettleCashModal isOpen={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} />
    </div>
  );
};
