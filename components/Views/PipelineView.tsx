import React, { useState } from 'react';
import { 
    KanbanSquare, MoreHorizontal, Plus, ArrowRight, 
    Calendar, User, AlertCircle, CheckCircle2, TrendingUp, Euro
} from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    customer: string;
    value: number;
    stage: 'lead' | 'estimating' | 'sent' | 'negotiation' | 'won';
    date: string;
    probability: number;
    tags: string[];
}

const PipelineView: React.FC = () => {
    // Mock Data
    const [deals, setDeals] = useState<Deal[]>([
        { id: '1', title: 'Loma-asunto Levi', customer: 'Matti Meikäläinen', value: 45200, stage: 'estimating', date: '2 pv sitten', probability: 40, tags: ['Kiireellinen'] },
        { id: '2', title: 'Rivitalo Espoo', customer: 'Rakennus Oy Esimerkki', value: 128500, stage: 'negotiation', date: '5 pv sitten', probability: 80, tags: ['B2B', 'Iso kohde'] },
        { id: '3', title: 'Autotalli', customer: 'Teppo Testaaja', value: 12800, stage: 'won', date: '1 vk sitten', probability: 100, tags: [] },
        { id: '4', title: 'Saunamökki Saimaa', customer: 'Maija Mallikas', value: 28000, stage: 'lead', date: 'Tänään', probability: 20, tags: ['Uusi'] },
        { id: '5', title: 'Paritalo Vantaa', customer: 'Urakoitsija X', value: 85000, stage: 'sent', date: 'Eilen', probability: 60, tags: ['B2B'] },
    ]);

    const stages = [
        { id: 'lead', label: 'Liidi / Yhteydenotto', color: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600' },
        { id: 'estimating', label: 'Laskennassa', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
        { id: 'sent', label: 'Tarjous lähetetty', color: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
        { id: 'negotiation', label: 'Neuvottelu', color: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
        { id: 'won', label: 'Kauppa', color: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    ] as const;

    const moveDeal = (id: string, currentStage: string) => {
        const stageOrder = ['lead', 'estimating', 'sent', 'negotiation', 'won'];
        const currentIndex = stageOrder.indexOf(currentStage);
        if (currentIndex < stageOrder.length - 1) {
            const nextStage = stageOrder[currentIndex + 1] as Deal['stage'];
            setDeals(deals.map(d => d.id === id ? { 
                ...d, 
                stage: nextStage,
                probability: nextStage === 'won' ? 100 : d.probability + 20
            } : d));
        }
    };

    const totalPipelineValue = deals.filter(d => d.stage !== 'won').reduce((sum, d) => sum + d.value, 0);
    const weightedForecast = deals.filter(d => d.stage !== 'won').reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header / Stats */}
            <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <KanbanSquare className="text-hieta-blue" /> Myyntiputki
                    </h1>
                    <div className="flex gap-6 mt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Euro size={14} />
                            Auki: <span className="font-bold text-slate-900">{totalPipelineValue.toLocaleString('fi-FI')} €</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-blue-500" />
                            Ennuste: <span className="font-bold text-hieta-blue">{weightedForecast.toLocaleString('fi-FI', {maximumFractionDigits: 0})} €</span>
                        </div>
                    </div>
                </div>
                <button className="bg-hieta-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all duration-200 card-shadow hover-lift">
                    <Plus size={16} /> Uusi Liidi
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex h-full gap-6 min-w-[1200px]">
                    {stages.map(stage => {
                        const stageDeals = deals.filter(d => d.stage === stage.id);
                        const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);
                        
                        return (
                            <div key={stage.id} className="flex-1 flex flex-col min-w-[280px]">
                                {/* Column Header */}
                                <div className={`p-3 rounded-t-xl border-t border-x ${stage.color} ${stage.border} flex justify-between items-center mb-0`}>
                                    <div>
                                        <h3 className={`font-bold text-sm uppercase tracking-wide ${stage.text}`}>{stage.label}</h3>
                                        <span className="text-xs text-slate-500 font-medium">{stageDeals.length} kpl • {stageTotal.toLocaleString('fi-FI', {maximumFractionDigits:0})} €</span>
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-white/50 flex items-center justify-center text-xs font-bold border border-white/50">
                                        {stageDeals.length}
                                    </div>
                                </div>
                                
                                {/* Drop Zone / List */}
                                <div className="flex-1 bg-slate-100/50 rounded-b-xl border-x border-b border-slate-200 p-3 space-y-3 overflow-y-auto">
                                    {stageDeals.map(deal => (
                                        <div key={deal.id} className="bg-white p-4 rounded-lg card-shadow border border-slate-200 group hover:shadow-md transition-all duration-200 hover:border-hieta-blue hover-lift relative">
                                            
                                            {/* Tags */}
                                            <div className="flex gap-2 mb-2">
                                                {deal.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm border border-slate-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <h4 className="font-bold text-slate-900 mb-0.5">{deal.title}</h4>
                                            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                                <User size={12} /> {deal.customer}
                                            </p>

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                                <div className="text-sm font-bold text-slate-700">
                                                    {deal.value.toLocaleString('fi-FI')} €
                                                </div>
                                                <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                    <Calendar size={12} /> {deal.date}
                                                </div>
                                            </div>

                                            {/* Hover Action */}
                                            {deal.stage !== 'won' && (
                                                <button 
                                                    onClick={() => moveDeal(deal.id, deal.stage)}
                                                    className="absolute top-1/2 right-[-10px] translate-y-[-50%] bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 group-hover:right-[-15px] transition-all z-10"
                                                    title="Siirrä seuraavaan vaiheeseen"
                                                >
                                                    <ArrowRight size={16} />
                                                </button>
                                            )}
                                            
                                            {/* Probability Bar */}
                                            {deal.stage !== 'won' && (
                                                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${deal.probability > 70 ? 'bg-green-500' : deal.probability > 40 ? 'bg-blue-500' : 'bg-slate-300'}`} 
                                                        style={{ width: `${deal.probability}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Empty State */}
                                    {stageDeals.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
                                            Ei projekteja
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PipelineView;