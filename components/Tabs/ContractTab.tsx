import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FileSignature, Printer, CheckCircle2, Calendar, Send, FileStack } from 'lucide-react';
import SendInstructionsModal from '../Modals/SendInstructionsModal';

const ContractTab: React.FC = () => {
  const { quotation, pricing, workflow, markInstructionsSent } = useQuotation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Derived Data
  const contractNumber = quotation.contract?.contractNumber || quotation.project.number;
  const isSigned = quotation.status === 'accepted';
  const signDate = quotation.contract?.signDate ? new Date(quotation.contract.signDate).toLocaleDateString() : '';

  const handleSendInstructions = (instructions: string[]) => {
      markInstructionsSent(instructions);
      setIsModalOpen(false);
      alert(`Ohjeet (${instructions.join(', ')}) lähetetty onnistuneesti!`);
  };

  return (
    <>
      <SendInstructionsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendInstructions}
        alreadySent={quotation.sentInstructions.map(i => i.name)}
      />

      <div className="max-w-[210mm] mx-auto pb-20">
          
        {/* Action Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow mb-8 flex items-center justify-between print:hidden">
            <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileSignature className="text-hieta-blue" /> Toimitussopimus
                </h1>
                <p className="text-sm text-slate-500">Tarkista ja hyväksy sopimus luodaksesi kaupan.</p>
            </div>
            <div className="flex gap-4">
                <button 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => window.print()}
                >
                    <Printer size={16} /> Tulosta
                </button>
                
                {!isSigned ? (
                    <button 
                      className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors animate-pulse"
                      onClick={() => {
                          if(window.confirm('Haluatko allekirjoittaa sopimuksen ja hyväksyä kaupan?')) {
                              workflow.markAccepted();
                          }
                      }}
                    >
                        <FileSignature size={18} /> Allekirjoita sopimus
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 size={18} /> Allekirjoitettu {signDate}
                    </div>
                )}
            </div>
        </div>

        {/* Post-Acceptance Actions */}
        {isSigned && (
            <div className="bg-hieta-blue/10 border-2 border-dashed border-hieta-blue/30 rounded-xl p-6 mb-8 print:hidden animate-in fade-in">
                <h2 className="font-bold text-lg text-hieta-blue flex items-center gap-2">
                    <FileStack /> Jälkitoimenpiteet
                </h2>
                <p className="text-sm text-slate-700 mt-2 mb-4">Sopimus on hyväksytty. Voit nyt lähettää asiakkaalle ja muille osapuolille tarvittavat ohjeet ja dokumentit.</p>
                
                <div className="flex items-start gap-6">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-hieta-black hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-lg flex items-center gap-2 card-shadow hover-lift transition-all duration-200"
                    >
                        <Send size={16} /> Lähetä ohjeet ja dokumentit
                    </button>
                    {quotation.sentInstructions.length > 0 && (
                        <div className="text-xs">
                            <div className="font-bold text-slate-600 uppercase mb-2">Lähetetyt ohjeet:</div>
                            <ul className="space-y-1 text-slate-500">
                                {quotation.sentInstructions.map(item => (
                                    <li key={item.name} className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-green-500" />
                                        <span>{item.name} ({new Date(item.sentAt).toLocaleDateString()})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* DOCUMENT PREVIEW */}
        <div className="bg-white shadow-xl p-[20mm] min-h-[297mm] text-slate-900 font-serif print:shadow-none print:p-0">
            
            <div className="text-center mb-12 border-b-2 border-black pb-6">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">Pienurakkasopimus</h1>
                <p className="text-sm uppercase tracking-wide">RT 80265 / Rakennusalan pienurakkasopimus</p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-10 text-sm">
                <div>
                    <h3 className="font-bold uppercase border-b border-black mb-2">1. Urakoitsija / Myyjä</h3>
                    <div className="space-y-1">
                        <p className="font-bold">Hietakulma Oy</p>
                        <p>2547711-2</p>
                        <p>Koskenojankatu 11</p>
                        <p>38700 Kankaanpää</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold uppercase border-b border-black mb-2">2. Tilaaja / Ostaja</h3>
                    <div className="space-y-1">
                        <p className="font-bold">{quotation.customer.name}</p>
                        <p>{quotation.customer.businessId}</p>
                        <p>{quotation.customer.address}</p>
                        <p>{quotation.customer.email}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8 text-sm">
                <h3 className="font-bold uppercase border-b border-black mb-2">3. Rakennuspaikka</h3>
                <p>{quotation.project.address}, {quotation.project.postalCode} {quotation.project.city}</p>
                <p>Rakennus: {quotation.project.buildingType}, "{quotation.project.name}"</p>
            </div>

            <div className="mb-8 text-sm">
                <h3 className="font-bold uppercase border-b border-black mb-2">4. Urakkasuoritus</h3>
                <p className="mb-2">Urakoitsija sitoutuu toimittamaan tilaajalle erillisen tarjousliitteen (Päivätty {quotation.updatedAt.toLocaleDateString()}) mukaisen materiaalitoimituksen ja asennustyön.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Tehdastuotteet (Elementit ja Ristikot)</li>
                    <li>Työmaatoimitukset</li>
                    <li>Asennustyö: {quotation.delivery.assemblyLevelId}</li>
                </ul>
            </div>

            <div className="mb-8 text-sm">
                <h3 className="font-bold uppercase border-b border-black mb-2">5. Urakkahinta</h3>
                <div className="flex justify-between w-1/2 font-bold mb-1">
                    <span>Arvonlisäveroton hinta:</span>
                    <span>{pricing.sellingPriceExVat.toLocaleString('fi-FI', {minimumFractionDigits: 2})} €</span>
                </div>
                <div className="flex justify-between w-1/2 font-bold mb-1">
                    <span>Arvonlisävero ({pricing.vatPercentage}%):</span>
                    <span>{pricing.vatAmount.toLocaleString('fi-FI', {minimumFractionDigits: 2})} €</span>
                </div>
                <div className="flex justify-between w-1/2 font-bold text-lg border-t border-black pt-1 mt-1">
                    <span>Yhteensä:</span>
                    <span>{pricing.totalWithVat.toLocaleString('fi-FI', {minimumFractionDigits: 2})} €</span>
                </div>
            </div>

            <div className="mb-8 text-sm">
                <h3 className="font-bold uppercase border-b border-black mb-2">6. Maksuerät</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-300">
                                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-left">Kuvaus</th>
                                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Osuus</th>
                                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Summa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.paymentSchedule.map((ms, index) => (
                                <tr key={ms.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <td className="py-3 px-4 font-medium text-slate-900">{ms.description}</td>
                                    <td className="py-3 px-4 text-right font-medium text-slate-700">{ms.percentage}%</td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">{(ms.amount || 0).toLocaleString('fi-FI', {maximumFractionDigits:0})} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-2 text-xs">Maksuehto 14 pv netto. Viivästyskorko korkolain mukainen.</p>
            </div>

            <div className="mb-8 text-sm">
                <h3 className="font-bold uppercase border-b border-black mb-2">7. Suoritusaika</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-xs font-bold uppercase text-slate-500">Toimitusviikko</span>
                        <div className="font-medium">{quotation.project.deliveryWeek || 'Sovitaan erikseen'}</div>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-24 border-t-2 border-black pt-8 grid grid-cols-2 gap-16">
                
                <div>
                    <div className="h-20 border-b border-dashed border-slate-400 mb-2 flex items-end pb-2">
                         {isSigned ? (
                             <div className="font-cursive text-2xl text-blue-800 ml-4 font-bold italic" style={{fontFamily: 'cursive'}}>
                                 Olli Hietanen
                             </div>
                         ) : null}
                    </div>
                    <div className="text-sm font-bold uppercase">Urakoitsija</div>
                    <div className="text-xs">Hietakulma Oy</div>
                    <div className="text-xs mt-1">{quotation.contract?.signingPlace}, {signDate || '___________'}</div>
                </div>

                <div>
                    <div className="h-20 border-b border-dashed border-slate-400 mb-2 flex items-end pb-2">
                        {isSigned ? (
                             <div className="font-cursive text-2xl text-slate-800 ml-4 font-bold italic" style={{fontFamily: 'cursive'}}>
                                 {quotation.customer.contactPerson} (Sähköinen Allekirjoitus)
                             </div>
                         ) : null}
                    </div>
                    <div className="text-sm font-bold uppercase">Tilaaja</div>
                    <div className="text-xs">{quotation.customer.name}</div>
                    <div className="text-xs mt-1">{quotation.contract?.signingPlace}, {signDate || '___________'}</div>
                </div>

            </div>

        </div>
      </div>
    </>
  );
};

export default ContractTab;