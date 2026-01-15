import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { 
    Trash2, Plus, Box, Maximize2, Palette, 
    Scan, ChevronDown, ChevronRight, LayoutGrid, 
    Package, Layers, Euro 
} from 'lucide-react';

const ProductsTab: React.FC = () => {
  const { quotation, addProduct, removeProduct, updateProduct } = useQuotation();
  
  // State for collapsible sections (default all open)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
      quotation.products.reduce((acc, curr) => ({ ...acc, [curr.id]: true }), {})
  );

  const toggleSection = (id: string) => {
      setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddWindow = () => {
    addProduct('windows', {
      rivinro: 10,
      tunnus: '001',
      manufacturer: 'Pihla Varma',
      type: 'window',
      subtype: 'opening',
      width: 1200,
      height: 1200,
      uValue: 1.0,
      glassType: 'MSE-ALUX',
      glassCode: '3K',
      frameInnerColor: 'Valkoinen',
      frameOuterColor: 'Musta',
      quantity: 1,
      unitPrice: 500,
      accessories: []
    });
  };

  const handleAddDoor = () => {
    addProduct('doors', {
        rivinro: 10,
        tunnus: 'OVI-1',
        manufacturer: 'Pihla Varma',
        type: 'door',
        subtype: 'opening',
        width: 1000,
        height: 2100,
        uValue: 0.8,
        glassType: 'Kirkas',
        glassCode: '',
        frameInnerColor: 'Valkoinen',
        frameOuterColor: 'Musta',
        quantity: 1,
        unitPrice: 900,
        accessories: []
    });
  };

  const handleAddGeneric = (sectionId: string) => {
      addProduct(sectionId, {
          tunnus: '',
          description: '',
          unit: 'kpl',
          quantity: 1,
          unitPrice: 0,
          isGeneric: true,
          type: 'material',
          accessories: []
      });
  };

  // Styles - Improved touch targets for mobile
  const inputClass = "w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-hieta-blue focus:bg-white text-slate-900 font-medium text-sm py-2 px-2 transition-all duration-200 outline-none placeholder:text-slate-300 focus:shadow-sm rounded-t-sm min-w-[60px]";
  const tableHeaderClass = "px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200 whitespace-nowrap";

  // Calculate totals for dashboard
  const windowsTotal = quotation.products.find(s => s.id === 'windows')?.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0) || 0;
  const doorsTotal = quotation.products.find(s => s.id === 'doors')?.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0) || 0;
  const materialsTotal = quotation.products
    .filter(s => s.id !== 'windows' && s.id !== 'doors')
    .reduce((sum, s) => sum + s.items.reduce((is, i) => is + (i.totalPrice || 0), 0), 0);

  return (
    <div className="space-y-8 pb-20">
       
       {/* 1. Header & Dashboard */}
       <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Työmaatoimitukset</h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">Määritä työmaalle toimitettavat irto-osat, ikkunat ja ovet.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3 min-w-[160px] flex-shrink-0 hover-lift">
                  <div className="bg-hieta-blue/10 p-2 rounded-lg text-hieta-blue"><LayoutGrid size={20}/></div>
                  <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Ikkunat & Ovet</div>
                      <div className="text-lg font-bold text-slate-900">{(windowsTotal + doorsTotal).toLocaleString('fi-FI')} €</div>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3 min-w-[160px] flex-shrink-0 hover-lift">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Package size={20}/></div>
                  <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Materiaalit</div>
                      <div className="text-lg font-bold text-slate-900">{materialsTotal.toLocaleString('fi-FI')} €</div>
                  </div>
              </div>
          </div>
       </div>

      {/* 2. Products List */}
      <div className="space-y-6">
        {quotation.products.map(section => {
          const isWindows = section.id === 'windows';
          const isDoors = section.id === 'doors';
          const isSpecial = isWindows || isDoors;
          const sectionTotal = section.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
          const isOpen = expandedSections[section.id];
          
          // Icon Selection
          let Icon = Box;
          if (isWindows) Icon = Scan;
          if (isDoors) Icon = LayoutGrid;
          if (!isSpecial) Icon = Layers;

          return (
            <div key={section.id} className={`bg-white rounded-xl card-shadow border transition-all duration-300 hover-lift ${isOpen ? 'border-hieta-blue/30 ring-1 ring-hieta-blue/10' : 'border-slate-200 hover:border-hieta-wood-accent'}`}>
                
                {/* Section Header */}
                <div 
                    className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer select-none gap-4 ${isOpen ? 'bg-slate-50/50 border-b border-slate-100' : ''}`}
                    onClick={() => toggleSection(section.id)}
                >
                    <div className="flex items-center gap-3">
                        <button className={`p-1 rounded-md transition-colors ${isOpen ? 'bg-hieta-blue/20 text-hieta-blue' : 'text-slate-400 hover:bg-slate-100'}`}>
                            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div className={`p-2 rounded-lg ${isSpecial ? 'bg-hieta-blue text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                            <div className="text-xs text-slate-500 font-medium">
                                {section.items.length} riviä • <span className="text-slate-900 font-bold">{sectionTotal.toLocaleString('fi-FI')} €</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pl-10 sm:pl-0">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isWindows) handleAddWindow();
                                else if (isDoors) handleAddDoor();
                                else handleAddGeneric(section.id);
                                if (!isOpen) toggleSection(section.id);
                            }}
                            className="w-full sm:w-auto text-sm bg-white border border-slate-200 text-slate-700 hover:text-hieta-blue hover:border-hieta-blue/30 font-bold px-3 py-2 rounded-lg card-shadow transition-all duration-200 hover-lift flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Lisää rivi
                        </button>
                    </div>
                </div>

                {/* Section Content */}
                {isOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Empty State */}
                        {section.items.length === 0 && (
                            <div className="py-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-300 mb-3">
                                    <Plus size={24} />
                                </div>
                                <p className="text-slate-500 font-medium text-sm">Ei rivejä tässä osiossa.</p>
                                <button 
                                    onClick={() => {
                                        if (isWindows) handleAddWindow();
                                        else if (isDoors) handleAddDoor();
                                        else handleAddGeneric(section.id);
                                    }}
                                    className="text-hieta-blue font-bold text-sm mt-2 hover:underline"
                                >
                                    Lisää ensimmäinen rivi
                                </button>
                            </div>
                        )}

                        {/* Special Table (Windows/Doors) */}
                        {isSpecial && section.items.length > 0 && (
                            <div className="overflow-x-auto -mx-0 sm:mx-0">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr>
                                            <th className={`${tableHeaderClass} min-w-[80px]`}>POS</th>
                                            <th className={`${tableHeaderClass} min-w-[140px]`}>Tuote</th>
                                            <th className={`${tableHeaderClass} min-w-[140px]`}>Mitat (mm)</th>
                                            <th className={`${tableHeaderClass} min-w-[180px]`}>Ominaisuudet</th>
                                            <th className={`${tableHeaderClass} text-right w-24`}>Määrä</th>
                                            <th className={`${tableHeaderClass} text-right w-32`}>à Hinta</th>
                                            <th className={`${tableHeaderClass} text-right w-32`}>Yhteensä</th>
                                            <th className={`${tableHeaderClass} w-10`}></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 bg-white">
                                        {section.items.map((item, idx) => (
                                            <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 align-top">
                                                    <input 
                                                        value={item.tunnus}
                                                        onChange={(e) => updateProduct(section.id, item.id, { tunnus: e.target.value })}
                                                        className={`${inputClass} font-bold text-center bg-slate-50 focus:bg-white rounded`}
                                                        placeholder="001"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <input 
                                                        value={item.manufacturer || ''}
                                                        onChange={(e) => updateProduct(section.id, item.id, { manufacturer: e.target.value })}
                                                        className={inputClass}
                                                        placeholder="Malli"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="number"
                                                            value={item.width}
                                                            onChange={(e) => updateProduct(section.id, item.id, { width: Number(e.target.value) })}
                                                            className={`${inputClass} w-16 text-center`}
                                                            placeholder="L"
                                                        />
                                                        <span className="text-slate-300">x</span>
                                                        <input 
                                                            type="number"
                                                            value={item.height}
                                                            onChange={(e) => updateProduct(section.id, item.id, { height: Number(e.target.value) })}
                                                            className={`${inputClass} w-16 text-center`}
                                                            placeholder="K"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="space-y-1">
                                                        <div className="flex gap-2">
                                                            <input 
                                                                value={item.frameInnerColor || ''}
                                                                onChange={(e) => updateProduct(section.id, item.id, { frameInnerColor: e.target.value })}
                                                                className={`${inputClass} text-xs py-1 h-7 bg-slate-50`}
                                                                placeholder="Sisäväri"
                                                            />
                                                            <input 
                                                                value={item.frameOuterColor || ''}
                                                                onChange={(e) => updateProduct(section.id, item.id, { frameOuterColor: e.target.value })}
                                                                className={`${inputClass} text-xs py-1 h-7 bg-slate-50`}
                                                                placeholder="Ulkoväri"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 text-xs text-slate-500 pl-1 whitespace-nowrap">
                                                            <span>U: {item.uValue}</span>
                                                            <span className="text-slate-300">|</span>
                                                            <span>{isWindows ? item.glassType : (item.lock?.type || 'Vakio')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <input 
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateProduct(section.id, item.id, { quantity: Number(e.target.value) })}
                                                        className={`${inputClass} text-right font-bold bg-hieta-blue/10`}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="relative">
                                                        <input 
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateProduct(section.id, item.id, { unitPrice: Number(e.target.value) })}
                                                            className={`${inputClass} text-right pr-6`}
                                                        />
                                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">€</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top text-right font-bold text-slate-900 pt-3 whitespace-nowrap">
                                                    {(item.totalPrice || 0).toLocaleString('fi-FI')} €
                                                </td>
                                                <td className="px-4 py-3 align-middle text-right">
                                                    <button 
                                                        onClick={() => removeProduct(section.id, item.id)}
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Generic Table */}
                        {!isSpecial && section.items.length > 0 && (
                             <div className="overflow-x-auto -mx-0 sm:mx-0">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr>
                                            <th className={`${tableHeaderClass} min-w-[160px]`}>Tuote / Nimike</th>
                                            <th className={`${tableHeaderClass} min-w-[200px]`}>Tarkenne</th>
                                            <th className={`${tableHeaderClass} text-right w-24`}>Määrä</th>
                                            <th className={`${tableHeaderClass} w-24`}>Yksikkö</th>
                                            <th className={`${tableHeaderClass} text-right w-32`}>à Hinta</th>
                                            <th className={`${tableHeaderClass} text-right w-32`}>Yhteensä</th>
                                            <th className={`${tableHeaderClass} w-10`}></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 bg-white">
                                        {section.items.map((item) => (
                                            <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-2">
                                                    <input 
                                                        value={item.tunnus}
                                                        onChange={(e) => updateProduct(section.id, item.id, { tunnus: e.target.value })}
                                                        className={`${inputClass} font-medium`}
                                                        placeholder="Tuotteen nimi"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        value={item.description || ''}
                                                        onChange={(e) => updateProduct(section.id, item.id, { description: e.target.value })}
                                                        className={`${inputClass} text-slate-500`}
                                                        placeholder="Tarkenne..."
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateProduct(section.id, item.id, { quantity: Number(e.target.value) })}
                                                        className={`${inputClass} text-right font-bold bg-hieta-blue/10`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.unit || 'kpl'}
                                                        onChange={(e) => updateProduct(section.id, item.id, { unit: e.target.value })}
                                                        className={`${inputClass} cursor-pointer`}
                                                    >
                                                        <option value="kpl">kpl</option>
                                                        <option value="jm">jm</option>
                                                        <option value="m">m</option>
                                                        <option value="m²">m²</option>
                                                        <option value="pkt">pkt</option>
                                                        <option value="rll">rll</option>
                                                        <option value="erä">erä</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="relative">
                                                        <input 
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateProduct(section.id, item.id, { unitPrice: Number(e.target.value) })}
                                                            className={`${inputClass} text-right pr-6`}
                                                        />
                                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">€</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold text-slate-900 whitespace-nowrap">
                                                    {(item.totalPrice || 0).toLocaleString('fi-FI')} €
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button 
                                                        onClick={() => removeProduct(section.id, item.id)}
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        )}
                        
                        {/* Footer Totals */}
                        {section.items.length > 0 && (
                            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-end items-center gap-4 rounded-b-xl">
                                <span className="text-xs font-bold text-slate-500 uppercase">Osio Yhteensä</span>
                                <span className="text-lg font-bold text-slate-900">{sectionTotal.toLocaleString('fi-FI')} €</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsTab;