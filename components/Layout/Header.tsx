import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Save, ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  const { quotation } = useQuotation();
  
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-hieta-sand w-2 h-8 rounded-sm"></div>
                <div>
                    <h1 className="text-sm font-semibold text-hieta-black leading-tight uppercase tracking-wide">
                        {quotation.project.name || 'Nimetön projekti'}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5 font-sans">
                        <span className="font-mono text-stone-400">
                        {quotation.project.number || '#'}
                        </span>
                        <span className="capitalize px-1.5 py-0.5 bg-hieta-sand/30 rounded-sm text-stone-700 font-medium">
                        {quotation.project.buildingType}
                        </span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3">
             {/* Status Badge */}
             <div className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-500 border border-stone-200">
                Luonnos
             </div>

            <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-hieta-black bg-hieta-sand hover:bg-[#dcd0b8] transition-colors rounded-sm shadow-sm active:translate-y-0.5">
              <Save size={16} />
              <span className="hidden sm:inline">Tallenna</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;