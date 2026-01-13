

import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { UserRole } from '../../App';
import { Clock, Plus, ArrowUpRight, CheckCircle, AlertCircle, FileText, TrendingUp, Users, Target, Edit2, Save, X, Trophy, Briefcase, BarChart, ShieldAlert, BadgePercent, Coins } from 'lucide-react';

interface DashboardHomeProps {
  onNewQuote: () => void;
  userRole?: UserRole;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNewQuote, userRole = 'sales' }) => {
  const { quotation } = useQuotation();

  // --- SALESPERSON STATE ---
  const [monthlyTarget, setMonthlyTarget] = useState(200000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTargetInput, setTempTargetInput] = useState(monthlyTarget.toString());

  // Mock data for realized sales
  const currentSales = 145000;
  
  // Calculate Progress
  const progressPercent = Math.min((currentSales / monthlyTarget) * 100, 100);
  const remaining = Math.max(monthlyTarget - currentSales, 0);
  const isAhead = progressPercent > (new Date().getDate() / 30) * 100;

  // Handle Target Update
  const saveTarget = () => {
      const val = Number(tempTargetInput);
      if (!isNaN(val) && val > 0) {
          setMonthlyTarget(val);
          setIsEditingTarget(false);
      }
  };

  // --- MANAGER STATE (Mock) ---
  const companySales = 1250000;
  const companyTarget = 1500000;
  const companyProgress = (companySales / companyTarget) * 100;

  // --- SHARED MOCK DATA ---
  const recentQuotes = [
    { id: '1', customer: 'Matti Meikäläinen', project: 'Loma-asunto Levi', price: '45 200 €', status: 'Avoin', date: '2 pv sitten', owner: 'Olli Hietanen' },
    { id: '2', customer: 'Rakennus Oy Esimerkki', project: 'Rivitalo Espoo', price: '128 500 €', status: 'Luonnos', date: '5 pv sitten', owner: 'Olli Hietanen' },
    { id: '3', customer: 'Teppo Testaaja', project: 'Autotalli', price: '12 800 €', status: 'Hyväksytty', date: '1 vk sitten', owner: 'Matti Myyjä' },
    { id: '4', customer: 'As Oy Saimaa', project: 'Rivitalo 4 as.', price: '320 000 €', status: 'Odottaa hyväksyntää', date: '1 pv sitten', owner: 'Pekka Pomo', needsApproval: true },
  ];

  // Filter quotes based on role (Manager sees all, Sales sees theirs)
  const visibleQuotes = userRole === 'manager' 
    ? recentQuotes 
    : recentQuotes.filter(q => q.owner === 'Olli Hietanen');

  const stats = userRole === 'sales' ? [
      { label: 'Omat avoimet', value: '14', unit: 'kpl', change: '+2', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Oma myynti (kk)', value: (currentSales / 1000).toFixed(0), unit: 't€', change: '+12%', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Keskim. kate', value: '28.5', unit: '%', change: '-1.2%', color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : [
      { label: 'Koko yritys (kk)', value: (companySales / 1000).toFixed(0), unit: 't€', change: '+5%', color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Avoimet tarjoukset', value: '42', unit: 'kpl', change: '+8', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Hyväksynnät', value: '3', unit: 'kpl', change: 'Kiire', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-display font-bold text-slate-900">Hei, Olli</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${userRole === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {userRole === 'manager' ? 'Myyntipäällikkö' : 'Myyntiedustaja'}
                </span>
            </div>
            <p className="text-slate-500">
                {userRole === 'sales' ? 'Tässä on katsaus omiin tavoitteisiisi.' : 'Tässä on katsaus koko tiimin tilanteeseen.'}
            </p>
        </div>
        <button 
            onClick={onNewQuote}
            className="bg-hieta-black text-white px-5 py-3 rounded-md font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
        >
            <Plus size={18} /> Uusi tarjouslaskelma
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors">
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-3xl font-display font-bold text-slate-900 flex items-baseline gap-1">
                        {stat.value}
                        <span className="text-sm font-sans font-medium text-slate-400">{stat.unit}</span>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${stat.bg} ${stat.color}`}>
                    <ArrowUpRight size={12} /> {stat.change}
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List (Quotes) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h2 className="font-display font-bold text-lg text-slate-800">
                    {userRole === 'manager' ? 'Kaikki viimeisimmät tarjoukset' : 'Omat viimeisimmät tarjoukset'}
                 </h2>
                 <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase">Näytä kaikki</button>
             </div>
             <div className="divide-y divide-slate-50">
                {/* Active draft */}
                <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border-l-4 border-blue-500 bg-blue-50/10" onClick={onNewQuote}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{quotation.project.name || 'Nimetön luonnos (Nykyinen)'}</div>
                            <div className="text-xs text-slate-500">{quotation.customer.name || 'Ei asiakasta'} • Muokattu juuri nyt</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900">{quotation.pricing.totalWithVat.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">TYÖN ALLA</div>
                    </div>
                </div>

                {visibleQuotes.map(quote => (
                    <div key={quote.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${quote.needsApproval ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                {quote.needsApproval ? <ShieldAlert size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">{quote.project}</div>
                                <div className="text-xs text-slate-500">
                                    {quote.customer} • {quote.date} 
                                    {userRole === 'manager' && <span className="text-slate-400"> • {quote.owner}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-slate-900">{quote.price}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 
                                ${quote.status === 'Hyväksytty' ? 'text-green-600 bg-green-50' : 
                                  quote.needsApproval ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100'}`}>
                                {quote.status}
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* Sidebar Widgets - CONDITIONAL BASED ON ROLE */}
          <div className="space-y-6">
              
              {/* === SALESPERSON VIEW: TARGET & COMMISSION === */}
              {userRole === 'sales' && (
                  <>
                    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg border border-slate-800 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                                    <Target className="text-blue-400" size={20} /> Myyntitavoite
                                </h3>
                                {!isEditingTarget ? (
                                    <button 
                                        onClick={() => {
                                            setTempTargetInput(monthlyTarget.toString());
                                            setIsEditingTarget(true);
                                        }} 
                                        className="text-slate-400 hover:text-white transition-colors"
                                        title="Muokkaa tavoitetta"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={saveTarget} className="text-green-400 hover:text-green-300"><Save size={16} /></button>
                                        <button onClick={() => setIsEditingTarget(false)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                                    </div>
                                )}
                            </div>

                            {isEditingTarget ? (
                                <div className="mb-6">
                                    <label className="text-xs text-slate-400 uppercase font-bold">Uusi tavoite (€)</label>
                                    <input 
                                        type="number" 
                                        value={tempTargetInput}
                                        onChange={(e) => setTempTargetInput(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-bold mt-1 outline-none focus:border-blue-500"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <div className="flex items-end gap-2 mb-1">
                                        <span className="text-3xl font-bold text-white">{currentSales.toLocaleString('fi-FI')} €</span>
                                        <span className="text-sm text-slate-400 mb-1">/ {monthlyTarget.toLocaleString('fi-FI')} €</span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Toteuma</span>
                                    <span className={`font-bold ${progressPercent >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
                                        {progressPercent.toFixed(1)} %
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800">
                                    <span className="text-slate-400">Jäljellä</span>
                                    <span className="font-bold text-white">
                                        {remaining > 0 ? remaining.toLocaleString('fi-FI') + ' €' : 'Tavoite saavutettu!'}
                                    </span>
                                </div>
                            </div>

                            {remaining === 0 && (
                                <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                                    <Trophy className="text-green-400" size={20} />
                                    <span className="text-xs font-bold text-green-300">Hienoa! Kuukauden tavoite on täynnä.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Commission Widget (Sales Only) */}
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 shadow-sm p-6">
                        <h3 className="font-display font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                            <Coins size={20} className="text-emerald-600" /> Arvioitu Provisio
                        </h3>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-bold text-emerald-700">5 800 €</span>
                            <span className="text-sm text-emerald-600 font-medium">tästä kuusta</span>
                        </div>
                        <p className="text-xs text-emerald-500 mb-4">Perustuu 4% keskimääräiseen provisioon.</p>
                        <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[70%]"></div>
                        </div>
                    </div>
                  </>
              )}


              {/* === MANAGER VIEW: TEAM & APPROVALS === */}
              {userRole === 'manager' && (
                  <>
                     <div className="bg-purple-900 text-white rounded-xl p-6 shadow-lg border border-purple-800 relative overflow-hidden">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                            <BarChart className="text-purple-300" size={20} /> Yrityksen myynti
                        </h3>
                        <div className="mb-4">
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-3xl font-bold text-white">{companySales.toLocaleString('fi-FI')} €</span>
                                <span className="text-sm text-purple-300 mb-1">/ {companyTarget.toLocaleString('fi-FI')} €</span>
                            </div>
                            <div className="h-3 w-full bg-purple-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                                    style={{ width: `${companyProgress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-sm text-purple-200">
                             Hienoa! Tiimi on <span className="font-bold text-white">83%</span> tavoitteesta.
                        </div>
                     </div>

                     <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6">
                         <h3 className="font-display font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                             <ShieldAlert size={20} className="text-amber-500" /> Hyväksynnät
                         </h3>
                         <div className="space-y-3">
                             <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100 cursor-pointer hover:bg-amber-100">
                                 <div>
                                     <div className="font-bold text-amber-900 text-sm">As Oy Saimaa</div>
                                     <div className="text-xs text-amber-700">Pekka Pomo • 320 000 €</div>
                                 </div>
                                 <ArrowUpRight size={16} className="text-amber-500" />
                             </div>
                             <button className="w-full text-center text-xs font-bold text-amber-600 hover:underline uppercase mt-2">
                                 Näytä kaikki (3)
                             </button>
                         </div>
                     </div>
                  </>
              )}

              {/* Shared Widgets */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group cursor-pointer hover:border-blue-300 transition-all" onClick={onNewQuote}>
                  <div className="relative z-10">
                      <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2"><Users size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" /> CRM</h3>
                      <p className="text-sm text-slate-500 mb-4">Hallitse asiakkaita ja aloita uudet projektit asiakasrekisterin kautta.</p>
                      <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-slate-200 transition-colors">Avaa rekisteri</button>
                  </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Tehtävälista</h3>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                          <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>Ota yhteyttä Mattiin (Levi-projekti)</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600">
                          <Clock size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Päivitä tarjous #11390</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-400 line-through">
                          <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Lähetä tilausvahvistus</span>
                      </li>
                  </ul>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardHome;