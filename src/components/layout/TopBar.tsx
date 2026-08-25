import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from './Sidebar';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  KeyRound,
  X,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeMain,
    activeSub,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
    setCurrentUser,
    showToast,
    cheques,
    outstandingList,
    payrollWeek,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMain = NAV_ITEMS.find((n) => n.key === activeMain);
  const currentSub = currentMain?.sub.find((s) => s.key === activeSub);

  const pendingChequeCount = cheques.filter((c) => c.status === 'Pending').length;
  const overdueCount = outstandingList().filter((o) => o.days > 30).length;

  const notifications = [
    {
      id: 'n1',
      title: 'Cheques Pending Allocation',
      desc: `${pendingChequeCount} cheques awaiting bank deposit`,
      time: '10m ago',
      type: 'warning',
      icon: Clock,
    },
    {
      id: 'n2',
      title: 'Overdue Supplier Payments',
      desc: `${overdueCount} deliveries exceeding 30-day credit term`,
      time: '1h ago',
      type: 'alert',
      icon: AlertTriangle,
    },
    {
      id: 'n3',
      title: 'Payroll Finalization',
      desc: `Weekly payroll for ${payrollWeek} is ready for review`,
      time: '3h ago',
      type: 'info',
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      <header className="flex items-center justify-between py-[10px] sm:py-[12px] px-[14px] sm:px-[20px] lg:px-[32px] bg-white border-b border-[#DEDACB] sticky top-0 z-20 shadow-xs">
        {/* Left: Mobile menu button & Breadcrumb / Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Hamburger toggle button for Mobile/Tablet (< lg) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-1 text-[#1E3E2E] hover:bg-[#F6F5F0] rounded-lg transition-colors border border-[#DEDACB] shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb / Title */}
          <div className="text-[13.5px] text-[#4B564E] flex items-center min-w-0">
            {/* Mobile Header Title (< sm) */}
            <div className="sm:hidden font-bold text-[15px] text-[#1B2420] truncate flex items-center gap-1.5">
              {currentMain && <currentMain.icon size={16} className="text-[#2F5D45] shrink-0" />}
              <span className="truncate">{currentSub?.label || currentMain?.label || 'KMK ERP'}</span>
            </div>

            {/* Tablet/Desktop Breadcrumb (>= sm) */}
            <div className="hidden sm:flex items-center flex-wrap gap-1.5">
              <span className="font-semibold text-[#1B2420] flex items-center gap-1.5">
                {currentMain && <currentMain.icon size={16} className="text-[#2F5D45]" />}
                {currentMain?.label || 'KMK Rice Mill'}
              </span>
              {currentSub && (
                <>
                  <span className="text-[#B9B39C]">/</span>
                  <span className="text-[#2F5D45] font-semibold">{currentSub.label}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification bell with popover */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-[#4B564E] hover:text-[#1B2420] hover:bg-[#F6F5F0] rounded-full transition-colors border border-transparent hover:border-[#DEDACB] min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
              title="System Alerts & Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A63D2C] rounded-full ring-2 ring-white" />
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-[300px] sm:w-[360px] max-w-[calc(100vw-24px)] bg-white border border-[#DEDACB] rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-[14px_16px] bg-[#FBFAF5] border-b border-[#EAE7DA] flex items-center justify-between">
                  <div className="font-semibold text-[13.5px] text-[#1B2420]">
                    Operations Notifications
                  </div>
                  <span className="text-[11px] bg-[#E7EFE9] text-[#2F5D45] font-semibold px-2 py-0.5 rounded-full">
                    {notifications.length} New
                  </span>
                </div>

                <div className="divide-y divide-[#EAE7DA] max-h-[340px] overflow-y-auto">
                  {notifications.map((n) => {
                    const NIcon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="p-[12px_16px] hover:bg-[#FBFAF5] transition-colors cursor-pointer flex gap-3 items-start"
                      >
                        <div className="p-2 rounded-lg bg-[#F6F5F0] text-[#2F5D45] shrink-0 mt-0.5">
                          <NIcon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-[#1B2420] leading-snug">
                            {n.title}
                          </div>
                          <div className="text-[12px] text-[#4B564E] mt-0.5 line-clamp-2">
                            {n.desc}
                          </div>
                          <div className="text-[10.5px] text-[#8C9A8E] mt-1">{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-[10px_16px] bg-[#F6F5F0] border-t border-[#EAE7DA] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      showToast('All notifications marked as read');
                    }}
                    className="text-[12px] text-[#2F5D45] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current User Profile Section */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-[8px] sm:gap-[10px] bg-[#E7EFE9] hover:bg-[#D9E6DC] border border-[#D0DDD2] py-[4px] sm:py-[5px] pr-[10px] sm:pr-[12px] pl-[4px] sm:pl-[5px] rounded-full transition-all cursor-pointer select-none text-left"
            >
              <div className="w-[30px] h-[30px] rounded-full bg-[#1E3E2E] text-white text-[12px] font-bold flex items-center justify-center shadow-xs shrink-0">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block">
                <div className="text-[12.5px] font-bold text-[#1B2420] leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10.5px] text-[#4B564E] uppercase tracking-[0.4px] font-medium leading-none mt-0.5">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`text-[#4B564E] transition-transform duration-200 shrink-0 ${
                  isUserMenuOpen ? 'rotate-180 text-[#1B2420]' : ''
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-[240px] max-w-[calc(100vw-24px)] bg-white border border-[#DEDACB] rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn divide-y divide-[#EAE7DA]">
                {/* User Card Header */}
                <div className="p-[14px_16px] bg-[#FBFAF5]">
                  <div className="font-semibold text-[13.5px] text-[#1B2420]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11.5px] text-[#4B564E] truncate">{currentUser.email}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E7EFE9] rounded-md text-[10.5px] font-semibold text-[#2F5D45]">
                    <ShieldCheck size={12} />
                    {currentUser.role} · Authorized
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#1B2420] hover:bg-[#F6F5F0] rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <User size={15} className="text-[#4B564E]" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#1B2420] hover:bg-[#F6F5F0] rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Settings size={15} className="text-[#4B564E]" />
                    <span>Account Settings</span>
                  </button>
                </div>

                {/* Logout Action */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      showToast('User logged out (Demo mode: session reset)');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#A63D2C] hover:bg-[#F5E2DD] rounded-lg transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MY PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[500px] w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-[16px_20px] bg-[#1E3E2E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#C68A2E]" />
                <h3 className="m-0 text-[16px] font-semibold text-white">User Profile</h3>
              </div>
              <button
                type="button"
                className="text-white/80 hover:text-white"
                onClick={() => setIsProfileModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-[20px] space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-[#EAE7DA]">
                <div className="w-14 h-14 rounded-full bg-[#1E3E2E] text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {currentUser.avatar}
                </div>
                <div>
                  <h4 className="m-0 text-[16px] font-semibold text-[#1B2420]">
                    {currentUser.name}
                  </h4>
                  <div className="text-[13px] text-[#4B564E]">{currentUser.email}</div>
                  <div className="text-[11.5px] font-medium text-[#2F5D45] mt-1">
                    Role: {currentUser.role} (Full Permissions)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 bg-[#FBFAF5] rounded-lg border border-[#EAE7DA]">
                  <div className="text-[11px] text-[#4B564E] uppercase font-semibold">Mill Branch</div>
                  <div className="font-medium text-[#1B2420] mt-0.5">{currentUser.branch}</div>
                </div>
                <div className="p-3 bg-[#FBFAF5] rounded-lg border border-[#EAE7DA]">
                  <div className="text-[11px] text-[#4B564E] uppercase font-semibold">Enterprise</div>
                  <div className="font-medium text-[#1B2420] mt-0.5">{currentUser.millName}</div>
                </div>
              </div>

              <div className="p-3 bg-[#E7EFE9] rounded-lg border border-[#D0DDD2] text-[12.5px] text-[#1E3E2E] flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-[#2F5D45]" />
                <div>
                  <strong>Authentication Architecture:</strong> This profile is structured to
                  automatically bind to <code>Supabase Authentication</code> upon database
                  connection.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    showToast('Profile reviewed');
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[520px] w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-[16px_20px] bg-[#1E3E2E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-[#C68A2E]" />
                <h3 className="m-0 text-[16px] font-semibold text-white">Mill & ERP Settings</h3>
              </div>
              <button
                type="button"
                className="text-white/80 hover:text-white"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-[20px] space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[#4B564E] block mb-1">
                  Mill Operating Name
                </label>
                <input
                  type="text"
                  value={currentUser.millName}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, millName: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#4B564E] block mb-1">
                    Base Currency
                  </label>
                  <input type="text" value="LKR (Sri Lankan Rupee)" disabled className="w-full bg-[#FBFAF5]" />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#4B564E] block mb-1">
                    Active Branch
                  </label>
                  <input
                    type="text"
                    value={currentUser.branch}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, branch: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FBFAF5] rounded-lg border border-[#EAE7DA] space-y-2">
                <div className="text-[12px] font-semibold text-[#1B2420] flex items-center gap-1.5">
                  <Building size={14} className="text-[#2F5D45]" />
                  <span>Integration Status</span>
                </div>
                <div className="text-[12px] text-[#4B564E] space-y-1">
                  <div className="flex justify-between">
                    <span>Database Adapter:</span>
                    <span className="font-semibold text-[#2F5D45]">Supabase Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Engine Connector:</span>
                    <span className="font-semibold text-[#2F5D45]">n8n Workflow Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Engine:</span>
                    <span className="font-semibold text-[#2F5D45]">Supabase Storage Ready</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    showToast('ERP Settings saved successfully');
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
