import React from 'react';
import { TabType } from '../../App';
import { 
  Info, 
  FileText, 
  Box, 
  Grid, 
  DollarSign, 
  Truck, 
  CheckCircle,
  Hammer
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Projekti', icon: <Info size={18} /> },
    { id: 'documents', label: 'Dokumentit', icon: <FileText size={18} /> },
    { id: 'elements', label: 'Tehdastuotanto', icon: <Box size={18} /> },
    { id: 'products', label: 'Työmaatoimitukset', icon: <Grid size={18} /> },
    { id: 'installation', label: 'Asennus', icon: <Hammer size={18} /> },
    { id: 'delivery', label: 'Logistiikka', icon: <Truck size={18} /> },
    { id: 'pricing', label: 'Hinnoittelu', icon: <DollarSign size={18} /> },
    { id: 'summary', label: 'Yhteenveto', icon: <CheckCircle size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="flex overflow-x-auto no-scrollbar py-1 px-4 sm:px-6 lg:px-8 space-x-2 sm:space-x-4" aria-label="Tabs">
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 select-none
                ${isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
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