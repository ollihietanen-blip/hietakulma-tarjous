import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FileText, Save, Download, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { quotation } = useQuotation();
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
                {quotation.project.name || 'Uusi Tarjous'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-0.5">
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 text-xs font-medium">
                  {quotation.project.number || '---'}
                </span>
                <span className="capitalize">{quotation.project.buildingType}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all focus:ring-2 focus:ring-gray-200">
              <Save size={18} />
              <span className="hidden sm:inline">Tallenna</span>
            </button>
            <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all shadow-sm focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
              <Download size={18} />
              <span className="hidden sm:inline">Lataa PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;