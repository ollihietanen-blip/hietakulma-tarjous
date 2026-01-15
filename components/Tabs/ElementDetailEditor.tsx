import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ElementItem } from '../../types';
import { Trash2, PenTool, Frame, Hammer } from 'lucide-react';

interface ElementDetailEditorProps {
  item: ElementItem & { sectionId: string };
  onRemove: (sectionId: string, elementId: string) => void;
}

const ElementDetailEditor: React.FC<ElementDetailEditorProps> = ({ item, onRemove }) => {
  const { updateElement } = useQuotation();

  const handleUpdate = (updates: Partial<ElementItem>) => {
    updateElement(item.sectionId, item.id, updates);
  };
  
  const handleSpecUpdate = (key: string, value: string) => {
    handleUpdate({ specifications: { ...item.specifications, [key]: value } });
  };
  
  const inputBaseClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium hover:border-blue-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm py-2 px-3 transition-all duration-200 outline-none placeholder:text-slate-400";
  const labelBaseClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";
  const sectionHeaderClass = "flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200";

  const quantityError = item.quantity <= 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-start">
        <input 
          type="text"
          value={item.type}
          onChange={(e) => handleUpdate({ type: e.target.value })}
          className="text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none -ml-2 p-2 w-full"
        />
        <button 
          onClick={() => onRemove(item.sectionId, item.id)}
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all ml-2"
          title="Poista elementti"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Main Details */}
        <div className="space-y-6">
          {/* Description & Specs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className={sectionHeaderClass}>Yleistiedot</h3>
            <div>
              <label className={labelBaseClass}>Kuvaus</label>
              <textarea 
                className={`${inputBaseClass} min-h-[100px] resize-y`}
                value={item.description}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                rows={3}
                placeholder="Elementin kuvaus..."
              />
            </div>
            <div className="mt-4 space-y-4">
              {/* Wall Structure Type Selector - for external walls */}
              {item.type.toLowerCase().includes('ulkoseinä') || item.type.toLowerCase().includes('seinä') ? (
                <div>
                  <label className={labelBaseClass}>Ulkoseinätyyppi</label>
                  <select
                    className={`${inputBaseClass} appearance-none cursor-pointer font-bold`}
                    value={item.specifications.structureType || 'US-198'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newUValue = newType === 'US-198' ? '0,17 W/m²K' : '0,25 W/m²K';
                      const newFrame = newType === 'US-198' ? '42x198' : '42x148';
                      
                      handleUpdate({
                        specifications: {
                          ...item.specifications,
                          structureType: newType,
                          uValue: newUValue,
                          frame: newFrame
                        },
                        type: item.type.replace(/US-\d{3}/g, newType) // Update type name if it contains structure type
                      });
                    }}
                  >
                    <option value="US-198">US-198 (U=0.17, 42x198)</option>
                    <option value="US-148">US-148 (U=0.25, 42x148)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Vaihtamalla tyyppiä päivitetään automaattisesti U-arvo ja rakenne
                  </p>
                </div>
              ) : null}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelBaseClass}>Rakenne</label>
                    <input type="text" className={inputBaseClass} value={item.specifications.frame || ''} onChange={(e) => handleSpecUpdate('frame', e.target.value)} />
                </div>
                <div>
                    <label className={labelBaseClass}>U-Arvo</label>
                    <input type="text" className={inputBaseClass} value={item.specifications.uValue || ''} onChange={(e) => handleSpecUpdate('uValue', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Window Installation */}
          <div className={`rounded-xl border-2 transition-all duration-200 p-6 ${item.hasWindowInstall ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Frame size={16} className={item.hasWindowInstall ? "text-blue-600" : "text-slate-400"} /> 
                    Ikkuna-asennus tehtaalla
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={item.hasWindowInstall || false} onChange={(e) => handleUpdate({ hasWindowInstall: e.target.checked })} />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            {item.hasWindowInstall && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                    <div>
                        <label className={labelBaseClass}>Määrä (kpl)</label>
                        <input type="number" min="0" className={inputBaseClass} value={item.windowCount || 0} onChange={(e) => handleUpdate({ windowCount: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label className={labelBaseClass}>Hinta (€/kpl)</label>
                        <input type="number" min="0" className={inputBaseClass} value={item.windowInstallPrice || 45} onChange={(e) => handleUpdate({ windowInstallPrice: Number(e.target.value) })} />
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Right column: Pricing & Cladding */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className={sectionHeaderClass}><Hammer size={14} className="text-slate-600" /> Hinnoittelu</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelBaseClass}>Määrä ({item.unit})</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleUpdate({ quantity: Number(e.target.value) })} className={`${inputBaseClass} font-bold text-lg ${quantityError ? 'border-red-300 ring-1 ring-red-100' : ''}`} />
                  </div>
                  <div>
                    <label className={labelBaseClass}>Netto m²</label>
                    <input type="number" min="0" value={item.netArea || 0} onChange={(e) => handleUpdate({ netArea: Number(e.target.value) })} className={inputBaseClass} />
                  </div>
              </div>
              <div>
                <label className={labelBaseClass}>Yksikköhinta (€)</label>
                <div className="relative">
                  <input type="number" min="0" value={item.unitPrice} onChange={(e) => handleUpdate({ unitPrice: Number(e.target.value) })} className={`${inputBaseClass} pr-8 text-lg`} />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-medium">€</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cladding */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className={sectionHeaderClass}><PenTool size={14} className="text-blue-500" /> Verhous & Pinta</h3>
            <div className="space-y-4">
              <div>
                <label className={labelBaseClass}>Verhousmateriaali</label>
                <input type="text" className={inputBaseClass} value={item.specifications.cladding || ''} onChange={(e) => handleSpecUpdate('cladding', e.target.value)} placeholder="esim. UTW 28x195" />
              </div>
              <div>
                <label className={labelBaseClass}>Käsittely</label>
                <select className={`${inputBaseClass} appearance-none cursor-pointer`} value={item.specifications.surfaceFinish || ''} onChange={(e) => handleSpecUpdate('surfaceFinish', e.target.value)}>
                  <option value="">Ei käsittelyä</option>
                  <option value="Pohjamaalattu">Pohjamaalattu</option>
                  <option value="Pohja- ja välimaalattu">Pohja- ja välimaalattu</option>
                  <option value="Valmismaalattu">Valmismaalattu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementDetailEditor;
