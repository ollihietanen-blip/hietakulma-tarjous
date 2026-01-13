import React from 'react';
import { ELEMENT_TEMPLATES } from '../../types';
import { X, Box, Plus } from 'lucide-react';

interface AddElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateKey: string) => void;
}

const TEMPLATE_GROUPS = [
    {
        title: 'Ulkoseinät',
        keys: ['US-198', 'US-148']
    },
    {
        title: 'Väliseinät',
        keys: ['VS-92', 'VS-66', 'HVS']
    },
    {
        title: 'Vaakarakenteet',
        keys: ['VP', 'YP']
    },
    {
        title: 'Kattorakenteet & Muut',
        keys: ['PAATYKOLMIO', 'RAYSTAS', 'RISTIKKO']
    }
];

const AddElementModal: React.FC<AddElementModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 flex flex-col h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Box size={20} className="text-blue-600" />
            Lisää uusi elementti pohjasta
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-6">Valitse alta pohja, jota haluat käyttää. Voit muokata kaikkia tietoja lisäyksen jälkeen.</p>
          
          <div className="space-y-6">
            {TEMPLATE_GROUPS.map(group => (
              <div key={group.title}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{group.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(group.keys as Array<keyof typeof ELEMENT_TEMPLATES>).map(key => {
                    const template = ELEMENT_TEMPLATES[key];
                    // FIX: Cast specifications to a generic record to safely access optional properties which are not present on all template types. Also improves display logic.
                    const specs = template.specifications as Record<string, string | undefined>;
                    return (
                      <button
                        key={key}
                        onClick={() => onSelectTemplate(key as string)}
                        className="bg-white border-2 border-slate-200 p-4 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-blue-800">{template.type}</div>
                        <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                        <div className="text-xs text-slate-400 mt-2 font-mono">
                            {[
                                specs.uValue ? `U-arvo: ${specs.uValue}` : null,
                                specs.frame ? `Runko: ${specs.frame}` : null,
                            ].filter(Boolean).join(' | ')}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sulje
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddElementModal;
