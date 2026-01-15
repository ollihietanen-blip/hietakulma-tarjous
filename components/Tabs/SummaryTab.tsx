import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ASSEMBLY_LEVELS } from '../../types';
import { Printer } from 'lucide-react';

const SummaryTab: React.FC = () => {
  const { quotation, pricing } = useQuotation();
  
  const paidDocuments = quotation.documents.filter(d => d.included); 
  const currentLevel = ASSEMBLY_LEVELS.find(l => l.id === quotation.delivery.assemblyLevelId) || ASSEMBLY_LEVELS[1];
  
  // Group elements by section
  const elementGroups = quotation.elements.filter(s => s.items.length > 0);
  
  // Group products
  const windows = quotation.products.find(s => s.id === 'windows')?.items || [];
  const doors = quotation.products.find(s => s.id === 'doors')?.items || [];
  const materials = quotation.products.filter(s => s.id !== 'windows' && s.id !== 'doors' && s.items.length > 0);
  const hasProducts = windows.length > 0 || doors.length > 0 || materials.length > 0;

  const includedLogistics = quotation.delivery.logistics.filter(l => l.included);

  const getTypeLabel = () => {
    switch(quotation.project.buildingType) {
        case 'omakotitalo': return 'Omakotitalo';
        case 'paritalo': return 'Paritalo';
        case 'loma-asunto': return 'Loma-asunto';
        case 'rivitalo': return 'Rivitalo';
        case 'varastohalli': return 'Varastohalli';
        case 'sauna': return 'Sauna';
        default: return 'Rakennus';
    }
  };

  return (
    <div className="max-w-[210mm] mx-auto pb-20">
      
      {/* Toolbar - Hidden when printing */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 card-shadow print:hidden mb-8">
        <div>
           <h1 className="text-xl font-bold text-slate-900">Yhteenveto & Esikatselu</h1>
           <p className="text-sm text-slate-500">Tarkista tiedot ennen tulostusta tai PDF-tallennusta.</p>
        </div>
        <button 
            className="flex items-center gap-2 bg-hieta-black text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium card-shadow-lg hover-lift"
            onClick={() => window.print()}
        >
            <Printer size={18} />
            Tulosta / PDF
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
             width: 100%;
          }
          .break-before {
            page-break-before: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
        }
        .cover-page {
           background-color: #E8DCC4 !important;
           print-color-adjust: exact;
           -webkit-print-color-adjust: exact;
        }
      `}</style>

      {/* --- KANSILEHTI (COVER PAGE) --- */}
      <div className="cover-page relative w-full aspect-[210/297] print:aspect-auto print:h-screen flex flex-col justify-between p-[60px] text-slate-900 shadow-2xl print:shadow-none mb-8 print:mb-0">
         {/* Yläosa */}
         <div>
          <div style={{ 
            letterSpacing: '0.3em', 
            fontSize: '14px', 
            fontWeight: '300',
            color: '#444',
            textTransform: 'uppercase'
          }}>
            T A R J O U S
          </div>
        </div>

        {/* Keskiosa */}
        <div className="mt-[20%] text-left">
          <h1 className="text-[64px] leading-[1.1] font-bold text-[#1a1a1a] mb-10">
            {getTypeLabel()}
            <br />
            {quotation.project.name}
          </h1>
          
          <div className="text-2xl font-bold text-[#1a1a1a] mb-2">
            {quotation.project.address}
          </div>
          <div className="text-2xl font-bold text-[#1a1a1a] mb-8">
            {quotation.project.postalCode} {quotation.project.city}
          </div>
          <div className="text-xl text-[#444] font-medium">
            {quotation.customer.name}
          </div>
        </div>

        {/* Alaosa */}
        <div>
          <div style={{ 
            borderTop: '4px solid #4A9FD8', 
            paddingTop: '40px',
            marginTop: '60px'
          }}>
            <div className="text-3xl font-bold tracking-widest text-slate-900 uppercase">
              HIETAKULMA
            </div>
            <div className="text-xs mt-4 text-[#444] leading-relaxed font-medium">
              HIETAKULMA OY / Koskenojankatu 11, 38700 Kankaanpää / 2547711-2<br />
              Puh. (02) 5730 300 / etunimi.sukunimi@hietakulma.fi / hietakulma.fi
            </div>
          </div>
        </div>
      </div>

      {/* --- SISÄLTÖSIVUT --- */}
      <div className="bg-white shadow-xl print:shadow-none p-[20mm] text-slate-900 font-sans print:break-before">
         
         {/* Page Header (Repeats on visual but logic usually on first content page) */}
         <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-8">
             <div className="text-2xl font-bold uppercase tracking-tight">HIETAKULMA</div>
             <div className="text-right text-xs text-slate-500">
                 <div>{quotation.project.number} / {quotation.project.name}</div>
                 <div>{new Date().toLocaleDateString('fi-FI')}</div>
             </div>
         </div>

         <h2 className="text-xl font-bold uppercase mb-6">Vastaus tarjouspyyntöönne</h2>
         
         <div className="prose prose-slate max-w-none text-sm mb-12">
            <p>Kiitämme tarjouspyynnöstänne ja tarjoamme Teille oheisen rakenne-, toimitus- ja asennusselostuksen mukaista toimitusta tarjouksesta ilmenevin ehdoin.</p>
            <p>Toivomme tarjouksen täyttävän odotuksenne! Annamme mielellämme lisätietoja tuotteistamme ja toiminnastamme.</p>
            <br />
            <p className="font-bold">Ystävällisin terveisin,</p>
            <p>Hietakulma Oy</p>
         </div>

         {/* 1. YLEISTÄ */}
         <div className="mb-8 break-inside-avoid">
             <h3 className="text-lg font-bold border-b border-slate-200 pb-1 mb-4">1. Yleistä</h3>
             <div className="text-sm space-y-3 text-slate-700">
                 <p>Toimitukseen sisältyy rakennusmateriaalien ja -osien toimitus tämän toimitussisällön mukaisesti sekä niiden mahdollinen asennus tässä toimitussisällössä olevan asennussisällön mukaisesti.</p>
                 <p>Rakenteissa tulee käyttää Hietakulma Oy:n suunnitelmien ja ohjeiden mukaisia ratkaisuja.</p>
                 <div className="bg-hieta-wood-light/30 p-4 border-l-4 border-hieta-blue my-4">
                     <p className="font-bold mb-1">Rakennuspaikka:</p>
                     <p>{quotation.project.address}, {quotation.project.postalCode} {quotation.project.city}</p>
                     <p>Rakennustyyppi: {getTypeLabel()}</p>
                 </div>
             </div>
         </div>

         {/* 2. SUUNNITELMAT */}
         <div className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold border-b border-slate-200 pb-1 mb-4">2. Suunnitelmat ja dokumentit</h3>
            <div className="grid grid-cols-2 gap-8 text-sm">
                {paidDocuments.length > 0 ? (
                    <>
                     <div>
                        <h4 className="font-bold uppercase text-xs text-slate-500 mb-2">Sisältyvät suunnitelmat</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {paidDocuments.map(doc => (
                                <li key={doc.id}>{doc.name}</li>
                            ))}
                        </ul>
                     </div>
                    </>
                ) : (
                    <p className="italic text-slate-500">Ei valittuja suunnitelmia.</p>
                )}
            </div>
         </div>

         {/* 3. TEHDASTUOTANTO */}
         <div className="mb-8">
            <h3 className="text-lg font-bold border-b border-slate-200 pb-1 mb-4">3. Tehtaalla valmistettavat rakenteet</h3>
            {elementGroups.length > 0 ? (
                <div className="space-y-6">
                    {elementGroups.map(section => (
                        <div key={section.id} className="break-inside-avoid">
                            <h4 className="font-bold uppercase text-sm mb-2">{section.title}</h4>
                            <div className="pl-4 border-l-2 border-slate-200 space-y-4">
                                {section.items.map(item => (
                                    <div key={item.id} className="text-sm">
                                        <div className="font-bold text-slate-900">{item.type} ({item.quantity} {item.unit})</div>
                                        <div className="text-slate-700 mt-1 whitespace-pre-line">{item.description}</div>
                                        <div className="mt-1 text-slate-500 text-xs">
                                            {Object.entries(item.specifications).map(([key, val]) => (
                                                val && <span key={key} className="mr-3 inline-block">• {key}: {val}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 italic">Ei tehdastuotteita.</p>
            )}
         </div>

         {/* 4. TYÖMAATOIMITUKSET */}
         <div className="mb-8 print:break-before">
            <h3 className="text-lg font-bold border-b border-slate-200 pb-1 mb-4">4. Työmaatoimitukset</h3>
            {hasProducts ? (
                <div className="space-y-6">
                    {/* Ikkunat */}
                    {windows.length > 0 && (
                        <div className="break-inside-avoid">
                            <h4 className="font-bold uppercase text-sm mb-2">Ikkunat (Pihla Varma)</h4>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-2">Tunnus</th>
                                        <th className="p-2">Koko</th>
                                        <th className="p-2">Tiedot</th>
                                        <th className="p-2 text-right">Määrä</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {windows.map(w => (
                                        <tr key={w.id}>
                                            <td className="p-2 font-medium">{w.tunnus}</td>
                                            <td className="p-2">{w.width}x{w.height}</td>
                                            <td className="p-2 text-slate-600">
                                                U:{w.uValue}, {w.glassType}, <span className="text-hieta-blue font-medium">{w.frameOuterColor}</span>
                                            </td>
                                            <td className="p-2 text-right">{w.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* Materiaalit */}
                    {materials.map(section => (
                        <div key={section.id} className="break-inside-avoid">
                            <h4 className="font-bold uppercase text-sm mb-2">{section.title}</h4>
                            <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                                {section.items.map(item => (
                                    <li key={item.id}>
                                        <span className="font-medium">{item.tunnus}</span>
                                        {item.description && <span className="text-slate-600"> - {item.description}</span>}
                                        <span className="font-bold ml-1">({item.quantity} {item.unit})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 italic">Ei työmaatoimituksia.</p>
            )}
         </div>

         {/* 5. ASENNUS & LOGISTIIKKA */}
         <div className="mb-8 break-inside-avoid">
             <h3 className="text-lg font-bold border-b border-slate-200 pb-1 mb-4">5. Asennus ja Logistiikka</h3>
             
             <div className="grid grid-cols-2 gap-8 mb-6">
                 <div>
                     <h4 className="font-bold uppercase text-xs text-slate-500 mb-2">Asennuslaajuus: {currentLevel.name}</h4>
                     <p className="text-sm text-slate-700 italic mb-4">{currentLevel.description}</p>
                     
                     <div className="text-sm">
                         <div className="font-bold mb-1">Sisältö mm:</div>
                         <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                            {Object.values(currentLevel.included).flat().slice(0, 6).map((i, idx) => (
                                <li key={idx} className="truncate">{i}</li>
                            ))}
                         </ul>
                     </div>
                 </div>
                 
                 <div>
                     <h4 className="font-bold uppercase text-xs text-slate-500 mb-2">Logistiikka</h4>
                     <ul className="text-sm space-y-1">
                         {quotation.delivery.transportation.distanceKm > 0 && (
                             <li>• Rahti ({quotation.delivery.transportation.distanceKm} km)</li>
                         )}
                         {includedLogistics.map(l => (
                             <li key={l.id}>• {l.description}</li>
                         ))}
                         {quotation.delivery.customItems.map((c, i) => (
                             <li key={i} className="text-blue-600 font-medium">• Lisätyö: {c}</li>
                         ))}
                     </ul>
                 </div>
             </div>
             
             <div className="bg-slate-50 p-4 text-sm border-l-4 border-slate-300">
                 <h4 className="font-bold mb-2">Huomioitavaa</h4>
                 <ul className="list-disc list-inside space-y-1 text-slate-700">
                     {currentLevel.excluded.slice(0, 4).map((e, i) => (
                         <li key={i}>{e}</li>
                     ))}
                     <li>Asiakas vastaa perustusten mittatarkkuudesta ja työmaateistä.</li>
                 </ul>
             </div>
         </div>

         {/* LOPPUYHTEENVETO (LAST PAGE) */}
         <div className="border-t-4 border-slate-900 pt-8 mt-12 break-inside-avoid print:break-before">
             <h2 className="text-2xl font-bold uppercase mb-8">Tarjouksen yhteenveto</h2>
             
             <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-6">
                     <div>
                         <div className="text-xs font-bold text-slate-500 uppercase">Hinta</div>
                         <div className="text-3xl font-bold text-slate-900 mt-1">
                             {pricing.totalWithVat.toLocaleString('fi-FI', { minimumFractionDigits: 2 })} €
                         </div>
                         <div className="text-sm text-slate-600">
                             sis. ALV {pricing.vatPercentage}% ({(pricing.vatAmount || 0).toLocaleString('fi-FI', {minimumFractionDigits: 2})} €)
                         </div>
                     </div>
                     
                     <div>
                         <div className="text-xs font-bold text-slate-500 uppercase">Toimitusaika</div>
                         <div className="font-medium">{quotation.project.deliveryWeek || 'Sovitaan erikseen'}</div>
                     </div>

                     <div>
                         <div className="text-xs font-bold text-slate-500 uppercase">Voimassaolo</div>
                         <div className="font-medium">4 viikkoa päiväyksestä</div>
                     </div>
                 </div>

                 <div className="space-y-6">
                     <div>
                         <div className="text-xs font-bold text-slate-500 uppercase mb-2">Maksuerät</div>
                         <table className="w-full text-sm">
                             <tbody>
                                 {quotation.paymentSchedule.map(ms => (
                                     <tr key={ms.id}>
                                         <td className="py-1 pr-4">{ms.description}</td>
                                         <td className="py-1 font-bold text-right">{ms.percentage}%</td>
                                         <td className="py-1 text-right text-slate-500">{(ms.amount || 0).toLocaleString('fi-FI', {maximumFractionDigits:0})} €</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         <div className="text-xs text-slate-500 mt-2">Maksuehto: 14 pv netto.</div>
                     </div>
                 </div>
             </div>

             <div className="mt-16 pt-8 border-t border-slate-200">
                 <div className="grid grid-cols-2 gap-20">
                     <div>
                         <div className="h-20 border-b border-slate-900 mb-2"></div>
                         <div className="font-bold">Hietakulma Oy</div>
                         <div className="text-sm text-slate-500">Olli Hietanen</div>
                     </div>
                     <div>
                         <div className="h-20 border-b border-slate-900 mb-2"></div>
                         <div className="font-bold">{quotation.customer.name}</div>
                         <div className="text-sm text-slate-500">Tilaaja</div>
                     </div>
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default SummaryTab;