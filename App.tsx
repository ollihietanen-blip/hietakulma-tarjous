import React, { useState } from 'react';
import { QuotationProvider } from './context/QuotationContext';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Footer from './components/Layout/Footer';
import ProjectInfoTab from './components/Tabs/ProjectInfoTab';
import DocumentsTab from './components/Tabs/DocumentsTab';
import ElementsTab from './components/Tabs/ElementsTab';
import ProductsTab from './components/Tabs/ProductsTab';
import InstallationTab from './components/Tabs/InstallationTab';
import PricingTab from './components/Tabs/PricingTab';
import DeliveryTab from './components/Tabs/DeliveryTab';
import SummaryTab from './components/Tabs/SummaryTab';

export type TabType = 'info' | 'documents' | 'elements' | 'products' | 'installation' | 'pricing' | 'delivery' | 'summary';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  return (
    <QuotationProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Header />
        
        <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-32 sm:mb-24">
          <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
            {activeTab === 'info' && <ProjectInfoTab />}
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'elements' && <ElementsTab />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'installation' && <InstallationTab />}
            {activeTab === 'delivery' && <DeliveryTab />}
            {activeTab === 'pricing' && <PricingTab />}
            {activeTab === 'summary' && <SummaryTab />}
          </div>
        </main>
        
        <Footer />
      </div>
    </QuotationProvider>
  );
}

export default App;