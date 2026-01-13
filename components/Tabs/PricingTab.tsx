import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import PaymentScheduleEditor from '../PaymentSchedule/PaymentScheduleEditor';

export const PricingTab: React.FC = () => {
  const { quotation, updatePricingSettings, pricing } = useQuotation();
  
  const updateCategoryMarkup = (category: string, value: number) => {
    updatePricingSettings({
      categoryMarkups: {
        ...quotation.pricing.categoryMarkups,
        [category]: value
      }
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Hinnoittelu</h1>
        <p className="text-slate-500">
          Määritä tuoteryhmäkohtaiset katekertoimet. Hinnat lasketaan automaattisesti verottomana (ALV 0%), verot lisätään loppusummaan.
        </p>
      </div>
      
      {/* Tavoite-kate näkyvästi ylhäällä */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Toteutuva kokonaiskate</h3>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Tavoite: <span className="text-green-700">25-30%</span>
            </p>
          </div>
          <div className="text-right flex flex-col items-center sm:items-end">
            <div className="text-4xl font-bold text-green-600 tracking-tight">
              {pricing.profitPercent.toFixed(1)} %
            </div>
            <div className="text-sm font-bold text-slate-600 mt-1 bg-white/50 px-2 py-1 rounded">
              {pricing.profitAmount.toFixed(2)} € kate
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
        {/* Left Column: Category Markups */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Katekertoimet tuoteryhmittäin</h3>
            
            <div className="space-y-6">
            {/* Elementit */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                <label className="font-bold text-slate-700 block">Elementit</label>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Tehdastuotanto</p>
                </div>
                <div className="col-span-3">
                <div className="relative">
                    <input
                        type="number"
                        step="0.5"
                        value={quotation.pricing.categoryMarkups.elements}
                        onChange={(e) => updateCategoryMarkup('elements', Number(e.target.value))}
                        className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                </div>
                </div>
                <div className="col-span-5 text-right space-y-0.5">
                    <div className="text-xs text-slate-500">Osto: {pricing.breakdown.elements.cost.toFixed(0)} €</div>
                    <div className="text-sm font-bold text-blue-600">Myynti: {pricing.breakdown.elements.sellingPrice.toFixed(0)} €</div>
                </div>
            </div>

            {/* Ikkunat ja ovet */}
            <div className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-2 -mx-2 rounded-lg">
                <div className="col-span-4">
                <label className="font-bold text-slate-700 block">Ikkunat & Ovet</label>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Pihla Varma</p>
                </div>
                <div className="col-span-3">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            value={quotation.pricing.categoryMarkups.windowsDoors}
                            onChange={(e) => updateCategoryMarkup('windowsDoors', Number(e.target.value))}
                            className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                    </div>
                </div>
                <div className="col-span-5 text-right space-y-0.5">
                    <div className="text-xs text-slate-500">Osto: {pricing.breakdown.windowsDoors.cost.toFixed(0)} €</div>
                    <div className="text-sm font-bold text-blue-600">Myynti: {pricing.breakdown.windowsDoors.sellingPrice.toFixed(0)} €</div>
                </div>
            </div>

            {/* Työmaatoimitukset */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                <label className="font-bold text-slate-700 block">Työmaatoimitus</label>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Irtotavara</p>
                </div>
                <div className="col-span-3">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            value={quotation.pricing.categoryMarkups.worksiteDeliveries}
                            onChange={(e) => updateCategoryMarkup('worksiteDeliveries', Number(e.target.value))}
                            className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                    </div>
                </div>
                <div className="col-span-5 text-right space-y-0.5">
                    <div className="text-xs text-slate-500">Osto: {pricing.breakdown.worksiteDeliveries.cost.toFixed(0)} €</div>
                    <div className="text-sm font-bold text-blue-600">Myynti: {pricing.breakdown.worksiteDeliveries.sellingPrice.toFixed(0)} €</div>
                </div>
            </div>

            {/* Asennus */}
            <div className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-2 -mx-2 rounded-lg">
                <div className="col-span-4">
                <label className="font-bold text-slate-700 block">Asennus</label>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Työkustannukset</p>
                </div>
                <div className="col-span-3">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            value={quotation.pricing.categoryMarkups.installation}
                            onChange={(e) => updateCategoryMarkup('installation', Number(e.target.value))}
                            className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                    </div>
                </div>
                <div className="col-span-5 text-right space-y-0.5">
                    <div className="text-xs text-slate-500">Osto: {pricing.breakdown.installation.cost.toFixed(0)} €</div>
                    <div className="text-sm font-bold text-blue-600">Myynti: {pricing.breakdown.installation.sellingPrice.toFixed(0)} €</div>
                </div>
            </div>

            {/* Kuljetus */}
            <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                <label className="font-bold text-slate-700 block">Kuljetus</label>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Rahti & Nostot</p>
                </div>
                <div className="col-span-3">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            value={quotation.pricing.categoryMarkups.transportation}
                            onChange={(e) => updateCategoryMarkup('transportation', Number(e.target.value))}
                            className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                    </div>
                </div>
                <div className="col-span-5 text-right space-y-0.5">
                    <div className="text-xs text-slate-500">Osto: {pricing.breakdown.transportation.cost.toFixed(0)} €</div>
                    <div className="text-sm font-bold text-blue-600">Myynti: {pricing.breakdown.transportation.sellingPrice.toFixed(0)} €</div>
                </div>
            </div>

             {/* Design */}
             <div className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-2 -mx-2 rounded-lg">
                <div className="col-span-4">
                <label className="font-bold text-slate-700 block">Suunnittelu</label>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Dokumentit</p>
                </div>
                <div className="col-span-3">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            value={quotation.pricing.categoryMarkups.design}
                            onChange={(e) => updateCategoryMarkup('design', Number(e.target.value))}
                            className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                    </div>
                </div>
                <div className="col-span-5 text-right space-y-0.5">
                    <div className="text-xs text-slate-500">Osto: {pricing.breakdown.design.cost.toFixed(0)} €</div>
                    <div className="text-sm font-bold text-blue-600">Myynti: {pricing.breakdown.design.sellingPrice.toFixed(0)} €</div>
                </div>
            </div>
            </div>
        </div>

        {/* Right Column: Commission & Totals */}
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Provisio & ALV</h3>
                <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-0.5">
                        Provisio-%
                        </label>
                        <p className="text-xs text-slate-500">Koko kauppasummasta</p>
                    </div>
                    <div className="relative w-24">
                        <input
                        type="number"
                        step="0.1"
                        value={quotation.pricing.commissionPercentage}
                        onChange={(e) => updatePricingSettings({ commissionPercentage: Number(e.target.value) })}
                        className="w-full pl-3 pr-6 py-2 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                    ALV-tila
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => updatePricingSettings({ vatMode: 'standard' })}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${quotation.pricing.vatMode === 'standard' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            Kuluttaja (25.5%)
                        </button>
                        <button
                            onClick={() => updatePricingSettings({ vatMode: 'construction_service' })}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${quotation.pricing.vatMode === 'construction_service' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            Käännetty ALV
                        </button>
                    </div>
                </div>
                </div>
            </div>

            {/* Yhteenveto */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Hinnoittelun yhteenveto</h3>
                <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-400">Ostohinta yhteensä:</span>
                    <span className="font-medium text-slate-200">{pricing.materialCostTotal.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                    <span className="text-slate-400">Myyntihinta (ilman ALV):</span>
                    <span className="font-bold text-white text-lg">{pricing.sellingPriceExVat.toFixed(2)} €</span>
                </div>

                <div className="border-t border-slate-700 my-2 pt-2">
                     <div className="flex justify-between">
                        <span className="text-slate-400">Kate (€):</span>
                        <span className="font-bold text-green-400">{pricing.profitAmount.toFixed(2)} €</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-slate-400">Kate (%):</span>
                        <span className="font-bold text-green-400">{pricing.profitPercent.toFixed(1)} %</span>
                    </div>
                </div>
                
                <div className="flex justify-between pt-2">
                    <span className="text-slate-400">ALV {pricing.vatPercentage}%:</span>
                    <span className="font-medium text-slate-200">{pricing.vatAmount.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-700">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Kokonaishinta</span>
                    <span className="text-2xl font-bold text-blue-400">{pricing.totalWithVat.toFixed(2)} €</span>
                </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Payment Schedule Editor */}
      <PaymentScheduleEditor />
    </div>
  );
};

export default PricingTab;