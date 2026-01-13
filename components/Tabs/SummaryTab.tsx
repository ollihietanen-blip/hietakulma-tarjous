import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ASSEMBLY_LEVELS } from '../../types';
import { Printer, FileCheck, Phone, Mail, MapPin } from 'lucide-react';

const SummaryTab: React.FC = () => {
  const { quotation, pricing } = useQuotation();
  
  const paidDocuments = quotation.documents.filter(d => d.included); // Show all included, even if price is 0
  const currentLevel = ASSEMBLY_LEVELS.find(l => l.id === quotation.delivery.assemblyLevelId) || ASSEMBLY_LEVELS[1];
  
  // Group elements by section
  const elementGroups = quotation.elements.filter(s => s.items.length > 0);
  
  // Group products
  const windows = quotation.products.find(s => s.id === 'windows')?.items || [];
  const doors = quotation.products.find(s => s.id === 'doors')?.items || [];
  const materials = quotation.products.filter(s => s.id !== 'windows' && s.id !== 'doors' && s.items.length > 0);

  const includedLogistics = quotation.delivery.logistics.filter(l => l.included);

  return (
    <div className="space-y-8 max-w-[210mm] mx-auto pb-20">
      
      {/* Toolbar - Hidden when printing */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
           <h1 className="text-xl font-bold text-slate-900">Yhteenveto & Esikatselu</h1>
           <p className="text-sm text-slate-500">Tarkista tiedot ennen tulostusta tai PDF-tallennusta.</p>
        </div>
        <button 
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-200"
            onClick={() => window.print()}
        >
            <Printer size={18} />
            Tulosta / PDF
        </button>
      </div>

      {/* A4 Preview Container */}
      <div className="bg-white shadow-xl print:shadow-none print:border-none border border-slate-200 min-h-[297mm] p-[15mm] md:p-[20mm] relative text-slate-900 font-sans">
         
         {/* 1. HEADER */}
         <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white p-2 rounded-lg">
                        <FileCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Tarjous</h1>
                        <p className="text-slate-500 font-medium">Toimitussopimus</p>
                    </div>
                </div>
            </div>
            <div className="text-right space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Hietakulma Oy</h2>
                <div className="text-sm text-slate-600 flex items-center justify-end gap-2">
                    <span>Kuninkaanlähteenkatu 8</span> <MapPin size={14}/>
                </div>
                <div className="text-sm text-slate-600">38700 Kankaanpää</div>
                <div className="text-sm text-slate-600 flex items-center justify-end gap-2 mt-2">
                    <span>044 123 4567</span> <Phone size={14}/>
                </div>
                <div className="text-sm text-slate-600 flex items-center justify-end gap-2">
                    <span>myynti@hietakulma.fi</span> <Mail size={14}/>
                </div>
            </div>
         </div>

         {/* 2. INFO GRID */}
         <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Tilaaja / Asiakas</h3>
                <div className="text-sm space-y-1">
                    <div className="font-bold text-lg text-slate-900">{quotation.customer.name}</div>
                    {quotation.customer.businessId && <div>Y-tunnus: {quotation.customer.businessId}</div>}
                    <div>{quotation.customer.address}</div>
                    <div className="pt-2 flex items-center gap-2 text-slate-600">
                        <Mail size={14}/> {quotation.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14}/> {quotation.customer.phone}
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Toimituskohde & Tiedot</h3>
                 <div className="text-sm space-y-1">
                     <div className="font-bold text-lg text-slate-900">{quotation.project.name}</div>
                     <div>{quotation.project.address}</div>
                     <div className="pt-3 grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-slate-500 text-xs block">Tarjousnumero</span>
                            <span className="font-medium">{quotation.project.number}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs block">Päiväys</span>
                            <span className="font-medium">{quotation.project.offerDate.toLocaleDateString('fi-FI')}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs block">Rakennustyyppi</span>
                            <span className="font-medium capitalize">{quotation.project.buildingType}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs block">Toimitusarvio</span>
                            <span className="font-medium">{quotation.project.deliveryWeek || 'Sovitaan erikseen'}</span>
                        </div>
                     </div>
                 </div>
            </div>
         </div>

         {/* 3. CONTENT SECTIONS */}
         <div className="space-y-10 mb-12">
            
            {/* A. Factory Production */}
            {elementGroups.length > 0 && (
                <div>
                    <h3 className="text-base font-bold text-white bg-slate-800 px-4 py-1.5 rounded-t-lg inline-block">1. Tehdastuotanto</h3>
                    <div className="border border-slate-200 rounded-b-lg rounded-tr-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase text-left">
                                <tr>
                                    <th className="px-4 py-3 w-1/4">Elementtityyppi</th>
                                    <th className="px-4 py-3">Kuvaus / Tekniset tiedot</th>
                                    <th className="px-4 py-3 text-right w-24">Määrä</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {elementGroups.map(section => (
                                    <React.Fragment key={section.id}>
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={3} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wide">
                                                {section.title}
                                            </td>
                                        </tr>
                                        {section.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium align-top">{item.type}</td>
                                                <td className="px-4 py-3 text-slate-600 align-top">
                                                    <div className="mb-1">{item.description}</div>
                                                    <div className="text-xs text-slate-400">
                                                        U-arvo: {item.specifications.uValue} | 
                                                        Verhous: {item.specifications.cladding || '-'}
                                                        {item.hasWindowInstall && ` | Sis. ikkuna-asennus (${item.windowCount} kpl)`}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium align-top">{item.quantity} {item.unit}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* B. Site Deliveries */}
            {(windows.length > 0 || doors.length > 0 || materials.length > 0) && (
                <div>
                    <h3 className="text-base font-bold text-white bg-slate-800 px-4 py-1.5 rounded-t-lg inline-block">2. Työmaatoimitukset</h3>
                    <div className="border border-slate-200 rounded-b-lg rounded-tr-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase text-left">
                                <tr>
                                    <th className="px-4 py-3 w-1/4">Tuote / Tunnus</th>
                                    <th className="px-4 py-3">Tiedot</th>
                                    <th className="px-4 py-3 text-right w-24">Määrä</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Windows */}
                                {windows.length > 0 && (
                                    <>
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={3} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wide">Ikkunat</td>
                                        </tr>
                                        {windows.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium align-top">{item.tunnus}</td>
                                                <td className="px-4 py-3 text-slate-600 align-top">
                                                    {item.manufacturer} {item.width}x{item.height}
                                                    <div className="text-xs text-slate-400">U: {item.uValue}, {item.glassType}, {item.frameInnerColor}/{item.frameOuterColor}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium align-top">{item.quantity} kpl</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                                {/* Doors */}
                                {doors.length > 0 && (
                                    <>
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={3} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wide">Ovet</td>
                                        </tr>
                                        {doors.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium align-top">{item.tunnus}</td>
                                                <td className="px-4 py-3 text-slate-600 align-top">
                                                    {item.manufacturer} {item.width}x{item.height}
                                                    <div className="text-xs text-slate-400">{item.lock?.type || 'Vakio'} lukitus, {item.frameInnerColor}/{item.frameOuterColor}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium align-top">{item.quantity} kpl</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                                {/* Other Materials */}
                                {materials.map(section => (
                                    <React.Fragment key={section.id}>
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={3} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wide">{section.title}</td>
                                        </tr>
                                        {section.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium align-top">{item.tunnus}</td>
                                                <td className="px-4 py-3 text-slate-600 align-top">{item.description}</td>
                                                <td className="px-4 py-3 text-right font-medium align-top">{item.quantity} {item.unit}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* C. Services, Installation & Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 break-inside-avoid">
                 {/* Left: Installation Scope */}
                 <div>
                    <h3 className="text-base font-bold text-white bg-slate-800 px-4 py-1.5 rounded-t-lg inline-block">3. Asennus & Palvelut</h3>
                    <div className="border border-slate-200 rounded-b-lg rounded-tr-lg p-5 bg-slate-50/50 h-full">
                        <div className="mb-4">
                            <div className="font-bold text-lg text-slate-900 mb-1 flex items-center gap-2">
                                {currentLevel.name}
                            </div>
                            <p className="text-sm text-slate-600 italic">{currentLevel.description}</p>
                        </div>
                        
                        <div className="space-y-3">
                             {/* Standard Inclusions (Summary) */}
                             <div>
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Sisältää mm:</div>
                                <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                                    {Object.values(currentLevel.included).flat().slice(0, 5).map((inc, i) => (
                                        <li key={i} className="truncate">{inc}</li>
                                    ))}
                                    <li>...sekä muut laajuuden mukaiset työt.</li>
                                </ul>
                             </div>

                             {/* Custom Additions */}
                             {quotation.delivery.customItems.length > 0 && (
                                 <div className="pt-2 border-t border-slate-200">
                                     <div className="text-xs font-bold text-blue-600 uppercase mb-1">Lisäpalvelut:</div>
                                     <ul className="text-sm text-blue-800 list-disc list-inside font-medium">
                                         {quotation.delivery.customItems.map((item, i) => (
                                             <li key={i}>{item}</li>
                                         ))}
                                     </ul>
                                 </div>
                             )}

                             {/* Exclusions / Unselected */}
                             {quotation.delivery.unselectedItems.length > 0 && (
                                 <div className="pt-2 border-t border-slate-200">
                                     <div className="text-xs font-bold text-red-500 uppercase mb-1">Poistettu toimituksesta:</div>
                                     <ul className="text-sm text-red-700 list-disc list-inside">
                                         {quotation.delivery.unselectedItems.map((item, i) => (
                                             <li key={i}>{item}</li>
                                         ))}
                                     </ul>
                                 </div>
                             )}
                        </div>
                    </div>
                 </div>

                 {/* Right: Logistics & Documents */}
                 <div className="flex flex-col gap-6">
                     
                     {/* Logistics */}
                     <div>
                        <h4 className="text-sm font-bold text-slate-700 uppercase mb-2 border-b border-slate-200 pb-1">Logistiikka</h4>
                        <ul className="text-sm space-y-2">
                            {includedLogistics.map(l => (
                                <li key={l.id} className="flex justify-between">
                                    <span className="text-slate-700">{l.description}</span>
                                    <span className="font-bold text-slate-900">Sisältyy</span>
                                </li>
                            ))}
                        </ul>
                     </div>

                     {/* Documents */}
                     <div>
                        <h4 className="text-sm font-bold text-slate-700 uppercase mb-2 border-b border-slate-200 pb-1">Suunnitelmat</h4>
                        <ul className="text-sm space-y-1">
                            {paidDocuments.map(d => (
                                <li key={d.id} className="flex justify-between">
                                    <span className="text-slate-700">{d.name}</span>
                                    <span className="font-bold text-slate-900">
                                        {d.price > 0 ? `${d.price} €` : 'Sisältyy'}
                                    </span>
                                </li>
                            ))}
                            {paidDocuments.length === 0 && <li className="text-slate-400 italic">Ei valittuja dokumentteja</li>}
                        </ul>
                     </div>
                 </div>
            </div>
         </div>

         {/* 4. PRICING SUMMARY */}
         <div className="break-inside-avoid mb-12">
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                     
                     {/* VAT Info */}
                     <div className="text-sm text-slate-500 max-w-md">
                         {pricing.vatMode === 'construction_service' ? (
                             <div className="space-y-1">
                                 <p className="font-bold text-slate-700">Rakentamispalvelun käännetty verovelvollisuus (AVL 8c §)</p>
                                 <p>Ostaja on verovelvollinen rakentamispalvelun myynnistä. Hinnat on esitetty verottomina (ALV 0%).</p>
                             </div>
                         ) : (
                             <div className="space-y-1">
                                 <p>Hinnat sisältävät arvonlisäveron {pricing.vatPercentage.toLocaleString('fi-FI')} %.</p>
                                 <p>Veron osuus yhteensä: <span className="font-medium text-slate-900">{pricing.vatAmount.toLocaleString('fi-FI', {minimumFractionDigits: 2})} €</span></p>
                             </div>
                         )}
                     </div>

                     {/* Total Price */}
                     <div className="text-right">
                         <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Kokonaishinta</div>
                         <div className="text-4xl font-bold text-slate-900 tracking-tight">
                             {pricing.totalWithVat.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                         </div>
                     </div>
                 </div>
             </div>
         </div>

         {/* 5. PAYMENT SCHEDULE */}
         <div className="mb-16 break-inside-avoid">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-1">Maksuerät</h3>
             <table className="w-full text-sm">
                 <thead className="text-left text-slate-500 font-medium">
                     <tr>
                         <th className="pb-2 w-12">Erä</th>
                         <th className="pb-2">Maksuerän aihe / kuvaus</th>
                         <th className="pb-2 text-right w-24">Osuus</th>
                         <th className="pb-2 text-right w-32">Summa</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {quotation.paymentSchedule.map(ms => (
                         <tr key={ms.id}>
                             <td className="py-2 font-bold text-slate-700">{ms.order}.</td>
                             <td className="py-2 text-slate-600">{ms.description}</td>
                             <td className="py-2 text-right text-slate-600">{ms.percentage} %</td>
                             <td className="py-2 text-right font-medium text-slate-900">{ms.amount.toLocaleString('fi-FI', {minimumFractionDigits: 2})} €</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
             <div className="mt-4 text-xs text-slate-400">
                 Maksuehto: 14 pv netto. Viivästyskorko korkolain mukaan.
             </div>
         </div>

         {/* 6. SIGNATURES */}
         <div className="break-inside-avoid pt-8 border-t-2 border-slate-100">
             <div className="grid grid-cols-2 gap-20">
                 <div>
                     <div className="h-16"></div>
                     <div className="border-t border-slate-400 pt-2">
                         <p className="font-bold text-slate-900">Paikka ja aika</p>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-8">
                     <div>
                        <div className="h-16"></div>
                        <div className="border-t border-slate-400 pt-2">
                            <p className="font-bold text-slate-900">Hietakulma Oy</p>
                            <p className="text-xs text-slate-500">Myyjän allekirjoitus</p>
                        </div>
                     </div>
                     <div>
                        <div className="h-16"></div>
                        <div className="border-t border-slate-400 pt-2">
                            <p className="font-bold text-slate-900">{quotation.customer.name}</p>
                            <p className="text-xs text-slate-500">Tilaajan allekirjoitus</p>
                        </div>
                     </div>
                 </div>
             </div>
         </div>

         {/* Footer Info */}
         <div className="absolute bottom-6 left-10 right-10 text-center text-[10px] text-slate-400 border-t border-slate-50 pt-4">
             Tarjous on voimassa 14 vuorokautta päiväyksestä. Toimitus ehtojen mukaisesti. Pidätämme oikeuden hinnanmuutoksiin.
         </div>

      </div>
    </div>
  );
};

export default SummaryTab;