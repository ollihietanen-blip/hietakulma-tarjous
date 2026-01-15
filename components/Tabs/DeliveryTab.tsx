import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { CheckSquare, Square, Truck, AlertCircle, MapPin, Calculator, ExternalLink } from 'lucide-react';

const DeliveryTab: React.FC = () => {
  const { quotation, toggleLogistics, updateTransportation } = useQuotation();
  
  // Safe access to transportation details
  const transportation = quotation.delivery.transportation || { distanceKm: 0, truckCount: 1, ratePerKm: 2.20 };
  const { distanceKm, truckCount, ratePerKm } = transportation;
  
  const transportTotal = (distanceKm * 2) * ratePerKm * truckCount;

  // Construct Google Maps URL
  // Origin: Koskenojankatu 11, 38700 Kankaanpää
  // Destination: Project Address
  const origin = "Koskenojankatu+11,+38700+Kankaanpää";
  const destination = encodeURIComponent(quotation.project.address || '');
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg card-shadow font-medium hover:border-hieta-wood-accent focus:bg-white focus:border-hieta-blue focus:ring-2 focus:ring-hieta-blue/20 text-sm py-2 px-3 transition-all duration-200 outline-none";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Logistiikka & Rajaukset</h1>
        <p className="text-slate-500">Määritä kuljetukset, nostot ja toimitusrajaukset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
            {/* Transportation Calculator */}
            <div className="bg-white rounded-xl card-shadow border border-slate-200 overflow-hidden hover-lift">
                <div className="px-6 py-4 bg-hieta-blue/5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-hieta-blue" size={20} />
                        <h2 className="text-lg font-bold text-slate-900">Kuljetuskustannukset</h2>
                    </div>
                    <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-hieta-blue hover:text-hieta-blue/80 bg-white border border-hieta-blue/20 hover:bg-hieta-blue/10 px-3 py-1.5 rounded-lg transition-all duration-200 hover-lift"
                    >
                        <ExternalLink size={14} /> Hae kilometrit
                    </a>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Etäisyys (km)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="0"
                                    value={distanceKm}
                                    onChange={(e) => updateTransportation({ distanceKm: Number(e.target.value) })}
                                    className={inputClass}
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-2 text-slate-400 text-sm font-medium">km</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Rekkojen määrä</label>
                            <input 
                                type="number" 
                                min="1"
                                value={truckCount}
                                onChange={(e) => updateTransportation({ truckCount: Number(e.target.value) })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Laskentakaava</div>
                            <div className="text-sm text-slate-600 font-mono">
                                ({distanceKm} km × 2) × {truckCount} kpl × {ratePerKm?.toFixed(2)} €/km
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Meno-paluu veloitus</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Yhteensä</div>
                             <div className="text-2xl font-bold text-slate-900">
                                 {(transportTotal || 0).toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Standard Logistics List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Truck className="text-slate-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-900">Muut logistiikkapalvelut</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {quotation.delivery.logistics.map(item => (
                        <div 
                            key={item.id}
                            className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50 ${item.included ? 'bg-white' : 'bg-slate-50/30'}`}
                            onClick={() => toggleLogistics(item.id)}
                        >
                            <div className={`mt-0.5 flex-shrink-0 ${item.included ? 'text-blue-600' : 'text-slate-300'}`}>
                                {item.included ? <CheckSquare size={24} /> : <Square size={24} />}
                            </div>
                            <div>
                                <span className={`block text-sm font-medium ${item.included ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {item.description}
                                </span>
                                {item.note && (
                                    <span className="text-xs text-slate-400 mt-0.5 block">{item.note}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      
        {/* Right Column */}
        <div className="space-y-8">
            {/* Exclusions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <AlertCircle className="text-slate-400" size={20} />
                        <h2 className="text-lg font-bold text-slate-900">Toimitusrajaukset</h2>
                    </div>
                    <div className="p-6">
                        <ul className="list-disc list-inside space-y-3 text-sm text-slate-600">
                            {quotation.delivery.exclusions.map((exclusion, idx) => (
                                <li key={idx} className="leading-relaxed pl-2 -indent-2">{exclusion}</li>
                            ))}
                        </ul>
                    </div>
            </div>
       </div>
      </div>
    </div>
  );
};

export default DeliveryTab;