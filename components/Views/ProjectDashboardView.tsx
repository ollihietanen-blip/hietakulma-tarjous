import React, { useState, useRef, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FolderCog, ArrowRight, Save, Phone, Mail, MessageCircle, FileText, Send, Lock, User, FileSignature, MapPin, Hash, Calendar } from 'lucide-react';

interface ProjectDashboardViewProps {
  onNext: () => void;
}

const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({ onNext }) => {
  const { quotation, updateProject, addMessage, updateContract } = useQuotation();
  const { project, customer, messages, contract } = quotation;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'customer' | 'internal'>('customer');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myName = "Olli Hietanen";
  const projectOwners = ['Olli Hietanen', 'Matti Myyjä', 'Pekka Projekti']; // Mock data

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'end' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    addMessage({
      author: myName,
      text: newMessage,
      type: messageType,
    });
    setNewMessage('');
  };

  // Helper to format phone for WhatsApp link
  const formatPhoneNumberForWA = (phone: string) => {
      let formatted = phone.replace(/[\s-]/g, ''); // remove spaces and dashes
      if (formatted.startsWith('0')) {
          formatted = '358' + formatted.substring(1); // Assume Finnish number, replace leading 0 with +358
      }
      return formatted;
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium hover:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none transition-all duration-200 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ml-1";
  const cardClasses = "bg-white rounded-xl shadow-sm border border-slate-200 p-6";

  const isContractSigned = quotation.status === 'accepted';

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                    <FolderCog className="text-blue-600" /> {project.name || 'Nimetön Projekti'}
                </h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Hallitse projektin tietoja, viestintää ja tarjousta keskitetysti.
                </p>
            </div>
            <button 
                onClick={onNext}
                className="bg-slate-900 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-black active:scale-95"
            >
                Avaa Tarjouslaskenta <ArrowRight size={18} />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Actions & Details */}
            <div className="lg:col-span-1 space-y-6">
                <div className={cardClasses}>
                     <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Asiakas</h2>
                     <div className="font-bold text-lg text-slate-800">{customer.name}</div>
                     <div className="text-sm text-slate-500">{customer.contactPerson}</div>
                     
                     <div className="mt-6 space-y-3">
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-3 text-sm text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition-colors border border-blue-100/50">
                            <Phone size={18} /> Soita ({customer.phone})
                        </a>
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-slate-50 hover:bg-slate-100 p-3 rounded-lg transition-colors">
                            <Mail size={18} /> {customer.email}
                        </a>
                        <a href={`https://wa.me/${formatPhoneNumberForWA(customer.phone)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-slate-50 hover:bg-slate-100 p-3 rounded-lg transition-colors">
                            <MessageCircle size={18} /> WhatsApp
                        </a>
                     </div>
                </div>

                <div className={cardClasses}>
                     <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Projektin Asetukset</h2>
                        <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-blue-600 hover:underline">
                            {isEditing ? 'Sulje' : 'Muokkaa'}
                        </button>
                     </div>
                      {!isEditing && (
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={16} /></div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Projektin omistaja</span>
                                <span className="font-medium block">{project.owner}</span>
                            </div>
                        </div>
                     )}
                     {isEditing && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className={labelClasses}>Projektin nimi</label>
                                <input type="text" value={project.name} onChange={(e) => updateProject({ name: e.target.value })} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Rakennuspaikka</label>
                                <input type="text" value={project.address} onChange={(e) => updateProject({ address: e.target.value })} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Projektin omistaja</label>
                                <select 
                                    value={project.owner}
                                    onChange={(e) => updateProject({ owner: e.target.value })}
                                    className={inputClasses}
                                >
                                    {projectOwners.map(owner => (
                                        <option key={owner} value={owner}>{owner}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                     )}
                </div>

                {/* Contract Card */}
                <div className={cardClasses}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileSignature size={18} className="text-blue-600"/> Toimitussopimus
                        </h2>
                        {!isContractSigned && (
                            <button onClick={() => setIsEditingContract(!isEditingContract)} className="text-xs font-bold text-blue-600 hover:underline">
                                {isEditingContract ? 'Sulje' : 'Muokkaa'}
                            </button>
                        )}
                    </div>

                    {!isEditingContract ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">Tila</span>
                                {isContractSigned ? (
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Allekirjoitettu</span>
                                ) : (
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Luonnos</span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Hash size={16} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Sopimusnumero</div>
                                    <div className="text-sm font-bold text-slate-900">{contract?.contractNumber || '-'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Allekirjoituspaikka</div>
                                    <div className="text-sm font-bold text-slate-900">{contract?.signingPlace || '-'}</div>
                                </div>
                            </div>

                            {isContractSigned && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">Päiväys</div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {contract?.signDate ? new Date(contract.signDate).toLocaleDateString() : '-'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className={labelClasses}>Sopimusnumero</label>
                                <input 
                                    type="text" 
                                    value={contract?.contractNumber || ''} 
                                    onChange={(e) => updateContract({ contractNumber: e.target.value })} 
                                    className={inputClasses} 
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Allekirjoituspaikka</label>
                                <input 
                                    type="text" 
                                    value={contract?.signingPlace || ''} 
                                    onChange={(e) => updateContract({ signingPlace: e.target.value })} 
                                    className={inputClasses} 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Communication Feed */}
            <div className="lg:col-span-2">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[75vh]">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-lg text-slate-900">Viestintä</h2>
                    </div>
                    {/* Message Display Area */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {messages.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()).map(msg => {
                            const isMine = msg.author === myName;
                            const isInternal = msg.type === 'internal';

                            if (isInternal) {
                                return (
                                    <div key={msg.id} className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-2 max-w-md mx-auto text-sm">
                                        <Lock size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-yellow-900 whitespace-pre-wrap">{msg.text}</p>
                                            <div className="text-xs text-yellow-600 mt-2">{new Date(msg.timestamp).toLocaleString('fi-FI')}</div>
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div key={msg.id} className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-md text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-100 text-slate-800 rounded-bl-lg'}`}>
                                        <div className="font-bold mb-1">{isMine ? 'Sinä' : msg.author}</div>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                        <div className={`text-xs mt-2 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(msg.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-xl">
                        <div className="relative">
                            <textarea 
                                className="w-full p-3 pr-28 text-sm text-slate-800 outline-none resize-none bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                                rows={2}
                                placeholder="Kirjoita viesti tai sisäinen muistiinpano..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                            />
                            <div className="absolute right-2 top-2 flex flex-col gap-1.5">
                                 <button onClick={handleSendMessage} className="bg-blue-600 text-white h-8 px-3 rounded-md text-xs font-bold hover:bg-blue-700 disabled:opacity-50" disabled={!newMessage.trim()}>
                                    Lähetä
                                 </button>
                                 <select 
                                    value={messageType}
                                    onChange={(e) => setMessageType(e.target.value as any)}
                                    className="bg-slate-100 border-slate-200 border text-slate-600 text-xs font-bold rounded-md h-8 px-2"
                                 >
                                    <option value="customer">Asiakkaalle</option>
                                    <option value="internal">Sisäinen</option>
                                 </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProjectDashboardView;