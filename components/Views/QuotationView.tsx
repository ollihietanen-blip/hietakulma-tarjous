import React, { useState } from 'react';
import Header from '../Layout/Header';
import Navigation from '../Layout/Navigation';
import DocumentsTab from '../Tabs/DocumentsTab';
import ElementsTab from '../Tabs/ElementsTab';
import ProductsTab from '../Tabs/ProductsTab';
import InstallationTab from '../Tabs/InstallationTab';
import PricingTab from '../Tabs/PricingTab';
import DeliveryTab from '../Tabs/DeliveryTab';
import SummaryTab from '../Tabs/SummaryTab';
import ContractTab from '../Tabs/ContractTab';
import MessagesTab from '../Tabs/MessagesTab';
import DebugPanel from '../Debug/DebugPanel';
import { TabType } from '../../App';

const QuotationView: React.FC = () => {
  // Default to documents now that info is moved
  const [activeTab, setActiveTab] = useState<TabType>('documents');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      <Header />
      
      <div className="flex-none bg-white border-b border-slate-200 shadow-sm z-40">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <main className="flex-1 overflow-y-auto w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-smooth">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-24">
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'elements' && <ElementsTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'installation' && <InstallationTab />}
          {activeTab === 'delivery' && <DeliveryTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'summary' && <SummaryTab />}
          {activeTab === 'contract' && <ContractTab />}
        </div>
      </main>
      
      <DebugPanel />
    </div>
  );
};

export default QuotationView;