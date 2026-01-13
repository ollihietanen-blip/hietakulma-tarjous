import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Users, Search, Plus, MapPin, Phone, Mail, User, Building2, ArrowRight } from 'lucide-react';

interface CRMViewProps {
  onSelectProject: () => void;
}

const CRMView: React.FC<CRMViewProps> = ({ onSelectProject }) => {
  const { quotation, updateCustomer, updateProject } = useQuotation();
  
  // Mock Customer Database
  const [customers] = useState([
    { id: 1, name: 'Matti Meikäläinen', company: '', email: 'matti.m@example.com', phone: '040 123 4567', address: 'Esimerkkitie 12, Helsinki', type: 'consumer' },
    { id: 2, name: 'Rakennus Oy Esimerkki', company: 'Rakennus Oy', email: 'toimisto@rakennus.fi', phone: '050 987 6543', address: 'Teollisuuskatu 5, Tampere', type: 'business' },
    { id: 3, name: 'Teppo Testaaja', company: '', email: 'teppo@testi.fi', phone: '044 555 6666', address: 'Mökkitie 8, Levi', type: 'consumer' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (c: any) => {
      setSelectedId(c.id);
      // Update Context with selected customer data
      updateCustomer({
          name: c.company || c.name,
          contactPerson: c.company ? c.name : c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          billingMethod: c.type === 'business' ? 'e-invoice' : 'email'
      });
  };

  const handleStartProject = () => {
     // Reset project details somewhat for a new flow, or keep existing if continuing
     onSelectProject();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left List */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="text-blue-600" /> Asiakasrekisteri
              </h1>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Hae asiakasta..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          <div className="flex-1 overflow-y-auto">
              {filteredCustomers.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${selectedId === c.id ? 'bg-blue-50 border-blue-100' : ''}`}
                  >
                      <div className="flex justify-between items-start mb-1">
                          <span className={`font-bold ${selectedId === c.id ? 'text-blue-900' : 'text-slate-900'}`}>
                              {c.company || c.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {c.type === 'business' ? 'Yritys' : 'Kuluttaja'}
                          </span>
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin size={12} /> {c.address}
                      </div>
                  </div>
              ))}
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-colors">
                  <Plus size={16} /> Uusi Asiakas
              </button>
          </div>
      </div>

      {/* Right Details */}
      <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
          {selectedId ? (
              <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
                  
                  {/* Customer Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                      <div className="flex items-start justify-between mb-6">
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-2 rounded-lg ${customers.find(c=>c.id===selectedId)?.type === 'business' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {customers.find(c=>c.id===selectedId)?.type === 'business' ? <Building2 size={24} /> : <User size={24} />}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{quotation.customer.name}</h2>
                              </div>
                              <p className="text-slate-500">{quotation.customer.contactPerson}</p>
                          </div>
                          <button className="text-sm text-blue-600 font-bold hover:underline">Muokkaa tietoja</button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="space-y-3">
                              <div className="flex items-center gap-3 text-slate-600">
                                  <Mail size={16} className="text-slate-400" />
                                  {quotation.customer.email}
                              </div>
                              <div className="flex items-center gap-3 text-slate-600">
                                  <Phone size={16} className="text-slate-400" />
                                  {quotation.customer.phone}
                              </div>
                          </div>
                          <div className="space-y-3">
                               <div className="flex items-start gap-3 text-slate-600">
                                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                                  <span>{quotation.customer.address}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Projects List */}
                  <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 ml-1">Asiakkaan projektit</h3>
                      
                      <div className="space-y-4">
                           {/* Active "Draft" in Context */}
                           <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 relative group hover:shadow-md transition-all">
                               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl"></div>
                               <div className="flex justify-between items-center">
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">LUONNOS</span>
                                            <h4 className="font-bold text-slate-900">{quotation.project.name || 'Uusi projekti'}</h4>
                                       </div>
                                       <p className="text-sm text-slate-500">{quotation.project.address || 'Ei osoitetta'}</p>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-xl font-bold text-slate-900">{quotation.pricing.totalWithVat.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</div>
                                       <div className="text-xs text-slate-400">Päivitetty tänään</div>
                                   </div>
                               </div>
                               <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                   <button 
                                      onClick={handleStartProject}
                                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                                   >
                                       Avaa projekti <ArrowRight size={16} />
                                   </button>
                               </div>
                           </div>

                           {/* Placeholder for history */}
                           <div className="bg-slate-100 rounded-xl border border-slate-200 p-6 opacity-60">
                               <div className="flex justify-between items-center">
                                   <div>
                                        <h4 className="font-bold text-slate-700">Terassi ja Pihavarasto</h4>
                                        <p className="text-sm text-slate-500">Valmistunut 2023</p>
                                   </div>
                                   <div className="text-right">
                                        <div className="text-lg font-bold text-slate-600">12 450 €</div>
                                        <div className="text-xs text-green-600 font-bold">LASKUTETTU</div>
                                   </div>
                               </div>
                           </div>
                      </div>
                  </div>

              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Valitse asiakas listasta</p>
                  <p className="text-sm">Tai luo uusi asiakas aloittaaksesi</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CRMView;