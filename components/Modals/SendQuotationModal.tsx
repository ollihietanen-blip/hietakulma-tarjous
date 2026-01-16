import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, RefreshCw, User, Building2, FileText, AlertCircle } from 'lucide-react';
import { Quotation, QuotationVersion } from '../../types';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { isConvexConfigured } from '../../lib/convexClient';

interface SendQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  quotation: Quotation;
  version?: QuotationVersion;
  previousVersion?: QuotationVersion;
}

const SendQuotationModal: React.FC<SendQuotationModalProps> = ({
  isOpen,
  onClose,
  onSend,
  quotation,
  version,
  previousVersion
}) => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'formal'>('professional');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [changes, setChanges] = useState<string>('');
  const generateText = isConvexConfigured ? useAction(api.gemini.generateText) : null;

  // Check if this is an updated quotation
  const isUpdate = previousVersion !== undefined && previousVersion !== null;

  // Generate AI suggestions on mount
  useEffect(() => {
    if (isOpen) {
      generateSuggestions();
      if (isUpdate) {
        detectChanges();
      }
    }
  }, [isOpen, selectedTone, isUpdate]);

  const detectChanges = async () => {
    if (!previousVersion || !version) return;

    try {
      const oldPrice = previousVersion.quotation.pricing?.totalWithVat || 0;
      const newPrice = version.quotation.pricing?.totalWithVat || 0;
      const oldElements = previousVersion.quotation.elements?.reduce((sum: number, s: any) => sum + (s.items?.length || 0), 0) || 0;
      const newElements = version.quotation.elements?.reduce((sum: number, s: any) => sum + (s.items?.length || 0), 0) || 0;
      const oldProducts = previousVersion.quotation.products?.reduce((sum: number, s: any) => sum + (s.items?.length || 0), 0) || 0;
      const newProducts = version.quotation.products?.reduce((sum: number, s: any) => sum + (s.items?.length || 0), 0) || 0;

      const prompt = `Vertaa kahta tarjousversiota ja listaa muutokset selkeästi. 

AIEMMPI VERSIO:
- Hinta: ${oldPrice.toLocaleString('fi-FI')} €
- Elementit: ${oldElements} kpl
- Tuotteet: ${oldProducts} kpl

UUSI VERSIO:
- Hinta: ${newPrice.toLocaleString('fi-FI')} €
- Elementit: ${newElements} kpl
- Tuotteet: ${newProducts} kpl

Listaa selkeästi mitä on muuttunut (hinta, määrät, jne.). Käytä suomea. Ole ytimekäs ja selkeä.`;

      // Call Claude API via Convex (server-side, secure)
      if (!generateText) {
        console.warn('Convex ei ole konfiguroitu. Muutosten tunnistus ei ole käytettävissä.');
        return;
      }

      const result = await generateText({ prompt });
      if (result.text) {
        setChanges(result.text);
      }
    } catch (error) {
      console.error('Error detecting changes:', error);
    }
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const toneDescriptions = {
        professional: 'ammattimainen mutta ystävällinen',
        friendly: 'ystävällinen ja lähestyttävä',
        formal: 'muodollinen ja ammattimainen'
      };

      const updateContext = isUpdate 
        ? `Tämä on päivitetty tarjous. ${changes ? `Muutokset: ${changes}` : 'Tarkista muutokset tarjouksesta.'}`
        : 'Tämä on ensimmäinen tarjous.';

      const prompt = `Kirjoita lyhyt, ${toneDescriptions[selectedTone]} sähköpostiviesti asiakkaalle, jolle lähetetään tarjouslaskenta.

ASIAAKKAAN TIEDOT:
- Nimi: ${quotation.customer.contactPerson}
- Yritys: ${quotation.customer.name}
- Projekti: ${quotation.project.name}
- Rakennustyyppi: ${quotation.project.buildingType}
- Tarjouksen arvo: ${quotation.pricing.totalWithVat.toLocaleString('fi-FI')} €

${updateContext}

Anna 3-5 lyhyttä, henkilökohtaista viestiehdotusta (max 2 lausetta per ehdotus). Käytä suomea. Viestit voivat olla:
1. Yksinkertainen ja suora
2. Ystävällinen ja avulias
3. Ammattimainen ja selkeä
4. Kiitollinen ja positiivinen
5. Informatiivinen ja selittävä

Palauta vain viestiehdotukset, yksi per rivi, ilman numeroita tai erikoismerkintöjä.`;

      // Call Claude API via Convex (server-side, secure)
      if (!generateText) {
        // Fallback suggestions without AI
        setSuggestions([
          `Hei ${quotation.customer.contactPerson}!`,
          `Lähetämme tämän tarjouksen projektille ${quotation.project.name}.`,
          `Toivomme, että tarjous vastaa odotuksianne.`
        ]);
        setIsGenerating(false);
        return;
      }

      const result = await generateText({ prompt });
      if (result.text) {
        const lines = result.text.split('\n').filter(line => line.trim() && !line.match(/^\d+[\.\)]/));
        setSuggestions(lines.slice(0, 5));
      } else {
        // Fallback
        setSuggestions([
          `Hei ${quotation.customer.contactPerson}!`,
          `Lähetämme tämän tarjouksen projektille ${quotation.project.name}.`,
          `Toivomme, että tarjous vastaa odotuksianne.`
        ]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([
        `Hei ${quotation.customer.contactPerson}!`,
        `Lähetämme tämän tarjouksen projektille ${quotation.project.name}.`,
        `Toivomme, että tarjous vastaa odotuksianne.`
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (message.trim()) {
      setMessage(prev => prev + '\n\n' + suggestion);
    } else {
      setMessage(suggestion);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto card-shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isUpdate ? 'Lähetä päivitetty tarjous' : 'Lähetä tarjous asiakkaalle'}
              </h2>
              <p className="text-sm text-slate-500">
                {quotation.customer.contactPerson} • {quotation.project.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Changes section for updates */}
          {isUpdate && changes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 mb-2">Havaitut muutokset:</h3>
                  <p className="text-sm text-amber-800 whitespace-pre-line">{changes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tone selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Viestin sävy:</label>
            <div className="flex gap-2">
              {(['professional', 'friendly', 'formal'] as const).map(tone => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTone === tone
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tone === 'professional' && 'Ammattimainen'}
                  {tone === 'friendly' && 'Ystävällinen'}
                  {tone === 'formal' && 'Muodollinen'}
                </button>
              ))}
              <button
                onClick={generateSuggestions}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                Päivitä
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-blue-600" size={18} />
              <label className="block text-sm font-bold text-slate-700">
                Tekoälyehdotukset ({selectedTone === 'professional' ? 'Ammattimainen' : selectedTone === 'friendly' ? 'Ystävällinen' : 'Muodollinen'})
              </label>
            </div>
            {isGenerating ? (
              <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-500">
                <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
                <p className="text-sm">Generoidaan ehdotuksia...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-3 text-sm text-slate-700 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message editor */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Viesti asiakkaalle:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Kirjoita viesti tai valitse yksi yllä olevista ehdotuksista..."
              className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="mt-2 text-xs text-slate-500">
              {message.length} merkkiä
            </div>
          </div>

          {/* Project info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 size={16} className="text-slate-500" />
              <span className="font-medium text-slate-700">Projekti:</span>
              <span className="text-slate-600">{quotation.project.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-slate-500" />
              <span className="font-medium text-slate-700">Vastaanottaja:</span>
              <span className="text-slate-600">{quotation.customer.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText size={16} className="text-slate-500" />
              <span className="font-medium text-slate-700">Tarjouksen arvo:</span>
              <span className="text-slate-600 font-bold">
                {quotation.pricing.totalWithVat.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Peruuta
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            Lähetä tarjous
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendQuotationModal;
