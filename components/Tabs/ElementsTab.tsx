import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ELEMENT_TEMPLATES, ElementItem } from '../../types';
import { Plus, Layers, Box, ChevronRight, Search, Trash2 } from 'lucide-react';
import ElementDetailEditor from './ElementDetailEditor';
import AddElementModal from '../Modals/AddElementModal';

const ElementsTab: React.FC = () => {
  const { quotation, addElement, removeElement } = useQuotation();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Combine all element items from all sections into one list for easier management
  const allItems = quotation.elements.flatMap(section => 
    section.items.map(item => ({ ...item, sectionId: section.id }))
  );

  useEffect(() => {
    // If there are items but none is selected, select the first one.
    if (allItems.length > 0 && !selectedItemId) {
      setSelectedItemId(allItems[0].id);
    }
    // If the selected item is removed, reset selection.
    if (selectedItemId && !allItems.some(item => item.id === selectedItemId)) {
      setSelectedItemId(allItems.length > 0 ? allItems[0].id : null);
    }
  }, [allItems.length, selectedItemId]);


  const filteredItems = allItems.filter(item => 
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = allItems.find(item => item.id === selectedItemId) || null;

  const handleAddFromTemplate = (templateKey: string) => {
    const template = ELEMENT_TEMPLATES[templateKey as keyof typeof ELEMENT_TEMPLATES];
    if (!template) return;

    const newId = `el-${Date.now()}`;
    
    let sectionId = 'section-ext-walls'; // default
    if (templateKey.startsWith('VS') || templateKey === 'HVS') {
        sectionId = 'section-int-walls';
    } else if (templateKey === 'VP' || templateKey === 'YP') {
        sectionId = 'section-floor';
    } else if (['PAATYKOLMIO', 'RAYSTAS', 'RISTIKKO'].includes(templateKey)) {
        sectionId = 'section-roof';
    }

    addElement(sectionId, {
        ...template,
        id: newId,
        quantity: 1,
        windowCount: 0,
        windowInstallPrice: 45,
        netArea: 0,
        hasWindowInstall: false,
    });
    setSelectedItemId(newId);
    setIsAddModalOpen(false);
  };
  
  const handleRemove = (sectionId: string, elementId: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän elementin?')) {
        removeElement(sectionId, elementId);
    }
  };


  return (
    <div className="flex h-[calc(100vh-200px)]">
      <AddElementModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectTemplate={handleAddFromTemplate}
      />
      {/* Left Column: List of Elements */}
      <div className="w-1/3 max-w-sm flex flex-col bg-white rounded-l-xl border border-slate-200 card-shadow">
        <div className="p-4 border-b border-slate-200">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Etsi elementtejä..."
                    className="w-full pl-10 pr-4 py-2 bg-hieta-wood-light/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-hieta-blue/50 focus:border-hieta-blue card-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {quotation.elements.map(section => {
                const sectionItems = filteredItems.filter(item => item.sectionId === section.id);
                if (sectionItems.length === 0 && (searchTerm || section.items.length === 0)) return null;

                return (
                    <div key={section.id}>
                        <div className="px-4 py-2 bg-slate-100 border-b border-t border-slate-200 sticky top-0 z-10">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{section.title}</h3>
                        </div>
                        {sectionItems.length > 0 ? (
                             sectionItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    className={`p-4 border-b border-slate-100 cursor-pointer group hover:bg-hieta-wood-light/30 transition-all duration-200 hover-lift ${selectedItemId === item.id ? 'bg-hieta-blue/10' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                       <div className="flex gap-3">
                                          <div className={`mt-1 flex-shrink-0 p-2 rounded-lg ${selectedItemId === item.id ? 'bg-hieta-blue/20 text-hieta-blue' : 'bg-slate-100 text-slate-500'}`}>
                                            <Box size={18} />
                                          </div>
                                          <div>
                                            <p className={`font-bold text-sm ${selectedItemId === item.id ? 'text-hieta-blue' : 'text-slate-800'}`}>{item.type}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                            <p className="font-bold text-sm text-slate-900">
                                                {(item.totalPrice || 0).toLocaleString('fi-FI', {maximumFractionDigits:0})} €
                                            </p>
                                            <p className="text-xs text-slate-400">{item.quantity} {item.unit}</p>
                                       </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !searchTerm && <div className="p-4 text-center text-xs text-slate-400 italic">Ei elementtejä</div>
                        )}
                    </div>
                )
            })}
             {allItems.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <Layers size={40} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">Ei elementtejä</p>
                    <p className="text-sm">Lisää ensimmäinen elementti alta.</p>
                </div>
            )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full bg-hieta-black text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-800 card-shadow hover-lift active:scale-95 transition-all duration-200"
            >
                <Plus size={18} /> Lisää elementti pohjasta
            </button>
        </div>
      </div>

      {/* Right Column: Detail Editor */}
      <div className="flex-1 overflow-y-auto">
          {selectedItem ? (
              <ElementDetailEditor 
                key={selectedItem.id} // Force re-render on item change
                item={selectedItem}
                onRemove={handleRemove}
              />
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                  <Box size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Valitse elementti</p>
                  <p className="text-sm">Valitse elementti vasemmalta muokataksesi sen tietoja.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default ElementsTab;
