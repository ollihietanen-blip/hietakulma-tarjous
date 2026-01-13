import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Calculator, ArrowRight, Ruler, Home, Box, Check } from 'lucide-react';

interface QuantityTakeoffProps {
  onComplete: () => void;
}

const QuantityTakeoff: React.FC<QuantityTakeoffProps> = ({ onComplete }) => {
  const { addElement, quotation } = useQuotation();
  
  // Basic dimensions state
  const [dims, setDims] = useState({
      width: 0,
      length: 0,
      floors: 1,
      height: 2.8,
      roofAngle: 18,
      eaves: 600, // mm
      windowCount: 0,
      windowArea: 0,
  });

  const [calculated, setCalculated] = useState(false);

  // Calculations
  const perimeter = (dims.width + dims.length) * 2;
  const wallAreaGross = perimeter * dims.height * dims.floors;
  const wallAreaNet = wallAreaGross - dims.windowArea;
  const floorArea = dims.width * dims.length * dims.floors;
  
  // Simple roof estimation (Gable roof)
  const roofWidth = dims.width + (dims.eaves * 2 / 1000);
  const roofLength = dims.length + (dims.eaves * 2 / 1000);
  const roofAreaFlat = roofWidth * roofLength;
  const roofFactor = 1 / Math.cos(dims.roofAngle * (Math.PI / 180));
  const roofAreaReal = roofAreaFlat * roofFactor;

  const handleApply = () => {
    // Determine typical elements based on calculation
    const elementCount = Math.ceil(perimeter / 2.8); // Approx 2.8m per element
    const roofTrussCount = Math.ceil(dims.length / 0.9) + 1; // k900 spacing

    // Add Outer Walls
    if (wallAreaNet > 0) {
        addElement('section-ext-walls', {
            type: 'Ulkoseinäelementti (Laskettu)',
            description: `Määrälaskennasta: Kehä ${perimeter}m, Korkeus ${dims.height}m.`,
            specifications: {
                height: `${dims.height * 1000} mm`,
                uValue: '0,17 W/m²K',
                cladding: 'UTW 28x195',
            },
            quantity: elementCount,
            unit: 'kpl',
            unitPrice: 450,
            netArea: Number((wallAreaNet / elementCount).toFixed(1)),
            hasWindowInstall: dims.windowCount > 0,
            windowCount: Math.ceil(dims.windowCount / elementCount),
            windowInstallPrice: 45
        });
    }

    // Add Trusses
    addElement('section-roof', {
        type: 'Kattoristikko (Laskettu)',
        description: `Määrälaskennasta: ${dims.width}m jänneväli, ${dims.roofAngle} astetta.`,
        specifications: {
            type: 'NR-ristikko',
            spacing: 'k900'
        },
        quantity: roofTrussCount,
        unit: 'kpl',
        unitPrice: 180
    });

    onComplete(); // Navigate to quotation
  };

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-3 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Määrälaskenta</h1>
        <p className="text-slate-500 mt-2">Syötä rakennuksen päämitat saadaksesi arvion elementeistä ja materiaaleista.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Ruler className="text-blue-500" /> Rakennuksen mitat
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Leveys (m)</label>
                          <input type="number" className={inputClass} value={dims.width || ''} onChange={e => setDims({...dims, width: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Pituus (m)</label>
                          <input type="number" className={inputClass} value={dims.length || ''} onChange={e => setDims({...dims, length: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Kerrokset</label>
                          <input type="number" className={inputClass} value={dims.floors} onChange={e => setDims({...dims, floors: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Huonekorkeus (m)</label>
                          <input type="number" className={inputClass} value={dims.height} onChange={e => setDims({...dims, height: Number(e.target.value)})} />
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Home className="text-orange-500" /> Vesikatto & Aukot
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Kattokulma (°)</label>
                          <input type="number" className={inputClass} value={dims.roofAngle} onChange={e => setDims({...dims, roofAngle: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Räystäsylitys (mm)</label>
                          <input type="number" className={inputClass} value={dims.eaves} onChange={e => setDims({...dims, eaves: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Ikkunoiden määrä (kpl)</label>
                          <input type="number" className={inputClass} value={dims.windowCount} onChange={e => setDims({...dims, windowCount: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Aukkojen ala (m²)</label>
                          <input type="number" className={inputClass} value={dims.windowArea} onChange={e => setDims({...dims, windowArea: Number(e.target.value)})} />
                      </div>
                  </div>
              </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                      <Calculator size={24} /> Tulokset
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Pohjan ala:</span>
                          <span className="text-xl font-bold">{floorArea.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Ulkoseinä (brutto):</span>
                          <span className="text-xl font-bold">{wallAreaGross.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Ulkoseinä (netto):</span>
                          <span className="text-xl font-bold text-blue-400">{wallAreaNet.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Vesikaton ala:</span>
                          <span className="text-xl font-bold text-orange-400">{roofAreaReal.toFixed(1)} m²</span>
                      </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Arvioidut tarvikkeet</div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-3 text-sm">
                             <Box size={16} className="text-blue-500"/>
                             <span>n. {Math.ceil(perimeter / 2.8)} kpl seinäelementtejä</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm">
                             <Home size={16} className="text-orange-500"/>
                             <span>n. {Math.ceil(dims.length / 0.9) + 1} kpl kattoristikoita</span>
                         </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleApply}
                    className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                      Siirrä tarjouslaskentaan <ArrowRight size={18} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default QuantityTakeoff;