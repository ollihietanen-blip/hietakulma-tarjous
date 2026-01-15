import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { 
    Save, ArrowLeft, Send, CheckCircle, XCircle, 
    ShieldCheck, Undo2, Lock, FileCheck, Check, RefreshCw, AlertCircle
} from 'lucide-react';
import { QuotationStatus } from '../../types';

const Header: React.FC = () => {
  const { quotation, workflow, pricing, saveStatus, saveQuotation } = useQuotation();
  const { status } = quotation;

  // Status Badge Logic
  const getStatusBadge = () => {
      const baseClass = "px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5";
      switch(status) {
          case 'draft': return <div className={`${baseClass} bg-stone-100 text-stone-500 border-stone-200`}>Luonnos</div>;
          case 'awaiting_approval': return <div className={`${baseClass} bg-amber-50 text-amber-600 border-amber-200`}><Lock size={12}/> Odottaa hyväksyntää</div>;
          case 'approved': return <div className={`${baseClass} bg-blue-50 text-blue-600 border-blue-200`}><ShieldCheck size={12}/> Hyväksytty (Sis.)</div>;
          case 'sent': return <div className={`${baseClass} bg-purple-50 text-purple-600 border-purple-200`}><Send size={12}/> Lähetetty</div>;
          case 'accepted': return <div className={`${baseClass} bg-green-50 text-green-700 border-green-200`}><CheckCircle size={12}/> Kauppa</div>;
          case 'rejected': return <div className={`${baseClass} bg-red-50 text-red-600 border-red-200`}><XCircle size={12}/> Hylätty</div>;
          default: return null;
      }
  };

  // Workflow Action Buttons
  const renderActions = () => {
      switch(status) {
          case 'draft':
              return (
                  <button 
                    onClick={() => {
                        if(window.confirm('Haluatko lähettää tarjouksen sisäiseen hyväksyntään? Tarjous lukittuu.')) {
                            workflow.submitForApproval();
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black transition-colors rounded-lg shadow-sm"
                  >
                    <Lock size={16} /> Pyydä hyväksyntä
                  </button>
              );
          case 'awaiting_approval':
              return (
                  <div className="flex gap-2">
                      <button 
                        onClick={() => workflow.returnToDraft()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors rounded-lg"
                      >
                        <Undo2 size={16} /> Palauta
                      </button>
                      <button 
                        onClick={() => workflow.approveQuotation('Olli Hietanen')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors rounded-lg shadow-sm"
                        title="Vain TJ/Myyntipäällikkö"
                      >
                        <ShieldCheck size={16} /> Hyväksy (TJ)
                      </button>
                  </div>
              );
          case 'approved':
              return (
                 <div className="flex gap-2">
                     <button 
                        onClick={() => workflow.returnToDraft()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors rounded-lg"
                      >
                        <Undo2 size={16} /> Muokkaa
                      </button>
                      <button 
                        onClick={() => workflow.markSent()}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm"
                      >
                        <Send size={16} /> Merkitse lähetetyksi
                      </button>
                 </div>
              );
          case 'sent':
               return (
                  <div className="flex gap-2">
                      <button 
                        onClick={() => {
                            if(window.confirm('Merkitäänkö tarjous hylätyksi?')) {
                                workflow.markRejected();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors rounded-lg border border-red-100"
                      >
                        <XCircle size={16} /> Hylätty
                      </button>
                      <button 
                        onClick={() => workflow.markAccepted()}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors rounded-lg shadow-sm"
                      >
                        <FileCheck size={16} /> Hyväksytty (Kauppa)
                      </button>
                  </div>
              );
           case 'accepted':
               return (
                   <div className="text-sm font-bold text-green-700 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                       <CheckCircle size={16} /> Tarjous hyväksytty {quotation.decisionAt?.toLocaleDateString()}
                   </div>
               );
           case 'rejected':
               return (
                   <div className="flex gap-4 items-center">
                       <div className="text-sm font-bold text-red-600 flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                           <XCircle size={16} /> Tarjous hylätty {quotation.decisionAt?.toLocaleDateString()}
                       </div>
                       <button onClick={() => workflow.returnToDraft()} className="text-xs underline text-slate-500 hover:text-slate-800">Palauta luonnokseksi</button>
                   </div>
               );
          default: 
            return null;
      }
  };
  
  const renderSaveStatus = () => {
    switch (saveStatus) {
        case 'saving':
            return (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Tallennetaan...</span>
                </div>
            );
        case 'saved':
            return (
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <Check size={14} />
                    <span>Tallennettu</span>
                </div>
            );
        case 'idle':
            return (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold">
                        <AlertCircle size={14} />
                        <span>Tallentamattomia muutoksia</span>
                    </div>
                    <button onClick={saveQuotation} className="text-xs font-bold bg-slate-800 text-white px-3 py-1 rounded hover:bg-black">Tallenna</button>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 card-shadow px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Project Info */}
        <div className="flex items-center gap-6">
          <img 
            src="/images/Hietakulma_logo_cmyk_musta.png" 
            alt="Hietakulma" 
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-3">
              <div className="bg-hieta-sand w-1.5 h-10 rounded-full"></div>
              <div>
                  <h1 className="text-base font-bold text-hieta-black leading-tight">
                      {quotation.project.name || 'Nimetön projekti'}
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5 font-sans">
                      {quotation.customer.name || 'Ei asiakasta'}
                  </p>
              </div>
          </div>
        </div>
        
        {/* Center: Total & Status */}
        <div className="flex-1 flex justify-center items-center gap-6">
            <div className="text-center">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tarjouksen arvo</div>
                <div className="text-xl font-bold text-blue-700 tabular-nums">
                    {pricing.totalWithVat.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
            </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-4">
           {/* Save Status */}
           <div className="w-48 flex justify-center">{renderSaveStatus()}</div>

           {/* Dynamic Status Badge */}
           {getStatusBadge()}
           
           {/* Workflow Buttons */}
           {renderActions()}
        </div>
      </div>
    </header>
  );
};

export default Header;
