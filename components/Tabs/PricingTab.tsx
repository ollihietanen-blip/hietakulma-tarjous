import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import PaymentScheduleEditor from '../PaymentSchedule/PaymentScheduleEditor';

const PricingTab: React.FC = () => {
  const { pricing, updatePricingSettings, quotation } = useQuotation();
  
  const markupError = pricing.markupPercentage < 0;
  const commissionError = pricing.commissionPercentage < 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hinnoittelu</h1>
        <p className="text-gray-500">
          Aseta kateprosentti ja mahdollinen provisio. Hinnat lasketaan automaattisesti verottomana (ALV 0%), verot lisätään loppusummaan.
        </p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Tehdastuotanto</div>
          <div className="text-xl font-bold text-gray-900">
            {pricing.elementsTotal.toLocaleString('fi-FI', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {quotation.elements.reduce((sum, s) => sum + s.items.length, 0)} riviä
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Työmaatoimitukset</div>
          <div className="text-xl font-bold text-gray-900">
            {pricing.productsTotal.toLocaleString('fi-FI', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {quotation.products.reduce((sum, s) => sum + s.items.length, 0)} riviä
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Suunnittelu</div>
          <div className="text-xl font-bold text-gray-900">
            {pricing.documentsTotal.toLocaleString('fi-FI', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {quotation.documents.filter(d => d.included).length} valittu
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm ring-1 ring-blue-100">
          <div className="text-xs text-blue-600 mb-1 font-semibold uppercase tracking-wide">Asennus</div>
          <div className="text-xl font-bold text-blue-900">
            {pricing.installationTotal.toLocaleString('fi-FI', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </div>
          <div className="text-xs text-blue-400 mt-1 truncate">
             {quotation.delivery.assemblyLevelId === 'material-only' ? 'Ei asennusta' : 
              quotation.delivery.assemblyLevelId === 'shell-and-roof' ? 'Runkovalmis' : 'Ulkovalmis'}
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 shadow-sm text-white">
          <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Omakustannehinta</div>
          <div className="text-xl font-bold text-white">
            {pricing.costPrice.toLocaleString('fi-FI', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </div>
          <div className="text-xs text-slate-400 mt-1">alv 0%</div>
        </div>
      </div>
      
      {/* Markup Calculation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Katelaskenta</h2>
        
        <div className="space-y-4 max-w-3xl">
          {/* Cost Price */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">Omakustannehinta (alv 0%)</span>
            <span className="text-lg font-semibold text-gray-900">
              {pricing.costPrice.toLocaleString('fi-FI', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </span>
          </div>
          
          {/* Markup Input */}
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Kate (wsum)</label>
                <div className="relative rounded-md shadow-sm">
                    <input
                    type="number"
                    step="0.1"
                    value={pricing.markupPercentage}
                    onChange={(e) => updatePricingSettings({ markupPercentage: Number(e.target.value) })}
                    className={`block w-24 pl-3 pr-8 py-1.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-right font-medium bg-white text-gray-900 shadow-sm ${markupError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                </div>
                </div>
                {markupError && <span className="text-xs text-red-500">Pitää olla &ge; 0</span>}
            </div>
            <span className="text-lg font-semibold text-green-600">
              + {pricing.markupAmount.toLocaleString('fi-FI', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </span>
          </div>
          
          {/* Commission Input */}
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Provisio</label>
                <div className="relative rounded-md shadow-sm">
                    <input
                    type="number"
                    step="0.1"
                    value={pricing.commissionPercentage}
                    onChange={(e) => updatePricingSettings({ commissionPercentage: Number(e.target.value) })}
                    className={`block w-24 pl-3 pr-8 py-1.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-right font-medium bg-white text-gray-900 shadow-sm ${commissionError ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                </div>
                </div>
                {commissionError && <span className="text-xs text-red-500">Pitää olla &ge; 0</span>}
            </div>
            <span className="text-lg font-semibold text-green-600">
              + {pricing.commissionAmount.toLocaleString('fi-FI', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </span>
          </div>
          
          {/* Subtotal */}
          <div className="flex items-center justify-between py-3 border-t-2 border-gray-200 mt-2">
            <span className="text-gray-900 font-bold text-lg">Välisumma (alv 0%)</span>
            <span className="text-xl font-bold text-gray-900">
              {pricing.subtotal.toLocaleString('fi-FI', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} €
            </span>
          </div>
          
          {/* VAT Treatment Selection */}
          <div className="py-4 border-b border-gray-200">
            <label className="block text-gray-700 font-medium mb-3">ALV-käsittely</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm border focus:outline-none
                    ${pricing.vatMode === 'standard' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'}
                `}>
                    <input 
                        type="radio" 
                        name="vat-mode" 
                        value="standard" 
                        checked={pricing.vatMode === 'standard'}
                        onChange={() => updatePricingSettings({ vatMode: 'standard' })}
                        className="sr-only" 
                    />
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                            <div className="text-sm">
                                <p className={`font-medium ${pricing.vatMode === 'standard' ? 'text-blue-900' : 'text-gray-900'}`}>
                                    Normaali
                                </p>
                                <p className={`text-xs ${pricing.vatMode === 'standard' ? 'text-blue-700' : 'text-gray-500'}`}>
                                    ALV 25,5 %
                                </p>
                            </div>
                        </div>
                        {pricing.vatMode === 'standard' && (
                            <div className="text-blue-600">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </label>

                <label className={`
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm border focus:outline-none
                    ${pricing.vatMode === 'construction_service' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'}
                `}>
                    <input 
                        type="radio" 
                        name="vat-mode" 
                        value="construction_service" 
                        checked={pricing.vatMode === 'construction_service'}
                        onChange={() => updatePricingSettings({ vatMode: 'construction_service' })}
                        className="sr-only" 
                    />
                    <div className="flex w-full items-center justify-between">
                         <div className="flex items-center">
                            <div className="text-sm">
                                <p className={`font-medium ${pricing.vatMode === 'construction_service' ? 'text-blue-900' : 'text-gray-900'}`}>
                                    Rakentamispalvelu
                                </p>
                                <p className={`text-xs ${pricing.vatMode === 'construction_service' ? 'text-blue-700' : 'text-gray-500'}`}>
                                    AVL 8c §
                                </p>
                            </div>
                         </div>
                         {pricing.vatMode === 'construction_service' && (
                            <div className="text-blue-600">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </label>
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
