


import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Folder, Search, Filter, ArrowUpRight, Calendar, User, FileText, CheckCircle2, Clock } from 'lucide-react';
import { QuotationStatus } from '../../types';

interface ProjectsListViewProps {
  onOpenProject: () => void;
}

const ProjectsListView: React.FC<ProjectsListViewProps> = ({ onOpenProject }) => {
  const { quotation } = useQuotation();

  // Mock data representing database of projects
  const allProjects = [
    { id: 'curr', name: quotation.project.name || 'Nimetön (Luonnos)', customer: quotation.customer.name || 'Ei asiakasta', status: quotation.status, value: quotation.pricing.totalWithVat, date: 'Tänään', owner: quotation.project.owner },
    { id: '101', name: 'Loma-asunto Levi', customer: 'Matti Meikäläinen', status: 'sent', value: 45200, date: '2 pv sitten', owner: 'Olli Hietanen' },
    { id: '102', name: 'Rivitalo Espoo', customer: 'Rakennus Oy Esimerkki', status: 'awaiting_approval', value: 128500, date: '5 pv sitten', owner: 'Pekka Projekti' },
    { id: '103', name: 'Autotalli', customer: 'Teppo Testaaja', status: 'accepted', value: 12800, date: '1 vk sitten', owner: 'Matti Myyjä' },
    { id: '104', name: 'Saunamökki Saimaa', customer: 'Maija Mallikas', status: 'draft', value: 28000, date: '2 vk sitten', owner: 'Olli Hietanen' },
    { id: '105', name: 'Paritalo Vantaa', customer: 'Urakoitsija X', status: 'sent', value: 85000, date: '3 vk sitten', owner: 'Matti Myyjä' },
    { id: '106', name: 'Varastohalli Pori', customer: 'Logistiikka Oy', status: 'rejected', value: 210000, date: '1 kk sitten', owner: 'Pekka Projekti' },
  ];

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'draft': return 'bg-slate-100 text-slate-600';
          case 'awaiting_approval': return 'bg-amber-50 text-amber-600';
          case 'approved': return 'bg-blue-50 text-blue-600';
          case 'sent': return 'bg-purple-50 text-purple-600';
          case 'accepted': return 'bg-green-50 text-green-700';
          case 'rejected': return 'bg-red-50 text-red-600';
          default: return 'bg-slate-50 text-slate-500';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'draft': return 'Luonnos';
          case 'awaiting_approval': return 'Odottaa hyv.';
          case 'approved': return 'Hyväksytty (Sis.)';
          case 'sent': return 'Lähetetty';
          case 'accepted': return 'Kauppa';
          case 'rejected': return 'Hävinnyt';
          default: return status;
      }
  };

  const filteredProjects = allProjects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.customer.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || p.status === filter;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-slate-50 flex-col">
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Folder className="text-blue-600" /> Projektit
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Selaa ja hallitse kaikkia projekteja.</p>
            </div>
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Hae projektia tai asiakasta..." 
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Kaikki</button>
                    <button onClick={() => setFilter('draft')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'draft' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Luonnokset</button>
                    <button onClick={() => setFilter('accepted')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'accepted' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Kaupat</button>
                </div>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Projektin nimi</th>
                            <th className="px-6 py-4">Asiakas</th>
                            <th className="px-6 py-4">Omistaja</th>
                            <th className="px-6 py-4">Tila</th>
                            <th className="px-6 py-4 text-right">Arvo</th>
                            <th className="px-6 py-4 text-right">Päivitetty</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredProjects.map(project => (
                            <tr 
                                key={project.id} 
                                className="group hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    // This now opens the project dashboard view for any project
                                    onOpenProject();
                                }}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        {project.name}
                                    </div>
                                    {project.id === 'curr' && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded ml-6">NYKYINEN ISTUNTO</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        {project.customer}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        {project.owner}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(project.status as string)}`}>
                                        {getStatusLabel(project.status as string)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    {project.value.toLocaleString('fi-FI', {maximumFractionDigits: 0})} €
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-slate-500 flex items-center justify-end gap-2 h-full">
                                    <Clock size={14} />
                                    {project.date}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredProjects.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        Ei projekteja hakuehdoilla.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ProjectsListView;