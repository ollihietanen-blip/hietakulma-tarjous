import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Clock, Plus, ArrowUpRight, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface DashboardHomeProps {
  onNewQuote: () => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNewQuote }) => {
  const { quotation } = useQuotation();

  // Mock data for dashboard
  const recentQuotes = [
    { id: '1', customer: 'Matti Meikäläinen', project: 'Loma-asunto Levi', price: '45 200 €', status: 'Avoin', date: '2 pv sitten' },
    { id: '2', customer: 'Rakennus Oy Esimerkki', project: 'Rivitalo Espoo', price: '128 500 €', status: 'Luonnos', date: '5 pv sitten' },
    { id: '3', customer: 'Teppo Testaaja', project: 'Autotalli', price: '12 800 €', status: 'Hyväksytty', date: '1 vk sitten' },
  ];

  const stats = [
      { label: 'Avoimet tarjoukset', value: '14', unit: 'kpl', change: '+2', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Tämän kuun myynti', value: '145', unit: 't€', change: '+12%', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Keskimääräinen kate', value: '28.5', unit: '%', change: '-1.2%', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Tervetuloa, Olli</h1>
            <p className="text-slate-500 mt-1">Tässä katsaus ajankohtaisiin projekteihin.</p>
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
          
          {/* Main List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h2 className="font-display font-bold text-lg text-slate-800">Viimeisimmät tarjoukset</h2>
                 <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase">Näytä kaikki</button>
             </div>
             <div className="divide-y divide-slate-50">
                {/* Active draft (Current state) */}
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

                {recentQuotes.map(quote => (
                    <div key={quote.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 text-slate-500 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">{quote.project}</div>
                                <div className="text-xs text-slate-500">{quote.customer} • {quote.date}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-slate-900">{quote.price}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 
                                ${quote.status === 'Hyväksytty' ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-100'}`}>
                                {quote.status}
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
              <div className="bg-hieta-black text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="font-display font-bold text-xl mb-2">Hietakulma Pro</h3>
                      <p className="text-sm text-slate-400 mb-4">Uusi hinnasto astuu voimaan 1.5.2024. Tarkista katteet.</p>
                      <button className="bg-white text-black px-4 py-2 rounded text-xs font-bold uppercase hover:bg-hieta-sand transition-colors">Lue tiedote</button>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12">
                      <FileText size={150} />
                  </div>
              </div>

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