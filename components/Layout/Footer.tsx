import React from 'react';
import { useQuotation } from '../../context/QuotationContext';

const Footer: React.FC = () => {
  const { pricing } = useQuotation();

  // Helper to safe format currency
  const formatMoney = (amount: number) => {
    return (Number(amount) || 0).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const formatPercent = (amount: number) => {
     return (Number(amount) || 0).toLocaleString('fi-FI');
  };

  return (
    <footer className="fixed bottom-0 left-64 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center gap-4">
          
          {/* Detailed breakdown (hidden on very small screens) */}
          <div className="hidden sm:flex gap-8 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Kustannukset</span>
              <span className="font-medium text-gray-700">{(pricing.materialCostTotal || 0).toLocaleString('fi-FI', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Kate</span>
              <span className="font-medium text-green-600">{(pricing.profitAmount || 0).toLocaleString('fi-FI', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} € ({pricing.profitPercent?.toFixed(1)}%)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">ALV {formatPercent(pricing.vatPercentage)}%</span>
              <span className="font-medium text-gray-700">{formatMoney(pricing.vatAmount)} €</span>
            </div>
          </div>
          
          {/* Mobile: Simple Total label */}
          <div className="sm:hidden text-xs text-gray-500 font-medium">
            Yhteensä (sis. alv)
          </div>

          <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
             <div className="text-right">
              <span className="hidden sm:block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Yhteensä (sis. alv)</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-700 tabular-nums leading-none">
                {formatMoney(pricing.totalWithVat)} €
              </span>
            </div>
            
            <button 
              className="bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-5 rounded-lg shadow-lg shadow-gray-200 active:transform active:scale-95 transition-all text-sm"
              onClick={() => alert('Tallennus ei vielä käytössä')}
            >
              Tallenna
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;