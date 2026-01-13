import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ELEMENT_TEMPLATES } from '../../types';
import { Trash2, Plus, PenTool, Frame, Info, Layers, Hammer } from 'lucide-react';

const ElementsTab: React.FC = () => {
  const { quotation, addElement, removeElement, updateElement } = useQuotation();
  
  // Quick add state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('US-198');
  
  const handleAdd = (sectionId: string) => {
    if (selectedTemplate in ELEMENT_TEMPLATES) {
        const template = ELEMENT_TEMPLATES[selectedTemplate as keyof typeof ELEMENT_TEMPLATES];
        addElement(sectionId, {
            ...template,
            quantity: 1,
            windowCount: 0,
            windowInstallPrice: 45,
            netArea: 0,
            hasWindowInstall: false,
        });
    }
  };

  const sections = [
    { id: 'section-ext-walls', title: '4. ULKOSEINÄELEMENTIT' },
    { id: 'section-int-walls', title: '5. VÄLISEINÄT JA HVS-ELEMENTIT' },
    { id: 'section-floors', title: '6. VÄLI- JA YLÄPOHJAELEMENTIT' },
    { id: 'section-roof', title: '7. KATTORAKENTEET' }
  ];

  // High Visibility Styles: White background
  const inputBaseClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium hover:border-blue-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm py-2 px-3 transition-all duration-200 outline-none placeholder:text-slate-400";
  const labelBaseClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";
  const sectionHeaderClass = "flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100";

  return (
    <div className="space-y-10">
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl flex items-start gap-4 shadow-sm">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
           <Info size={20} />
        </div>
        <div>
           <h2 className="text-blue-900 font-bold text-base">Tehdastuotannon hallinta</h2>
           <p className="text-blue-700 text-sm mt-1 leading-relaxed">Hallitse tehtaalla valmistettavia elementtejä. Voit määrittää määrät, neliöt, verhoilut ja ikkuna-asennukset erikseen jokaiselle elementtityypille.</p>
        </div>
      </div>

      <div className="space-y-14">
        {sections.map(sectionDef => {
          const sectionData = quotation.elements.find(s => s.id === sectionDef.id);
          const items = sectionData ? sectionData.items : [];

          return (
            <div key={sectionDef.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b-2 border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{sectionDef.title}</h2>
                
                <div className="flex gap-2 w-full sm:w-auto">
                   <div className="relative flex-1 sm:flex-none">
                       <select 
                         className="w-full text-sm appearance-none bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 py-2.5 pl-4 pr-10 font-medium cursor-pointer hover:border-slate-400 transition-colors"
                         value={selectedTemplate}
                         onChange={(e) => setSelectedTemplate(e.target.value)}
                       >
                         {Object.entries(ELEMENT_TEMPLATES).map(([key, t]) => (
                           <option key={key} value={key}>{t.type}</option>
                         ))}
                       </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                   </div>
                   <button 
                     onClick={() => handleAdd(sectionDef.id)}
                     className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm shadow-blue-200 active:scale-95 transition-all"
                   >
                     <Plus size={18} /> <span className="hidden sm:inline">Lisää Elementti</span><span className="sm:hidden">Lisää</span>
                   </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm border border-slate-100">
                    <Layers className="text-slate-300" size={40} />
                  </div>
                  <p className="text-slate-600 font-bold text-lg">Ei elementtejä tässä osiossa.</p>
                  <p className="text-sm text-slate-400 mt-2">Valitse tyyppi ylhäältä ja paina "Lisää".</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item, index) => {
                    const quantityError = item.quantity <= 0;
                    
                    return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
                      
                      {/* Card Header */}
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 sm:px-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-white border border-slate-200 text-slate-500 text-xs font-bold px-2.5 py-1 rounded shadow-sm">#{index + 1}</span>
                            <span className="font-bold text-slate-800 text-base sm:text-lg">{item.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md">
                                {item.specifications.uValue || 'Muu'}
                            </span>
                             <button 
                               onClick={() => removeElement(sectionDef.id, item.id)}
                               className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all ml-2"
                               title="Poista elementti"
                             >
                               <Trash2 size={18} />
                             </button>
                        </div>
                      </div>

                      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* 1. Description & Specs */}
                        <div className="lg:col-span-4 space-y-5">
                          <div>
                            <label className={labelBaseClass}>Kuvaus</label>
                            <textarea 
                                className={`${inputBaseClass} min-h-[100px] resize-y`}
                                value={item.description}
                                onChange={(e) => updateElement(sectionDef.id, item.id, { description: e.target.value })}
                                rows={3}
                                placeholder="Elementin kuvaus..."
                            />
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                             <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Tekniset tiedot</div>
                             <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                {Object.entries(item.specifications).slice(0, 4).map(([k, v]) => (
                                    v && k !== 'cladding' && k !== 'claddingOverhang' && k !== 'surfaceFinish' && 
                                    <div key={k} className="text-xs">
                                        <span className="text-slate-400 capitalize mr-1 block mb-0.5">{k}:</span>
                                        <span className="font-semibold text-slate-700 truncate block">{v}</span>
                                    </div>
                                ))}
                             </div>
                          </div>
                        </div>

                        {/* 2. Middle Column: Cladding & Window Install */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* Cladding Section */}
                            <div>
                                <h3 className={sectionHeaderClass}>
                                    <PenTool size={14} className="text-blue-500" /> Verhous & Pinta
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelBaseClass}>Verhousmateriaali</label>
                                        <input
                                            type="text"
                                            className={inputBaseClass}
                                            value={item.specifications.cladding || ''}
                                            onChange={(e) => updateElement(sectionDef.id, item.id, { specifications: { ...item.specifications, cladding: e.target.value } })}
                                            placeholder="esim. UTW 28x195"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className={labelBaseClass}>Verhouksen ylitys</label>
                                            <input
                                                type="text"
                                                className={inputBaseClass}
                                                value={item.specifications.claddingOverhang || ''}
                                                onChange={(e) => updateElement(sectionDef.id, item.id, { specifications: { ...item.specifications, claddingOverhang: e.target.value } })}
                                                placeholder="esim. 150 mm"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelBaseClass}>Käsittely</label>
                                            <div className="relative">
                                                <select 
                                                    className={`${inputBaseClass} appearance-none cursor-pointer pr-8`}
                                                    value={item.specifications.surfaceFinish || ''}
                                                    onChange={(e) => updateElement(sectionDef.id, item.id, { specifications: { ...item.specifications, surfaceFinish: e.target.value } })}
                                                >
                                                    <option value="">Ei käsittelyä</option>
                                                    <option value="Pohjamaalattu">Pohjamaalattu</option>
                                                    <option value="Pohja- ja välimaalattu">Pohja- ja välimaalattu</option>
                                                    <option value="Valmismaalattu">Valmismaalattu</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Window Installation Section */}
                            <div className={`rounded-xl border-2 transition-all duration-200 ${item.hasWindowInstall ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50 border-transparent'}`}>
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 m-0">
                                        <Frame size={14} className={item.hasWindowInstall ? "text-blue-600" : "text-slate-400"} /> 
                                        Ikkuna-asennus
                                    </h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={item.hasWindowInstall || false}
                                        onChange={(e) => updateElement(sectionDef.id, item.id, { hasWindowInstall: e.target.checked })}
                                      />
                                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {item.hasWindowInstall && (
                                    <div className="p-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 border-t border-blue-100">
                                        <div>
                                            <label className={labelBaseClass}>Määrä (kpl)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className={`${inputBaseClass}`}
                                                value={item.windowCount || 0}
                                                onChange={(e) => updateElement(sectionDef.id, item.id, { windowCount: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelBaseClass}>Hinta (€/kpl)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className={`${inputBaseClass}`}
                                                value={item.windowInstallPrice || 45}
                                                onChange={(e) => updateElement(sectionDef.id, item.id, { windowInstallPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="col-span-2 text-right pt-2">
                                            <span className="text-xs text-blue-700 font-bold bg-blue-100 px-2 py-1 rounded">
                                                Lisähinta: +{((item.windowCount || 0) * (item.windowInstallPrice || 0)).toLocaleString('fi-FI')} €
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Right Column: Pricing & Totals */}
                        <div className="lg:col-span-4 bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-between h-full">
                           <h3 className={sectionHeaderClass}>
                                <Hammer size={14} className="text-slate-600" /> Hinnoittelu
                           </h3>
                           
                           <div className="space-y-5 flex-1">
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <label className={labelBaseClass}>Määrä ({item.unit})</label>
                                      <input 
                                        type="number" 
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateElement(sectionDef.id, item.id, { quantity: Number(e.target.value) })}
                                        className={`${inputBaseClass} font-bold text-lg ${quantityError ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                      />
                                   </div>
                                   <div>
                                      <label className={labelBaseClass}>Netto m²</label>
                                      <input 
                                        type="number" 
                                        min="0"
                                        value={item.netArea || 0}
                                        onChange={(e) => updateElement(sectionDef.id, item.id, { netArea: Number(e.target.value) })}
                                        className={`${inputBaseClass}`}
                                      />
                                   </div>
                               </div>
                               <div>
                                  <label className={labelBaseClass}>Yksikköhinta (€)</label>
                                  <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={item.unitPrice}
                                        onChange={(e) => updateElement(sectionDef.id, item.id, { unitPrice: Number(e.target.value) })}
                                        className={`${inputBaseClass} pr-8 text-lg`}
                                    />
                                    <span className="absolute right-3 top-3 text-slate-400 text-sm font-medium">€</span>
                                  </div>
                               </div>
                           </div>

                           <div className="mt-8 pt-6 border-t border-slate-200">
                             <div className="flex justify-between items-end">
                                 <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Yhteensä</div>
                                    <div className="text-[10px] text-slate-400 font-medium">omakustanne (alv 0%)</div>
                                 </div>
                                 <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
                                   {item.totalPrice.toLocaleString('fi-FI', { minimumFractionDigits: 2 })} <span className="text-lg font-medium text-slate-500">€</span>
                                 </div>
                             </div>
                           </div>
                        </div>

                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElementsTab;