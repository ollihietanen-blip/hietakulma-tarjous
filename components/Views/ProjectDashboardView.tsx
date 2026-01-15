import React, { useState, useRef, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FolderCog, ArrowRight, Save, Phone, Mail, MessageCircle, FileText, Send, Lock, User, FileSignature, MapPin, Hash, Calendar, Clock, Copy, CheckCircle2, X, CheckSquare, Square, Mic, MicOff, Plus as PlusIcon, Bell, AlertCircle } from 'lucide-react';

interface ProjectDashboardViewProps {
  onNext: () => void;
}

const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({ onNext }) => {
  const { quotation, updateProject, updateSchedule, addMessage, updateContract, createNewVersion, switchToVersion, sendVersion, addCommunicationTask, updateCommunicationTask, completeCommunicationTask, removeCommunicationTask } = useQuotation();
  const { project, schedule, customer, messages, contract, versions, currentVersionId, communicationTasks } = quotation;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'customer' | 'internal'>('customer');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDictationModal, setShowDictationModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [newTask, setNewTask] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'other',
    title: '',
    description: '',
    dueDate: undefined as Date | undefined,
    assignedTo: 'Olli Hietanen'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  // Helper to safely format dates for input
  const formatDateForInput = (date?: Date) => date ? new Date(date).toISOString().split('T')[0] : '';

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg card-shadow font-medium hover:border-hieta-wood-accent focus:bg-white focus:ring-2 focus:ring-hieta-blue/20 focus:border-hieta-blue focus:outline-none transition-all duration-200 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ml-1";
  const cardClasses = "bg-white rounded-xl card-shadow border border-slate-200 p-6 hover-lift";

  const isContractSigned = quotation.status === 'accepted';

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                    <FolderCog className="text-hieta-blue" /> {project.name || 'Nimetön Projekti'}
                </h1>
                <p className="text-slate-600 mt-2 max-w-2xl font-medium">
                    Hallitse projektin tietoja, viestintää ja tarjousta keskitetysti.
                </p>
            </div>
            <button 
                onClick={onNext}
                className="bg-hieta-black text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 card-shadow-lg hover:bg-slate-800 hover-lift active:scale-95"
            >
                Avaa Tarjouslaskenta <ArrowRight size={18} />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Actions & Details */}
            <div className="lg:col-span-1 space-y-6">
                {/* Muistutukset */}
                <div className={cardClasses}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Bell size={18} className="text-orange-600"/> Muistutukset
                        </h2>
                    </div>
                    
                    <div className="space-y-2">
                        {(() => {
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            
                            // Suorittamattomat tehtävät
                            const incompleteTasks = communicationTasks.filter(t => !t.completed);
                            
                            // Eräpäivä tänään
                            const dueToday = incompleteTasks.filter(t => 
                                t.dueDate && new Date(t.dueDate).getTime() >= today.getTime() && 
                                new Date(t.dueDate).getTime() < tomorrow.getTime()
                            );
                            
                            // Eräpäivä huomenna
                            const dueTomorrow = incompleteTasks.filter(t => 
                                t.dueDate && new Date(t.dueDate).getTime() >= tomorrow.getTime() && 
                                new Date(t.dueDate).getTime() < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).getTime()
                            );
                            
                            // Myöhässä
                            const overdue = incompleteTasks.filter(t => 
                                t.dueDate && new Date(t.dueDate).getTime() < today.getTime()
                            );
                            
                            // Ei eräpäivää
                            const noDueDate = incompleteTasks.filter(t => !t.dueDate);
                            
                            if (incompleteTasks.length === 0) {
                                return (
                                    <div className="text-sm text-slate-500 py-4 text-center">
                                        Ei muistutuksia. Kaikki tehtävät suoritettu!
                                    </div>
                                );
                            }
                            
                            return (
                                <>
                                    {overdue.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle size={16} className="text-red-600" />
                                                <span className="font-bold text-sm text-red-900">Myöhässä ({overdue.length})</span>
                                            </div>
                                            {overdue.slice(0, 3).map(task => {
                                                const TaskIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : task.type === 'meeting' ? Calendar : MessageCircle;
                                                return (
                                                    <div key={task.id} className="text-xs text-red-800 flex items-center gap-2 mb-1">
                                                        <TaskIcon size={12} />
                                                        <span>{task.title}</span>
                                                    </div>
                                                );
                                            })}
                                            {overdue.length > 3 && (
                                                <div className="text-xs text-red-600 mt-1">+ {overdue.length - 3} muuta</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {dueToday.length > 0 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={16} className="text-orange-600" />
                                                <span className="font-bold text-sm text-orange-900">Tänään ({dueToday.length})</span>
                                            </div>
                                            {dueToday.slice(0, 3).map(task => {
                                                const TaskIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : task.type === 'meeting' ? Calendar : MessageCircle;
                                                return (
                                                    <div key={task.id} className="text-xs text-orange-800 flex items-center gap-2 mb-1">
                                                        <TaskIcon size={12} />
                                                        <span>{task.title}</span>
                                                    </div>
                                                );
                                            })}
                                            {dueToday.length > 3 && (
                                                <div className="text-xs text-orange-600 mt-1">+ {dueToday.length - 3} muuta</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {dueTomorrow.length > 0 && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar size={16} className="text-blue-600" />
                                                <span className="font-bold text-sm text-blue-900">Huomenna ({dueTomorrow.length})</span>
                                            </div>
                                            {dueTomorrow.slice(0, 3).map(task => {
                                                const TaskIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : task.type === 'meeting' ? Calendar : MessageCircle;
                                                return (
                                                    <div key={task.id} className="text-xs text-blue-800 flex items-center gap-2 mb-1">
                                                        <TaskIcon size={12} />
                                                        <span>{task.title}</span>
                                                    </div>
                                                );
                                            })}
                                            {dueTomorrow.length > 3 && (
                                                <div className="text-xs text-blue-600 mt-1">+ {dueTomorrow.length - 3} muuta</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {noDueDate.length > 0 && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageCircle size={16} className="text-slate-600" />
                                                <span className="font-bold text-sm text-slate-900">Ei eräpäivää ({noDueDate.length})</span>
                                            </div>
                                            {noDueDate.slice(0, 3).map(task => {
                                                const TaskIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : task.type === 'meeting' ? Calendar : MessageCircle;
                                                return (
                                                    <div key={task.id} className="text-xs text-slate-700 flex items-center gap-2 mb-1">
                                                        <TaskIcon size={12} />
                                                        <span>{task.title}</span>
                                                    </div>
                                                );
                                            })}
                                            {noDueDate.length > 3 && (
                                                <div className="text-xs text-slate-600 mt-1">+ {noDueDate.length - 3} muuta</div>
                                            )}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

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

                {/* Schedule Card */}
                <div className={cardClasses}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock size={18} className="text-blue-600"/> Aikataulu & Resurssit
                        </h2>
                        <button onClick={() => setIsEditingSchedule(!isEditingSchedule)} className="text-xs font-bold text-blue-600 hover:underline">
                            {isEditingSchedule ? 'Sulje' : 'Muokkaa'}
                        </button>
                    </div>

                    {!isEditingSchedule ? (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Toimitusviikko</span>
                                <span className="font-bold text-slate-900 text-lg">{project.deliveryWeek || 'Ei määritetty'}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-xs font-bold text-orange-600 uppercase mb-1">Tuotanto</div>
                                    <div className="text-slate-700">
                                        {schedule.productionStart ? new Date(schedule.productionStart).toLocaleDateString() : '-'} <br/> 
                                        {schedule.productionEnd ? new Date(schedule.productionEnd).toLocaleDateString() : ''}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-purple-600 uppercase mb-1">Asennus</div>
                                    <div className="text-slate-700">
                                        {schedule.installationStart ? new Date(schedule.installationStart).toLocaleDateString() : '-'} <br/>
                                        {schedule.installationEnd ? new Date(schedule.installationEnd).toLocaleDateString() : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className={labelClasses}>Toimitusviikko (Arvio)</label>
                                <input 
                                    type="text" 
                                    value={project.deliveryWeek || ''} 
                                    onChange={(e) => updateProject({ deliveryWeek: e.target.value })} 
                                    className={inputClasses}
                                    placeholder="esim. Vko 45"
                                />
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100">
                                <label className="text-xs font-bold text-orange-600 uppercase mb-2 block">Tuotantoaikataulu</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="date" 
                                        value={formatDateForInput(schedule.productionStart)} 
                                        onChange={(e) => updateSchedule({ productionStart: e.target.valueAsDate || undefined })} 
                                        className={`${inputClasses} text-xs px-2`}
                                    />
                                    <input 
                                        type="date" 
                                        value={formatDateForInput(schedule.productionEnd)} 
                                        onChange={(e) => updateSchedule({ productionEnd: e.target.valueAsDate || undefined })} 
                                        className={`${inputClasses} text-xs px-2`}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="text-xs font-bold text-purple-600 uppercase mb-2 block">Asennusaikataulu</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="date" 
                                        value={formatDateForInput(schedule.installationStart)} 
                                        onChange={(e) => updateSchedule({ installationStart: e.target.valueAsDate || undefined })} 
                                        className={`${inputClasses} text-xs px-2`}
                                    />
                                    <input 
                                        type="date" 
                                        value={formatDateForInput(schedule.installationEnd)} 
                                        onChange={(e) => updateSchedule({ installationEnd: e.target.valueAsDate || undefined })} 
                                        className={`${inputClasses} text-xs px-2`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Versions Card */}
                <div className={cardClasses}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Copy size={18} className="text-blue-600"/> Tarjouksen versiot
                        </h2>
                        <button 
                            onClick={() => setShowVersionModal(true)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            Uusi versio
                        </button>
                    </div>

                    <div className="space-y-2">
                        {versions.length === 0 ? (
                            <div className="text-sm text-slate-500 py-4 text-center">
                                Ei versioita vielä. Luo ensimmäinen versio.
                            </div>
                        ) : (
                            versions
                                .sort((a, b) => b.versionNumber - a.versionNumber)
                                .map(version => (
                                    <div 
                                        key={version.id}
                                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                            version.id === currentVersionId
                                                ? 'bg-blue-50 border-blue-300'
                                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                        onClick={() => switchToVersion(version.id)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 text-sm">{version.name}</span>
                                                    {version.id === currentVersionId && (
                                                        <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">Aktiivinen</span>
                                                    )}
                                                    {version.isSent && (
                                                        <span className="text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                                            <CheckCircle2 size={10} /> Lähetetty
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(version.createdAt).toLocaleDateString('fi-FI')} • {version.createdBy}
                                                </div>
                                                {version.notes && (
                                                    <div className="text-xs text-slate-600 mt-1 italic">{version.notes}</div>
                                                )}
                                                <div className="text-xs text-slate-400 mt-1">
                                                    Status: {version.status === 'draft' ? 'Luonnos' : 
                                                            version.status === 'sent' ? 'Lähetetty' :
                                                            version.status === 'accepted' ? 'Hyväksytty' : version.status}
                                                </div>
                                            </div>
                                            {!version.isSent && version.id !== currentVersionId && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        sendVersion(version.id);
                                                    }}
                                                    className="p-1.5 hover:bg-green-100 rounded transition-colors"
                                                    title="Lähetä tämä versio asiakkaalle"
                                                >
                                                    <Send size={14} className="text-green-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
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
            <div className="lg:col-span-2 space-y-6">
                {/* Communication Tasks */}
                <div className={cardClasses}>
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CheckSquare size={18} className="text-green-600"/> Kommunikointitehtävät
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDictationModal(true)}
                                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                            >
                                <Mic size={14} /> Sanelu
                            </button>
                            <button 
                                onClick={() => setShowTaskModal(true)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <PlusIcon size={14} /> Uusi tehtävä
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {communicationTasks.length === 0 ? (
                            <div className="text-sm text-slate-500 py-4 text-center">
                                Ei tehtäviä vielä. Luo ensimmäinen tehtävä.
                            </div>
                        ) : (
                            communicationTasks
                                .sort((a, b) => {
                                    // Ensin suorittamattomat, sitten suoritetut
                                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                                    // Sitten eräpäivän mukaan
                                    if (a.dueDate && b.dueDate) {
                                        return a.dueDate.getTime() - b.dueDate.getTime();
                                    }
                                    return 0;
                                })
                                .map(task => {
                                    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                                    const TaskIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : task.type === 'meeting' ? Calendar : MessageCircle;
                                    
                                    return (
                                        <div 
                                            key={task.id}
                                            className={`p-3 rounded-lg border transition-all ${
                                                task.completed
                                                    ? 'bg-slate-50 border-slate-200 opacity-60'
                                                    : isOverdue
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => {
                                                        if (task.completed) {
                                                            updateCommunicationTask(task.id, { completed: false, completedAt: undefined });
                                                        } else {
                                                            // Merkitse tehtävä valmiiksi - sanelu voidaan tehdä erikseen
                                                            completeCommunicationTask(task.id);
                                                        }
                                                    }}
                                                    className="mt-0.5"
                                                >
                                                    {task.completed ? (
                                                        <CheckSquare size={18} className="text-green-600" />
                                                    ) : (
                                                        <Square size={18} className="text-slate-400 hover:text-green-600" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <TaskIcon size={14} className="text-slate-500" />
                                                        <span className={`font-bold text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                            {task.title}
                                                        </span>
                                                        {isOverdue && (
                                                            <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded">Myöhässä</span>
                                                        )}
                                                    </div>
                                                    {task.description && (
                                                        <div className="text-xs text-slate-600 mb-1">{task.description}</div>
                                                    )}
                                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                                        {task.dueDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {new Date(task.dueDate).toLocaleDateString('fi-FI')}
                                                            </span>
                                                        )}
                                                        <span>{task.assignedTo}</span>
                                                        {task.completed && task.completedAt && (
                                                            <span className="text-green-600">Suoritettu {new Date(task.completedAt).toLocaleDateString('fi-FI')}</span>
                                                        )}
                                                    </div>
                                                    {task.notes && (
                                                        <div className="text-xs text-slate-600 mt-1 italic bg-slate-50 p-2 rounded">
                                                            {task.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeCommunicationTask(task.id)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
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

        {/* Version Creation Modal */}
        {showVersionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVersionModal(false)}>
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Luo uusi versio</h3>
                        <button onClick={() => setShowVersionModal(false)} className="p-1 hover:bg-slate-100 rounded">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Version nimi (valinnainen)
                            </label>
                            <input
                                type="text"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                placeholder="Jätä tyhjäksi automaattiselle nimeen (esim. Versio 2) tai anna oma nimi"
                                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Jos jätät tyhjäksi, versio nimetään automaattisesti seuraavaksi versionumeroksi
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Muistiinpanot (valinnainen)
                            </label>
                            <textarea
                                value={newVersionNotes}
                                onChange={(e) => setNewVersionNotes(e.target.value)}
                                placeholder="Mitä muutoksia tehtiin tässä versiossa?"
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none resize-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    const versionName = newVersionName.trim() || undefined;
                                    createNewVersion(versionName, newVersionNotes.trim() || undefined);
                                    const displayName = versionName || `Versio ${(quotation.versions.length || 0) + 1}`;
                                    setNewVersionName('');
                                    setNewVersionNotes('');
                                    setShowVersionModal(false);
                                    addMessage({
                                        author: 'Järjestelmä',
                                        text: `Luotu uusi tarjouksen versio: ${displayName}`,
                                        type: 'internal'
                                    });
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
                            >
                                Luo versio
                            </button>
                            <button
                                onClick={() => setShowVersionModal(false)}
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

export default ProjectDashboardView;