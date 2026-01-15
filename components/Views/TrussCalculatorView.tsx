import React, { useState, useMemo } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Triangle, ArrowRight, CornerRightUp, Scissors, Share, PlusCircle, Ruler, Scale, Truck, CheckSquare, Square, Info } from 'lucide-react';

interface TrussCalculatorViewProps {
  onComplete: () => void;
}

type TrussType = 'gable' | 'mono' | 'scissor' | 'portal';

const TrussCalculatorView: React.FC<TrussCalculatorViewProps> = ({ onComplete }) => {
  const { addElement } = useQuotation();

  const [inputs, setInputs] = useState({
    type: 'gable' as TrussType,
    span: 9.6, // m (Jänneväli)
    length: 15.0, // m (Rakennuksen pituus)
    pitch: 22, // degrees
    eaves: 600, // mm (Räystäs)
    spacing: 900, // mm (Jako)
    snowLoad: 2.5, // kN/m²
    bottomChordThickness: 42, // mm
    includeBracing: true,
    includeAnchors: true,
  });

  const handleInputChange = (field: keyof typeof inputs, value: string | number | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: TrussType) => {
    setInputs(prev => ({ ...prev, type }));
  };

  // --- CALCULATIONS ---
  const calculations = useMemo(() => {
    const { span, length, pitch, spacing, type, eaves, snowLoad, includeBracing, includeAnchors } = inputs;
    
    if (span <= 0 || length <= 0 || spacing <= 0) {
        return null;
    }

    // Geometry
    const totalTrussWidth = span + (eaves * 2 / 1000); // m
    const count = Math.ceil(length / (spacing / 1000)) + 1;
    
    // Height Calculation (approximate peak height from bottom chord)
    let height = 0;
    if (type === 'gable' || type === 'scissor' || type === 'portal') {
        height = Math.tan(pitch * (Math.PI / 180)) * (span / 2);
    } else if (type === 'mono') {
        height = Math.tan(pitch * (Math.PI / 180)) * span;
    }
    
    // Transport Height (Height + approx structure thickness)
    const transportHeight = height + 0.3; 

    // Weight Estimation (Very rough approx: 15kg/m of span * load factor)
    const weightPerTruss = span * 12 * (1 + (snowLoad * 0.1));
    const totalWeight = weightPerTruss * count;

    // Pricing Logic
    const baseTrussPrice = 45; // € Start cost
    const spanCost = span * 18; // € per meter of span
    const heightCost = height * 25; // € per meter of height
    const loadFactor = 1 + ((snowLoad - 2.0) * 0.15); // +15% cost per 0.5kN increase
    
    let typeMultiplier = 1.0;
    let label = 'Harjaristikko NR';
    switch (type) {
        case 'mono': typeMultiplier = 1.15; label = 'Pulpettiristikko NR'; break;
        case 'scissor': typeMultiplier = 1.40; label = 'Saksiristikko NR'; break;
        case 'portal': typeMultiplier = 1.90; label = 'Kehäristikko NR'; break;
    }

    const pricePerTruss = (baseTrussPrice + spanCost + heightCost) * typeMultiplier * loadFactor;
    const trussesTotal = pricePerTruss * count;

    // Accessories Pricing
    const bracingPrice = includeBracing ? (length * 15) : 0; // Vinoreivauslaudat + naulat
    const anchorPrice = includeAnchors ? (count * 2 * 4.50) : 0; // 2 brackets per truss

    return { 
        count, 
        height, 
        transportHeight,
        weightPerTruss,
        totalWeight,
        pricePerTruss, 
        trussesTotal, 
        bracingPrice,
        anchorPrice,
        grandTotal: trussesTotal + bracingPrice + anchorPrice,
        typeLabel: label,
        totalTrussWidth
    };
  }, [inputs]);
  
  const handleAddToQuotation = () => {
    if (!calculations) return;

    // 1. Add Trusses
    addElement('section-roof', {
        type: `${calculations.typeLabel} (${inputs.span}m)`,
        description: `Määrälaskennasta: Jänneväli ${inputs.span}m + räystäät ${inputs.eaves}mm.\nKattokulma 1: ${inputs.pitch}°, Lumikuorma: ${inputs.snowLoad} kN/m².\nKuljetuskorkeus n. ${calculations.transportHeight.toFixed(1)}m.`,
        specifications: {
            type: 'CE-merkityt NR-ristikot',
            spacing: `k-${inputs.spacing}`,
            snowLoad: `${inputs.snowLoad} kN/m²`,
            weight: `n. ${calculations.weightPerTruss.toFixed(0)} kg/kpl`,
        },
        quantity: calculations.count,
        unit: 'kpl',
        unitPrice: calculations.pricePerTruss
    });

    // 2. Add Bracing (if selected)
    if (inputs.includeBracing) {
        addElement('section-roof', {
            type: 'Ristikoiden jäykistepaketti',
            description: 'Vinoreivauslaudat 22x100 ja tarvittavat naulat ristikoiden tuentaan.',
            specifications: {
                material: 'Vajaasärmä 22x100',
                usage: 'Yläpaarteiden sidonta'
            },
            quantity: 1,
            unit: 'erä',
            unitPrice: calculations.bracingPrice
        });
    }

    // 3. Add Anchors (if selected)
    if (inputs.includeAnchors) {
        addElement('section-roof', {
            type: 'Ristikoiden kiinnityspaketti',
            description: 'Ristikoiden kiinnityskulmat (2kpl/ristikko) ja ankkurinaulat.',
            specifications: {
                item: 'Vahvistettu kulmarauta',
                quantity: `${calculations.count * 2} kpl`
            },
            quantity: 1,
            unit: 'erä',
            unitPrice: calculations.anchorPrice
        });
    }

    alert(`Lisätty tarjoukseen: ${calculations.count} ristikkoa ja valitut tarvikkeet.`);
    onComplete();
  };

  // --- VISUALIZER COMPONENT ---
  const TrussVisualizer = () => {
    const { span, pitch, type, eaves } = inputs;
    // Scale Logic
    const eavesM = eaves / 1000;
    const totalW = span + (eavesM * 2);
    
    // Viewbox setup
    const viewW = 200;
    const padding = 20;
    const scale = (viewW - (padding * 2)) / totalW;
    
    // Coordinates
    const xStart = padding;
    const xSupportLeft = xStart + (eavesM * scale);
    const xSupportRight = xStart + ((eavesM + span) * scale);
    const xEnd = xStart + (totalW * scale);
    
    const wSpan = span * scale;
    const hTruss = (type === 'mono' ? span : span / 2) * Math.tan(pitch * Math.PI / 180) * scale;
    const yBase = 120;
    const yPeak = yBase - hTruss;

    // SVG Points generation based on type
    const drawTruss = () => {
        switch(type) {
            case 'mono':
                return (
                    <>
                        <polygon points={`${xStart},${yBase} ${xEnd},${yBase - (hTruss * (totalW/span))} ${xEnd},${yBase} ${xStart},${yBase}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                        {/* Webbing Mockup */}
                        <line x1={xSupportLeft} y1={yBase} x2={xEnd} y2={yBase - hTruss} stroke="#93c5fd" strokeWidth="1.5" />
                        <line x1={(xSupportLeft+xEnd)/2} y1={yBase} x2={xEnd} y2={yBase - hTruss*0.5} stroke="#93c5fd" strokeWidth="1.5" />
                    </>
                );
            case 'scissor':
                return (
                    <>
                        {/* Top Chord */}
                        <polyline points={`${xStart},${yBase} ${xStart + (totalW/2)*scale},${yPeak} ${xEnd},${yBase}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Bottom Chord (Raised) */}
                        <polyline points={`${xStart},${yBase} ${xStart + (totalW/2)*scale},${yBase - hTruss*0.3} ${xEnd},${yBase}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Webbing */}
                        <line x1={xSupportLeft + wSpan*0.25} y1={yBase - hTruss*0.15} x2={xStart + (totalW/2)*scale} y2={yPeak} stroke="#93c5fd" strokeWidth="1.5" />
                        <line x1={xSupportRight - wSpan*0.25} y1={yBase - hTruss*0.15} x2={xStart + (totalW/2)*scale} y2={yPeak} stroke="#93c5fd" strokeWidth="1.5" />
                    </>
                );
            case 'portal':
                 return (
                    <>
                        <polygon points={`${xStart},${yBase} ${xStart + (totalW/2)*scale},${yPeak} ${xEnd},${yBase} ${xSupportRight},${yBase} ${xSupportRight},${yBase-20} ${xSupportLeft},${yBase-20} ${xSupportLeft},${yBase}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                    </>
                 );
            default: // Gable
                return (
                    <>
                        <polygon points={`${xStart},${yBase} ${xStart + (totalW/2)*scale},${yPeak} ${xEnd},${yBase}`} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                        {/* Webbing Mockup */}
                        <line x1={xStart + (totalW/2)*scale} y1={yPeak} x2={xStart + (totalW/2)*scale} y2={yBase} stroke="#93c5fd" strokeWidth="1.5" />
                        <line x1={xSupportLeft + wSpan*0.25} y1={yBase} x2={xStart + (totalW/2)*scale} y2={yPeak*1.2 + yBase*0.8} stroke="#93c5fd" strokeWidth="1.5" />
                        <line x1={xSupportRight - wSpan*0.25} y1={yBase} x2={xStart + (totalW/2)*scale} y2={yPeak*1.2 + yBase*0.8} stroke="#93c5fd" strokeWidth="1.5" />
                    </>
                );
        }
    };

    return (
        <svg viewBox="0 0 200 160" className="w-full h-48 select-none">
            {/* Ground / Supports */}
            <path d={`M ${xSupportLeft - 5} ${yBase + 5} L ${xSupportLeft} ${yBase} L ${xSupportLeft + 5} ${yBase + 5}`} fill="none" stroke="#94a3b8" strokeWidth="2" />
            <path d={`M ${xSupportRight - 5} ${yBase + 5} L ${xSupportRight} ${yBase} L ${xSupportRight + 5} ${yBase + 5}`} fill="none" stroke="#94a3b8" strokeWidth="2" />
            
            {/* Dimension Lines */}
            {/* Span */}
            <line x1={xSupportLeft} y1={yBase + 15} x2={xSupportRight} y2={yBase + 15} stroke="#64748b" strokeWidth="1" />
            <line x1={xSupportLeft} y1={yBase + 12} x2={xSupportLeft} y2={yBase + 18} stroke="#64748b" strokeWidth="1" />
            <line x1={xSupportRight} y1={yBase + 12} x2={xSupportRight} y2={yBase + 18} stroke="#64748b" strokeWidth="1" />
            <text x={(xSupportLeft + xSupportRight)/2} y={yBase + 28} fontSize="8" textAnchor="middle" fill="#64748b" fontWeight="bold">Jänne {span} m</text>

            {/* Total Width (if eaves exist) */}
            {eaves > 0 && (
                <>
                    <line x1={xStart} y1={yBase + 35} x2={xEnd} y2={yBase + 35} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
                    <line x1={xStart} y1={yBase + 32} x2={xStart} y2={yBase + 38} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={xEnd} y1={yBase + 32} x2={xEnd} y2={yBase + 38} stroke="#cbd5e1" strokeWidth="1" />
                    <text x={xStart + 10} y={yBase + 32} fontSize="6" fill="#94a3b8">Leveys {totalW.toFixed(2)} m</text>
                </>
            )}

            {/* The Truss Itself */}
            {drawTruss()}
        </svg>
    );
  };
  
  const typeOptions: {id: TrussType, label: string, icon: React.ReactNode}[] = [
      { id: 'gable', label: 'Harja', icon: <Triangle size={24} /> },
      { id: 'mono', label: 'Pulpetti', icon: <CornerRightUp size={24} /> },
      { id: 'scissor', label: 'Saksi', icon: <Scissors size={24} /> },
      { id: 'portal', label: 'Kehä', icon: <Share size={24} className="-scale-y-100" /> },
  ];

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-3 font-medium focus:border-hieta-blue focus:ring-2 focus:ring-hieta-blue/20 outline-none transition-all card-shadow";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
          <Triangle className="text-hieta-blue" /> Ristikkolaskenta
        </h1>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Määritä kattoristikoiden geometria ja kuormat. Laskuri arvioi hinnan, painon ja kuljetusmitat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs Column */}
          <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Type Selection */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow hover-lift">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Square size={18} className="text-hieta-blue"/> 1. Ristikon tyyppi
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {typeOptions.map(opt => (
                           <button 
                              key={opt.id}
                              onClick={() => handleTypeChange(opt.id)}
                              className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all hover-lift ${inputs.type === opt.id ? 'border-hieta-blue bg-hieta-blue/10' : 'border-slate-200 bg-white hover:border-hieta-wood-accent'}`}
                           >
                                <div className={inputs.type === opt.id ? 'text-hieta-blue' : 'text-slate-400'}>{opt.icon}</div>
                                <span className={`font-bold text-sm ${inputs.type === opt.id ? 'text-hieta-blue' : 'text-slate-600'}`}>{opt.label}</span>
                           </button>
                      ))}
                  </div>
              </div>

              {/* 2. Geometry */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow hover-lift">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Ruler size={18} className="text-orange-500"/> 2. Mitat
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Jänneväli (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={inputs.span} onChange={e => handleInputChange('span', Number(e.target.value))} />
                      </div>
                      <div>
                          <label className={labelClass}>Räystään pituus (mm)</label>
                          <input type="number" step="50" className={inputClass} value={inputs.eaves} onChange={e => handleInputChange('eaves', Number(e.target.value))} />
                      </div>
                      <div>
                          <label className={labelClass}>Kattokulma (°)</label>
                          <input type="number" className={inputClass} value={inputs.pitch} onChange={e => handleInputChange('pitch', Number(e.target.value))} />
                      </div>
                      <div>
                          <label className={labelClass}>Rakennuksen pituus (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={inputs.length} onChange={e => handleInputChange('length', Number(e.target.value))} />
                      </div>
                  </div>
              </div>

              {/* 3. Specs & Accessories */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow hover-lift">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Scale size={18} className="text-green-600"/> 3. Kuormat & Varusteet
                  </h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                          <label className={labelClass}>Jakoväli (mm)</label>
                           <select className={inputClass} value={inputs.spacing} onChange={e => handleInputChange('spacing', Number(e.target.value))}>
                              <option value={900}>k900</option>
                              <option value={1200}>k1200</option>
                           </select>
                      </div>
                      <div>
                          <label className={labelClass}>Lumikuorma</label>
                           <select className={inputClass} value={inputs.snowLoad} onChange={e => handleInputChange('snowLoad', Number(e.target.value))}>
                              <option value={2.0}>2.0 kN/m² (Etelä-Suomi)</option>
                              <option value={2.5}>2.5 kN/m² (Keski-Suomi)</option>
                              <option value={3.0}>3.0 kN/m² (Lappi)</option>
                              <option value={3.5}>3.5 kN/m² (Lappi, vaativa)</option>
                           </select>
                      </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4">
                      <label className={labelClass}>Lisätarvikkeet</label>
                      <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-hieta-wood-light/30 transition-all hover-lift">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center ${inputs.includeBracing ? 'bg-hieta-blue border-hieta-blue' : 'bg-white border-slate-300'}`}>
                                  {inputs.includeBracing && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <input type="checkbox" className="hidden" checked={inputs.includeBracing} onChange={e => handleInputChange('includeBracing', e.target.checked)} />
                              <div className="flex-1">
                                  <span className="font-bold text-sm text-slate-800 block">Jäykistepaketti (Vinoreivaus)</span>
                                  <span className="text-xs text-slate-500">Sisältää vinolaudoituksen (22x100) ja naulat.</span>
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                  +{calculations?.bracingPrice.toFixed(0)} €
                              </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-hieta-wood-light/30 transition-all hover-lift">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center ${inputs.includeAnchors ? 'bg-hieta-blue border-hieta-blue' : 'bg-white border-slate-300'}`}>
                                  {inputs.includeAnchors && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <input type="checkbox" className="hidden" checked={inputs.includeAnchors} onChange={e => handleInputChange('includeAnchors', e.target.checked)} />
                              <div className="flex-1">
                                  <span className="font-bold text-sm text-slate-800 block">Kiinnityspaketti</span>
                                  <span className="text-xs text-slate-500">Sisältää kulmaraudat (2kpl/liitos) ja ankkurinaulat.</span>
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                  +{calculations?.anchorPrice.toFixed(0)} €
                              </div>
                          </label>
                      </div>
                  </div>
              </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 space-y-6">
              {calculations && (
                <div className="bg-hieta-black text-white p-6 rounded-xl card-shadow-lg sticky top-6">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-xl text-white">Laskennan tulokset</h3>
                        <div className="bg-hieta-blue text-xs font-bold px-2 py-1 rounded text-white">
                            AUTO-CALC
                        </div>
                    </div>
                    
                    <div className="bg-slate-800 rounded-lg p-2 mb-6 border border-slate-700 overflow-hidden">
                        <TrussVisualizer />
                        <div className="text-center text-xs text-slate-400 mt-2 font-mono pb-2">
                            {calculations.typeLabel} • L: {inputs.span}m • {inputs.pitch}°
                        </div>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-slate-400">Määrä</span>
                            <span className="text-xl font-bold">{calculations.count} kpl</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-700">
                            <div>
                                <div className="text-slate-400 text-xs flex items-center gap-1"><Info size={12}/> Korkeus (kuljetus)</div>
                                <div className="font-bold text-lg">{calculations.transportHeight.toFixed(2)} m</div>
                                {calculations.transportHeight > 3.0 && (
                                    <div className="text-xs text-yellow-400 mt-1 flex items-center gap-1"><Truck size={10}/> Erikoisrahti?</div>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-slate-400 text-xs">Kokonaispaino</div>
                                <div className="font-bold text-lg">{calculations.totalWeight.toFixed(0)} kg</div>
                                <div className="text-xs text-slate-500">~{calculations.weightPerTruss.toFixed(0)} kg/kpl</div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-slate-400 text-xs">
                                <span>Ristikot ({calculations.count} kpl)</span>
                                <span>{calculations.trussesTotal.toFixed(0)} €</span>
                            </div>
                            {inputs.includeBracing && (
                                <div className="flex justify-between text-slate-400 text-xs">
                                    <span>Jäykistepaketti</span>
                                    <span>{calculations.bracingPrice.toFixed(0)} €</span>
                                </div>
                            )}
                            {inputs.includeAnchors && (
                                <div className="flex justify-between text-slate-400 text-xs">
                                    <span>Kiinnityspaketti</span>
                                    <span>{calculations.anchorPrice.toFixed(0)} €</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-700 mt-2">
                            <span className="text-slate-300 font-bold uppercase">Yhteensä (alv 0%)</span>
                            <span className="text-3xl font-bold text-blue-400">{calculations.grandTotal.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleAddToQuotation}
                        className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
                    >
                        <PlusCircle size={18} /> Lisää tarjoukseen
                    </button>
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default TrussCalculatorView;