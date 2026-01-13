import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { CheckSquare, Square, Truck, AlertCircle } from 'lucide-react';

const DeliveryTab: React.FC = () => {
  const { quotation, toggleLogistics } = useQuotation();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Logistiikka & Rajaukset</h1>
        <p className="text-slate-500">Määritä kuljetukset, nostot ja toimitusrajaukset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logistics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <Truck className="text-slate-400" size={20} />
                <h2 className="text-lg font-bold text-slate-900">Logistiikka ja kalusto</h2>
            </div>
             <div className="divide-y divide-slate-100">
                {quotation.delivery.logistics.map(item => (
                    <div 
                        key={item.id}
                        className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50 ${item.included ? 'bg-white' : 'bg-slate-50/30'}`}
                        onClick={() => toggleLogistics(item.id)}
                    >
                         <div className={`mt-0.5 flex-shrink-0 ${item.included ? 'text-blue-600' : 'text-slate-300'}`}>
                            {item.included ? <CheckSquare size={24} /> : <Square size={24} />}
                        </div>
                        <div>
                             <span className={`block text-sm font-medium ${item.included ? 'text-slate-900' : 'text-slate-500'}`}>
                                {item.description}
                            </span>
                            {item.note && (
                                <span className="text-xs text-slate-400 mt-0.5 block">{item.note}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      
      {/* Exclusions */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <AlertCircle className="text-slate-400" size={20} />
                <h2 className="text-lg font-bold text-slate-900">Toimitusrajaukset</h2>
            </div>
            <div className="p-6">
                <ul className="list-disc list-inside space-y-3 text-sm text-slate-600">
                    {quotation.delivery.exclusions.map((exclusion, idx) => (
                        <li key={idx} className="leading-relaxed pl-2 -indent-2">{exclusion}</li>
                    ))}
                </ul>
            </div>
       </div>
      </div>
    </div>
  );
};

export default DeliveryTab;