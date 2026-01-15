import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { CheckSquare, Square, FileText } from 'lucide-react';

const DocumentsTab: React.FC = () => {
  const { quotation, updateDocument, pricing } = useQuotation();
  
  // Group documents by category
  const categories = {
    'pääpiirustukset': quotation.documents.filter(d => d.category === 'pääpiirustukset'),
    'rakennesuunnitelmat': quotation.documents.filter(d => d.category === 'rakennesuunnitelmat'),
    'tekniset-liitteet': quotation.documents.filter(d => d.category === 'tekniset-liitteet'),
    'myyntiaineisto': quotation.documents.filter(d => d.category === 'myyntiaineisto')
  };

  const getCategoryTitle = (key: string) => {
    switch(key) {
      case 'pääpiirustukset': return '1. Pääpiirustukset (ARK)';
      case 'rakennesuunnitelmat': return '2. Rakennesuunnitelmat (RAK)';
      case 'tekniset-liitteet': return '3. Tekniset liitteet';
      case 'myyntiaineisto': return '4. Myyntiaineisto';
      default: return key;
    }
  };

  const inputClass = "w-28 text-right bg-white border border-slate-300 text-slate-900 rounded-lg card-shadow font-medium hover:border-hieta-wood-accent focus:bg-white focus:border-hieta-blue focus:ring-2 focus:ring-hieta-blue/20 text-sm py-1.5 pr-8 transition-all duration-200 outline-none";

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-start">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Dokumentit & Suunnittelu</h1>
            <p className="text-slate-500">Määritä tarjoukseen sisältyvät suunnitelmat ja niiden hinnat.</p>
         </div>
         <div className="bg-hieta-blue/10 px-5 py-4 rounded-xl border border-hieta-blue/20 text-right card-shadow">
             <div className="text-xs text-hieta-blue font-bold uppercase tracking-wide mb-1">Kustannus</div>
             <div className="text-2xl font-bold text-hieta-blue">
                {(pricing.documentsCost || 0).toLocaleString('fi-FI', { minimumFractionDigits: 2 })} €
             </div>
         </div>
      </div>

      <div className="space-y-8">
        {Object.entries(categories).map(([key, docs]) => (
          <div key={key} className="bg-white rounded-xl card-shadow border border-slate-200 overflow-hidden hover-lift">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                    <FileText size={18} className="text-slate-400" />
                    {getCategoryTitle(key)}
                </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {docs.sort((a,b) => a.order - b.order).map(doc => (
                <div 
                  key={doc.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors hover:bg-slate-50/50 ${doc.included ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <div 
                     className="flex items-center gap-4 cursor-pointer group flex-1"
                     onClick={() => updateDocument(doc.id, { included: !doc.included })}
                  >
                    <div className={`flex-shrink-0 transition-colors ${doc.included ? 'text-hieta-blue' : 'text-slate-300 group-hover:text-slate-400'}`}>
                      {doc.included ? <CheckSquare size={24} /> : <Square size={24} />}
                    </div>
                    <span className={`text-sm font-medium ${doc.included ? 'text-slate-900' : 'text-slate-400'}`}>
                      {doc.name}
                    </span>
                  </div>

                  {doc.included && (
                    <div className="mt-3 sm:mt-0 pl-10 sm:pl-0 flex items-center gap-3 animate-in fade-in">
                       <div className="relative">
                         <input 
                            type="number"
                            min="0"
                            className={inputClass}
                            value={doc.price ?? 0}
                            onChange={(e) => updateDocument(doc.id, { price: Number(e.target.value) })}
                         />
                         <span className="absolute right-3 top-1.5 text-slate-400 text-sm font-bold">€</span>
                       </div>
                       <span className="text-xs text-slate-400 w-16 text-right font-medium">
                         {doc.price === 0 ? '(sisältyy)' : ''}
                       </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsTab;