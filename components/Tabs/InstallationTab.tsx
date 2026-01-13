import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ASSEMBLY_LEVELS } from '../../types';
import { Check, X, Clock, Hammer, ShieldCheck, HardHat, AlertTriangle, Plus, Trash2, Package, Home, Frame, Calculator, Timer, Coins } from 'lucide-react';

const InstallationTab: React.FC = () => {
  const { 
    quotation, 
    setAssemblyLevel, 
    pricing, 
    toggleInstallationItem, 
    addCustomInstallationItem, 
    removeCustomInstallationItem 
  } = useQuotation();
  
  const [customItemInput, setCustomItemInput] = useState('');

  // 1. Calculate Summary Data from Quotation
  const elementCount = quotation.elements.reduce((sum, s) => sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
  
  const windowsSection = quotation.products.find(s => s.id === 'windows');
  const windowCount = windowsSection ? windowsSection.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  const doorsSection = quotation.products.find(s => s.id === 'doors');
  const doorCount = doorsSection ? doorsSection.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  // Try to find roofing quantity if it exists in 'vesikate' or similar section
  const roofSection = quotation.products.find(s => s.id === 'vesikate');
  const roofMaterialItem = roofSection?.items.find(i => i.tunnus.toLowerCase().includes('vesikate') || i.description?.toLowerCase().includes('pelti') || i.description?.toLowerCase().includes('huopa'));
  const roofQuantity = roofMaterialItem ? `${roofMaterialItem.quantity} ${roofMaterialItem.unit}` : null;

  // Helper: Get detailed metadata for specific installation items
  const getItemMetadata = (text: string) => {
      const lower = text.toLowerCase();
      
      // Logic for Element Assembly (Tehdastuotanto / Pystytys)
      if (lower.includes('element') && lower.includes('pystytys') && elementCount > 0) {
          const hoursPerUnit = 2;
          const pricePerHour = 40;
          const totalEstimate = elementCount * hoursPerUnit * pricePerHour;
          
          return {
              quantity: `${elementCount} kpl`,
              details: {
                  time: `${hoursPerUnit}h / elementti`,
                  price: `${pricePerHour}€ / h (alv 0%)`,
                  total: `Työn arvo n. ${totalEstimate.toLocaleString('fi-FI')} €`
              },
              icon: <Timer size={14} className="text-blue-500" />
          };
      }

      // Logic for Windows
      if (lower.includes('ikkun') && lower.includes('asennus') && windowCount > 0) {
          return {
              quantity: `${windowCount} kpl`,
              details: null, // Can add window specific hours later if needed
              icon: null
          };
      }

      // Logic for Doors
      if ((lower.includes('ulko-ov') || lower.includes('ovien')) && lower.includes('asennus') && doorCount > 0) {
          return {
              quantity: `${doorCount} kpl`,
              details: null,
              icon: null
          };
      }

      // Logic for Roofing
      if (lower.includes('vesikate') && lower.includes('asennus') && roofQuantity) {
          return {
              quantity: roofQuantity,
              details: null,
              icon: null
          };
      }

      return null;
  };

  // Calculate Base Price for Material (Elements + Products Cost)
  const materialCost = (pricing.elementsCost || 0) + (pricing.productsCost || 0);
  const currentLevel = ASSEMBLY_LEVELS.find(l => l.id === quotation.delivery.assemblyLevelId) || ASSEMBLY_LEVELS[1];
  
  const handleAddCustomItem = () => {
      if (customItemInput.trim()) {
          addCustomInstallationItem(customItemInput.trim());
          setCustomItemInput('');
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleAddCustomItem();
    }
  };

  const getLevelIcon = (iconName: string) => {
      switch(iconName) {
          case 'package': return <Package size={36} />;
          case 'frame': return <Frame size={36} />;
          case 'home': return <Home size={36} />;
          default: return <Hammer size={36} />;
      }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Asennuspalvelut</h1>
        <p className="text-slate-500">
            Valitse asennuksen laajuus. Hinta lasketaan automaattisesti materiaalipaketin ({(materialCost || 0).toLocaleString('fi-FI', {maximumFractionDigits:0})} €) päälle.
            Voit muokata valittua laajuutta poistamalla työvaiheita tai lisäämällä omia rivejä.
        </p>
      </div>
      
      {/* Quick Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-4 items-center text-sm shadow-sm">
          <div className="font-bold text-slate-700 flex items-center gap-2">
              <Calculator size={16} className="text-blue-500"/>
              Lasketut määrät:
          </div>
          <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100 text-slate-600">
              Elementit: <span className="font-bold text-slate-900">{elementCount} kpl</span>
          </div>
          <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100 text-slate-600">
              Ikkunat: <span className="font-bold text-slate-900">{windowCount} kpl</span>
          </div>
          <div className="bg-slate-50 px-3 py-1 rounded border border-slate-100 text-slate-600">
              Ovet: <span className="font-bold text-slate-900">{doorCount} kpl</span>
          </div>
      </div>

      {/* 3 Level Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ASSEMBLY_LEVELS.map((level) => {
            const isSelected = quotation.delivery.assemblyLevelId === level.id;
            // Note: This logic assumes materialCost is accurate. 
            const estimatedTotal = materialCost * level.pricing.baseMultiplier;
            const installationShare = estimatedTotal - materialCost;

            return (
                <div 
                    key={level.id}
                    onClick={() => setAssemblyLevel(level.id)}
                    className={`
                        relative flex flex-col rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden
                        ${isSelected 
                            ? 'border-blue-600 bg-white shadow-xl scale-[1.02] z-10' 
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg'}
                    `}
                >
                    {isSelected && (
                        <div className="absolute top-0 inset-x-0 h-2 bg-blue-600" />
                    )}
                    
                    <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                {getLevelIcon(level.icon)}
                            </div>
                            {isSelected ? (
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Valittu
                                </span>
                            ) : (
                                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Valitse
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{level.name}</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed min-h-[40px]">
                            {level.description}
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Arvioitu asennuskustannus</div>
                                <div className={`text-xl font-bold ${installationShare > 0 ? 'text-blue-700' : 'text-slate-700'}`}>
                                    +{installationShare.toLocaleString('fi-FI', { maximumFractionDigits: 0 })} €
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    Materiaalit +{level.pricing.assemblyAddition}%
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock size={16} className="text-slate-400" />
                                <span>Kesto: <span className="font-semibold">{level.timeline.total}</span></span>
                            </div>
                             <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Hammer size={16} className="text-slate-400" />
                                <span>Työmäärä: <span className="font-semibold">{level.customerWork.effort}</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`p-4 border-t ${isSelected ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                        <button className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                            {isSelected ? '✓ Laajuus valittu' : 'Valitse tämä laajuus'}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Detailed Info for Selected Level */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
             <ShieldCheck size={24} className="text-green-400" />
             <div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Valittu laajuus</div>
                 <h2 className="text-xl font-bold">{currentLevel.name} - Sisältöerittely</h2>
             </div>
        </div>
        
        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* INCLUDED */}
            <div>
                 <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="bg-green-100 text-green-700 p-1 rounded-full"><Check size={14} strokeWidth={3} /></span>
                    Sisältyy toimitukseen
                </h3>
                <div className="space-y-6">
                    {Object.entries(currentLevel.included).map(([category, items]) => (
                        <div key={category}>
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                             </div>
                             <ul className="space-y-2">
                                {items.map((item, idx) => {
                                    const isUnselected = quotation.delivery.unselectedItems.includes(item);
                                    const metadata = getItemMetadata(item);
                                    
                                    return (
                                    <li 
                                        key={idx} 
                                        className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${isUnselected ? 'opacity-50' : ''}`}
                                        onClick={() => toggleInstallationItem(item)}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 border rounded flex items-center justify-center flex-shrink-0 transition-colors ${isUnselected ? 'border-slate-300 bg-slate-100' : 'border-green-500 bg-green-500'}`}>
                                            {!isUnselected && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        
                                        <div className="flex-1">
                                            {/* Main Item Text */}
                                            <div className="flex justify-between items-start">
                                                <span className={`text-sm font-medium leading-tight select-none block ${isUnselected ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-700'}`}>
                                                    {item}
                                                </span>
                                                {metadata && !isUnselected && (
                                                     <span className="ml-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                                        {metadata.quantity}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Extended Metadata (Details & Pricing) */}
                                            {metadata?.details && !isUnselected && (
                                                <div className="mt-2 text-xs flex flex-wrap gap-y-1 gap-x-3 items-center text-slate-500 bg-slate-50/50 p-1.5 rounded border border-slate-100/50">
                                                    <div className="flex items-center gap-1.5">
                                                        {metadata.icon}
                                                        <span>{metadata.details.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Coins size={14} className="text-slate-400" />
                                                        <span>{metadata.details.price}</span>
                                                    </div>
                                                    <div className="w-full border-t border-slate-200 mt-1 pt-1 font-semibold text-blue-700">
                                                        {metadata.details.total}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                )})}
                             </ul>
                        </div>
                    ))}

                    {/* Custom Additions Section */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Lisäpalvelut / Muutokset</div>
                        <ul className="space-y-2 mb-3">
                            {quotation.delivery.customItems.map((item, idx) => (
                                <li key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                                            <Plus size={14} className="text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm text-blue-900 font-medium">{item}</span>
                                    </div>
                                    <button 
                                        onClick={() => removeCustomInstallationItem(idx)}
                                        className="text-blue-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Kirjoita lisättävä asennustyö..."
                                value={customItemInput}
                                onChange={(e) => setCustomItemInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                            <button 
                                onClick={handleAddCustomItem}
                                className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
                            >
                                Lisää
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* EXCLUDED & WARNINGS */}
            <div className="space-y-10">
                 <div>
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="bg-red-100 text-red-700 p-1 rounded-full"><X size={14} strokeWidth={3} /></span>
                        Ei sisälly (Asiakkaan vastuulla)
                    </h3>
                    <ul className="space-y-2">
                        {currentLevel.excluded.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 p-1">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                <span className="leading-relaxed">{item}</span>
                            </li>
                        ))}
                         {/* Items that were standard but unchecked now appear here implicitly as exclusions */}
                         {quotation.delivery.unselectedItems.length > 0 && (
                            <>
                                <li className="pt-2 text-xs font-bold text-slate-400 uppercase">Poistettu toimituksesta:</li>
                                {quotation.delivery.unselectedItems.map((item, idx) => (
                                    <li key={`unselected-${idx}`} className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                        <X size={14} className="mt-0.5 flex-shrink-0" />
                                        <span className="leading-relaxed font-medium">{item}</span>
                                    </li>
                                ))}
                            </>
                         )}
                    </ul>
                </div>
                
                {currentLevel.whatIsReady && (
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                        <h3 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <HardHat size={18} />
                            Valmiusaste luovutuksessa
                        </h3>
                        <div className="space-y-4">
                             {currentLevel.whatIsReady.exterior && (
                                <div>
                                    <div className="text-xs font-bold text-blue-700 uppercase mb-1">Ulkopuoli</div>
                                    <ul className="text-sm text-blue-800 space-y-1 pl-1">
                                        {currentLevel.whatIsReady.exterior.map((i,idx) => <li key={idx}>• {i}</li>)}
                                    </ul>
                                </div>
                             )}
                             {currentLevel.whatIsReady.readyFor && (
                                <div>
                                    <div className="text-xs font-bold text-blue-700 uppercase mb-1">Valmis seuraaville</div>
                                    <ul className="text-sm text-blue-800 space-y-1 pl-1">
                                        {currentLevel.whatIsReady.readyFor.map((i,idx) => <li key={idx}>→ {i}</li>)}
                                    </ul>
                                </div>
                             )}
                        </div>
                    </div>
                )}
                
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                     <h3 className="text-base font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Huomioitavaa
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        {currentLevel.pricing.note && <li>{currentLevel.pricing.note}</li>}
                        <li>Asiakas vastaa aina perustusten mittatarkkuudesta.</li>
                        <li>Sähkö- ja vesi tulee olla tontilla saatavilla.</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InstallationTab;