import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Delivery, DeliveryItem } from '../../types';
import { todayISO, fmtDate, fmtNum, fmtKg } from '../../utils/formatters';

/* ---------------- REGISTER FARMER MODAL ---------------- */
export const RegisterFarmerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { saveFarmer, showToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nic, setNic] = useState('');
  const [loc, setLoc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter the farmer's name");
      return;
    }
    saveFarmer(name.trim(), phone.trim(), nic.trim(), loc.trim());
    setName('');
    setPhone('');
    setNic('');
    setLoc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register Farmer / Supplier</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senarathna Bandara" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Telephone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">NIC (optional)</label>
              <input type="text" value={nic} onChange={(e) => setNic(e.target.value)} placeholder="XXXXXXXXXV" />
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Location / Village</label>
              <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. Wariyapola" />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Farmer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- REGISTER VARIETY MODAL ---------------- */
export const RegisterVarietyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { saveVariety, showToast } = useApp();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a variety name');
      return;
    }
    saveVariety(name.trim(), Number(price) || 0);
    setName('');
    setPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register Paddy Variety</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] flex flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Variety Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nadu, Samba, Keeri Samba" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Default Unit Price (LKR / kg)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 100" min="0" />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Variety</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- RECORD / EDIT DELIVERY MODAL ---------------- */
interface RecordDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Delivery | null;
}

export const RecordDeliveryModal: React.FC<RecordDeliveryModalProps> = ({ isOpen, onClose, initialData }) => {
  const { suppliers, varieties, deliveries, saveDelivery, showToast } = useApp();
  const [date, setDate] = useState(todayISO());
  const [ref, setRef] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [payment, setPayment] = useState<'Cash' | 'Credit'>('Cash');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setRef(initialData.ref);
        setSupplierId(initialData.supplierId);
        setPayment(initialData.payment);
        setNote(initialData.note || '');
        setItems(initialData.items.map((it) => ({ ...it })));
      } else {
        const nextNum = deliveries.length + 1;
        setDate(todayISO());
        setRef('GRN-' + String(nextNum).padStart(4, '0'));
        setSupplierId(suppliers[0]?.id || '');
        setPayment('Cash');
        setNote('');
        const defaultVariety = varieties[0]?.name || 'Nadu';
        const defaultPrice = varieties[0]?.price || 100;
        setItems([{ variety: defaultVariety, weight: 0, price: defaultPrice }]);
      }
    }
  }, [isOpen, initialData, deliveries.length, suppliers, varieties]);

  if (!isOpen) return null;

  const handleVarietyChange = (index: number, varietyName: string) => {
    const v = varieties.find((x) => x.name === varietyName);
    const updated = [...items];
    updated[index].variety = varietyName;
    if (v) updated[index].price = v.price;
    setItems(updated);
  };

  const handleWeightChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index].weight = Number(val) || 0;
    setItems(updated);
  };

  const handlePriceChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index].price = Number(val) || 0;
    setItems(updated);
  };

  const addRow = () => {
    const defaultVariety = varieties[0]?.name || 'Nadu';
    const defaultPrice = varieties[0]?.price || 100;
    setItems([...items, { variety: defaultVariety, weight: 0, price: defaultPrice }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalWeight = items.reduce((s, it) => s + (Number(it.weight) || 0), 0);
  const totalAmount = items.reduce((s, it) => s + (Number(it.weight) || 0) * (Number(it.price) || 0), 0);

  const handleSave = (andPrint: boolean) => {
    if (!supplierId) {
      showToast('Please select a supplier');
      return;
    }
    const validItems = items.filter((it) => it.weight > 0);
    if (validItems.length === 0) {
      showToast('Add at least one variety with weight');
      return;
    }

    const deliveryRecord: Delivery = {
      ref,
      date,
      supplierId,
      payment,
      items: validItems,
      note,
    };

    saveDelivery(deliveryRecord, !!initialData);
    if (andPrint) {
      setTimeout(() => showToast(`Sending delivery ${ref} to printer…`), 200);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? 'Edit Paddy Delivery' : 'Record Paddy Delivery'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-[22px_24px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                Ref No <span className="text-[11px] text-[#9AA69C] font-normal">(auto-generated)</span>
              </label>
              <input type="text" value={ref} disabled className="mono bg-gray-50 text-gray-700" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Select Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location || 'Local'})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Payment Method</label>
              <select value={payment} onChange={(e) => setPayment(e.target.value as 'Cash' | 'Credit')}>
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          <label className="text-[12px] font-semibold text-[#4B564E] block mb-[8px]">Paddy Varieties Delivered</label>
          <div className="variety-rows">
            <div className="vr-head grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_32px]">
              <div>Variety</div>
              <div>Weight (kg)</div>
              <div>Unit Price</div>
              <div>Amount</div>
              <div></div>
            </div>
            {items.map((it, idx) => {
              const rowAmt = (Number(it.weight) || 0) * (Number(it.price) || 0);
              return (
                <div key={idx} className="vr-row grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_32px]">
                  <select value={it.variety} onChange={(e) => handleVarietyChange(idx, e.target.value)}>
                    {varieties.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={it.weight || ''}
                    onChange={(e) => handleWeightChange(idx, e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  <input
                    type="number"
                    value={it.price || ''}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  <input type="text" value={fmtNum(rowAmt)} disabled className="mono bg-gray-50 text-gray-700" />
                  <button type="button" className="vr-remove" onClick={() => removeRow(idx)}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <span className="add-variety-link mt-[4px]" onClick={addRow}>
            + Add another variety
          </span>

          <div className="totals-strip mt-[8px]">
            <div>
              Total Weight: <b>{fmtKg(totalWeight)}</b>
            </div>
            <div>
              Total Amount: <b>LKR {fmtNum(totalAmount)}</b>
            </div>
          </div>

          <div className="flex flex-col gap-[6px] mt-[12px]">
            <label className="text-[12px] font-semibold text-[#4B564E]">Description / Notes (optional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any remarks about this delivery..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ borderColor: 'var(--field)', color: 'var(--field-dark)' }}
            onClick={() => handleSave(false)}
          >
            Save
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSave(true)}>
            Save &amp; Print
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- VIEW DELIVERY MODAL ---------------- */
export const ViewDeliveryModal: React.FC<{
  isOpen: boolean;
  delivery: Delivery | null;
  onClose: () => void;
}> = ({ isOpen, delivery, onClose }) => {
  const { supplierById, totalAmount, showToast } = useApp();
  if (!isOpen || !delivery) return null;

  const sup = supplierById(delivery.supplierId);
  const total = totalAmount(delivery);

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420] flex items-center gap-2">
            Delivery Record <span className="mono text-[14px] text-[#4B564E] font-normal">{delivery.ref}</span>
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-[22px_24px]">
          <div className="grid grid-cols-2 gap-[14px] mb-[12px]">
            <div>
              <div className="text-[11px] text-[#9AA69C]">Date</div>
              <div className="font-semibold">{fmtDate(delivery.date)}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9AA69C]">Supplier</div>
              <div className="font-semibold">{sup ? sup.name : '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9AA69C]">Payment Method</div>
              <div>
                <span className={`pay-chip ${delivery.payment === 'Cash' ? 'cash' : 'credit'}`}>{delivery.payment}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#9AA69C]">Total Amount</div>
              <div className="font-semibold font-mono text-[#2F5D45]">LKR {fmtNum(total)}</div>
            </div>
          </div>

          <table className="w-full border-collapse mt-[14px]">
            <thead>
              <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                <th className="p-[10px_14px] font-semibold">Variety</th>
                <th className="p-[10px_14px] font-semibold">Weight</th>
                <th className="p-[10px_14px] font-semibold">Unit Price</th>
                <th className="p-[10px_14px] font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {delivery.items.map((it, idx) => (
                <tr key={idx} className="border-b border-[#EAE7DA]">
                  <td className="p-[10px_14px] text-[13.5px]">{it.variety}</td>
                  <td className="p-[10px_14px] text-[13.5px] font-mono">{fmtKg(it.weight)}</td>
                  <td className="p-[10px_14px] text-[13.5px] font-mono">LKR {fmtNum(it.price)}</td>
                  <td className="p-[10px_14px] text-[13.5px] font-mono font-semibold">LKR {fmtNum(it.weight * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {delivery.note && (
            <div className="text-[12px] text-[#4B564E] italic mt-[14px] p-[8px_12px] bg-[#F6F5F0] rounded-[6px]">
              Note: {delivery.note}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => showToast(`Sending delivery ${delivery.ref} to printer…`)}
          >
            🖨 Print
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- PAY OUTSTANDING MODAL ---------------- */
export const PayOutstandingModal: React.FC<{
  isOpen: boolean;
  delivery: Delivery | null;
  bal: number;
  onClose: () => void;
}> = ({ isOpen, delivery, bal, onClose }) => {
  const { supplierById, savePayment, showToast } = useApp();
  const [amount, setAmount] = useState(bal);
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [refNo, setRefNo] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (delivery) {
      setAmount(bal);
      setDate(todayISO());
      setDesc('Settlement for ' + delivery.ref);
    }
  }, [delivery, bal]);

  if (!isOpen || !delivery) return null;

  const sup = supplierById(delivery.supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast('Enter a valid payment amount');
      return;
    }
    savePayment({
      ref: delivery.ref,
      amount,
      date,
      method,
      refNo,
      desc,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Record Payment</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px]">
            <div className="bg-[#E7EFE9] rounded-[8px] p-[12px_14px] mb-[16px] text-[13px] text-[#1B2420]">
              Paying <b>{sup ? sup.name : 'Supplier'}</b> for <span className="ref-badge">{delivery.ref}</span> —
              outstanding balance <b>LKR {fmtNum(bal)}</b>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Amount Being Paid (LKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  max={bal}
                  min="1"
                  required
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Payment Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Payment Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value as any)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Reference / Cheque No (optional)</label>
                <input type="text" value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="e.g. CHQ-99120" />
              </div>
              <div className="col-span-full flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Partial settlement for GRN-0002"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
