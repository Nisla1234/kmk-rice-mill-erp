import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientBranch, SalesTeam, Invoice, InvoiceItem } from '../../types';
import { todayISO, fmtDate, fmtNum } from '../../utils/formatters';

/* ---------------- REGISTER / EDIT CLIENT MODAL ---------------- */
export const RegisterClientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Client | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { saveClient, showToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'Finished Product' | 'By-Product'>('Finished Product');
  const [branchType, setBranchType] = useState<'Single' | 'Multiple'>('Single');
  const [openingOutstanding, setOpeningOutstanding] = useState<number | ''>('');
  const [branches, setBranches] = useState<ClientBranch[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPhone(initialData.phone || '');
        setLocation(initialData.location || '');
        setType(initialData.type);
        setBranchType(initialData.branchType);
        setOpeningOutstanding(initialData.openingOutstanding || '');
        setBranches(initialData.branches ? initialData.branches.map((b) => ({ ...b })) : []);
      } else {
        setName('');
        setPhone('');
        setLocation('');
        setType('Finished Product');
        setBranchType('Single');
        setOpeningOutstanding('');
        setBranches([{ name: '', location: '' }]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddBranch = () => {
    setBranches([...branches, { name: '', location: '' }]);
  };

  const handleBranchChange = (index: number, field: keyof ClientBranch, value: string) => {
    const updated = [...branches];
    updated[index][field] = value;
    setBranches(updated);
  };

  const handleRemoveBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter the client name');
      return;
    }

    const validBranches = branchType === 'Multiple' ? branches.filter((b) => b.name.trim().length > 0) : [];

    saveClient(
      {
        id: initialData ? initialData.id : '',
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        type,
        branchType,
        branches: validBranches,
        openingOutstanding: Number(openingOutstanding) || 0,
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
            {initialData ? 'Edit Client' : 'Register New Client'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Client Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunil Stores" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Telephone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kurunegala" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="Finished Product">Finished Product</option>
                <option value="By-Product">By-Product</option>
              </select>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Branch Type</label>
              <select value={branchType} onChange={(e) => setBranchType(e.target.value as any)}>
                <option value="Single">Single</option>
                <option value="Multiple">Multiple</option>
              </select>
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Opening Outstanding Balance (LKR)</label>
              <input
                type="number"
                value={openingOutstanding}
                onChange={(e) => setOpeningOutstanding(Number(e.target.value) || '')}
                placeholder="0"
                min="0"
              />
            </div>

            {branchType === 'Multiple' && (
              <div className="col-span-full mt-[8px]">
                <label className="text-[12px] font-semibold text-[#4B564E] block mb-[8px]">Branch Locations</label>
                <div className="variety-rows">
                  <div className="vr-head grid-cols-[1.3fr_1.3fr_32px]">
                    <div>Branch Name</div>
                    <div>Location</div>
                    <div></div>
                  </div>
                  {branches.map((b, idx) => (
                    <div key={idx} className="vr-row grid-cols-[1.3fr_1.3fr_32px]">
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => handleBranchChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Colombo 07 Branch"
                      />
                      <input
                        type="text"
                        value={b.location}
                        onChange={(e) => handleBranchChange(idx, 'location', e.target.value)}
                        placeholder="e.g. Colombo 07"
                      />
                      <button type="button" className="vr-remove" onClick={() => handleRemoveBranch(idx)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <span className="add-variety-link mt-[4px]" onClick={handleAddBranch}>
                  + Add another branch
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW CLIENTS MODAL ---------------- */
export const ViewClientsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onEditClient: (client: Client) => void;
}> = ({ isOpen, onClose, onOpenRegister, onEditClient }) => {
  const { clients, clientOutstandingTotal, deleteClient } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Registered Clients</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          <div className="mb-[14px]">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
            >
              ＋ Register New Client
            </button>
          </div>

          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Client</th>
                  <th className="p-[12px_16px] font-semibold">Phone</th>
                  <th className="p-[12px_16px] font-semibold">Location</th>
                  <th className="p-[12px_16px] font-semibold">Type</th>
                  <th className="p-[12px_16px] font-semibold">Branches</th>
                  <th className="p-[12px_16px] font-semibold">Outstanding</th>
                  <th className="p-[12px_16px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-[30px] text-[#4B564E] text-[13px]">
                      No clients registered yet.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => {
                    const outstanding = clientOutstandingTotal(c.id);
                    return (
                      <tr key={c.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5]">
                        <td className="p-[12px_16px] text-[13.5px] font-medium">{c.name}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{c.phone || '—'}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{c.location || '—'}</td>
                        <td className="p-[12px_16px] text-[13.5px]">{c.type}</td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          {c.branchType === 'Multiple' ? `${c.branches.length} branches` : 'Single'}
                        </td>
                        <td className="p-[12px_16px] text-[13.5px] font-mono font-semibold">
                          LKR {fmtNum(outstanding)}
                        </td>
                        <td className="p-[12px_16px] text-[13.5px]">
                          <div className="flex gap-[6px]">
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => {
                                onClose();
                                onEditClient(c);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => {
                                if (confirm(`Delete "${c.name}"?`)) deleteClient(c.id);
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

/* ---------------- REGISTER / EDIT SALES TEAM MODAL ---------------- */
export const RegisterSalesTeamModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: SalesTeam | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { saveSalesTeam, showToast } = useApp();
  const [lorryNo, setLorryNo] = useState('');
  const [salesRep, setSalesRep] = useState('');
  const [driver, setDriver] = useState('');
  const [helper, setHelper] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLorryNo(initialData.lorryNo);
        setSalesRep(initialData.salesRep);
        setDriver(initialData.driver);
        setHelper(initialData.helper || '');
      } else {
        setLorryNo('');
        setSalesRep('');
        setDriver('');
        setHelper('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lorryNo.trim()) {
      showToast('Please enter the lorry number');
      return;
    }
    saveSalesTeam(
      {
        id: initialData ? initialData.id : '',
        lorryNo: lorryNo.trim(),
        salesRep: salesRep.trim(),
        driver: driver.trim(),
        helper: helper.trim(),
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
            {initialData ? 'Edit Sales Team' : 'Register Sales Team'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Lorry Number</label>
              <input type="text" value={lorryNo} onChange={(e) => setLorryNo(e.target.value)} placeholder="e.g. LH-4521" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Sales Rep</label>
              <input type="text" value={salesRep} onChange={(e) => setSalesRep(e.target.value)} placeholder="e.g. D. Rathnayake" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Driver</label>
              <input type="text" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="e.g. S. Kumara" required />
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                Helper <span className="text-[11px] text-[#9AA69C] font-normal">(optional)</span>
              </label>
              <input type="text" value={helper} onChange={(e) => setHelper(e.target.value)} placeholder="e.g. P. Nimal" />
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Sales Team</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW SALES TEAM MODAL ---------------- */
export const ViewSalesTeamModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onEditTeam: (team: SalesTeam) => void;
}> = ({ isOpen, onClose, onOpenRegister, onEditTeam }) => {
  const { salesTeams, deleteSalesTeam } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Sales Teams</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          <div className="mb-[14px]">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
            >
              ＋ Register New Sales Team
            </button>
          </div>

          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Lorry No</th>
                  <th className="p-[12px_16px] font-semibold">Sales Rep</th>
                  <th className="p-[12px_16px] font-semibold">Driver</th>
                  <th className="p-[12px_16px] font-semibold">Helper</th>
                  <th className="p-[12px_16px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesTeams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-[30px] text-[#4B564E] text-[13px]">
                      No sales teams registered yet.
                    </td>
                  </tr>
                ) : (
                  salesTeams.map((t) => (
                    <tr key={t.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5]">
                      <td className="p-[12px_16px] text-[13.5px]">
                        <span className="ref-badge">{t.lorryNo}</span>
                      </td>
                      <td className="p-[12px_16px] text-[13.5px] font-medium">{t.salesRep}</td>
                      <td className="p-[12px_16px] text-[13.5px]">{t.driver}</td>
                      <td className="p-[12px_16px] text-[13.5px]">{t.helper || '—'}</td>
                      <td className="p-[12px_16px] text-[13.5px]">
                        <div className="flex gap-[6px]">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              onClose();
                              onEditTeam(t);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Delete team "${t.lorryNo}"?`)) deleteSalesTeam(t.id);
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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

/* ---------------- NEW / EDIT INVOICE MODAL ---------------- */
export const NewInvoiceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Invoice | null;
}> = ({ isOpen, onClose, initialData }) => {
  const {
    clients,
    salesTeams,
    invoices,
    finishedProducts,
    byProducts,
    flourProducts,
    clientById,
    clientOutstandingTotal,
    saveInvoice,
    showToast,
  } = useApp();

  const [date, setDate] = useState(todayISO());
  const [invoiceNo, setInvoiceNo] = useState('');
  const [clientId, setClientId] = useState('');
  const [branch, setBranch] = useState('');
  const [salesTeamId, setSalesTeamId] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Finished Products' | 'Rice Flour' | 'By-Products'>('Finished Products');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setInvoiceNo(initialData.invoiceNo);
        setClientId(initialData.clientId);
        setBranch(initialData.branch || '');
        setSalesTeamId(initialData.salesTeamId);
        setItems(initialData.items.map((it) => ({ ...it })));
      } else {
        const nextNum = invoices.length + 56;
        setDate(todayISO());
        setInvoiceNo('INV-' + String(nextNum).padStart(4, '0'));
        setClientId(clients[0]?.id || '');
        setBranch('');
        setSalesTeamId(salesTeams[0]?.id || '');
        setItems([]);
      }
    }
  }, [isOpen, initialData, invoices.length, clients, salesTeams]);

  const selectedClient = clientById(clientId);

  const availableCategories: ('Finished Products' | 'Rice Flour' | 'By-Products')[] = React.useMemo(() => {
    if (!selectedClient) return ['Finished Products', 'Rice Flour', 'By-Products'];
    if (selectedClient.type === 'Finished Product') return ['Finished Products', 'Rice Flour'];
    return ['By-Products'];
  }, [selectedClient]);

  useEffect(() => {
    if (!availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0] || 'Finished Products');
    }
  }, [availableCategories, activeCategory]);

  const productList = React.useMemo(() => {
    if (activeCategory === 'Finished Products') {
      return finishedProducts.map((p) => ({ id: p.id, name: p.name, price: p.unitPrice * p.weight, weight: p.weight }));
    }
    if (activeCategory === 'Rice Flour') {
      return flourProducts.map((p) => ({ id: p.id, name: p.name, price: p.unitPrice * p.packetSize, weight: p.packetSize }));
    }
    return byProducts.map((p) => ({ id: p.id, name: p.name, price: p.unitPrice }));
  }, [activeCategory, finishedProducts, flourProducts, byProducts]);

  useEffect(() => {
    if (productList.length > 0 && !selectedProductId) {
      setSelectedProductId(productList[0].id);
    }
  }, [productList, selectedProductId]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const p = productList.find((x) => x.id === selectedProductId) || productList[0];
    if (!p) {
      showToast('No products available in this category');
      return;
    }
    const q = Number(qty);
    if (!q || q <= 0) {
      showToast('Enter a valid quantity');
      return;
    }

    setItems([
      ...items,
      {
        category: activeCategory,
        productId: p.id,
        productName: p.name,
        unitPrice: p.price,
        weight: (p as any).weight,
        qty: q,
        total: p.price * q,
      },
    ]);
    setQty('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((s, it) => s + it.total, 0);
  const outstandingHint = selectedClient ? clientOutstandingTotal(selectedClient.id) : 0;

  const handleSave = (andPrint: boolean) => {
    if (!clientId) {
      showToast('Please select a client');
      return;
    }
    if (items.length === 0) {
      showToast('Add at least one item to the invoice');
      return;
    }

    saveInvoice(
      {
        invoiceNo,
        date,
        clientId,
        branch: selectedClient?.branchType === 'Multiple' ? branch : '',
        salesTeamId,
        items,
        totalAmount: grandTotal,
      },
      !!initialData
    );

    if (andPrint) {
      setTimeout(() => showToast(`Sending invoice ${invoiceNo} to printer…`), 200);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? 'Edit Invoice' : 'New Invoice'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-[22px_24px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-[12px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                Invoice No <span className="text-[11px] text-[#9AA69C] font-normal">(auto-generated)</span>
              </label>
              <input type="text" value={invoiceNo} disabled className="mono bg-gray-50 text-gray-700" />
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {selectedClient?.branchType === 'Multiple' && selectedClient.branches.length > 0 && (
              <div className="col-span-full flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">
                  Branch <span className="text-[11px] text-[#9AA69C] font-normal">(this client bills separately per branch)</span>
                </label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="">Main / Default</option>
                  {selectedClient.branches.map((b, idx) => (
                    <option key={idx} value={b.name}>
                      {b.name} — {b.location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Sales Team (Lorry No)</label>
              <select value={salesTeamId} onChange={(e) => setSalesTeamId(e.target.value)}>
                {salesTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.lorryNo} — {t.salesRep}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClient && (
            <div className="text-[11.5px] text-[#4B564E] bg-[#F6F5F0] p-[8px_12px] rounded-[6px] mb-[16px]">
              Existing outstanding balance for {selectedClient.name}: <b>LKR {fmtNum(outstandingHint)}</b>
            </div>
          )}

          <label className="text-[12px] font-semibold text-[#4B564E] block mb-[6px]">Add Items</label>
          <div className="flex gap-[8px] flex-wrap my-[8px]">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`subtab-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedProductId('');
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-[10px] flex-wrap bg-[#FFFFFF] border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[12px]">
            <label className="text-[12px] text-[#4B564E] font-semibold">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 min-w-[180px]"
            >
              {productList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — LKR {fmtNum(p.price)}
                </option>
              ))}
            </select>

            <label className="text-[12px] text-[#4B564E] font-semibold">Qty</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || '')}
              placeholder="0"
              min="1"
              className="w-[100px]"
            />

            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItem}>
              + Add Item
            </button>
          </div>

          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden mb-[8px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[10px_14px] font-semibold">Category</th>
                  <th className="p-[10px_14px] font-semibold">Product</th>
                  <th className="p-[10px_14px] font-semibold">Unit Price</th>
                  <th className="p-[10px_14px] font-semibold">Qty</th>
                  <th className="p-[10px_14px] font-semibold">Total</th>
                  <th className="p-[10px_14px] font-semibold w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-[20px] text-[#4B564E] text-[13px]">
                      No items added yet.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={idx} className="border-b border-[#EAE7DA]">
                      <td className="p-[10px_14px] text-[13px]">{it.category}</td>
                      <td className="p-[10px_14px] text-[13px] font-medium">{it.productName}</td>
                      <td className="p-[10px_14px] text-[13px] font-mono">LKR {fmtNum(it.unitPrice)}</td>
                      <td className="p-[10px_14px] text-[13px] font-mono">{fmtNum(it.qty)}</td>
                      <td className="p-[10px_14px] text-[13px] font-mono font-semibold">LKR {fmtNum(it.total)}</td>
                      <td className="p-[10px_14px] text-[13px]">
                        <button type="button" className="icon-btn danger" onClick={() => handleRemoveItem(idx)}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="totals-strip">
            <div>
              Grand Total: <b className="mono">LKR {fmtNum(grandTotal)}</b>
            </div>
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

/* ---------------- VIEW INVOICE MODAL ---------------- */
export const ViewInvoiceModal: React.FC<{
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}> = ({ isOpen, invoice, onClose }) => {
  const { clientById, salesTeamById, previousOutstanding, showToast } = useApp();

  if (!isOpen || !invoice) return null;

  const client = clientById(invoice.clientId);
  const team = salesTeamById(invoice.salesTeamId);
  const prevOutstanding = previousOutstanding(invoice.clientId, invoice.invoiceNo);
  const grandTotal = invoice.totalAmount + prevOutstanding;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420] flex items-center gap-2">
            Invoice <span className="mono text-[14px] text-[#4B564E] font-normal">{invoice.invoiceNo}</span>
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-[22px_24px]">
          <div className="grid grid-cols-2 gap-[14px] mb-[12px]">
            <div>
              <div className="text-[11px] text-[#9AA69C]">Date</div>
              <div className="font-semibold">{fmtDate(invoice.date)}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9AA69C]">Client</div>
              <div className="font-semibold">
                {client ? client.name : '—'}
                {invoice.branch ? ` · ${invoice.branch}` : ''}
              </div>
            </div>
            <div className="col-span-full">
              <div className="text-[11px] text-[#9AA69C]">Sales Team</div>
              <div className="font-semibold">{team ? `${team.lorryNo} — ${team.salesRep}` : '—'}</div>
            </div>
          </div>

          <table className="w-full border-collapse mt-[12px]">
            <thead>
              <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                <th className="p-[10px_14px] font-semibold">Category</th>
                <th className="p-[10px_14px] font-semibold">Product</th>
                <th className="p-[10px_14px] font-semibold">Unit Price</th>
                <th className="p-[10px_14px] font-semibold">Qty</th>
                <th className="p-[10px_14px] font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, idx) => (
                <tr key={idx} className="border-b border-[#EAE7DA]">
                  <td className="p-[10px_14px] text-[13px]">{it.category}</td>
                  <td className="p-[10px_14px] text-[13px] font-medium">{it.productName}</td>
                  <td className="p-[10px_14px] text-[13px] font-mono">LKR {fmtNum(it.unitPrice)}</td>
                  <td className="p-[10px_14px] text-[13px] font-mono">{fmtNum(it.qty)}</td>
                  <td className="p-[10px_14px] text-[13px] font-mono font-semibold">LKR {fmtNum(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-[16px] pt-[12px] border-t border-[#DEDACB] flex flex-col gap-[6px] items-end text-[13.5px]">
            <div>
              Total Invoice&nbsp;&nbsp;: <span className="mono font-semibold">LKR {fmtNum(invoice.totalAmount)}</span>
            </div>
            <div>
              Outstanding&nbsp;&nbsp;&nbsp;: <span className="mono">LKR {fmtNum(prevOutstanding)}</span>
            </div>
            <div className="text-[15px] font-semibold text-[#1E3E2E] mt-[4px]">
              Grand Total&nbsp;&nbsp;: <span className="mono">LKR {fmtNum(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => showToast(`Sending invoice ${invoice.invoiceNo} to printer…`)}
          >
            🖨 Print
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- SETTLE INVOICE MODAL ---------------- */
export const SettleInvoiceModal: React.FC<{
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}> = ({ isOpen, invoice, onClose }) => {
  const { clientById, invoiceOutstanding, settlements, saveSettlement, showToast } = useApp();
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<'Cash' | 'Cheque'>('Cash');
  const [chequeNo, setChequeNo] = useState('');

  const outstanding = invoice ? invoiceOutstanding(invoice.invoiceNo) : 0;
  const client = invoice ? clientById(invoice.clientId) : null;

  useEffect(() => {
    if (invoice) {
      setAmount(outstanding > 0 ? outstanding : '');
      setDate(todayISO());
      setMethod('Cash');
      setChequeNo('');
    }
  }, [invoice, outstanding]);

  if (!isOpen || !invoice) return null;

  // Last 2 transactions for this client
  const clientInvNos = [invoice.invoiceNo];
  const clientHistory = settlements
    .filter((s) => clientInvNos.includes(s.invoiceNo))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) {
      showToast('Enter a valid payment amount');
      return;
    }

    saveSettlement({
      invoiceNo: invoice.invoiceNo,
      date,
      amount: val,
      method,
      chequeNo: method === 'Cheque' ? chequeNo.trim() : '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Settle Invoice</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px]">
            <div className="bg-[#E7EFE9] rounded-[8px] p-[12px_14px] mb-[14px] text-[13px] text-[#1B2420]">
              Settling <b>{client ? client.name : '—'}</b> — <span className="ref-badge">{invoice.invoiceNo}</span> —
              outstanding <b>LKR {fmtNum(outstanding)}</b>
            </div>

            <div className="mb-[14px]">
              <label className="text-[12px] font-semibold text-[#4B564E] block">Last 2 Transactions</label>
              <div className="text-[12.5px] text-[#4B564E] mt-[6px] p-[8px_12px] bg-[#F6F5F0] rounded-[6px]">
                {clientHistory.length === 0 ? (
                  <span className="text-[#9AA69C]">No previous payments recorded for this invoice yet.</span>
                ) : (
                  clientHistory.map((h, i) => (
                    <div key={i}>
                      {fmtDate(h.date)} — LKR {fmtNum(h.amount)} — {h.method}
                      {h.chequeNo ? ` (${h.chequeNo})` : ''} <span className="text-[#9AA69C]">({h.invoiceNo})</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-semibold text-[#4B564E]">Amount Paid (LKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || '')}
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
                <select value={method} onChange={(e) => setMethod(e.target.value as 'Cash' | 'Cheque')}>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              {method === 'Cheque' && (
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[12px] font-semibold text-[#4B564E]">Cheque No</label>
                  <input
                    type="text"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    placeholder="e.g. 092975"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
