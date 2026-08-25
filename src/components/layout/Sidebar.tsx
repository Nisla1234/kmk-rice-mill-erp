import React from 'react';
import { useApp } from '../../context/AppContext';
import { MainNavKey } from '../../types';
import {
  LayoutDashboard,
  Wheat,
  Factory,
  ReceiptText,
  Landmark,
  Users,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';

export interface NavItemConfig {
  key: MainNavKey;
  label: string;
  icon: React.ElementType;
  sub: { key: string; label: string }[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, sub: [] },
  {
    key: 'rmr',
    label: 'Raw Material Registry',
    icon: Wheat,
    sub: [
      { key: 'paddy', label: 'Paddy Deliveries' },
      { key: 'outstanding', label: 'Outstanding Payments' },
      { key: 'ledger', label: 'Supplier Ledger' },
    ],
  },
  {
    key: 'production',
    label: 'Production Records',
    icon: Factory,
    sub: [
      { key: 'finished', label: 'Finished Products' },
      { key: 'byproducts', label: 'By-Products' },
      { key: 'flour', label: 'Rice Flour' },
      { key: 'stock', label: 'Stock' },
    ],
  },
  {
    key: 'sales',
    label: 'Sales & Billing',
    icon: ReceiptText,
    sub: [
      { key: 'billing', label: 'Billing' },
      { key: 'settlements', label: 'Settlements' },
      { key: 'customer-ledger', label: 'Customer Ledger' },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: Landmark,
    sub: [
      { key: 'cashbook', label: 'Cashbook' },
      { key: 'cheques', label: 'Cheque Registry' },
    ],
  },
  { key: 'payroll', label: 'Payroll', icon: Users, sub: [] },
  { key: 'ai', label: 'AI Assistant', icon: Sparkles, sub: [] },
];

export const Sidebar: React.FC = () => {
  const {
    activeMain,
    activeSub,
    setActiveMain,
    setActiveSub,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
  } = useApp();

  const handleNavClick = (item: NavItemConfig, isMobile: boolean = false) => {
    setActiveMain(item.key);
    if (item.sub.length > 0) {
      const isCurrentSubValid = item.sub.some((s) => s.key === activeSub);
      if (!isCurrentSubValid) {
        setActiveSub(item.sub[0].key);
      }
    } else if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubClick = (mainKey: MainNavKey, subKey: string, e: React.MouseEvent, isMobile: boolean = false) => {
    e.stopPropagation();
    setActiveMain(mainKey);
    setActiveSub(subKey);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderNavList = (isMobile: boolean = false) => (
    <nav className="p-[14px_12px] overflow-y-auto flex-1 space-y-1.5 scrollbar-thin">
      {NAV_ITEMS.map((item) => {
        const isActive = activeMain === item.key;
        const Icon = item.icon;
        const hasSub = item.sub.length > 0;

        return (
          <div key={item.key} className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleNavClick(item, isMobile)}
              className={`w-full flex items-center justify-between py-[10px] px-[12px] rounded-[8px] cursor-pointer text-[13.5px] sm:text-[14px] font-medium transition-all text-left group min-h-[42px] ${
                isActive
                  ? 'bg-[rgba(198,138,46,0.2)] text-[#FBF7EC] shadow-xs'
                  : 'text-[#D3DFD6] hover:bg-[rgba(239,233,216,0.07)] hover:text-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center gap-[10px] min-w-0">
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-[#C68A2E]' : 'text-[#8EA594] group-hover:text-[#D3DFD6]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {hasSub && (
                <ChevronDown
                  size={15}
                  className={`text-[#8EA594] transition-transform duration-200 shrink-0 ${
                    isActive ? 'rotate-180 text-[#C68A2E]' : 'opacity-60'
                  }`}
                />
              )}
            </button>

            {/* Sub items */}
            {hasSub && isActive && (
              <div className="pl-[28px] pr-[4px] py-1 space-y-1 animate-fadeIn">
                {item.sub.map((subItem) => {
                  const isSubActive = activeSub === subItem.key;
                  return (
                    <button
                      key={subItem.key}
                      type="button"
                      onClick={(e) => handleSubClick(item.key, subItem.key, e, isMobile)}
                      className={`w-full flex items-center gap-[8px] py-[8px] px-[10px] rounded-[6px] text-[13px] transition-colors text-left min-h-[38px] ${
                        isSubActive
                          ? 'bg-[rgba(255,255,255,0.15)] text-[#FFFFFF] font-semibold shadow-xs'
                          : 'text-[#B4C7BB] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span
                        className={`w-[6px] h-[6px] rounded-full shrink-0 transition-colors ${
                          isSubActive ? 'bg-[#C68A2E] ring-2 ring-[#C68A2E]/40' : 'bg-[#6D8374]'
                        }`}
                      />
                      <span className="truncate">{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-[260px] xl:w-[270px] bg-[#1E3E2E] text-[#EFE9D8] flex-col shrink-0 border-r border-[#2A523E] min-h-screen sticky top-0 h-screen overflow-y-auto select-none z-30 shadow-md">
        {/* Brand Header */}
        <div className="pt-[22px] px-[20px] pb-[18px] border-b border-[rgba(239,233,216,0.12)]">
          <div className="text-[18px] font-bold tracking-[0.2px] text-[#FBF7EC] flex items-center gap-2">
            <span className="text-[20px]">🌾</span>
            <span>KMK Rice Mill</span>
          </div>
          <div className="text-[11px] text-[#9FB6A4] mt-[2px] tracking-[0.6px] uppercase font-semibold">
            ERP Enterprise · v1.0
          </div>
        </div>

        {/* Navigation list */}
        {renderNavList(false)}

        {/* Sidebar Footer */}
        <div className="p-[14px_18px] border-t border-[rgba(239,233,216,0.12)] bg-[#193527]/70">
          <div className="flex items-center justify-between text-[11.5px] text-[#9FB6A4]">
            <span>Kurunegala Mill HQ</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (lg:hidden) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Navigation Panel */}
          <div className="relative w-[300px] max-w-[85vw] bg-[#1E3E2E] text-[#EFE9D8] flex flex-col h-full shadow-2xl z-10 animate-fadeIn">
            {/* Drawer Header */}
            <div className="pt-5 px-5 pb-4 border-b border-[rgba(239,233,216,0.12)] flex items-center justify-between">
              <div>
                <div className="text-[17px] font-bold tracking-[0.2px] text-[#FBF7EC] flex items-center gap-2">
                  <span className="text-[20px]">🌾</span>
                  <span>KMK Rice Mill</span>
                </div>
                <div className="text-[11px] text-[#9FB6A4] mt-0.5 tracking-[0.5px] uppercase font-semibold">
                  ERP Enterprise · Mobile
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-[#D3DFD6] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                title="Close Navigation"
                aria-label="Close Navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info Strip in Mobile Drawer */}
            <div className="p-3 mx-3 mt-3 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C68A2E] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-[#BFD1C4] uppercase tracking-wider">{currentUser.role}</div>
              </div>
            </div>

            {/* Mobile Nav list */}
            {renderNavList(true)}

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[rgba(239,233,216,0.12)] bg-[#193527]">
              <div className="flex items-center justify-between text-[12px] text-[#9FB6A4]">
                <span>Kurunegala Mill HQ</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
