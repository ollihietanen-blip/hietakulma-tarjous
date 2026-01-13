import React, { useState } from 'react';
import { QuotationProvider } from './context/QuotationContext';
import Sidebar from './components/Layout/Sidebar';
import DashboardHome from './components/Views/DashboardHome';
import QuantityTakeoff from './components/Views/QuantityTakeoff';
import QuotationView from './components/Views/QuotationView';

export type TabType = 'info' | 'documents' | 'elements' | 'products' | 'installation' | 'pricing' | 'delivery' | 'summary';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <QuotationProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Fixed Sidebar */}
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
           {currentView === 'dashboard' && (
               <DashboardHome onNewQuote={() => setCurrentView('quotation')} />
           )}
           {currentView === 'takeoff' && (
               <QuantityTakeoff onComplete={() => setCurrentView('quotation')} />
           )}
           {currentView === 'quotation' && (
               <QuotationView />
           )}
        </div>
      </div>
    </QuotationProvider>
  );
}

export default App;