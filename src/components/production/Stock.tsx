import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubTabs } from '../layout/SubTabs';
import { fmtKg, fmtNum } from '../../utils/formatters';

export const Stock: React.FC = () => {
  const {
    stockTab,
    setStockTab,
    computeStockTotals,
    computeFinishedStock,
    computeByProductStock,
    computeFlourStock,
    showToast,
  } = useApp();

  const [varietyFilter, setVarietyFilter] = useState('all');

  const rawStock = computeStockTotals();
  const finishedList = computeFinishedStock();
  const byProductList = computeByProductStock();
  const flourList = computeFlourStock();

  const totalFinishedKg = finishedList.reduce((s, it) => s + it.totalKg, 0);
  const totalFlourPkts = flourList.reduce((s, it) => s + it.stockPackets, 0);
  const totalByProductKg = byProductList.reduce((s, it) => s + it.stockKg, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Stock</h1>
        <SubTabs />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-[12px] flex-wrap gap-[10px]">
        <div className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#4B564E]">
          Current Stock on Hand
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Raw Material (Paddy)</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">{fmtKg(rawStock.total)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Finished Products</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(totalFinishedKg)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Flour Packets</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtNum(totalFlourPkts)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">By-Products</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">{fmtKg(totalByProductKg)}</div>
        </div>
      </div>

      {/* Stock Sub-Tab Switcher */}
      <div className="flex gap-[8px] mb-[18px] flex-wrap">
        <button
          type="button"
          className={`subtab-pill ${stockTab === 'finished' ? 'active' : ''}`}
          onClick={() => setStockTab('finished')}
        >
          Finished Products
        </button>
        <button
          type="button"
          className={`subtab-pill ${stockTab === 'flour' ? 'active' : ''}`}
          onClick={() => setStockTab('flour')}
        >
          Rice Flour
        </button>
        <button
          type="button"
          className={`subtab-pill ${stockTab === 'byproducts' ? 'active' : ''}`}
          onClick={() => setStockTab('byproducts')}
        >
          By-Products
        </button>
      </div>

      {/* Action and Filter Row */}
      <div className="flex items-center gap-[10px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[12px_14px] mb-[16px]">
        {stockTab === 'finished' && (
          <>
            <label className="text-[12px] text-[#4B564E] font-semibold mr-[2px]">Variety</label>
            <select value={varietyFilter} onChange={(e) => setVarietyFilter(e.target.value)}>
              <option value="all">All Varieties</option>
              <option value="Nadu">Nadu</option>
              <option value="Samba">Samba</option>
              <option value="Keeri Samba">Keeri Samba</option>
            </select>
          </>
        )}

        <div className="grow" />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => showToast(`Exporting current ${stockTab} inventory…`)}
        >
          ⬇ Export Stock CSV
        </button>
      </div>

      {/* Render Stock Table based on tab */}
      {stockTab === 'finished' && (
        <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Product Name</th>
                  <th className="p-[12px_16px] font-semibold">Variety</th>
                  <th className="p-[12px_16px] font-semibold">Bag Weight</th>
                  <th className="p-[12px_16px] font-semibold">Stock (Bags)</th>
                  <th className="p-[12px_16px] font-semibold">Total Stock (kg)</th>
                  <th className="p-[12px_16px] font-semibold">Unit Price / kg</th>
                </tr>
              </thead>
              <tbody>
                {finishedList
                  .filter((p) => (varietyFilter === 'all' ? true : p.variety === varietyFilter))
                  .map((p) => (
                    <tr key={p.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                      <td className="p-[14px_16px] text-[13.5px] font-medium">{p.name}</td>
                      <td className="p-[14px_16px] text-[13.5px]">{p.variety}</td>
                      <td className="p-[14px_16px] text-[13.5px] font-mono">{p.weight} kg</td>
                      <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E]">
                        {fmtNum(p.stockBags)} bags
                      </td>
                      <td className="p-[14px_16px] text-[13.5px] font-mono">{fmtKg(p.totalKg)}</td>
                      <td className="p-[14px_16px] text-[13.5px] font-mono">LKR {fmtNum(p.unitPrice)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-[10px_16px] text-[12px] text-[#4B564E] border-t border-[#EAE7DA]">
            <span>Finished Goods Inventory</span>
            <span>Real-time bag count (Production minus Billed)</span>
          </div>
        </div>
      )}

      {stockTab === 'flour' && (
        <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Product Name</th>
                  <th className="p-[12px_16px] font-semibold">Packet Size</th>
                  <th className="p-[12px_16px] font-semibold">Stock (Packets)</th>
                  <th className="p-[12px_16px] font-semibold">Total Stock (kg)</th>
                  <th className="p-[12px_16px] font-semibold">Unit Price / kg</th>
                </tr>
              </thead>
              <tbody>
                {flourList.map((p) => (
                  <tr key={p.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{p.name}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{p.packetSize} kg</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E]">
                      {fmtNum(p.stockPackets)} pkts
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">{fmtKg(p.totalKg)}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">LKR {fmtNum(p.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-[10px_16px] text-[12px] text-[#4B564E] border-t border-[#EAE7DA]">
            <span>Rice Flour Inventory</span>
            <span>Real-time packet count</span>
          </div>
        </div>
      )}

      {stockTab === 'byproducts' && (
        <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">By-Product Name</th>
                  <th className="p-[12px_16px] font-semibold">Stock on Hand (kg)</th>
                  <th className="p-[12px_16px] font-semibold">Unit Price / kg</th>
                </tr>
              </thead>
              <tbody>
                {byProductList.map((p) => (
                  <tr key={p.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{p.name}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E]">
                      {fmtKg(p.stockKg)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono">LKR {fmtNum(p.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-[10px_16px] text-[12px] text-[#4B564E] border-t border-[#EAE7DA]">
            <span>By-Product Inventory</span>
            <span>Includes Husk, Bran, Broken Rice</span>
          </div>
        </div>
      )}
    </div>
  );
};
