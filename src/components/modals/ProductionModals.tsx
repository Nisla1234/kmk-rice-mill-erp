import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FinishedProduct, FinishedBatch, ByProduct, ByProductBatch, FlourProduct, FlourBatch } from '../../types';
import { todayISO, fmtNum, fmtKg } from '../../utils/formatters';

/* ---------------- REGISTER FINISHED PRODUCT ---------------- */
export const RegisterFinishedProductModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { varieties, saveFinishedProduct, showToast } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<'Parboiled' | 'Raw'>('Parboiled');
  const [variety, setVariety] = useState(varieties[0]?.name || 'Nadu');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>(25);

  useEffect(() => {
    if (varieties.length > 0 && !variety) {
      setVariety(varieties[0].name);
    }
  }, [varieties, variety]);

  if (!isOpen) return null;

  const total = (Number(unitPrice) || 0) * (Number(weight) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product name');
      return;
    }
    saveFinishedProduct({
      name: name.trim(),
      processType: type,
      variety,
      unitPrice: Number(unitPrice) || 0,
      weight: Number(weight) || 0,
    });
    setName('');
    setUnitPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register Finished Product</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nadu Rice 25kg" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Processed Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'Parboiled' | 'Raw')}>
                <option value="Parboiled">Parboiled</option>
                <option value="Raw">Raw</option>
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Variety</label>
              <select value={variety} onChange={(e) => setVariety(e.target.value)}>
                {varieties.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Unit Price (LKR / kg)</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value) || '')} placeholder="e.g. 118" min="0" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || '')} placeholder="e.g. 25" min="0" required />
            </div>
            <div className="col-span-full totals-strip justify-start">
              <div>
                Total Price: <b className="mono">LKR {fmtNum(total)}</b>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW FINISHED PRODUCTS MODAL ---------------- */
export const ViewFinishedProductsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { finishedProducts, updateFinishedProductPrice, deleteFinishedProduct } = useApp();
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    finishedProducts.forEach((p) => {
      map[p.id] = p.unitPrice;
    });
    setPrices(map);
  }, [finishedProducts, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Registered Finished Products</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Product</th>
                  <th className="p-[12px_16px] font-semibold">Method</th>
                  <th className="p-[12px_16px] font-semibold">Variety</th>
                  <th className="p-[12px_16px] font-semibold">Weight (kg)</th>
                  <th className="p-[12px_16px] font-semibold">Unit Price</th>
                  <th className="p-[12px_16px] font-semibold">Total Price</th>
                  <th className="p-[12px_16px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {finishedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-[30px] text-[#4B564E] text-[13px]">
                      No products registered yet.
                    </td>
                  </tr>
                ) : (
                  finishedProducts.map((p) => {
                    const curPrice = prices[p.id] !== undefined ? prices[p.id] : p.unitPrice;
                    return (
                      <tr key={p.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5]">
                        <td className="p-[12px_16px] text-[13.5px] font-medium">{p.name}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{p.processType}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{p.variety}</td>
                        <td className="p-[12px_16px] text-[13.5px] font-mono">{fmtKg(p.weight)}</td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <input
                            type="number"
                            value={curPrice}
                            onChange={(e) => setPrices({ ...prices, [p.id]: Number(e.target.value) || 0 })}
                            className="w-[90px] py-[4px] px-[6px] text-[12.5px]"
                          />
                        </td>
                        <td className="p-[12px_16px] text-[13.5px] font-mono font-semibold">
                          LKR {fmtNum(curPrice * p.weight)}
                        </td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <div className="flex gap-[6px]">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary py-[4px] px-[8px]"
                              onClick={() => updateFinishedProductPrice(p.id, curPrice)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => {
                                if (confirm(`Delete "${p.name}"?`)) deleteFinishedProduct(p.id);
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

/* ---------------- ADD / EDIT FINISHED BATCH MODAL ---------------- */
export const AddFinishedBatchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: FinishedBatch | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { varieties, finishedProducts, finishedBatches, saveFinishedBatch, showToast } = useApp();
  const [date, setDate] = useState(todayISO());
  const [batchNo, setBatchNo] = useState('');
  const [variety, setVariety] = useState(varieties[0]?.name || 'Nadu');
  const [paddyInput, setPaddyInput] = useState<number | ''>('');
  const [processType, setProcessType] = useState<'Parboiled' | 'Raw'>('Parboiled');
  const [operator, setOperator] = useState('');
  const [outputs, setOutputs] = useState<{ productId: string; packets: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setBatchNo(initialData.batchNo);
        setVariety(initialData.variety);
        setPaddyInput(initialData.paddyInput);
        setProcessType(initialData.processType);
        setOperator(initialData.operator);
        setOutputs(initialData.outputs.map((o) => ({ ...o })));
      } else {
        const nextNum = finishedBatches.length + 2;
        setDate(todayISO());
        setBatchNo('B-' + String(nextNum).padStart(3, '0'));
        setVariety(varieties[0]?.name || 'Nadu');
        setPaddyInput('');
        setProcessType('Parboiled');
        setOperator('');
        setOutputs(finishedProducts.length > 0 ? [{ productId: finishedProducts[0].id, packets: 0 }] : []);
      }
    }
  }, [isOpen, initialData, finishedBatches.length, varieties, finishedProducts]);

  if (!isOpen) return null;

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...outputs];
    updated[index].productId = productId;
    setOutputs(updated);
  };

  const handlePacketsChange = (index: number, val: string) => {
    const updated = [...outputs];
    updated[index].packets = Number(val) || 0;
    setOutputs(updated);
  };

  const addRow = () => {
    if (finishedProducts.length === 0) return;
    setOutputs([...outputs, { productId: finishedProducts[0].id, packets: 0 }]);
  };

  const removeRow = (index: number) => {
    if (outputs.length <= 1) return;
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const totalOutput = outputs.reduce((s, o) => {
    const p = finishedProducts.find((x) => x.id === o.productId);
    return s + (p ? p.weight * (Number(o.packets) || 0) : 0);
  }, 0);

  const pInput = Number(paddyInput) || 0;
  const yieldPct = pInput > 0 ? (totalOutput / pInput) * 100 : 0;

  const handleSave = () => {
    if (pInput <= 0) {
      showToast('Enter the total paddy input');
      return;
    }
    const validOutputs = outputs.filter((o) => o.packets > 0);
    if (validOutputs.length === 0) {
      showToast('Add at least one rice output with packets');
      return;
    }

    saveFinishedBatch(
      {
        batchNo,
        date,
        variety,
        paddyInput: pInput,
        processType,
        operator,
        outputs: validOutputs,
      },
      !!initialData
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? 'Edit Production Batch' : 'Add New Production Batch'}
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
                Batch No <span className="text-[11px] text-[#9AA69C] font-normal">(auto-generated)</span>
              </label>
              <input type="text" value={batchNo} disabled className="mono bg-gray-50 text-gray-700" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Variety</label>
              <select value={variety} onChange={(e) => setVariety(e.target.value)}>
                {varieties.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Total Paddy Input (kg)</label>
              <input
                type="number"
                value={paddyInput}
                onChange={(e) => setPaddyInput(Number(e.target.value) || '')}
                placeholder="e.g. 12000"
                min="0"
                required
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Processed Type</label>
              <select value={processType} onChange={(e) => setProcessType(e.target.value as 'Parboiled' | 'Raw')}>
                <option value="Parboiled">Parboiled</option>
                <option value="Raw">Raw</option>
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Operator Name</label>
              <input type="text" value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="e.g. K. Fernando" />
            </div>
          </div>

          <label className="text-[12px] font-semibold text-[#4B564E] block mb-[8px]">
            Rice Output (Finished Products)
          </label>
          <div className="variety-rows">
            <div className="vr-head grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_32px]">
              <div>Product</div>
              <div>Weight (kg)</div>
              <div>No. of Packets</div>
              <div>Total (kg)</div>
              <div></div>
            </div>
            {outputs.map((out, idx) => {
              const p = finishedProducts.find((x) => x.id === out.productId);
              const pWeight = p ? p.weight : 0;
              const rowTotal = pWeight * (Number(out.packets) || 0);

              return (
                <div key={idx} className="vr-row grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_32px]">
                  <select value={out.productId} onChange={(e) => handleProductChange(idx, e.target.value)}>
                    {finishedProducts.map((pItem) => (
                      <option key={pItem.id} value={pItem.id}>
                        {pItem.name}
                      </option>
                    ))}
                  </select>
                  <input type="text" value={pWeight ? fmtKg(pWeight) : '—'} disabled className="mono bg-gray-50 text-gray-700" />
                  <input
                    type="number"
                    value={out.packets || ''}
                    onChange={(e) => handlePacketsChange(idx, e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  <input type="text" value={fmtKg(rowTotal)} disabled className="mono bg-gray-50 text-gray-700" />
                  <button type="button" className="vr-remove" onClick={() => removeRow(idx)}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <span className="add-variety-link mt-[4px]" onClick={addRow}>
            + Add another product output
          </span>

          <div className="totals-strip mt-[8px]">
            <div>
              Total Output: <b className="mono">{fmtKg(totalOutput)}</b>
            </div>
            <div>
              Yield: <b className="mono">{yieldPct.toFixed(1)}%</b>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Batch
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- REGISTER BY-PRODUCT MODAL ---------------- */
export const RegisterByProductModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { varieties, saveByProduct, showToast } = useApp();
  const [name, setName] = useState('');
  const [variety, setVariety] = useState(varieties[0]?.name || 'Nadu');
  const [processType, setProcessType] = useState<'Parboiled' | 'Raw'>('Parboiled');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product name');
      return;
    }
    saveByProduct({
      name: name.trim(),
      variety,
      processType,
      unitPrice: Number(unitPrice) || 0,
    });
    setName('');
    setUnitPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register By-Product</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rice Bran" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Variety</label>
              <select value={variety} onChange={(e) => setVariety(e.target.value)}>
                {varieties.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Processed Type</label>
              <select value={processType} onChange={(e) => setProcessType(e.target.value as 'Parboiled' | 'Raw')}>
                <option value="Parboiled">Parboiled</option>
                <option value="Raw">Raw</option>
              </select>
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Unit Price (LKR / kg)</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value) || '')} placeholder="e.g. 45" min="0" required />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save By-Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW BY-PRODUCTS MODAL ---------------- */
export const ViewByProductsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { byProducts, updateByProductPrice, deleteByProduct } = useApp();
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    byProducts.forEach((p) => {
      map[p.id] = p.unitPrice;
    });
    setPrices(map);
  }, [byProducts, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Registered By-Products</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Product</th>
                  <th className="p-[12px_16px] font-semibold">Variety</th>
                  <th className="p-[12px_16px] font-semibold">Method</th>
                  <th className="p-[12px_16px] font-semibold">Unit Price /kg</th>
                  <th className="p-[12px_16px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {byProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-[30px] text-[#4B564E] text-[13px]">
                      No by-products registered yet.
                    </td>
                  </tr>
                ) : (
                  byProducts.map((p) => {
                    const curPrice = prices[p.id] !== undefined ? prices[p.id] : p.unitPrice;
                    return (
                      <tr key={p.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5]">
                        <td className="p-[12px_16px] text-[13.5px] font-medium">{p.name}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{p.variety}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{p.processType}</td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <input
                            type="number"
                            value={curPrice}
                            onChange={(e) => setPrices({ ...prices, [p.id]: Number(e.target.value) || 0 })}
                            className="w-[90px] py-[4px] px-[6px] text-[12.5px]"
                          />
                        </td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <div className="flex gap-[6px]">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary py-[4px] px-[8px]"
                              onClick={() => updateByProductPrice(p.id, curPrice)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => {
                                if (confirm(`Delete "${p.name}"?`)) deleteByProduct(p.id);
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

/* ---------------- ADD / EDIT BY-PRODUCT BATCH MODAL ---------------- */
export const AddByProductBatchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: ByProductBatch | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { byProducts, saveByProductBatch, showToast } = useApp();
  const [date, setDate] = useState(todayISO());
  const [batchNo, setBatchNo] = useState('');
  const [productId, setProductId] = useState(byProducts[0]?.id || '');
  const [outKg, setOutKg] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setBatchNo(initialData.batchNo);
        setProductId(initialData.productId);
        setOutKg(initialData.out);
      } else {
        setDate(todayISO());
        setBatchNo('B-006');
        setProductId(byProducts[0]?.id || '');
        setOutKg('');
      }
    }
  }, [isOpen, initialData, byProducts]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNo.trim()) {
      showToast('Please enter a batch number');
      return;
    }
    if (!outKg || Number(outKg) <= 0) {
      showToast('Please enter total output in kg');
      return;
    }

    saveByProductBatch(
      {
        id: initialData ? initialData.id : 0,
        batchNo: batchNo.trim(),
        date,
        productId,
        out: Number(outKg) || 0,
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
            {initialData ? 'Edit By-Product Batch' : 'Add New By-Product Batch'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Batch No</label>
              <input type="text" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} placeholder="e.g. B-006" required />
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Select Product</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)}>
                {byProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.variety})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Total (kg)</label>
              <input type="number" value={outKg} onChange={(e) => setOutKg(Number(e.target.value) || '')} placeholder="e.g. 1200" min="0" required />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Batch</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- REGISTER RICE FLOUR PRODUCT MODAL ---------------- */
export const RegisterFlourModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { saveFlourProduct, showToast } = useApp();
  const [name, setName] = useState('');
  const [packetSize, setPacketSize] = useState<number | ''>(10);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');

  if (!isOpen) return null;

  const total = (Number(packetSize) || 0) * (Number(unitPrice) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product name');
      return;
    }
    saveFlourProduct({
      name: name.trim(),
      packetSize: Number(packetSize) || 0,
      unitPrice: Number(unitPrice) || 0,
    });
    setName('');
    setUnitPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Register Rice Flour Product</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rice Flour 10kg" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Packet Size (kg)</label>
              <input type="number" value={packetSize} onChange={(e) => setPacketSize(Number(e.target.value) || '')} placeholder="e.g. 10" min="0" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Unit Price (LKR / kg)</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value) || '')} placeholder="e.g. 95" min="0" required />
            </div>
            <div className="col-span-full text-[11px] text-[#9AA69C] -mt-[6px]">
              Your sketch labelled this field &quot;Batch&quot; — showing it here as Packet Size since that&apos;s what determines packet count per batch.
            </div>
            <div className="col-span-full totals-strip justify-start">
              <div>
                Total Amount / Packet: <b className="mono">LKR {fmtNum(total)}</b>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW RICE FLOUR PRODUCTS MODAL ---------------- */
export const ViewFlourProductsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { flourProducts, updateFlourProductPrice, deleteFlourProduct } = useApp();
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    flourProducts.forEach((p) => {
      map[p.id] = p.unitPrice;
    });
    setPrices(map);
  }, [flourProducts, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Registered Rice Flour Products</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Product</th>
                  <th className="p-[12px_16px] font-semibold">Packet Size (kg)</th>
                  <th className="p-[12px_16px] font-semibold">Unit Price /kg</th>
                  <th className="p-[12px_16px] font-semibold">Amount / Packet</th>
                  <th className="p-[12px_16px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flourProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-[30px] text-[#4B564E] text-[13px]">
                      No rice flour products registered yet.
                    </td>
                  </tr>
                ) : (
                  flourProducts.map((p) => {
                    const curPrice = prices[p.id] !== undefined ? prices[p.id] : p.unitPrice;
                    return (
                      <tr key={p.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5]">
                        <td className="p-[12px_16px] text-[13.5px] font-medium">{p.name}</td>
                        <td className="p-[12px_16px] text-[13.5px] font-mono">{fmtKg(p.packetSize)}</td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <input
                            type="number"
                            value={curPrice}
                            onChange={(e) => setPrices({ ...prices, [p.id]: Number(e.target.value) || 0 })}
                            className="w-[90px] py-[4px] px-[6px] text-[12.5px]"
                          />
                        </td>
                        <td className="p-[12px_16px] text-[13.5px] font-mono font-semibold">
                          LKR {fmtNum(curPrice * p.packetSize)}
                        </td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <div className="flex gap-[6px]">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary py-[4px] px-[8px]"
                              onClick={() => updateFlourProductPrice(p.id, curPrice)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => {
                                if (confirm(`Delete "${p.name}"?`)) deleteFlourProduct(p.id);
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

/* ---------------- ADD / EDIT RICE FLOUR BATCH MODAL ---------------- */
export const AddFlourBatchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: FlourBatch | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { flourProducts, flourBatches, saveFlourBatch, showToast } = useApp();
  const [date, setDate] = useState(todayISO());
  const [batchNo, setBatchNo] = useState('');
  const [outputs, setOutputs] = useState<{ productId: string; packets: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setBatchNo(initialData.batchNo);
        setOutputs(initialData.outputs.map((o) => ({ ...o })));
      } else {
        const nextNum = flourBatches.length + 10;
        setDate(todayISO());
        setBatchNo('B-' + String(nextNum).padStart(4, '0'));
        setOutputs(flourProducts.length > 0 ? [{ productId: flourProducts[0].id, packets: 0 }] : []);
      }
    }
  }, [isOpen, initialData, flourBatches.length, flourProducts]);

  if (!isOpen) return null;

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...outputs];
    updated[index].productId = productId;
    setOutputs(updated);
  };

  const handlePacketsChange = (index: number, val: string) => {
    const updated = [...outputs];
    updated[index].packets = Number(val) || 0;
    setOutputs(updated);
  };

  const addRow = () => {
    if (flourProducts.length === 0) return;
    setOutputs([...outputs, { productId: flourProducts[0].id, packets: 0 }]);
  };

  const removeRow = (index: number) => {
    if (outputs.length <= 1) return;
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const totalOutputKg = outputs.reduce((s, o) => {
    const p = flourProducts.find((x) => x.id === o.productId);
    return s + (p ? p.packetSize * (Number(o.packets) || 0) : 0);
  }, 0);

  const totalPackets = outputs.reduce((s, o) => s + (Number(o.packets) || 0), 0);

  const handleSave = () => {
    const validOutputs = outputs.filter((o) => o.packets > 0);
    if (validOutputs.length === 0) {
      showToast('Add at least one product output with packets');
      return;
    }

    saveFlourBatch(
      {
        batchNo,
        date,
        outputs: validOutputs,
      },
      !!initialData
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? 'Edit Rice Flour Batch' : 'Add New Rice Flour Batch'}
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
                Batch No <span className="text-[11px] text-[#9AA69C] font-normal">(auto-generated)</span>
              </label>
              <input type="text" value={batchNo} disabled className="mono bg-gray-50 text-gray-700" />
            </div>
          </div>

          <label className="text-[12px] font-semibold text-[#4B564E] block mb-[8px]">Output</label>
          <div className="variety-rows">
            <div className="vr-head grid-cols-[1.4fr_0.9fr_0.9fr_32px]">
              <div>Product</div>
              <div>Packets</div>
              <div>Output (kg)</div>
              <div></div>
            </div>
            {outputs.map((out, idx) => {
              const p = flourProducts.find((x) => x.id === out.productId);
              const pSize = p ? p.packetSize : 0;
              const rowKg = pSize * (Number(out.packets) || 0);

              return (
                <div key={idx} className="vr-row grid-cols-[1.4fr_0.9fr_0.9fr_32px]">
                  <select value={out.productId} onChange={(e) => handleProductChange(idx, e.target.value)}>
                    {flourProducts.map((pItem) => (
                      <option key={pItem.id} value={pItem.id}>
                        {pItem.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={out.packets || ''}
                    onChange={(e) => handlePacketsChange(idx, e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  <input type="text" value={fmtKg(rowKg)} disabled className="mono bg-gray-50 text-gray-700" />
                  <button type="button" className="vr-remove" onClick={() => removeRow(idx)}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <span className="add-variety-link mt-[4px]" onClick={addRow}>
            + Add another product output
          </span>

          <div className="totals-strip mt-[8px]">
            <div>
              Total Output: <b className="mono">{fmtKg(totalOutputKg)}</b>
            </div>
            <div>
              Total Packets: <b className="mono">{fmtNum(totalPackets)}</b>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Batch
          </button>
        </div>
      </div>
    </div>
  );
};
