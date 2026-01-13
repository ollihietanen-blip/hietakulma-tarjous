import React, { useState, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FileSignature, CheckCircle, Clock, Send, Square, CheckSquare, Paperclip, AlertTriangle, GripVertical, Trash2, PlusCircle, FileCheck, FileQuestion, UploadCloud } from 'lucide-react';

interface ContractDocument {
    id: string;
    name: string;
    category: string;
    included: boolean;
    isCustom: boolean;
    status: 'saved' | 'empty';
}

const INITIAL_DOCUMENTS: ContractDocument[] = [
    { id: 'summary', name: 'Tarjouksen yhteenveto', category: 'Tarjous', included: true, isCustom: false, status: 'saved' },
    { id: 'terms', name: 'Yleiset sopimusehdot (RT 80265)', category: 'Ehdot', included: true, isCustom: false, status: 'saved' },
    { id: 'window_list', name: 'Ikkunaluettelo', category: 'Liitteet', included: true, isCustom: false, status: 'empty' },
    { id: 'door_list', name: 'Oviluettelo', category: 'Liitteet', included: true, isCustom: false, status: 'empty' },
    { id: 'blueprints_main', name: 'Pääpiirustukset (ARK)', category: 'Piirustukset', included: false, isCustom: false, status: 'empty' },
    { id: 'blueprints_struct', name: 'Rakennesuunnitelmat (RAK)', category: 'Piirustukset', included: false, isCustom: false, status: 'empty' },
    { id: 'energy_cert', name: 'Energiatodistus', category: 'Liitteet', included: false, isCustom: false, status: 'empty' },
];


const ContractView: React.FC = () => {
    const { quotation } = useQuotation();
    const [documents, setDocuments] = useState<ContractDocument[]>(INITIAL_DOCUMENTS);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleUpdateDoc = (id: string, field: keyof ContractDocument, value: string | boolean) => {
        setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, [field]: value } : doc));
    };

    const handleAddDoc = () => {
        const newDoc: ContractDocument = {
            id: `custom-${Date.now()}`,
            name: 'Uusi dokumentti',
            category: 'Muu',
            included: true,
            isCustom: true,
            status: 'empty'
        };
        setDocuments(prev => [...prev, newDoc]);
    };

    const handleRemoveDoc = (id: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };
    
    const handleDragSortEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const docsCopy = [...documents];
            const draggedItemContent = docsCopy.splice(dragItem.current, 1)[0];
            docsCopy.splice(dragOverItem.current, 0, draggedItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            setDocuments(docsCopy);
        }
    };
    
    // --- File Drop Handlers ---
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDraggingOver(true);
        }
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // FIX: Explicitly type 'file' as 'File' to resolve 'unknown' type error on file.name.
            const newFiles: ContractDocument[] = Array.from(e.dataTransfer.files).map((file: File) => ({
                id: `file-${Date.now()}-${file.name}`,
                name: file.name,
                category: 'Asiakirja',
                included: true,
                isCustom: true,
                status: 'saved',
            }));
            setDocuments(prev => [...prev, ...newFiles]);
            e.dataTransfer.clearData();
        }
    };


    const includedCount = documents.filter(d => d.included).length;
    const isDisabled = quotation.status === 'accepted' || quotation.status === 'sent';
    const isContractSigned = quotation.status === 'accepted';

    const getStatusInfo = () => {
        switch (quotation.status) {
            case 'accepted':
                return { 
                    text: 'Allekirjoitettu', 
                    icon: <CheckCircle className="text-green-500" />, 
                    color: 'bg-green-100 text-green-800',
                    desc: `Sopimus allekirjoitettiin ${new Date(quotation.contract?.signDate || Date.now()).toLocaleDateString()}.`
                };
            case 'sent':
                return { 
                    text: 'Odottaa allekirjoitusta', 
                    icon: <Clock className="text-purple-500" />,
                    color: 'bg-purple-100 text-purple-800',
                    desc: 'Sopimus on lähetetty asiakkaalle sähköiseen allekirjoitukseen.'
                };
            default:
                return {
                    text: 'Luonnos', 
                    icon: <FileSignature className="text-slate-500" />, 
                    color: 'bg-slate-100 text-slate-800',
                    desc: 'Sopimus on valmis koottavaksi ja lähetettäväksi.'
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                        <FileSignature className="text-blue-600" /> Sopimuksen Hallinta
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Järjestä, muokkaa ja valitse sähköiseen allekirjoitukseen lähetettävät dokumentit.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Status & Actions */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Sopimuksen tila</h2>
                        <div className={`flex items-center gap-3 p-4 rounded-lg ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <div className="flex-1">
                                <div className="font-bold">{statusInfo.text}</div>
                                <div className="text-xs opacity-80">{statusInfo.desc}</div>
                            </div>
                        </div>
                    </div>
                     {!isContractSigned && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Toiminnot</h2>
                             {quotation.status === 'sent' ? (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 flex items-start gap-2">
                                    <AlertTriangle size={24} className="flex-shrink-0" />
                                    <span>Voit perua allekirjoituspyynnön ja palauttaa sopimuksen luonnokseksi hallintapaneelista.</span>
                                </div>
                             ) : (
                                <button
                                    disabled={includedCount === 0 || isDisabled}
                                    onClick={() => alert('Lähetetään sähköiseen allekirjoitukseen... (toiminnallisuus ei toteutettu)')}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={18} /> Lähetä allekirjoitettavaksi ({includedCount})
                                </button>
                             )}
                        </div>
                     )}
                </div>

                {/* Right Column: Documents */}
                <div 
                    className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative"
                    onDragEnter={handleDragEnter}
                >
                     {isDraggingOver && !isDisabled && (
                        <div 
                            className="absolute inset-0 bg-blue-500/10 border-4 border-dashed border-blue-500 rounded-xl z-20 flex flex-col items-center justify-center"
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <UploadCloud size={48} className="text-blue-500" />
                            <p className="font-bold text-blue-700 mt-2">Pudota tiedostot tähän</p>
                        </div>
                    )}
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Paperclip size={18} /> Allekirjoituspaketin sisältö
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Raahaa dokumentteja muuttaaksesi järjestystä tai pudota tiedostoja lisätäksesi uusia.</p>
                    
                    <div className="space-y-3">
                        {documents.map((doc, index) => (
                            <div
                                key={doc.id}
                                draggable={!isDisabled}
                                onDragStart={(e) => { dragItem.current = index; e.dataTransfer.effectAllowed = 'move'; }}
                                onDragEnter={(e) => dragOverItem.current = index}
                                onDragEnd={handleDragSortEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors group ${isDisabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:bg-slate-50'} ${doc.included ? 'border-slate-200' : 'border-slate-100 bg-slate-50/50'}`}
                            >
                                {!isDisabled && <GripVertical className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />}
                                
                                <div onClick={() => !isDisabled && handleUpdateDoc(doc.id, 'included', !doc.included)} className={`flex-shrink-0 cursor-pointer ${doc.included ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {doc.included ? <CheckSquare size={24} /> : <Square size={24} />}
                                </div>
                                
                                <div className={`flex-shrink-0 ${doc.status === 'saved' ? 'text-green-500' : 'text-slate-400'}`}>
                                    {doc.status === 'saved' ? <FileCheck size={20} /> : <FileQuestion size={20} />}
                                </div>

                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        value={doc.name}
                                        onChange={(e) => handleUpdateDoc(doc.id, 'name', e.target.value)}
                                        disabled={isDisabled}
                                        className={`font-medium w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 ${doc.included ? 'text-slate-800' : 'text-slate-400 line-through'}`}
                                    />
                                    <input
                                        type="text"
                                        value={doc.category}
                                        onChange={(e) => handleUpdateDoc(doc.id, 'category', e.target.value)}
                                        disabled={isDisabled}
                                        className={`text-xs w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 ${doc.included ? 'text-slate-500' : 'text-slate-400'}`}
                                    />
                                </div>
                                {!isDisabled && (
                                <button onClick={() => handleRemoveDoc(doc.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!isDisabled && (
                        <div className="mt-6 border-t border-slate-200 pt-4">
                            <button onClick={handleAddDoc} className="w-full flex items-center justify-center gap-2 text-sm text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg py-2.5 transition-colors">
                                <PlusCircle size={16} /> Lisää tyhjä dokumenttirivi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractView;
