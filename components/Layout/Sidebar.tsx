import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { LayoutDashboard, Calculator, FileText, Users, LogOut, ChevronRight, KanbanSquare, X, PieChart, RefreshCw, FolderCog, Triangle, Box, ChevronDown, ListTree, Calendar } from 'lucide-react';
import { UserRole } from '../../App';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: UserRole;
  onToggleRole?: () => void;
  isProjectActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen = true, onClose, userRole = 'sales', onToggleRole, isProjectActive }) => {
  const { quotation } = useQuotation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    puuelementti: true, // Default to open
  });

  const mainItems = [
    { id: 'dashboard', label: 'Etusivu', icon: <LayoutDashboard size={20} /> },
    { id: 'pipeline', label: 'Myyntiputki', icon: <KanbanSquare size={20} /> },
    { id: 'calendar', label: 'Kalenteri', icon: <Calendar size={20} /> },
  ];

  const registryItems = [
    { id: 'customers', label: 'Asiakkaat', icon: <Users size={20} /> },
    { id: 'projects', label: 'Projektit', icon: <ListTree size={20} /> },
  ];
  
  const activeProjectItems: any[] = [
    { id: 'project_dashboard', label: 'Projektin Yleisnäkymä', icon: <FolderCog size={20} /> },
    { 
      id: 'puuelementti', 
      label: 'Puuelementtilaskenta', 
      icon: <Box size={20} />,
      children: [
          { id: 'element_calculator', label: 'Määrälaskenta', icon: <Calculator size={20} /> },
          { id: 'quotation', label: 'Tarjouslaskenta', icon: <FileText size={20} /> },
      ]
    },
    { id: 'truss_calculator', label: 'Ristikkolaskenta', icon: <Triangle size={20} /> },
    ...(userRole === 'manager' ? [{ id: 'cost_tracking', label: 'Jälkilaskenta', icon: <PieChart size={20} /> }] : []),
  ];

  const handleNavigation = (viewId: string) => {
      onChangeView(viewId);
      if (onClose) onClose();
  };

  const renderLink = (item: any, isChild: boolean = false) => {
    const isActive = currentView === item.id;
    return (
        <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={`w-full flex items-center justify-between py-2.5 rounded-md transition-all group mb-1 ${isChild ? 'px-3' : 'px-3'} ${
            isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            <div className={`flex items-center gap-3 ${isChild ? 'pl-4' : ''}`}>
              <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
                  {item.icon}
              </span>
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </div>
            {isActive && <ChevronRight size={14} />}
        </button>
    );
  };

  return (
    <>
        {/* Mobile Backdrop */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
                onClick={onClose}
            ></div>
        )}

        {/* Sidebar Container */}
        <div className={`
            fixed inset-y-0 left-0 z-[70] w-64 bg-hieta-black text-white flex flex-col h-screen border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:shadow-none
        `}>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-widest text-white uppercase leading-none">
                Hietakulma
                </span>
                <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase mt-1 font-sans font-medium">
                Myynti
                </span>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
            
            <div className="mb-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Hallinta</div>
                {mainItems.map(item => renderLink(item))}
            </div>

            <div className="mb-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Rekisterit</div>
                {registryItems.map(item => renderLink(item))}
            </div>

            {isProjectActive && (
              <div className="mb-6 animate-in fade-in duration-300">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-2 truncate">
                      <span className="truncate">{quotation.project.name || 'Nimetön projekti'}</span>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-1 border border-slate-800/50">
                      {activeProjectItems.map((item) => {
                        if (item.children) {
                          const isParentActive = item.children.some((child: any) => child.id === currentView);
                          const isExpanded = !!expanded[item.id];
                          return (
                            <div key={item.id} className="mb-1">
                              <button
                                onClick={() => setExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all group ${
                                  isParentActive ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={isParentActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
                                    {item.icon}
                                  </span>
                                  <span className="font-medium text-sm tracking-wide">{item.label}</span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              {isExpanded && (
                                <div className="mt-1 space-y-1">
                                  {item.children.map((child: any) => renderLink(child, true))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return renderLink(item, false);
                      })}
                  </div>
              </div>
            )}

        </nav>

        {/* User / Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 pb-8 md:pb-4">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-display text-lg
                    ${userRole === 'manager' ? 'bg-purple-500 text-white' : 'bg-hieta-sand text-hieta-black'}
                `}>
                    OH
                </div>
                <div>
                    <div className="text-sm font-bold text-white">Olli Hietanen</div>
                    <div className="text-xs text-slate-500 cursor-pointer hover:text-blue-400 flex items-center gap-1" onClick={onToggleRole}>
                        {userRole === 'manager' ? 'Toimitusjohtaja' : 'Myyntiedustaja'}
                        <RefreshCw size={10} />
                    </div>
                </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white py-2 transition-colors">
                <LogOut size={14} /> Kirjaudu ulos
            </button>
        </div>
        </div>
    </>
  );
};

export default Sidebar;