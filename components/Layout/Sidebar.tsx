import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { LayoutDashboard, Calculator, FileText, Users, LogOut, ChevronRight, KanbanSquare, X, PieChart, RefreshCw, FolderCog, Triangle, Box, ChevronDown, ListTree, Calendar, FileSignature } from 'lucide-react';
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
  const [isProjectMenuExpanded, setIsProjectMenuExpanded] = useState(isProjectActive);

  // Automatically expand the project menu when a project becomes active.
  useEffect(() => {
    setIsProjectMenuExpanded(isProjectActive);
  }, [isProjectActive]);

  const handleNavigation = (viewId: string) => {
      onChangeView(viewId);
      if (onClose) onClose();
  };

  const projectSubItems = [
    { id: 'project_dashboard', label: 'Yleisnäkymä', icon: <FolderCog size={18} /> },
    { id: 'element_calculator', label: 'Elementtilaskuri', icon: <Box size={18} /> },
    { id: 'truss_calculator', label: 'Ristikkolaskuri', icon: <Triangle size={18} /> },
    ...(userRole === 'manager' ? [{ id: 'cost_tracking', label: 'Jälkilaskenta', icon: <PieChart size={18} /> }] : []),
    { id: 'quotation', label: 'Tarjouslaskenta', icon: <FileText size={18} /> },
    { id: 'contract_view', label: 'Sopimus', icon: <FileSignature size={18} /> },
  ];

  const menuSections = [
    {
      title: 'Hallinta',
      items: [
        { id: 'dashboard', label: 'Etusivu', icon: <LayoutDashboard size={20} /> },
        { id: 'pipeline', label: 'Myyntiputki', icon: <KanbanSquare size={20} /> },
        { id: 'calendar', label: 'Kalenteri', icon: <Calendar size={20} /> },
      ],
    },
    {
      title: 'Rekisterit',
      items: [
        { id: 'customers', label: 'Asiakkaat', icon: <Users size={20} /> },
        {
          id: 'projects',
          label: 'Projektit',
          icon: <ListTree size={20} />,
          children: isProjectActive ? projectSubItems : undefined,
        },
      ],
    },
  ];

  const renderMenuItem = (item: any, isSubItem: boolean = false) => {
    const isActive = currentView === item.id;
    const isParentActive = item.children && item.children.some((child: any) => child.id === currentView);

    // Case 1: Item is an expandable parent (e.g., Projects when active)
    if (item.children) {
      return (
        <div key={item.id} className="bg-slate-900/50 rounded-lg p-1 border border-slate-800/50">
          <div className={`w-full flex items-center justify-between rounded-md transition-all group ${isParentActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            <button
              onClick={() => handleNavigation(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 flex-1 rounded-l-md ${isParentActive ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
            >
              <span className={isParentActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}>{item.icon}</span>
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </button>
            <button
              onClick={() => setIsProjectMenuExpanded(!isProjectMenuExpanded)}
              className={`p-2 mr-1 rounded-r-md ${isParentActive ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
            >
              <ChevronDown size={16} className={`transition-transform ${isProjectMenuExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isProjectMenuExpanded && (
            <div className="pt-3 pl-4 border-l-2 border-slate-700 ml-5 mt-2 animate-in fade-in duration-300">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 truncate pr-2">
                {quotation.project.name || 'Nimetön projekti'}
              </div>
              {item.children.map((child: any) => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }
    
    // Case 2: Item is a simple link
    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.id)}
        className={`w-full flex items-center justify-between py-2.5 rounded-md transition-all group mb-1 ${isSubItem ? 'px-3 text-sm' : 'px-3'} ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
            {item.icon}
          </span>
          <span className="font-medium tracking-wide">{item.label}</span>
        </div>
        {isActive && !isSubItem && <ChevronRight size={14} />}
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
          <div className="flex flex-col gap-2">
            <img 
              src="/images/Hietakulma_logo_cmyk_valk.png" 
              alt="Hietakulma" 
              className="h-8 w-auto"
            />
            <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase font-sans font-medium">
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
          {menuSections.map(section => (
            <div key={section.title} className="mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">{section.title}</div>
              {section.items.map(item => renderMenuItem(item))}
            </div>
          ))}
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