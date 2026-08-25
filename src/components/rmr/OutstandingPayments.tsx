import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import { PayOutstandingModal, RecordDeliveryModal } from '../modals/RmrModals';
import { Delivery } from '../../types';
import { fmtDate, fmtNum } from '../../utils/formatters';

export const OutstandingPayments: React.FC = () => {
  const { outstandingList, supplierById } = useApp();

  const [payingItem, setPayingItem] = useState<{ delivery: Delivery; bal: number } | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  const list = outstandingList().sort((a, b) => a.d.date.localeCompare(b.d.date));
  const totalPayable = list.reduce((s, x) => s + x.bal, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Outstanding Payments</h1>
        <SubTabs />
      </div>

      {/* Stat Card */}
      <div className="grid grid-cols-1 max-w-[320px] mb-[22px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Payables</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">LKR {fmtNum(totalPayable)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Supplier</th>
              <th className="p-[12px_16px] font-semibold">Ref No</th>
              <th className="p-[12px_16px] font-semibold">Delivery Date</th>
              <th className="p-[12px_16px] font-semibold">Amount</th>
              <th className="p-[12px_16px] font-semibold">Aging</th>
              <th className="p-[12px_16px] font-semibold">Description</th>
              <th className="p-[12px_16px] font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No outstanding balances — every credit delivery has been settled.
                </td>
              </tr>
            ) : (
              list.map(({ d, bal, days }) => {
                const sup = supplierById(d.supplierId);
                return (
                  <tr key={d.ref} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{sup ? sup.name : '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{d.ref}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(d.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#A63D2C]">
                      LKR {fmtNum(bal)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      {days} day{days !== 1 ? 's' : ''}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      {d.note ? (
                        <span className="text-[12px] text-[#4B564E] italic">{d.note}</span>
                      ) : (
                        <span className="text-[#9AA69C]">—</span>
                      )}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px] flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-gold"
                          onClick={() => setPayingItem({ delivery: d, bal })}
                        >
                          Pay
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setEditingDelivery(d)}
                        >
                          Edit
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
            {list.length} outstanding record{list.length !== 1 ? 's' : ''}
          </span>
          <span>Updates the Supplier Ledger automatically</span>
        </div>
      </div>

      {/* Pay Modal */}
      <PayOutstandingModal
        isOpen={!!payingItem}
        delivery={payingItem?.delivery || null}
        bal={payingItem?.bal || 0}
        onClose={() => setPayingItem(null)}
      />

      {/* Edit Delivery Modal */}
      <RecordDeliveryModal
        isOpen={!!editingDelivery}
        initialData={editingDelivery}
        onClose={() => setEditingDelivery(null)}
      />
    </div>
  );
};
