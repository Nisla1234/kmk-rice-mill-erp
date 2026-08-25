import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fmtNum, fmtKg } from '../../utils/formatters';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const {
    computeStockTotals,
    computeFinishedStock,
    computeByProductStock,
    computeFlourStock,
    outstandingList,
    salesTotals,
    chequeTotals,
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your KMK Rice Mill AI Assistant. I can help analyze your raw material intake, production yields, outstanding supplier balances, customer receivables, or bank cheque clearance. How can I help you today?',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const rawStock = computeStockTotals();
  const finishedList = computeFinishedStock();
  const totalFinishedKg = finishedList.reduce((s, it) => s + it.totalKg, 0);
  const byProductList = computeByProductStock();
  const totalByProductsKg = byProductList.reduce((s, it) => s + it.stockKg, 0);
  const flourList = computeFlourStock();
  const totalFlourPackets = flourList.reduce((s, it) => s + it.stockPackets, 0);

  const outList = outstandingList();
  const totalSupplierPayables = outList.reduce((s, x) => s + x.bal, 0);
  const salesStats = salesTotals();
  const cheques = chequeTotals();

  const quickQuestions = [
    'What is our current raw paddy stock breakdown?',
    'How much is currently owed to farmers & suppliers?',
    'What are our total outstanding sales receivables?',
    'What is our pending cheque clearance amount?',
    'Give me a complete summary of the mill status.',
  ];

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const newMsgs: ChatMessage[] = [...messages, { sender: 'user', text: q }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('paddy') || lower.includes('raw material') || lower.includes('variety')) {
        reply = `🌾 **Current Raw Paddy Stock**:\n• Total Paddy: ${fmtKg(rawStock.total)}\n• Nadu: ${fmtKg(
          rawStock.byVariety['Nadu'] || 0
        )}\n• Samba: ${fmtKg(rawStock.byVariety['Samba'] || 0)}\n• Keeri Samba: ${fmtKg(
          rawStock.byVariety['Keeri Samba'] || 0
        )}\n\nDeliveries are currently meeting planned milling capacity.`;
      } else if (lower.includes('farmer') || lower.includes('supplier') || lower.includes('payable') || lower.includes('owed')) {
        reply = `💰 **Supplier & Farmer Payables**:\n• Total Outstanding to Suppliers: **LKR ${fmtNum(
          totalSupplierPayables
        )}** across ${outList.length} unsettled credit deliveries.\n\nOldest outstanding: ${
          outList.length > 0 ? `${outList[0].days} days old (${outList[0].d.ref})` : 'None'
        }.`;
      } else if (lower.includes('receivable') || lower.includes('sales') || lower.includes('client') || lower.includes('customer')) {
        reply = `📊 **Sales & Billing Health**:\n• Total Invoiced: **LKR ${fmtNum(
          salesStats.totalSales
        )}**\n• Collected: **LKR ${fmtNum(salesStats.totalCollected)}**\n• Outstanding Receivables: **LKR ${fmtNum(
          salesStats.totalOutstanding
        )}**\n\nCollection rate is running steadily.`;
      } else if (lower.includes('cheque') || lower.includes('clearance') || lower.includes('bank')) {
        reply = `🏦 **Cheque Registry Overview**:\n• Pending Cheques Value: **LKR ${fmtNum(
          cheques.pendingTotal
        )}**\n• Received from Clients: LKR ${fmtNum(
          cheques.receivedTotal
        )}\n• Issued to Suppliers: LKR ${fmtNum(
          cheques.issuedTotal
        )}\n\nRemember to allocate pending cheques to your respective bank accounts for clearance.`;
      } else if (lower.includes('summary') || lower.includes('status') || lower.includes('mill')) {
        reply = `🏭 **KMK Rice Mill — Comprehensive Status**:\n\n1. **Inventory**:\n  - Raw Paddy: ${fmtKg(
          rawStock.total
        )}\n  - Finished Rice: ${fmtKg(totalFinishedKg)}\n  - Rice Flour: ${fmtNum(
          totalFlourPackets
        )} packets\n  - By-Products: ${fmtKg(
          totalByProductsKg
        )}\n\n2. **Financials**:\n  - Supplier Payables: LKR ${fmtNum(
          totalSupplierPayables
        )}\n  - Customer Receivables: LKR ${fmtNum(
          salesStats.totalOutstanding
        )}\n  - Pending Cheques: LKR ${fmtNum(cheques.pendingTotal)}`;
      } else {
        reply = `I have analyzed your operational and financial data. Currently we have **${fmtKg(
          rawStock.total
        )}** of raw paddy in silos, **LKR ${fmtNum(
          salesStats.totalOutstanding
        )}** in customer receivables, and **LKR ${fmtNum(
          totalSupplierPayables
        )}** in supplier payables. Feel free to ask more specific questions about any module!`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="max-w-[860px] mx-auto">
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <div>
          <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">AI Operational Assistant</h1>
          <p className="text-[13px] text-[#4B564E] m-0 mt-[4px]">
            Instant intelligence on stock levels, yields, financial exposures, and mill logistics.
          </p>
        </div>
      </div>

      {/* Suggested chips */}
      <div className="mb-[16px]">
        <div className="text-[12px] font-semibold text-[#4B564E] uppercase tracking-[0.5px] mb-[8px]">
          Quick Insights
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {quickQuestions.map((qq, idx) => (
            <button
              key={idx}
              type="button"
              className="bg-white border border-[#DEDACB] hover:border-[#2F5D45] hover:bg-[#F6F9F7] text-[#1B2420] text-[12.5px] p-[6px_12px] rounded-[20px] cursor-pointer transition-colors text-left"
              onClick={() => handleSend(qq)}
            >
              {qq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white border border-[#DEDACB] rounded-[12px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 p-[20px] overflow-y-auto flex flex-col gap-[14px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] p-[12px_16px] rounded-[12px] text-[13.5px] leading-[1.6] whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-[#1E3E2E] text-[#FBF7EC] rounded-tr-[2px]'
                    : 'bg-[#F6F5F0] text-[#1B2420] border border-[#EAE7DA] rounded-tl-[2px]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#F6F5F0] text-[#4B564E] border border-[#EAE7DA] p-[10px_16px] rounded-[12px] text-[13px] italic">
                KMK AI is analyzing ERP records…
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-[14px_18px] border-t border-[#DEDACB] bg-[#FBFAF5] flex items-center gap-[10px]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inventory, supplier dues, sales, or production yields…"
            className="flex-1 bg-white"
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
            Send ➜
          </button>
        </form>
      </div>
    </div>
  );
};
