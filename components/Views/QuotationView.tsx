import React, { useState } from 'react';
import Header from '../Layout/Header';
import Navigation from '../Layout/Navigation';
import Footer from '../Layout/Footer';
import ProjectInfoTab from '../Tabs/ProjectInfoTab';
import DocumentsTab from '../Tabs/DocumentsTab';
import ElementsTab from '../Tabs/ElementsTab';
import ProductsTab from '../Tabs/ProductsTab';
import InstallationTab from '../Tabs/InstallationTab';
import PricingTab from '../Tabs/PricingTab';
import DeliveryTab from '../Tabs/DeliveryTab';
import SummaryTab from '../Tabs/SummaryTab';
import DebugPanel from '../Debug/DebugPanel';
import { TabType } from '../../App';

const QuotationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('info');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header />
      
      <div className="flex-none bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm z-40">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <main className="flex-1 overflow-y-auto w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 scroll-smooth">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300 slide-in-from-bottom-2 pb-24">
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
      
      <div className="z-50">
          <Footer />
      </div>
      <DebugPanel />
    </div>
  );
};

export default QuotationView;