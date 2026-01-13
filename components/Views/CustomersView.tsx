import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Users, Search, Plus, MapPin, Phone, Mail, User, Building2, ArrowRight, FolderOpen, History } from 'lucide-react';

interface CustomersViewProps {
  onSelectProject: () => void;
}

const CustomersView: React.FC<CustomersViewProps> = ({ onSelectProject }) => {
  const { quotation, updateCustomer } = useQuotation();
  
  // Mock Customer Database
  const [customers] = useState([
    { id: 1, name: 'Matti Meikäläinen', company: '', email: 'matti.m@example.com', phone: '040 123 4567', address: 'Esimerkkitie 12, Helsinki', type: 'consumer', projectCount: 2 },
    { id: 2, name: 'Rakennus Oy Esimerkki', company: 'Rakennus Oy', email: 'toimisto@rakennus.fi', phone: '050 987 6543', address: 'Teollisuuskatu 5, Tampere', type: 'business', projectCount: 5 },
    { id: 3, name: 'Teppo Testaaja', company: '', email: 'teppo@testi.fi', phone: '044 555 6666', address: 'Mökkitie 8, Levi', type: 'consumer', projectCount: 1 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (c: any) => {
      setSelectedId(c.id);
      // Update Context with selected customer data (simulating loading customer)
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
     // Trigger navigation to project settings to start/edit active project
     onSelectProject();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left List */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="text-blue-600" /> Asiakkaat
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
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <MapPin size={12} /> {c.address}
                        </div>
                        {c.projectCount > 0 && (
                            <div className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                <FolderOpen size={10} /> {c.projectCount}
                            </div>
                        )}
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
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
                  
                  {/* Customer Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                      <div className="flex items-start justify-between mb-6">
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-2 rounded-lg ${customers.find(c=>c.id===selectedId)?.type === 'business' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {customers.find(c=>c.id===selectedId)?.type === 'business' ? <Building2 size={24} /> : <User size={24} />}
                                </div>
                                <h2 className="text-3xl font-display font-bold text-slate-900">{quotation.customer.name}</h2>
                              </div>
                              <p className="text-slate-500 text-lg">{quotation.customer.contactPerson}</p>
                          </div>
                          <button className="text-sm text-blue-600 font-bold hover:underline bg-blue-50 px-4 py-2 rounded-lg">Muokkaa tietoja</button>
                      </div>

                      <div className="grid grid-cols-2 gap-8 text-sm border-t border-slate-100 pt-6">
                          <div className="space-y-4">
                              <div className="flex items-center gap-3 text-slate-700">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                                  <span className="font-medium">{quotation.customer.email}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-700">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                                  <span className="font-medium">{quotation.customer.phone}</span>
                              </div>
                          </div>
                          <div className="space-y-4">
                               <div className="flex items-center gap-3 text-slate-700">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><MapPin size={16} /></div>
                                  <span className="font-medium">{quotation.customer.address}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Projects List */}
                  <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FolderOpen className="text-blue-600" /> Projektit
                        </h3>
                        <button 
                             onClick={handleStartProject}
                             className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors"
                        >
                             <Plus size={16} /> Uusi projekti asiakkaalle
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                           {/* Active "Draft" in Context */}
                           <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 relative group hover:shadow-md transition-all cursor-pointer" onClick={handleStartProject}>
                               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl"></div>
                               <div className="flex justify-between items-start">
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">TYÖN ALLA</span>
                                            <h4 className="font-bold text-lg text-slate-900">{quotation.project.name || 'Uusi nimetön projekti'}</h4>
                                       </div>
                                       <p className="text-sm text-slate-500">{quotation.project.address || 'Ei määritettyä osoitetta'} • Omistaja: {quotation.project.owner}</p>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-xl font-bold text-slate-900">{quotation.pricing.totalWithVat.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</div>
                                       <div className="text-xs text-slate-400 mt-1">Muokattu tänään</div>
                                   </div>
                               </div>
                           </div>

                           {/* Historical Projects (Mock) */}
                           <div className="bg-white rounded-xl border border-slate-200 p-6 opacity-75 hover:opacity-100 transition-opacity">
                               <div className="flex justify-between items-center">
                                   <div>
                                       <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">VALMIS</span>
                                            <h4 className="font-bold text-lg text-slate-700">Autotalli ja Varasto</h4>
                                       </div>
                                       <p className="text-sm text-slate-500">Mökkitie 8 B, Levi • Omistaja: Olli Hietanen</p>
                                   </div>
                                   <div className="text-right">
                                        <div className="text-lg font-bold text-slate-600">12 450 €</div>
                                        <div className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1"><History size={12}/> 24.10.2023</div>
                                   </div>
                               </div>
                           </div>
                           
                           {/* Only show more mock data if 'business' to simulate volume */}
                           {customers.find(c=>c.id===selectedId)?.type === 'business' && (
                               <>
                                <div className="bg-white rounded-xl border border-slate-200 p-6 opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">HÄVINNYT</span>
                                                    <h4 className="font-bold text-lg text-slate-700">Rivitaloyhtiö As Oy Metsä</h4>
                                            </div>
                                            <p className="text-sm text-slate-500">Kantakatu 44, Tampere • Omistaja: Matti Myyjä</p>
                                        </div>
                                        <div className="text-right">
                                                <div className="text-lg font-bold text-slate-600">89 200 €</div>
                                                <div className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1"><History size={12}/> 15.08.2023</div>
                                        </div>
                                    </div>
                                </div>
                               </>
                           )}

                      </div>
                  </div>

              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Users size={40} className="text-slate-300" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-600 mb-2">Valitse asiakas</h2>
                  <p className="text-sm max-w-xs text-center">Valitse asiakas vasemmanpuoleisesta listasta tarkastellaksesi tietoja ja projekteja.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CustomersView;