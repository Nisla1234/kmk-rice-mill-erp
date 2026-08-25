import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Toast } from './components/layout/Toast';

// Module views
import { DashboardModule } from './components/dashboard/DashboardModule';
import { PaddyDeliveries } from './components/rmr/PaddyDeliveries';
import { OutstandingPayments } from './components/rmr/OutstandingPayments';
import { SupplierLedger } from './components/rmr/SupplierLedger';
import { FinishedProducts } from './components/production/FinishedProducts';
import { ByProducts } from './components/production/ByProducts';
import { RiceFlour } from './components/production/RiceFlour';
import { Stock } from './components/production/Stock';
import { Billing } from './components/sales/Billing';
import { Settlements } from './components/sales/Settlements';
import { CustomerLedger } from './components/sales/CustomerLedger';
import { Cashbook } from './components/finance/Cashbook';
import { ChequeRegistry } from './components/finance/ChequeRegistry';
import { PayrollModule } from './components/payroll/PayrollModule';
import { AIAssistant } from './components/ai/AIAssistant';

const AppContent: React.FC = () => {
  const { activeMain, activeSub } = useApp();

  const renderContent = () => {
    switch (activeMain) {
      case 'dashboard':
        return <DashboardModule />;

      case 'rmr':
        if (activeSub === 'outstanding') return <OutstandingPayments />;
        if (activeSub === 'ledger') return <SupplierLedger />;
        return <PaddyDeliveries />;

      case 'production':
        if (activeSub === 'byproducts') return <ByProducts />;
        if (activeSub === 'flour') return <RiceFlour />;
        if (activeSub === 'stock') return <Stock />;
        return <FinishedProducts />;

      case 'sales':
        if (activeSub === 'settlements') return <Settlements />;
        if (activeSub === 'customer-ledger') return <CustomerLedger />;
        return <Billing />;

      case 'finance':
        if (activeSub === 'cheques') return <ChequeRegistry />;
        return <Cashbook />;

      case 'payroll':
        return <PayrollModule />;

      case 'ai':
        return <AIAssistant />;

      default:
        return <PaddyDeliveries />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="p-[16px_14px_36px] sm:p-[20px_24px_40px] lg:p-[24px_32px_48px] max-w-[1400px] w-full mx-auto">
          {renderContent()}
        </main>
      </div>
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

