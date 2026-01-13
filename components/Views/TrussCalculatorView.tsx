import React, { useState, useMemo } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Triangle, ArrowRight, CornerRightUp, Scissors, Share, PlusCircle, Check } from 'lucide-react';

interface TrussCalculatorViewProps {
  onComplete: () => void;
}

type TrussType = 'gable' | 'mono' | 'scissor' | 'portal';

const TrussCalculatorView: React.FC<TrussCalculatorViewProps> = ({ onComplete }) => {
  const { addElement } = useQuotation();

  const [inputs, setInputs] = useState({
    type: 'gable' as TrussType,
    span: 9.6, // m
    length: 15.0, // m
    pitch: 22, // degrees
    eaves: 600, // mm
    spacing: 900, // mm
    snowLoad: 2.5, // kN/m²
  });

  const handleInputChange = (field: keyof typeof inputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleTypeChange = (type: TrussType) => {
    setInputs(prev => ({ ...prev, type }));
  };

  const { count, height, singlePrice, totalPrice, typeLabel } = useMemo(() => {
    const { span, length, pitch, spacing, type } = inputs;
    if (span <= 0 || length <= 0 || spacing <= 0) {
        return { count: 0, height: 0, singlePrice: 0, totalPrice: 0, typeLabel: '' };
    }

    const count = Math.ceil(length / (spacing / 1000)) + 1;
    const height = Math.tan(pitch * (Math.PI / 180)) * (span / 2);

    // Pricing formula factors
    const baseFactor = 25;
    const spanFactor = 12;
    const heightFactor = 15;
    let typeFactor = 1.0;
    let label = 'Harjaristikko';

    switch (type) {
        case 'mono':
            typeFactor = 1.1;
            label = 'Pulpettiristikko';
            break;
        case 'scissor':
            typeFactor = 1.35;
            label = 'Saksiristikko';
            break;
        case 'portal':
            typeFactor = 1.8;
            label = 'Kehäristikko';
            break;
    }
    
    const singlePrice = (baseFactor + (span * spanFactor) + (height * heightFactor)) * typeFactor;
    const totalPrice = singlePrice * count;

    return { count, height, singlePrice, totalPrice, typeLabel: label };
  }, [inputs]);
  
  const handleAddToQuotation = () => {
    addElement('section-roof', {
        type: `${typeLabel} (Laskettu)`,
        description: `Määrälaskennasta: Jänneväli ${inputs.span}m, Pituus ${inputs.length}m, Kulma ${inputs.pitch}°, K-jako ${inputs.spacing}mm`,
        specifications: {
            type: 'CE-merkityt NR-ristikot',
            spacing: `k-${inputs.spacing}`,
            snowLoad: `${inputs.snowLoad} kN/m²`,
        },
        quantity: count,
        unit: 'kpl',
        unitPrice: singlePrice
    });
    alert(`${count}kpl ${typeLabel.toLowerCase()} lisätty onnistuneesti tarjoukseen!`);
    onComplete();
  };

  const TrussVisualizer = () => {
    const { span, pitch, type } = inputs;
    const viewBoxWidth = 120;
    const viewBoxHeight = 60;
    const scale = viewBoxWidth / Math.max(span, 4);
    
    const w = span * scale;
    const h = (span / 2) * Math.tan(pitch * Math.PI / 180) * scale;
    
    const points: Record<TrussType, string> = {
        gable: `0,${viewBoxHeight} ${w / 2},${viewBoxHeight - h} ${w},${viewBoxHeight}`,
        mono: `0,${viewBoxHeight} ${w},${viewBoxHeight - h} ${w},${viewBoxHeight}`,
        scissor: `0,${viewBoxHeight} ${w / 2},${viewBoxHeight - h} ${w},${viewBoxHeight} ${w * 0.8},${viewBoxHeight - h * 0.2} ${w / 2},${viewBoxHeight - h * 0.5} ${w * 0.2},${viewBoxHeight - h * 0.2}`,
        portal: `0,${viewBoxHeight} 0,${viewBoxHeight - h * 0.8} ${w / 2},${viewBoxHeight - h} ${w},${viewBoxHeight - h * 0.8} ${w},${viewBoxHeight}`,
    };

    return (
        <svg viewBox={`-10 0 ${viewBoxWidth + 20} ${viewBoxHeight + 10}`} className="w-full h-32">
            <polygon points={points[type]} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
            {/* Simple internal webbing for visual flair */}
            {type === 'gable' && (
                <>
                    <line x1={w/2} y1={viewBoxHeight - h} x2={w/2} y2={viewBoxHeight} stroke="#93c5fd" strokeWidth="1"/>
                    <line x1={w/4} y1={viewBoxHeight - h/2} x2={w/2} y2={viewBoxHeight} stroke="#93c5fd" strokeWidth="1"/>
                    <line x1={w*0.75} y1={viewBoxHeight - h/2} x2={w/2} y2={viewBoxHeight} stroke="#93c5fd" strokeWidth="1"/>
                </>
            )}
        </svg>
    );
  };
  
  const typeOptions: {id: TrussType, label: string, icon: React.ReactNode}[] = [
      { id: 'gable', label: 'Harja', icon: <Triangle size={24} /> },
      { id: 'mono', label: 'Pulpetti', icon: <CornerRightUp size={24} /> },
      { id: 'scissor', label: 'Saksi', icon: <Scissors size={24} /> },
      { id: 'portal', label: 'Kehä', icon: <Share size={24} className="-scale-y-100" /> },
  ];

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-3 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
          <Triangle className="text-blue-600" /> Ristikkolaskenta
        </h1>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Syötä rakennuksen päämitat ja tekniset vaatimukset laskeaksesi kattoristikoiden määrän ja hinta-arvion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">1. Ristikon tyyppi</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {typeOptions.map(opt => (
                           <button 
                              key={opt.id}
                              onClick={() => handleTypeChange(opt.id)}
                              className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${inputs.type === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                           >
                                <div className={inputs.type === opt.id ? 'text-blue-600' : 'text-slate-400'}>{opt.icon}</div>
                                <span className={`font-bold text-sm ${inputs.type === opt.id ? 'text-blue-800' : 'text-slate-600'}`}>{opt.label}</span>
                           </button>
                      ))}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">2. Mitat ja tekniset tiedot</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                          <label className={labelClass}>Jänneväli (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={inputs.span} onChange={e => handleInputChange('span', e.target.value)} />
                      </div>
                      <div>
                          <label className={labelClass}>Rakennuksen pituus (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={inputs.length} onChange={e => handleInputChange('length', e.target.value)} />
                      </div>
                      <div>
                          <label className={labelClass}>Kattokulma (°)</label>
                          <input type="number" className={inputClass} value={inputs.pitch} onChange={e => handleInputChange('pitch', e.target.value)} />
                      </div>
                      <div>
                          <label className={labelClass}>Räystäs (mm)</label>
                          <input type="number" step="50" className={inputClass} value={inputs.eaves} onChange={e => handleInputChange('eaves', e.target.value)} />
                      </div>
                      <div>
                          <label className={labelClass}>Jakoväli (mm)</label>
                           <select className={inputClass} value={inputs.spacing} onChange={e => handleInputChange('spacing', e.target.value)}>
                              <option value={900}>k900</option>
                              <option value={1200}>k1200</option>
                           </select>
                      </div>
                      <div>
                          <label className={labelClass}>Lumikuorma (kN/m²)</label>
                           <select className={inputClass} value={inputs.snowLoad} onChange={e => handleInputChange('snowLoad', e.target.value)}>
                              <option value={2.0}>2.0 kN/m²</option>
                              <option value={2.5}>2.5 kN/m²</option>
                              <option value={3.0}>3.0 kN/m²</option>
                           </select>
                      </div>
                  </div>
              </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg sticky top-6">
                  <h3 className="font-bold text-xl text-white mb-4">3. Laskennan tulokset</h3>
                  
                  <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
                      <TrussVisualizer />
                      <div className="text-center text-xs text-slate-400 mt-2">{typeLabel} / {inputs.span}m / {inputs.pitch}°</div>
                  </div>

                  <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Ristikoiden määrä</span>
                          <span className="text-2xl font-bold">{count} kpl</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Ristikon korkeus</span>
                          <span className="font-bold">{height.toFixed(2)} m</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400">Hinta / kpl (arvio)</span>
                          <span className="font-bold">{singlePrice.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                          <span className="text-slate-300 font-bold uppercase">Yhteensä (alv 0%)</span>
                          <span className="text-3xl font-bold text-blue-400">{totalPrice.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</span>
                      </div>
                  </div>
                  
                   <button 
                    onClick={handleAddToQuotation}
                    className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group disabled:bg-slate-500"
                    disabled={totalPrice <= 0}
                  >
                      <PlusCircle size={18} /> Lisää tarjoukseen
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default TrussCalculatorView;