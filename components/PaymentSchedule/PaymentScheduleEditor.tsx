import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { PAYMENT_SCHEDULE_TEMPLATES, PaymentMilestone } from '../../types';
import { Trash2, Plus } from 'lucide-react';

const PaymentScheduleEditor: React.FC = () => {
  const { quotation, updatePaymentMilestone, pricing, setPaymentSchedule } = useQuotation();
  const { paymentSchedule } = quotation;
  
  // Calculate sum of percentages
  const totalPercentage = paymentSchedule.reduce((sum, m) => sum + m.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01;
  
  // Load template based on building type
  const loadTemplate = () => {
    const template = PAYMENT_SCHEDULE_TEMPLATES[quotation.project.buildingType];
    if (template) {
      const milestones: PaymentMilestone[] = template.map((t, idx) => ({
        id: `milestone-${Date.now()}-${idx}`,
        order: t.order,
        description: t.description,
        trigger: t.trigger,
        percentage: t.percentage,
        amount: pricing.totalWithVat * (t.percentage / 100)
      }));
      setPaymentSchedule(milestones);
    }
  };

  const addMilestone = () => {
    const newMilestone: PaymentMilestone = {
      id: `milestone-${Date.now()}`,
      order: paymentSchedule.length + 1,
      description: 'Uusi maksuerä',
      trigger: 'custom',
      percentage: 0,
      amount: 0
    };
    setPaymentSchedule([...paymentSchedule, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    setPaymentSchedule(paymentSchedule.filter(m => m.id !== id));
  };
  
  const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium hover:border-blue-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all duration-200 outline-none";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Maksuerätaulukko</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Maksuehto: 14 pv netto, viivästyskorko 16%
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {!isValid && (
            <span className="text-sm text-red-700 font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-md w-full sm:w-auto text-center">
              ⚠️ Summa {totalPercentage.toFixed(1)}% (pitää olla 100%)
            </span>
          )}
          
          <button
            onClick={loadTemplate}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition-colors"
          >
            Lataa vakiopohja
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Header Row - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
          <div className="col-span-1 text-center">Nro</div>
          <div className="col-span-6">Kuvaus</div>
          <div className="col-span-2 text-right">Prosentti</div>
          <div className="col-span-2 text-right">Summa (sis. ALV)</div>
          <div className="col-span-1"></div>
        </div>

        {paymentSchedule.map((milestone, idx) => {
          const percentageError = milestone.percentage < 0;
          
          return (
          <div
            key={milestone.id}
            className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center py-4 md:py-3 border-b border-slate-100 md:border-none hover:bg-slate-50/50 md:px-2 rounded-lg transition-colors bg-slate-50/30 md:bg-transparent p-3"
          >
            {/* Order & Actions Mobile Wrapper */}
            <div className="flex justify-between w-full md:hidden mb-1">
                <span className="font-bold text-slate-700 bg-white border border-slate-200 w-6 h-6 rounded-full flex items-center justify-center text-xs">#{idx + 1}</span>
                <button 
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-slate-400 hover:text-red-500"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Desktop Order */}
            <div className="hidden md:block col-span-1 text-center">
              <span className="font-bold text-slate-700 bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs">{idx + 1}</span>
            </div>
            
            {/* Description */}
            <div className="w-full md:col-span-6">
              <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block">Kuvaus</label>
              <input
                type="text"
                value={milestone.description}
                onChange={(e) => updatePaymentMilestone(milestone.id, { description: e.target.value })}
                className={inputClass}
              />
            </div>
            
            {/* Mobile: Percentage & Amount Row */}
            <div className="flex gap-4 w-full md:contents">
                {/* Percentage */}
                <div className="flex-1 md:col-span-2 flex flex-col items-end justify-center">
                   <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block self-start">Osuus</label>
                   <div className="relative w-full md:w-24">
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={milestone.percentage}
                        onChange={(e) => updatePaymentMilestone(milestone.id, { percentage: Number(e.target.value) })}
                        className={`${inputClass} text-right pr-8 ${percentageError ? 'border-red-300 ring-1 ring-red-100' : ''}`}
                    />
                    <span className="absolute right-3 top-2 text-slate-400 text-sm font-bold">%</span>
                   </div>
                   {percentageError && <span className="text-xs text-red-500 mt-1 font-bold">Pitää olla &ge; 0</span>}
                </div>
                
                {/* Amount */}
                <div className="flex-1 md:col-span-2 text-right">
                  <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block self-start text-left">Summa</label>
                  <div className="h-9 flex items-center justify-end font-bold text-slate-900 text-sm bg-slate-100/50 px-3 rounded-lg border border-transparent md:bg-transparent md:px-0">
                    {milestone.amount.toLocaleString('fi-FI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} €
                  </div>
                </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex col-span-1 justify-center">
              <button 
                onClick={() => removeMilestone(milestone.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )})}
        
        {/* Total Row */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center pt-6 border-t-2 border-slate-900 md:px-2 mt-4">
          <div className="w-full md:col-span-7 flex justify-between md:justify-end">
            <span className="font-bold text-slate-900 text-lg uppercase tracking-wide">Yhteensä:</span>
          </div>
          
          <div className="w-full md:col-span-2 flex justify-between md:justify-end md:pr-6 border-b md:border-none pb-2 md:pb-0 border-slate-200">
             <span className="md:hidden text-sm text-slate-500">Kokonaisprosentti</span>
            <span className={`font-bold text-lg ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage.toFixed(1)} %
            </span>
          </div>
          
          <div className="w-full md:col-span-2 flex justify-between md:justify-end">
             <span className="md:hidden text-sm text-slate-500">Loppusumma</span>
            <span className="font-bold text-blue-700 text-xl">
              {pricing.totalWithVat.toLocaleString('fi-FI', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </span>
          </div>
          <div className="hidden md:block col-span-1"></div>
        </div>
      </div>
      
      {/* Add Button */}
      <div className="mt-8">
        <button 
          onClick={addMilestone}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-lg transition-colors border border-blue-200"
        >
          <Plus size={18} /> Lisää maksuerä
        </button>
      </div>
    </div>
  );
};

export default PaymentScheduleEditor;