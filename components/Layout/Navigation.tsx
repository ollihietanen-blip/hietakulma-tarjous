import React from 'react';
import { TabType } from '../../App';
import { useQuotation } from '../../context/QuotationContext';
import { 
  FileText, 
  Box, 
  Grid, 
  DollarSign, 
  Truck, 
  CheckCircle,
  Hammer,
  FileSignature,
  MessageSquare
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { quotation } = useQuotation();
  
  // Logic to show Contract tab
  const showContract = ['sent', 'accepted', 'rejected'].includes(quotation.status);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { id: 'documents', label: 'Dokumentit', icon: <FileText size={18} /> },
    { id: 'elements', label: 'Tehdastuotanto', icon: <Box size={18} /> },
    { id: 'products', label: 'Työmaatoimitukset', icon: <Grid size={18} /> },
    { id: 'installation', label: 'Asennus', icon: <Hammer size={18} /> },
    { id: 'delivery', label: 'Logistiikka', icon: <Truck size={18} /> },
    { id: 'pricing', label: 'Hinnoittelu', icon: <DollarSign size={18} /> },
    { id: 'messages', label: 'Viestit', icon: <MessageSquare size={18} /> },
    { id: 'summary', label: 'Yhteenveto', icon: <CheckCircle size={18} /> },
    { id: 'contract', label: 'Sopimus', icon: <FileSignature size={18} />, hidden: !showContract },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="flex overflow-x-auto no-scrollbar pt-2 px-4 sm:px-6 lg:px-8 space-x-1" aria-label="Tabs">
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {tabs.filter(t => !t.hidden).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-display uppercase tracking-wide text-sm flex items-center gap-2 transition-all duration-200 select-none
                ${isActive
                  ? 'border-hieta-black text-hieta-black bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300 hover:bg-white/50'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={isActive ? 'text-hieta-blue' : 'text-stone-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;