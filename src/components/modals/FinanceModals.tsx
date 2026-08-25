import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CashEntry, Cheque } from '../../types';
import { todayISO, fmtDate, fmtNum } from '../../utils/formatters';

/* ---------------- REGISTER CASH CATEGORY MODAL ---------------- */
export const RegisterCashCategoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { saveCashCategory, showToast } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Income');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a category name');
      return;
    }
    saveCashCategory(name.trim(), type);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register Category</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] flex flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Category Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Transport" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- RECORD / EDIT INCOME / EXPENSE MODAL ---------------- */
export const RecordCashEntryModal: React.FC<{
  isOpen: boolean;
  type: 'Income' | 'Expense';
  initialData?: CashEntry | null;
  onClose: () => void;
}> = ({ isOpen, type, initialData, onClose }) => {
  const { cashDate, cashCategories, saveCashEntry, showToast } = useApp();
  const [date, setDate] = useState(cashDate);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Cheque'>('Cash');
  const [amount, setAmount] = useState<number | ''>('');

  const currentCategories = cashCategories.filter((c) => c.type === (initialData ? initialData.type : type));

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setCategoryId(initialData.categoryId);
        setDescription(initialData.description || '');
        setPaymentMethod(initialData.paymentMethod);
        setAmount(initialData.amount);
      } else {
        setDate(cashDate || todayISO());
        setCategoryId(currentCategories[0]?.id || '');
        setDescription('');
        setPaymentMethod('Cash');
        setAmount('');
      }
    }
  }, [isOpen, initialData, cashDate, currentCategories]);

  if (!isOpen) return null;

  const entryType = initialData ? initialData.type : type;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      showToast('Please select or register a category first');
      return;
    }
    const val = Number(amount);
    if (!val || val <= 0) {
      showToast('Enter a valid amount');
      return;
    }

    saveCashEntry(
      {
        id: initialData ? initialData.id : 0,
        date,
        categoryId,
        description: description.trim(),
        paymentMethod,
        amount: val,
        type: entryType,
      },
      !!initialData
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? `Edit ${entryType}` : `Record ${entryType}`}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                Date <span className="text-[11px] text-[#9AA69C] font-normal">(Super Admin can backdate)</span>
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {currentCategories.length === 0 ? (
                  <option value="">No {entryType} categories found</option>
                ) : (
                  currentCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Sales, B-0056…"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Amount (LKR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || '')}
                placeholder="0"
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- SETTLE CASH IN HAND MODAL ---------------- */
export const SettleCashModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cashDate, cashBalancesAsOf, cashEntries } = useApp();
  const [actualInput, setActualInput] = useState<string>('');

  if (!isOpen) return null;

  const selDate = cashDate || todayISO();
  const opening = cashBalancesAsOf(selDate);
  const todays = cashEntries.filter((e) => e.date === selDate);
  const totalIncomeCash = todays
    .filter((e) => e.type === 'Income' && e.paymentMethod === 'Cash')
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalExpenseCash = todays
    .filter((e) => e.type === 'Expense' && e.paymentMethod === 'Cash')
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  const expectedCash = opening.cash + totalIncomeCash - totalExpenseCash;
  const actualNum = Number(actualInput);
  const diff = actualNum - expectedCash;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Settle Cash In Hand</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-[22px_24px]">
          <div className="flex flex-col gap-[8px] text-[14px] mb-[16px] p-[14px] bg-[#F6F5F0] rounded-[8px]">
            <div>
              Total Income (Cash): <b className="mono text-[#1F6F63]">LKR {fmtNum(totalIncomeCash)}</b>
            </div>
            <div>
              Total Expense (Cash): <b className="mono text-[#A63D2C]">LKR {fmtNum(totalExpenseCash)}</b>
            </div>
            <div className="border-t border-[#DEDACB] pt-[6px] font-medium">
              Expected Cash Balance: <b className="mono text-[#1B2420]">LKR {fmtNum(expectedCash)}</b>
            </div>
          </div>

          <div className="flex flex-col gap-[6px] mb-[14px]">
            <label className="text-[12px] font-semibold text-[#4B564E]">
              Cash In Hand (LKR) <span className="text-[11px] text-[#9AA69C] font-normal">— enter the physically counted amount</span>
            </label>
            <input
              type="number"
              value={actualInput}
              onChange={(e) => setActualInput(e.target.value)}
              placeholder="e.g. 500000"
              min="0"
              autoFocus
            />
          </div>

          {actualInput !== '' && (
            <div className="mt-[14px] text-[16px] font-semibold">
              {diff === 0 && <span className="text-[#1F6F63]">🟢 Balanced — cash in hand matches exactly.</span>}
              {diff > 0 && <span className="text-[#1F6F63]">🟢 Excess: LKR {fmtNum(diff)}</span>}
              {diff < 0 && <span className="text-[#A63D2C]">🔴 Short: LKR {fmtNum(Math.abs(diff))}</span>}
            </div>
          )}
        </div>

        <div className="flex justify-end p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- REGISTER BANK ACCOUNT MODAL ---------------- */
export const RegisterBankModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { saveBankAccount, showToast } = useApp();
  const [bankName, setBankName] = useState('');
  const [accNo, setAccNo] = useState('');
  const [accName, setAccName] = useState('KMK Rice Mill');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      showToast('Please enter the bank name');
      return;
    }
    saveBankAccount(bankName.trim(), accNo.trim(), accName.trim());
    setBankName('');
    setAccNo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register Bank Account</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] flex flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Bank Name</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Bank of Ceylon" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Account Number</label>
              <input type="text" value={accNo} onChange={(e) => setAccNo(e.target.value)} placeholder="e.g. 8801234567" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Account Name</label>
              <input type="text" value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="e.g. KMK Rice Mill" required />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Bank Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- ADD / EDIT CHEQUE MODAL ---------------- */
export const AddChequeModal: React.FC<{
  isOpen: boolean;
  type: 'Received' | 'Issued';
  initialData?: Cheque | null;
  onClose: () => void;
}> = ({ isOpen, type, initialData, onClose }) => {
  const { clients, suppliers, salesTeams, saveCheque, showToast } = useApp();
  const [date, setDate] = useState(todayISO());
  const [partyId, setPartyId] = useState('');
  const [salesTeamId, setSalesTeamId] = useState('');
  const [bank, setBank] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [chequeDate, setChequeDate] = useState(todayISO());
  const [amount, setAmount] = useState<number | ''>('');

  const chequeType = initialData ? initialData.type : type;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setPartyId(initialData.partyId);
        setSalesTeamId(initialData.salesTeamId || '');
        setBank(initialData.bank);
        setChequeNo(initialData.chequeNo);
        setChequeDate(initialData.chequeDate);
        setAmount(initialData.amount);
      } else {
        setDate(todayISO());
        setPartyId(chequeType === 'Received' ? (clients[0]?.id || '') : (suppliers[0]?.id || ''));
        setSalesTeamId(salesTeams[0]?.id || '');
        setBank('BOC');
        setChequeNo('');
        setChequeDate(todayISO());
        setAmount('');
      }
    }
  }, [isOpen, initialData, chequeType, clients, suppliers, salesTeams]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) {
      showToast(`Please select a ${chequeType === 'Received' ? 'client' : 'supplier'}`);
      return;
    }
    const val = Number(amount);
    if (!val || val <= 0) {
      showToast('Enter a valid amount');
      return;
    }

    saveCheque(
      {
        id: initialData ? initialData.id : '',
        date,
        type: chequeType,
        partyId,
        salesTeamId: chequeType === 'Received' ? salesTeamId : null,
        bank: bank.trim(),
        chequeNo: chequeNo.trim(),
        chequeDate,
        amount: val,
        status: initialData ? initialData.status : 'Pending',
        allocatedBankAccountId: initialData ? initialData.allocatedBankAccountId : null,
      },
      !!initialData
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData
              ? `Edit Cheque (${chequeType})`
              : chequeType === 'Received'
              ? 'Add Cheque (Received)'
              : 'Issue Cheque (Supplier)'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                {chequeType === 'Received' ? 'Client' : 'Supplier'}
              </label>
              <select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                {chequeType === 'Received'
                  ? clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  : suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
              </select>
            </div>

            {chequeType === 'Received' && (
              <div className="col-span-full flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Sales Team</label>
                <select value={salesTeamId} onChange={(e) => setSalesTeamId(e.target.value)}>
                  {salesTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.lorryNo} — {t.salesRep}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                Bank <span className="text-[11px] text-[#9AA69C] font-normal">(drawn on)</span>
              </label>
              <input type="text" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. BOC" required />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Cheque Number</label>
              <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} placeholder="e.g. 092975" required />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Cheque Date</label>
              <input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Amount (LKR)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || '')} min="1" required />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Cheque</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- RETURN CHEQUE MODAL ---------------- */
export const ReturnChequeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cheques, clientById, supplierById, returnCheque, showToast } = useApp();
  const eligibleCheques = cheques.filter((c) => c.status !== 'Returned');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (eligibleCheques.length > 0) {
      setSelectedId(eligibleCheques[0].id);
    }
  }, [eligibleCheques]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      showToast('Select a cheque');
      return;
    }
    returnCheque(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Return Cheque</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] flex flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Select Cheque to Mark as Returned</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {eligibleCheques.length === 0 ? (
                  <option value="">No cheques available</option>
                ) : (
                  eligibleCheques.map((c) => {
                    const party = c.type === 'Received' ? clientById(c.partyId) : supplierById(c.partyId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.chequeNo} — {party ? party.name : '—'} — LKR {fmtNum(c.amount)} ({c.status})
                      </option>
                    );
                  })
                )}
              </select>
            </div>
            <div className="text-[11.5px] text-[#9AA69C] leading-relaxed">
              This puts the cheque back into the pending list, clearing any bank allocation, so it can be re-issued or re-allocated.
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={eligibleCheques.length === 0}>
              Mark as Returned
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW ALLOCATIONS MODAL ---------------- */
export const ViewAllocationsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { bankAccounts, cheques, clientById, supplierById } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Cheque Allocations by Bank Account</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          {bankAccounts.length === 0 ? (
            <div className="text-center p-[30px] text-[#4B564E] text-[13px]">No bank accounts registered yet.</div>
          ) : (
            bankAccounts.map((b) => {
              const allocated = cheques.filter((c) => c.allocatedBankAccountId === b.id);
              const total = allocated.reduce((s, c) => s + Number(c.amount || 0), 0);

              return (
                <div key={b.id} className="border border-[#DEDACB] rounded-[10px] p-[16px] mb-[14px] bg-[#FFFFFF] shadow-xs">
                  <div className="flex justify-between items-center text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E] mb-[10px]">
                    <span>
                      {b.bankName} — {b.accountNumber} ({b.accountName})
                    </span>
                    <span className="text-[#1E3E2E]">Total: LKR {fmtNum(total)}</span>
                  </div>

                  {allocated.length === 0 ? (
                    <div className="text-[12px] text-[#9AA69C] italic">No cheques allocated to this account yet.</div>
                  ) : (
                    <table className="w-full border-collapse mt-[6px]">
                      <thead>
                        <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.4px] text-[#4B564E]">
                          <th className="p-[8px_12px] font-semibold">Cheque No</th>
                          <th className="p-[8px_12px] font-semibold">Party</th>
                          <th className="p-[8px_12px] font-semibold">Cheque Date</th>
                          <th className="p-[8px_12px] font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocated.map((c) => {
                          const party = c.type === 'Received' ? clientById(c.partyId) : supplierById(c.partyId);
                          return (
                            <tr key={c.id} className="border-b border-[#EAE7DA]">
                              <td className="p-[8px_12px] text-[13px]">
                                <span className="ref-badge">{c.chequeNo}</span>
                              </td>
                              <td className="p-[8px_12px] text-[13px] font-medium">{party ? party.name : '—'}</td>
                              <td className="p-[8px_12px] text-[13px] font-mono">{fmtDate(c.chequeDate)}</td>
                              <td className="p-[8px_12px] text-[13px] font-mono font-semibold">LKR {fmtNum(c.amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="flex justify-end p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- RESCHEDULE CHEQUE MODAL ---------------- */
export const RescheduleChequeModal: React.FC<{
  isOpen: boolean;
  cheque: Cheque | null;
  onClose: () => void;
}> = ({ isOpen, cheque, onClose }) => {
  const { rescheduleCheque } = useApp();
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    if (cheque) {
      setNewDate(cheque.chequeDate);
    }
  }, [cheque]);

  if (!isOpen || !cheque) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rescheduleCheque(cheque.id, newDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Reschedule Cheque</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] flex flex-col gap-[14px]">
            <div className="bg-[#E7EFE9] rounded-[8px] p-[12px_14px] text-[13px] text-[#1B2420]">
              Cheque <span className="ref-badge">{cheque.chequeNo}</span> — current date <b>{fmtDate(cheque.chequeDate)}</b>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">New Cheque Date</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save New Date</button>
          </div>
        </form>
      </div>
    </div>
  );
};
