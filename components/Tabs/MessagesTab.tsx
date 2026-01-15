import React, { useState, useEffect, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Send, MessageSquare, Lock, User, Briefcase } from 'lucide-react';

const MessagesTab: React.FC = () => {
  const { quotation, addMessage } = useQuotation();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'customer' | 'internal'>('customer');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myName = "Olli Hietanen";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [quotation.messages]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    addMessage({
      author: myName,
      text: newMessage,
      type: messageType,
    });
    setNewMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="text-hieta-blue" /> Viestit
                </h1>
                <p className="text-slate-500">Keskustele asiakkaan kanssa ja lisää sisäisiä muistiinpanoja.</p>
            </div>
        </div>

        <div className="bg-white rounded-xl card-shadow border border-slate-200 flex flex-col h-[70vh]">
            {/* Message Display Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {quotation.messages.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()).map(msg => {
                    const isMine = msg.author === myName;
                    const isInternal = msg.type === 'internal';
                    const isSystem = msg.author === 'Järjestelmä';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="text-center text-xs text-slate-400 my-4">{msg.text}</div>
                        )
                    }

                    if (isInternal) {
                        return (
                            <div key={msg.id} className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-2 max-w-xl mx-auto">
                                <Lock size={16} className="text-yellow-600 mt-1 flex-shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-yellow-800 text-sm">{msg.author}</span>
                                        <span className="text-xs text-yellow-600">(Sisäinen muistiinpano)</span>
                                    </div>
                                    <p className="text-sm text-yellow-900 whitespace-pre-wrap">{msg.text}</p>
                                    <div className="text-xs text-yellow-500 mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={msg.id} className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {!isMine && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs flex-shrink-0">
                                    <User size={16} />
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl max-w-lg ${isMine ? 'bg-hieta-blue text-white rounded-br-lg' : 'bg-slate-100 text-slate-800 rounded-bl-lg'}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-bold text-sm">{isMine ? 'Sinä' : msg.author}</span>
                                    <span className={`text-xs ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {isMine && (
                                <div className="w-8 h-8 rounded-full bg-hieta-sand flex items-center justify-center font-bold text-hieta-black text-xs flex-shrink-0">
                                    OH
                                </div>
                            )}
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-xl">
                <div className="bg-white border border-slate-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                    <textarea 
                        className="w-full p-3 text-sm text-slate-800 outline-none resize-none bg-transparent"
                        rows={3}
                        placeholder="Kirjoita viesti..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <div className="flex justify-between items-center p-2 border-t border-slate-100">
                        {/* Type Switch */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                            <button 
                                onClick={() => setMessageType('customer')}
                                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${messageType === 'customer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                            >
                                <User size={14} /> Asiakkaalle
                            </button>
                             <button 
                                onClick={() => setMessageType('internal')}
                                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${messageType === 'internal' ? 'bg-white shadow-sm text-yellow-700' : 'text-slate-500'}`}
                            >
                                <Lock size={14} /> Sisäinen
                            </button>
                        </div>
                        <button 
                            onClick={handleSend}
                            className="bg-blue-600 text-white font-bold text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            disabled={!newMessage.trim()}
                        >
                            Lähetä <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MessagesTab;
