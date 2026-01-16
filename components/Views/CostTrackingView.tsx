import React, { useState, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { CostEntry, CostEntryCategory } from '../../types';
import { Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle, Calculator, PieChart, List, BarChart3, Box, Grid, Upload, FileText, X, Loader } from 'lucide-react';
import Header from '../Layout/Header';
import { api } from '../../convex/_generated/api.js';
import { isConvexConfigured } from '../../lib/convexClient';
import { useAction } from '../../lib/convexHooks';

interface InvoiceAnalysis {
  supplier?: string;
  date?: Date;
  totalAmount: number;
  category: CostEntryCategory;
  description: string;
  items?: Array<{
    description: string;
    amount: number;
    category?: CostEntryCategory;
  }>;
}

const CostTrackingView: React.FC = () => {
  const { quotation, pricing, addCostEntry, removeCostEntry } = useQuotation();
  const [comparisonView, setComparisonView] = useState<'summary' | 'items'>('summary');
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  const [uploadedInvoice, setUploadedInvoice] = useState<File | null>(null);
  const [isAnalyzingInvoice, setIsAnalyzingInvoice] = useState(false);
  const [invoiceAnalysis, setInvoiceAnalysis] = useState<InvoiceAnalysis | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateWithImages = useAction(api?.gemini?.generateWithImages);
  
  // New Entry State
  const [newEntry, setNewEntry] = useState<Partial<CostEntry>>({
      date: new Date(),
      category: 'elements',
      description: '',
      amount: 0,
      supplier: '',
      costType: 'material', // Oletuksena materiaalikustannus
      laborHours: undefined,
      laborRate: undefined // TODO: Haetaan tietokannasta myöhemmin
  });

  // Calculate Realized Totals - erotellaan työ- ja materiaalikustannukset
  const entries = quotation.postCalculation.entries;
  const materialEntries = entries.filter(e => e.costType === 'material');
  const laborEntries = entries.filter(e => e.costType === 'labor');
  
  const realizedMaterialCost = materialEntries.reduce((sum, e) => sum + e.amount, 0);
  const realizedLaborCost = laborEntries.reduce((sum, e) => sum + e.amount, 0);
  const realizedTotal = realizedMaterialCost + realizedLaborCost;
  
  const salesPrice = pricing.sellingPriceExVat; // Budget Sales Price (Ex VAT)
  const budgetedMaterialCost = pricing.materialCostTotal; // Budget Material Cost
  // TODO: Työkustannukset haetaan tietokannasta myöhemmin
  const budgetedLaborCost = 0; // Placeholder - haetaan tietokannasta
  
  const budgetedCost = budgetedMaterialCost + budgetedLaborCost;
  
  const realizedProfit = salesPrice - realizedTotal;
  const realizedMarginPercent = salesPrice > 0 ? (realizedProfit / salesPrice) * 100 : 0;
  
  // Calculate Totals per Category for Comparison
  const getCategoryTotal = (cat: string) => entries.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
  
  const comparisons = [
      { id: 'elements', label: 'Elementit', budget: pricing.breakdown.elements.cost, realized: getCategoryTotal('elements') },
      { id: 'trusses', label: 'Ristikot', budget: pricing.breakdown.trusses.cost, realized: getCategoryTotal('trusses') },
      { id: 'products', label: 'Ikkunat/Ovet/Tarvikkeet', budget: pricing.breakdown.windowsDoors.cost + pricing.breakdown.worksiteDeliveries.cost, realized: getCategoryTotal('products') },
      { id: 'installation', label: 'Asennus', budget: pricing.breakdown.installation.cost, realized: getCategoryTotal('installation') },
      { id: 'logistics', label: 'Logistiikka', budget: pricing.breakdown.transportation.cost, realized: getCategoryTotal('logistics') },
      { id: 'design', label: 'Suunnittelu', budget: pricing.breakdown.design.cost, realized: getCategoryTotal('design') },
      { id: 'other', label: 'Muut kulut', budget: 0, realized: getCategoryTotal('other') },
  ];

  // Aggregate Budget Items
  const getBudgetItems = () => {
      const items: any[] = [];
      
      // Elements
      quotation.elements.forEach(section => {
          section.items.forEach(item => {
              items.push({
                  id: item.id,
                  type: 'Elementti',
                  name: item.type,
                  desc: item.description,
                  qty: item.quantity,
                  unit: item.unit,
                  total: item.totalPrice,
                  category: 'elements'
              });
          });
      });

      // Products
      quotation.products.forEach(section => {
          section.items.forEach(item => {
              items.push({
                  id: item.id,
                  type: section.id === 'windows' ? 'Ikkuna' : section.id === 'doors' ? 'Ovi' : 'Materiaali',
                  name: item.tunnus,
                  desc: item.description || item.manufacturer,
                  qty: item.quantity,
                  unit: item.unit || 'kpl',
                  total: item.totalPrice,
                  category: 'products'
              });
          });
      });

      return items;
  };

  const budgetItems = getBudgetItems();

  const handleAdd = () => {
      if (!newEntry.description) return;
      if (newEntry.costType === 'labor' && (!newEntry.laborHours || !newEntry.laborRate)) return;
      if (newEntry.costType === 'material' && !newEntry.amount) return;
      
      addCostEntry({
          date: newEntry.date || new Date(),
          category: newEntry.category as any,
          description: newEntry.description || '',
          amount: Number(newEntry.amount) || 0,
          supplier: newEntry.supplier,
          costType: newEntry.costType || 'material',
          laborHours: newEntry.laborHours,
          laborRate: newEntry.laborRate
      });
      
      // Reset form
      setNewEntry({
          date: new Date(),
          category: 'elements',
          description: '',
          amount: 0,
          supplier: '',
          costType: 'material',
          laborHours: undefined,
          laborRate: undefined
      });
  };

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm text-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

  // Analyze invoice with AI
  const analyzeInvoice = async (file: File) => {
    setIsAnalyzingInvoice(true);
    setInvoiceAnalysis(null);

    try {
      // Convert image to base64
      let imageData: { mimeType: string; base64Data: string };
      if (file.type.startsWith('image/')) {
        imageData = await new Promise<{ mimeType: string; base64Data: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({
              mimeType: file.type,
              base64Data: base64
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        throw new Error('PDF-tiedostot eivät ole vielä tuettuja. Käytä kuvatiedostoa.');
      }

      // Prepare prompt for Claude
      const prompt = `Analysoi tämä lasku ja palauta JSON-muodossa seuraavat tiedot:
{
  "supplier": "Toimittajan nimi",
  "date": "YYYY-MM-DD",
  "totalAmount": kokonaissumma numeroina (ilman €-merkkiä, ALV 0%),
  "category": "Yksi seuraavista: elements, trusses, products, installation, logistics, design, other",
  "description": "Lyhyt kuvaus laskun sisällöstä",
  "items": [
    {
      "description": "Tuotteen/työn kuvaus",
      "amount": summa numeroina,
      "category": "vapaaehtoinen kategoria"
    }
  ]
}

Kategorisoi lasku seuraavasti:
- elements: Puuelementit, seinät, lattiat (tehdastuotanto)
- trusses: Ristikot
- products: Ikkunat, ovet, materiaalit
- installation: Asennustyöt, työvoima
- logistics: Kuljetus, logistiikka
- design: Suunnittelu, piirustukset
- other: Muut kulut

Palauta VAIN JSON-objekti, ei muuta tekstiä.`;

      // Call Claude API via Convex (server-side, secure)
      if (!generateWithImages) {
        throw new Error('Convex ei ole konfiguroitu. Tarkista että VITE_CONVEX_URL on asetettu .env.local tiedostossa.');
      }

      const result = await generateWithImages({
        prompt: prompt,
        images: [imageData]
      });

      const text = result.text;
      
      // Extract JSON from response (might be wrapped in markdown or have extra text)
      let jsonText = text.trim();
      
      // First, try to extract JSON from markdown code blocks
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      
      // Remove markdown headers (lines starting with #)
      jsonText = jsonText.split('\n')
        .filter(line => !line.trim().startsWith('#'))
        .join('\n');
      
      // Try to find JSON object boundaries ({ ... })
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // Extract only the JSON object part
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }
      
      // Final cleanup
      jsonText = jsonText.trim();
      
      // Validate that we have something that looks like JSON
      if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        throw new Error(`AI-vastaus ei sisällä kelvollista JSON-objektia. Vastaus alkaa: "${jsonText.substring(0, 100)}..."`);
      }
      
      let analysis: InvoiceAnalysis;
      try {
        analysis = JSON.parse(jsonText);
      } catch (parseError) {
        // If parsing fails, try to extract JSON more aggressively
        const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          try {
            analysis = JSON.parse(jsonObjectMatch[0]);
          } catch (retryError) {
            throw new Error(`JSON-parsinta epäonnistui: ${parseError instanceof Error ? parseError.message : 'Tuntematon virhe'}. Vastaus: "${text.substring(0, 200)}..."`);
          }
        } else {
          throw new Error(`JSON-parsinta epäonnistui: ${parseError instanceof Error ? parseError.message : 'Tuntematon virhe'}. Vastaus: "${text.substring(0, 200)}..."`);
        }
      }
      
      // Parse date if provided
      if (analysis.date && typeof analysis.date === 'string') {
        analysis.date = new Date(analysis.date);
      } else {
        analysis.date = new Date(); // Default to today
      }

      setInvoiceAnalysis(analysis);
    } catch (error) {
      console.error('Laskun analysointi epäonnistui:', error);
      alert(`Laskun analysointi epäonnistui: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`);
    } finally {
      setIsAnalyzingInvoice(false);
    }
  };

  // Confirm and add invoice as cost entry
  const confirmInvoiceEntry = () => {
    if (!invoiceAnalysis) return;

    addCostEntry({
      date: invoiceAnalysis.date || new Date(),
      category: invoiceAnalysis.category,
      description: invoiceAnalysis.description,
      amount: invoiceAnalysis.totalAmount,
      supplier: invoiceAnalysis.supplier,
      costType: 'material' // Laskut ovat yleensä materiaalikustannuksia
    });

    // Reset
    setUploadedInvoice(null);
    setInvoiceAnalysis(null);
    setShowConfirmModal(false);
    setShowInvoiceUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 relative">
      <Header />
      
      <main className="flex-1 overflow-y-auto w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 scroll-smooth">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                        <div className="text-sm text-slate-400 font-medium">
                            Budjetti: {budgetedCost.toLocaleString('fi-FI', {maximumFractionDigits:0})} €
                            <div className="text-xs mt-1">
                                Materiaali: {realizedMaterialCost.toLocaleString('fi-FI', {maximumFractionDigits:0})} € / 
                                Työ: {realizedLaborCost.toLocaleString('fi-FI', {maximumFractionDigits:0})} €
                            </div>
                        </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kustannustyyppi</label>
                                <select 
                                    className={inputClass}
                                    value={newEntry.costType || 'material'}
                                    onChange={(e) => setNewEntry({ ...newEntry, costType: e.target.value as 'material' | 'labor' })}
                                >
                                    <option value="material">Materiaalikustannus</option>
                                    <option value="labor">Työkustannus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategoria</label>
                                <select 
                                    className={inputClass}
                                    value={newEntry.category}
                                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as any })}
                                >
                                    <option value="elements">Elementit (Tehdas)</option>
                                    <option value="trusses">Ristikot</option>
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
                        {newEntry.costType === 'labor' ? (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Työtunnit</label>
                                    <input 
                                        type="number" 
                                        step="0.5"
                                        className={inputClass}
                                        placeholder="0.0"
                                        value={newEntry.laborHours || ''}
                                        onChange={(e) => {
                                            const hours = Number(e.target.value);
                                            const rate = newEntry.laborRate || 0;
                                            setNewEntry({ 
                                                ...newEntry, 
                                                laborHours: hours,
                                                amount: hours * rate
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tuntihinta (€)</label>
                                    <input 
                                        type="number" 
                                        className={inputClass}
                                        placeholder="0.00"
                                        value={newEntry.laborRate || ''}
                                        onChange={(e) => {
                                            const rate = Number(e.target.value);
                                            const hours = newEntry.laborHours || 0;
                                            setNewEntry({ 
                                                ...newEntry, 
                                                laborRate: rate,
                                                amount: hours * rate
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Summa (€ alv 0%)</label>
                                    <input 
                                        type="number" 
                                        className={`${inputClass} font-bold text-right`} 
                                        placeholder="0.00"
                                        value={newEntry.amount || ''}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ) : (
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
                        )}
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

                {/* RIGHT: Comparison Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit flex flex-col">
                    <div className="flex border-b border-slate-200">
                        <button 
                            onClick={() => setComparisonView('summary')}
                            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${comparisonView === 'summary' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                        >
                            <BarChart3 size={16} /> Yhteenveto
                        </button>
                        <button 
                            onClick={() => setComparisonView('items')}
                            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${comparisonView === 'items' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                        >
                            <List size={16} /> Tuote-erittely
                        </button>
                    </div>

                    {comparisonView === 'summary' ? (
                        /* Summary Table */
                        <table className="w-full text-sm animate-in fade-in duration-300">
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
                    ) : (
                        /* Item Breakdown List */
                        <div className="flex-1 overflow-y-auto max-h-[600px] animate-in fade-in duration-300 bg-slate-50/30">
                            {budgetItems.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">Ei laskettuja tuotteita.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide flex justify-between">
                                        <span>Tuote / Nimike</span>
                                        <span>Budjetoitu (alv 0%)</span>
                                    </div>
                                    {budgetItems.map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="px-4 py-3 hover:bg-white transition-colors flex justify-between items-start group">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 p-1.5 rounded ${item.category === 'elements' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {item.category === 'elements' ? <Box size={14} /> : <Grid size={14} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700 text-sm">{item.name}</div>
                                                    <div className="text-xs text-slate-500 line-clamp-1">{item.desc}</div>
                                                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                                                        {item.qty} {item.unit}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-700 text-sm">{item.total.toLocaleString('fi-FI')} €</div>
                                                <div className="text-[10px] text-slate-400">Arvio</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="px-4 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Yhteensä listalta</span>
                                        <span className="font-bold text-slate-900">
                                            {budgetItems.reduce((s, i) => s + (i.total || 0), 0).toLocaleString('fi-FI')} €
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
      </main>

      {/* Confirm Invoice Modal */}
      {showConfirmModal && invoiceAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Vahvista kulu</h3>
              <button onClick={() => setShowConfirmModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Kategoria
                </label>
                <select
                  value={invoiceAnalysis.category}
                  onChange={(e) => setInvoiceAnalysis({ ...invoiceAnalysis, category: e.target.value as CostEntryCategory })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                >
                  <option value="elements">Elementit (Tehdas)</option>
                  <option value="trusses">Ristikot</option>
                  <option value="products">Ikkunat/Ovet/Materiaali</option>
                  <option value="installation">Asennus</option>
                  <option value="logistics">Logistiikka</option>
                  <option value="design">Suunnittelu</option>
                  <option value="other">Muu / Yllättävä</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Kuvaus
                </label>
                <input
                  type="text"
                  value={invoiceAnalysis.description}
                  onChange={(e) => setInvoiceAnalysis({ ...invoiceAnalysis, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Toimittaja
                </label>
                <input
                  type="text"
                  value={invoiceAnalysis.supplier || ''}
                  onChange={(e) => setInvoiceAnalysis({ ...invoiceAnalysis, supplier: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Summa (€ alv 0%)
                </label>
                <input
                  type="number"
                  value={invoiceAnalysis.totalAmount}
                  onChange={(e) => setInvoiceAnalysis({ ...invoiceAnalysis, totalAmount: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Päivämäärä
                </label>
                <input
                  type="date"
                  value={invoiceAnalysis.date ? new Date(invoiceAnalysis.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setInvoiceAnalysis({ ...invoiceAnalysis, date: e.target.valueAsDate || new Date() })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmInvoiceEntry}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Vahvista ja lisää
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-all"
                >
                  Peruuta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostTrackingView;