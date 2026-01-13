import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ArrowRight, Ruler, Home, Box, Layers, PenTool, CheckCircle } from 'lucide-react';

interface ElementCalculatorViewProps {
  onComplete: () => void;
}

const ElementCalculatorView: React.FC<ElementCalculatorViewProps> = ({ onComplete }) => {
  const { addElement } = useQuotation();
  
  // Basic dimensions state
  const [dims, setDims] = useState({
      width: 8,
      length: 12,
      floors: 1,
      height: 2.8,
      windowCount: 5,
      windowArea: 8,
      structureType: 'US-198'
  });

  // Calculations
  const perimeter = (dims.width + dims.length) * 2;
  const wallAreaGross = perimeter * dims.height * dims.floors;
  const wallAreaNet = wallAreaGross - dims.windowArea;
  const floorArea = dims.width * dims.length * dims.floors;

  const handleApply = () => {
    // Assuming max element width ~3.0m for simple calculation
    const elementWidth = 3.0; 
    const elementCount = Math.ceil(perimeter / elementWidth); 

    if (wallAreaNet > 0) {
        // Create one batch entry for the calculated elements
        addElement('section-ext-walls', {
            type: `Ulkoseinä ${dims.structureType} (Laskettu)`,
            description: `Määrälaskennasta: Kehä ${perimeter}m, Korkeus ${dims.height}m. \nBruttoala ${wallAreaGross.toFixed(1)}m², Aukot ${dims.windowArea}m²`,
            specifications: {
                height: `${dims.height * 1000} mm`,
                uValue: dims.structureType === 'US-198' ? '0,17 W/m²K' : '0,25 W/m²K',
                cladding: 'UTW 28x195',
            },
            quantity: elementCount,
            unit: 'kpl',
            unitPrice: 450, // Base price estimate
            netArea: Number((wallAreaNet / elementCount).toFixed(1)),
            hasWindowInstall: dims.windowCount > 0,
            windowCount: Math.ceil(dims.windowCount / elementCount),
            windowInstallPrice: 45
        });
        
        alert(`${elementCount}kpl seinäelementtejä lisätty onnistuneesti tarjoukseen!`);
        onComplete();
    } else {
        alert('Ei lisättävää, tarkista syötetyt mitat.');
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-3 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Box className="text-blue-600" /> Puuelementtilaskenta
        </h1>
        <p className="text-slate-500 mt-2 max-w-2xl">
            Syötä rakennuksen päämitat, niin järjestelmä laskee arvion seinäelementtien menekistä ja lisää ne tarjoukseen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-6">
              
              {/* Dimensions Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Ruler className="text-blue-600" /> Geometria & Rakenne
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                          <label className={labelClass}>Rakennetyyppi (Seinä)</label>
                          <select 
                             className={inputClass}
                             value={dims.structureType}
                             onChange={e => setDims({...dims, structureType: e.target.value})}
                          >
                              <option value="US-198">US-198 (U=0.17, 42x198)</option>
                              <option value="US-148">US-148 (U=0.25, 42x148)</option>
                          </select>
                      </div>
                      <div>
                          <label className={labelClass}>Leveys (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={dims.width} onChange={e => setDims({...dims, width: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Pituus (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={dims.length} onChange={e => setDims({...dims, length: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Huonekorkeus (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={dims.height} onChange={e => setDims({...dims, height: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Kerrokset</label>
                          <input type="number" min="1" step="1" className={inputClass} value={dims.floors} onChange={e => setDims({...dims, floors: Number(e.target.value)})} />
                      </div>
                  </div>
              </div>

              {/* Openings */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Layers className="text-orange-500" /> Aukot
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Ikkunoiden määrä (kpl)</label>
                          <input type="number" min="0" className={inputClass} value={dims.windowCount} onChange={e => setDims({...dims, windowCount: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Aukkojen ala yht. (m²)</label>
                          <input type="number" min="0" step="0.1" className={inputClass} value={dims.windowArea} onChange={e => setDims({...dims, windowArea: Number(e.target.value)})} />
                      </div>
                  </div>
              </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <CheckCircle size={24} className="text-blue-400" /> Tulokset
                    </h3>
                    <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">AUTO-CALC</span>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400 flex items-center gap-2"><Layers size={14}/> Pohjan ala</span>
                          <span className="text-xl font-bold">{floorArea.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400 flex items-center gap-2"><PenTool size={14}/> Ulkoseinä (brutto)</span>
                          <span className="text-xl font-bold">{wallAreaGross.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400 flex items-center gap-2"><CheckCircle size={14}/> Ulkoseinä (netto)</span>
                          <span className="text-xl font-bold text-blue-400">{wallAreaNet.toFixed(1)} m²</span>
                      </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Arvioidut tarvikkeet (siirtyy tarjoukseen)</div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                             <div className="flex items-center gap-2 text-slate-300">
                                <Box size={16} className="text-blue-500"/> Seinäelementit
                             </div>
                             <span className="font-bold text-white">~{Math.ceil(perimeter / 3.0)} kpl</span>
                         </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleApply}
                    className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
                  >
                      Siirrä elementit tarjoukseen <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ElementCalculatorView;