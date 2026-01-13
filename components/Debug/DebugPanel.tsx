import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Bug, X, RefreshCw, Database, Activity, AlertTriangle } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const { quotation, pricing, resetQuotation } = useQuotation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'state' | 'pricing'>('pricing');

  // Check for NaNs
  const hasNaN = JSON.stringify(pricing).includes('null') || 
                 Object.values(pricing).some(v => Number.isNaN(v));

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-[100] p-3 rounded-full shadow-lg transition-all hover:scale-110 ${hasNaN ? 'bg-red-600 animate-pulse' : 'bg-slate-800 hover:bg-slate-700'}`}
        title="Avaa Debug-paneeli"
      >
        <Bug className="text-white" size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[90vw] max-w-lg bg-slate-900 text-slate-300 rounded-xl shadow-2xl border border-slate-700 flex flex-col max-h-[80vh] font-mono text-xs overflow-hidden animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <Activity size={16} className={hasNaN ? "text-red-500" : "text-green-500"} />
            <span className="font-bold text-white">System Debugger</span>
        </div>
        <div className="flex items-center gap-2">
             <button 
                onClick={() => {
                    if(window.confirm('Oletko varma? Tämä nollaa kaiken tiedon.')) {
                        resetQuotation();
                    }
                }}
                className="p-1.5 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                title="Nollaa sovelluksen tila (Hard Reset)"
             >
                <RefreshCw size={14} />
             </button>
            <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 py-2 text-center font-bold border-b-2 transition-colors ${activeTab === 'pricing' ? 'border-blue-500 text-blue-400 bg-slate-800' : 'border-transparent hover:bg-slate-800'}`}
          >
            Laskenta
          </button>
          <button 
            onClick={() => setActiveTab('state')}
            className={`flex-1 py-2 text-center font-bold border-b-2 transition-colors ${activeTab === 'state' ? 'border-blue-500 text-blue-400 bg-slate-800' : 'border-transparent hover:bg-slate-800'}`}
          >
            Raakadata (JSON)
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          {hasNaN && (
              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded mb-4 text-red-400 flex gap-2 items-start">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <div>
                      <div className="font-bold">Laskentavirhe havaittu (NaN)</div>
                      <div>Jokin arvo on määrittelemätön. Tarkista syötteet.</div>
                  </div>
              </div>
          )}

          {activeTab === 'pricing' && (
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                      <div className="text-slate-500">Elements Total</div>
                      <div className="text-right text-white">{pricing.elementsTotal.toFixed(2)}</div>
                      
                      <div className="text-slate-500">Products Total</div>
                      <div className="text-right text-white">{pricing.productsTotal.toFixed(2)}</div>
                      
                      <div className="text-slate-500">Installation Total</div>
                      <div className="text-right text-white">{pricing.installationTotal.toFixed(2)}</div>

                      <div className="text-slate-500">Transport (Dist: {quotation.delivery.transportation.distanceKm}km)</div>
                      <div className="text-right text-white">{pricing.transportationTotal.toFixed(2)}</div>

                      <div className="col-span-2 border-t border-slate-800 my-1"></div>
                      
                      <div className="text-slate-400 font-bold">Cost Price</div>
                      <div className="text-right font-bold text-blue-400">{pricing.costPrice.toFixed(2)}</div>

                      <div className="text-slate-500">+ Markup ({pricing.markupPercentage}%)</div>
                      <div className="text-right text-green-400">{pricing.markupAmount.toFixed(2)}</div>

                      <div className="text-slate-500">+ Commission ({pricing.commissionPercentage}%)</div>
                      <div className="text-right text-green-400">{pricing.commissionAmount.toFixed(2)}</div>

                      <div className="col-span-2 border-t border-slate-800 my-1"></div>

                      <div className="text-slate-300">Subtotal (ALV 0%)</div>
                      <div className="text-right text-white">{pricing.subtotal.toFixed(2)}</div>

                      <div className="text-slate-500">+ VAT ({pricing.vatPercentage}%)</div>
                      <div className="text-right text-slate-400">{pricing.vatAmount.toFixed(2)}</div>

                       <div className="col-span-2 border-t border-slate-700 my-2"></div>

                      <div className="text-sm font-bold text-white">TOTAL</div>
                      <div className="text-sm font-bold text-right text-blue-400">{pricing.totalWithVat.toFixed(2)}</div>
                  </div>
              </div>
          )}

          {activeTab === 'state' && (
              <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(quotation, null, 2)}
              </pre>
          )}
      </div>
      
      <div className="p-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-600 text-center">
         App ID: {quotation.id} | Items: {quotation.elements.length + quotation.products.length}
      </div>
    </div>
  );
};

export default DebugPanel;