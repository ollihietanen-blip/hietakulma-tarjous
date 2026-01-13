import React from 'react';
import { LayoutDashboard, Calculator, FileText, Settings, LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Etusivu', icon: <LayoutDashboard size={20} /> },
    { id: 'takeoff', label: 'Määrälaskenta', icon: <Calculator size={20} /> },
    { id: 'quotation', label: 'Tarjouslaskenta', icon: <FileText size={20} /> },
  ];

  return (
    <div className="w-64 bg-hieta-black text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-[60]">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
         <div className="flex flex-col">
            <span className="font-display font-bold text-2xl tracking-widest text-white uppercase leading-none">
            Hietakulma
            </span>
            <span className="text-[10px] tracking-[0.3em] text-slate-500 uppercase mt-1 font-sans font-medium">
            Pro
            </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-md transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
                    {item.icon}
                </span>
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      {/* User / Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-hieta-sand text-hieta-black flex items-center justify-center font-bold font-display text-lg">
                OH
            </div>
            <div>
                <div className="text-sm font-bold text-white">Olli Hietanen</div>
                <div className="text-xs text-slate-500">Myyntipäällikkö</div>
            </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white py-2 transition-colors">
            <LogOut size={14} /> Kirjaudu ulos
        </button>
      </div>
    </div>
  );
};

export default Sidebar;