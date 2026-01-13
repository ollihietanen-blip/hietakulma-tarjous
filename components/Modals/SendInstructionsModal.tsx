import React, { useState } from 'react';
import { X, Send, FileText, CheckSquare, Square } from 'lucide-react';

interface SendInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (selectedInstructions: string[]) => void;
  alreadySent: string[];
}

const INSTRUCTIONS_LIST = [
    "Ohje sähkösuunnittelijalle",
    "Perustusten mittauspöytäkirjan pohja",
    "Vastaavan työnjohtajan tarkastuslista",
    "Asennusryhmän yhteystiedot"
];

const SendInstructionsModal: React.FC<SendInstructionsModalProps> = ({ isOpen, onClose, onSend, alreadySent }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (instruction: string) => {
    if (alreadySent.includes(instruction)) return; // Don't allow toggling already sent items
    
    setSelected(prev => 
      prev.includes(instruction)
        ? prev.filter(item => item !== instruction)
        : [...prev, instruction]
    );
  };

  const handleSend = () => {
    if (selected.length > 0) {
      onSend(selected);
      setSelected([]); // Reset after sending
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Send size={20} className="text-blue-600" />
            Lähetä ohjeet asiakkaalle
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Valitse alla olevista listoista, mitkä ohjeet ja dokumentit lähetetään sähköpostitse asiakkaalle ja muille osapuolille.</p>
          
          <div className="space-y-2">
            {INSTRUCTIONS_LIST.map(item => {
              const isSelected = selected.includes(item);
              const isSent = alreadySent.includes(item);
              const isDisabled = isSent;

              return (
                <div
                  key={item}
                  onClick={() => toggleSelection(item)}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    isDisabled 
                      ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
                      : 'cursor-pointer hover:bg-slate-50'
                  } ${
                    isSelected ? 'bg-blue-50 border-blue-200' : 'border-slate-200'
                  }`}
                >
                  <div className={`flex-shrink-0 ${isDisabled ? 'text-green-400' : isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isDisabled || isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                  </div>
                  <div className="flex-1">
                      <span className={`font-medium text-sm ${isDisabled ? '' : 'text-slate-800'}`}>{item}</span>
                      {isSent && <span className="text-xs font-bold text-green-600 ml-2">(Lähetetty)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Peruuta
          </button>
          <button 
            onClick={handleSend}
            disabled={selected.length === 0}
            className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={16} /> Lähetä ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendInstructionsModal;
