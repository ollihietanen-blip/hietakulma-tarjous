import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { CostEntry } from '../../types';
import { Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle, Calculator, PieChart } from 'lucide-react';

const CostTrackingTab: React.FC = () => {
  const { quotation, pricing, addCostEntry, removeCostEntry } = useQuotation();
  
  // New Entry State
  const [newEntry, setNewEntry] = useState<Partial<CostEntry>>({
      date: new Date(),
      category: 'elements',
      description: '',
      amount: 0,
      supplier: ''
  });

  // Calculate Realized Totals
  const entries = quotation.postCalculation.entries;
  const realizedTotal = entries.reduce((sum, e) => sum + e.amount, 0);
  const salesPrice = pricing.sellingPriceExVat; // Budget Sales Price (Ex VAT)
  const budgetedCost = pricing.materialCostTotal; // Budget Cost
  
  const realizedProfit = salesPrice - realizedTotal;
  const realizedMarginPercent = salesPrice > 0 ? (realizedProfit / salesPrice) * 100 : 0;
  
  // Calculate Totals per Category for Comparison
  const getCategoryTotal = (cat: string) => entries.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
  
  const comparisons = [
      { id: 'elements', label: 'Elementit', budget: pricing.breakdown.elements.cost, realized: getCategoryTotal('elements') },
      { id: 'products', label: 'Ikkunat/Ovet/Tarvikkeet', budget: pricing.breakdown.windowsDoors.cost + pricing.breakdown.worksiteDeliveries.cost, realized: getCategoryTotal('products') },
      { id: 'installation', label: 'Asennus', budget: pricing.breakdown.installation.cost, realized: getCategoryTotal('installation') },
      { id: 'logistics', label: 'Logistiikka', budget: pricing.breakdown.transportation.cost, realized: getCategoryTotal('logistics') },
      { id: 'design', label: 'Suunnittelu', budget: pricing.breakdown.design.cost, realized: getCategoryTotal('design') },
      { id: 'other', label: 'Muut kulut', budget: 0, realized: getCategoryTotal('other') },
  ];

  const handleAdd = () => {
      if (!newEntry.amount || !newEntry.description) return;
      
      addCostEntry({
          date: newEntry.date || new Date(),
          category: newEntry.category as any,
          description: newEntry.description || '',
          amount: Number(newEntry.amount),
          supplier: newEntry.supplier
      });
      
      // Reset form
      setNewEntry({
          ...newEntry,
          description: '',
          amount: 0,
          supplier: ''
      });
  };

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm text-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                <PieChart className="text-blue-600" /> Jälkilaskenta
            </h1>
            <p className="text-slate-500 text-sm">Seuraa projektin toteutuneita kustannuksia ja kannattavuutta.</p>
        </div>
        <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase">Myyntihinta (ALV 0%)</div>
            <div className="text-xl font-bold text-slate-900">{salesPrice.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="relative z-10">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Budjetoitu Kate</div>
                  <div className="text-3xl font-bold text-slate-700">{pricing.profitPercent.toFixed(1)}%</div>
                  <div className="text-sm text-slate-400 font-medium">{pricing.profitAmount.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</div>
              </div>
              <div className="absolute right-0 bottom-0 p-4 opacity-10">
                  <Calculator size={64} />
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="relative z-10">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Toteutuneet kulut</div>
                  <div className={`text-3xl font-bold ${realizedTotal > budgetedCost ? 'text-red-600' : 'text-slate-900'}`}>
                      {realizedTotal.toLocaleString('fi-FI', {maximumFractionDigits:0})} €
                  </div>
                  <div className="text-sm text-slate-400 font-medium">Budjetti: {budgetedCost.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</div>
              </div>
              <div className="absolute right-0 bottom-0 p-4 opacity-10">
                  <TrendingUp size={64} />
              </div>
          </div>

          <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between h-32 relative overflow-hidden ${realizedMarginPercent < pricing.profitPercent - 5 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="relative z-10">
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${realizedMarginPercent < pricing.profitPercent - 5 ? 'text-red-600' : 'text-green-700'}`}>Toteutunut Kate</div>
                  <div className={`text-3xl font-bold ${realizedMarginPercent < pricing.profitPercent - 5 ? 'text-red-700' : 'text-green-800'}`}>
                      {realizedMarginPercent.toFixed(1)}%
                  </div>
                  <div className={`text-sm font-medium ${realizedMarginPercent < pricing.profitPercent - 5 ? 'text-red-600' : 'text-green-700'}`}>
                      {realizedProfit.toLocaleString('fi-FI', {maximumFractionDigits:0})} €
                  </div>
              </div>
              <div className="absolute right-0 bottom-0 p-4 opacity-10">
                  {realizedMarginPercent < pricing.profitPercent - 5 ? <AlertTriangle size={64} /> : <CheckCircle size={64} />}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Input & List */}
          <div className="space-y-6">
              {/* Add Entry Form */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Lisää kustannus</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Päivämäärä</label>
                          <input 
                            type="date" 
                            className={inputClass}
                            value={newEntry.date ? new Date(newEntry.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setNewEntry({ ...newEntry, date: new Date(e.target.value) })}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategoria</label>
                          <select 
                            className={inputClass}
                            value={newEntry.category}
                            onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as any })}
                          >
                              <option value="elements">Elementit (Tehdas)</option>
                              <option value="products">Ikkunat/Ovet/Materiaali</option>
                              <option value="installation">Asennus</option>
                              <option value="logistics">Logistiikka</option>
                              <option value="design">Suunnittelu</option>
                              <option value="other">Muu / Yllättävä</option>
                          </select>
                      </div>
                  </div>
                  <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kuvaus</label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="esim. Rautakauppa Oy, lisävillat"
                        value={newEntry.description}
                        onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Toimittaja (Valinnainen)</label>
                          <input 
                            type="text" 
                            className={inputClass}
                            value={newEntry.supplier || ''}
                            onChange={(e) => setNewEntry({ ...newEntry, supplier: e.target.value })}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Summa (€ alv 0%)</label>
                          <input 
                            type="number" 
                            className={`${inputClass} font-bold text-right`} 
                            placeholder="0.00"
                            value={newEntry.amount || ''}
                            onChange={(e) => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                          />
                      </div>
                  </div>
                  <button 
                    onClick={handleAdd}
                    className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                      <Plus size={18} /> Lisää kirjaus
                  </button>
              </div>

              {/* Entries List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-bold text-slate-700 text-sm uppercase">Tapahtumat ({entries.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                      {entries.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm italic">Ei kirjauksia vielä.</div>
                      ) : (
                          entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                              <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                  <div>
                                      <div className="text-xs text-slate-400 mb-0.5">{new Date(entry.date).toLocaleDateString('fi-FI')} • <span className="uppercase font-bold tracking-wide text-[10px]">{entry.category}</span></div>
                                      <div className="font-medium text-slate-900 text-sm">{entry.description}</div>
                                      {entry.supplier && <div className="text-xs text-slate-500">{entry.supplier}</div>}
                                  </div>
                                  <div className="text-right">
                                      <div className="font-bold text-slate-900">{entry.amount.toFixed(2)} €</div>
                                      <button 
                                        onClick={() => removeCostEntry(entry.id)}
                                        className="text-xs text-red-400 hover:text-red-600 hover:underline mt-1 flex items-center justify-end gap-1 ml-auto"
                                      >
                                          <Trash2 size={10} /> Poista
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>

          {/* RIGHT: Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 text-sm uppercase">Budjettivertailu</h3>
                  <div className="text-xs text-slate-500">Alv 0%</div>
              </div>
              <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-3 text-left">Kategoria</th>
                          <th className="px-4 py-3 text-right">Budjetti</th>
                          <th className="px-4 py-3 text-right">Toteuma</th>
                          <th className="px-6 py-3 text-right">Erotus</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {comparisons.map(item => {
                          const diff = item.budget - item.realized;
                          const percent = item.budget > 0 ? (item.realized / item.budget) * 100 : 0;
                          
                          return (
                              <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-3 font-medium text-slate-700">
                                      {item.label}
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full ${percent > 100 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                          ></div>
                                      </div>
                                  </td>
                                  <td className="px-4 py-3 text-right text-slate-500">{item.budget.toFixed(0)} €</td>
                                  <td className="px-4 py-3 text-right font-bold text-slate-900">{item.realized.toFixed(0)} €</td>
                                  <td className={`px-6 py-3 text-right font-bold ${diff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {diff > 0 ? '+' : ''}{diff.toFixed(0)} €
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                          <td className="px-6 py-4 font-bold text-slate-900 uppercase text-xs">Yhteensä</td>
                          <td className="px-4 py-4 text-right font-bold text-slate-900">{budgetedCost.toFixed(0)} €</td>
                          <td className="px-4 py-4 text-right font-bold text-slate-900">{realizedTotal.toFixed(0)} €</td>
                          <td className={`px-6 py-4 text-right font-bold ${budgetedCost - realizedTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {(budgetedCost - realizedTotal).toFixed(0)} €
                          </td>
                      </tr>
                  </tfoot>
              </table>
          </div>

      </div>
    </div>
  );
};

export default CostTrackingTab;