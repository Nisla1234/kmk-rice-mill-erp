import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import {
  RegisterClientModal,
  ViewClientsModal,
  RegisterSalesTeamModal,
  ViewSalesTeamModal,
  NewInvoiceModal,
  ViewInvoiceModal,
  SettleInvoiceModal,
} from '../modals/SalesModals';
import { Invoice, Client, SalesTeam } from '../../types';
import { fmtDate, fmtNum, todayISO } from '../../utils/formatters';

export const Billing: React.FC = () => {
  const {
    invoices,
    salesTeams,
    clients,
    clientById,
    salesTeamById,
    salesTotals,
    invoiceOutstanding,
    deleteInvoice,
    showToast,
  } = useApp();

  const [clientFilter, setClientFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [dateMode, setDateMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals
  const [isRegisterClientOpen, setIsRegisterClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isViewClientsOpen, setIsViewClientsOpen] = useState(false);

  const [isRegisterTeamOpen, setIsRegisterTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<SalesTeam | null>(null);
  const [isViewTeamsOpen, setIsViewTeamsOpen] = useState(false);

  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [settlingInvoice, setSettlingInvoice] = useState<Invoice | null>(null);

  const stats = salesTotals();

  const filteredInvoices = invoices
    .filter((inv) => {
      if (clientFilter !== 'all' && inv.clientId !== clientFilter) return false;
      if (teamFilter !== 'all' && inv.salesTeamId !== teamFilter) return false;

      const today = todayISO();
      if (dateMode === 'today' && inv.date !== today) return false;
      if (dateMode === 'week') {
        const dObj = new Date(inv.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 7);
        if (dObj < start) return false;
      }
      if (dateMode === 'month') {
        const dObj = new Date(inv.date + 'T00:00:00');
        const start = new Date(today + 'T00:00:00');
        start.setDate(start.getDate() - 30);
        if (dObj < start) return false;
      }
      if (dateMode === 'custom') {
        if (fromDate && inv.date < fromDate) return false;
        if (toDate && inv.date > toDate) return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Sales &amp; Billing</h1>
        <SubTabs />
      </div>

      {/* Stats Header */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Sales Overview
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Sales</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">LKR {fmtNum(stats.totalSales)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Collected</div>
          <div className="text-[26px] font-semibold text-[#1F6F63] font-serif">LKR {fmtNum(stats.totalCollected)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Receivables Outstanding</div>
          <div className="text-[26px] font-semibold text-[#A63D2C] font-serif">
            LKR {fmtNum(stats.totalOutstanding)}
          </div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Invoices</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{invoices.length}</div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingInvoice(null);
            setIsNewInvoiceOpen(true);
          }}
        >
          ＋ New Invoice
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditingClient(null);
            setIsRegisterClientOpen(true);
          }}
        >
          ＋ Register Client
        </button>
        <button type="button" className="btn" onClick={() => setIsViewClientsOpen(true)}>
          👁 View Clients
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditingTeam(null);
            setIsRegisterTeamOpen(true);
          }}
        >
          ＋ Register Sales Team
        </button>
        <button type="button" className="btn" onClick={() => setIsViewTeamsOpen(true)}>
          👁 View Sales Teams
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Invoices…')}
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

        <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Sales Team</label>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="all">All Teams</option>
          {salesTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.lorryNo} — {t.salesRep}
            </option>
          ))}
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

      {/* Invoices Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Date</th>
              <th className="p-[12px_16px] font-semibold">Invoice No</th>
              <th className="p-[12px_16px] font-semibold">Client</th>
              <th className="p-[12px_16px] font-semibold">Sales Team</th>
              <th className="p-[12px_16px] font-semibold">Total Amount</th>
              <th className="p-[12px_16px] font-semibold">Outstanding</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No invoices found. Click “New Invoice” to create one.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const client = clientById(inv.clientId);
                const team = salesTeamById(inv.salesTeamId);
                const outBal = invoiceOutstanding(inv.invoiceNo);

                return (
                  <tr key={inv.invoiceNo} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px]">{fmtDate(inv.date)}</td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <span className="ref-badge">{inv.invoiceNo}</span>
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-medium">
                      {client ? client.name : '—'}
                      {inv.branch ? ` (${inv.branch})` : ''}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      {team ? `${team.lorryNo} · ${team.salesRep}` : '—'}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold">
                      LKR {fmtNum(inv.totalAmount)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold">
                      {outBal > 0 ? (
                        <span className="text-[#A63D2C]">LKR {fmtNum(outBal)}</span>
                      ) : (
                        <span className="text-[#1F6F63]">Settled</span>
                      )}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px] flex-wrap">
                        <button
                          type="button"
                          className="icon-btn"
                          title="View"
                          onClick={() => setViewingInvoice(inv)}
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Print"
                          onClick={() => {
                            setViewingInvoice(inv);
                            setTimeout(() => showToast(`Sending invoice ${inv.invoiceNo} to printer…`), 150);
                          }}
                        >
                          🖨
                        </button>
                        {outBal > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-gold"
                            onClick={() => setSettlingInvoice(inv)}
                          >
                            Settle
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit"
                          onClick={() => {
                            setEditingInvoice(inv);
                            setIsNewInvoiceOpen(true);
                          }}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete invoice ${inv.invoiceNo}?`)) deleteInvoice(inv.invoiceNo);
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
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </span>
          <span>Rice Mill ERP · Sales &amp; Billing</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterClientModal
        isOpen={isRegisterClientOpen}
        initialData={editingClient}
        onClose={() => {
          setIsRegisterClientOpen(false);
          setEditingClient(null);
        }}
      />
      <ViewClientsModal
        isOpen={isViewClientsOpen}
        onClose={() => setIsViewClientsOpen(false)}
        onOpenRegister={() => {
          setEditingClient(null);
          setIsRegisterClientOpen(true);
        }}
        onEditClient={(c) => {
          setEditingClient(c);
          setIsRegisterClientOpen(true);
        }}
      />
      <RegisterSalesTeamModal
        isOpen={isRegisterTeamOpen}
        initialData={editingTeam}
        onClose={() => {
          setIsRegisterTeamOpen(false);
          setEditingTeam(null);
        }}
      />
      <ViewSalesTeamModal
        isOpen={isViewTeamsOpen}
        onClose={() => setIsViewTeamsOpen(false)}
        onOpenRegister={() => {
          setEditingTeam(null);
          setIsRegisterTeamOpen(true);
        }}
        onEditTeam={(t) => {
          setEditingTeam(t);
          setIsRegisterTeamOpen(true);
        }}
      />
      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        initialData={editingInvoice}
        onClose={() => {
          setIsNewInvoiceOpen(false);
          setEditingInvoice(null);
        }}
      />
      <ViewInvoiceModal
        isOpen={!!viewingInvoice}
        invoice={viewingInvoice}
        onClose={() => setViewingInvoice(null)}
      />
      <SettleInvoiceModal
        isOpen={!!settlingInvoice}
        invoice={settlingInvoice}
        onClose={() => setSettlingInvoice(null)}
      />
    </div>
  );
};
