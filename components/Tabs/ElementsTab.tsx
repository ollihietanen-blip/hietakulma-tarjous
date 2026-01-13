import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ELEMENT_TEMPLATES, ElementItem } from '../../types';
import { Plus, Layers, Box, ChevronRight, Search, Trash2 } from 'lucide-react';
import ElementDetailEditor from './ElementDetailEditor';

const ElementsTab: React.FC = () => {
  const { quotation, addElement, removeElement } = useQuotation();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleAddNew = () => {
    const template = ELEMENT_TEMPLATES['US-198'];
    const newId = `el-${Date.now()}`;
    addElement('section-ext-walls', {
        ...template,
        id: newId,
        type: 'Uusi elementti',
        quantity: 1,
        windowCount: 0,
        windowInstallPrice: 45,
        netArea: 0,
        hasWindowInstall: false,
    });
    setSelectedItemId(newId); // Select the newly created item
  };
  
  const handleRemove = (sectionId: string, elementId: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän elementin?')) {
        removeElement(sectionId, elementId);
        // Selection will be reset by useEffect
    }
  };


  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Left Column: List of Elements */}
      <div className="w-1/3 max-w-sm flex flex-col bg-white rounded-l-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Etsi elementtejä..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-4 border-b border-slate-100 cursor-pointer group hover:bg-slate-50 transition-colors ${selectedItemId === item.id ? 'bg-blue-50' : ''}`}
                    >
                        <div className="flex justify-between items-start">
                           <div className="flex gap-3">
                              <div className={`mt-1 flex-shrink-0 p-2 rounded-lg ${selectedItemId === item.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Box size={18} />
                              </div>
                              <div>
                                <p className={`font-bold text-sm ${selectedItemId === item.id ? 'text-blue-900' : 'text-slate-800'}`}>{item.type}</p>
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
                <div className="p-12 text-center text-slate-400">
                    <Layers size={40} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">Ei elementtejä</p>
                    <p className="text-sm">Lisää ensimmäinen elementti alta.</p>
                </div>
            )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
             <button 
                onClick={handleAddNew}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
            >
                <Plus size={18} /> Lisää uusi elementti
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
