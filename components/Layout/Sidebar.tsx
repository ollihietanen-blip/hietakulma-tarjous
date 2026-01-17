import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { LayoutDashboard, Calculator, FileText, Users, LogOut, ChevronRight, KanbanSquare, X, PieChart, RefreshCw, FolderCog, Triangle, Box, ChevronDown, ListTree, Calendar, FileSignature, UserCog, Factory } from 'lucide-react';
import { UserRole } from '../../App';
import { api } from '../../convex/_generated/api.js';
import { isConvexConfigured } from '../../lib/convexClient';
import { useQuery } from '../../lib/convexHooks';
import { Id } from '../../convex/_generated/dataModel';

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
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  
  // Get current user ID from localStorage or use first active user
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(() => {
    const stored = localStorage.getItem('currentUserId');
    return stored as Id<"users"> | null;
  });
  
  // Fetch all users from database - safely check api structure
  const usersQuery = (api && api.users && api.users.listUsers) ? api.users.listUsers : undefined;
  const users = useQuery(usersQuery);
  
  // Find current user
  const currentUser = users?.find(u => u._id === currentUserId) || users?.find(u => u.active) || null;
  
  // Set first user as current if none selected
  useEffect(() => {
    if (users && users.length > 0 && !currentUserId) {
      const firstActiveUser = users.find(u => u.active) || users[0];
      if (firstActiveUser) {
        setCurrentUserId(firstActiveUser._id);
        localStorage.setItem('currentUserId', firstActiveUser._id);
      }
    }
  }, [users, currentUserId]);

  // Handle user switch
  const handleUserSwitch = (userId: Id<"users">) => {
    setCurrentUserId(userId);
    localStorage.setItem('currentUserId', userId);
    setShowUserSwitcher(false);
    // Trigger custom event to notify App.tsx
    window.dispatchEvent(new CustomEvent('currentUserIdChanged', { detail: userId }));
  };

  // Close user switcher when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserSwitcher && !target.closest('.user-switcher-container')) {
        setShowUserSwitcher(false);
      }
    };

    if (showUserSwitcher) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserSwitcher]);
  
  // Get user initials
  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Map role from database to UserRole type
  const getRoleFromUser = (role: string): UserRole => {
    if (role === 'toimitusjohtaja' || role === 'myyntipäällikkö') {
      return 'manager';
    }
    if (role === 'tehtaanjohtaja') {
      return 'manager'; // Factory manager also has manager-level access
    }
    return 'sales';
  };
  
  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'toimitusjohtaja': 'Toimitusjohtaja',
      'myyntipäällikkö': 'Myyntipäällikkö',
      'myyntiedustaja': 'Myyntiedustaja',
      'tehtaanjohtaja': 'Tehtaanjohtaja',
      'muu': 'Käyttäjä'
    };
    return roleMap[role] || 'Käyttäjä';
  };

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

  // Check if current user is manager (toimitusjohtaja or myyntipäällikkö)
  const isManager = currentUser && (currentUser.role === 'toimitusjohtaja' || currentUser.role === 'myyntipäällikkö');
  const isFactoryManager = currentUser && currentUser.role === 'tehtaanjohtaja';

  const menuSections = [
    {
      title: 'Hallinta',
      items: [
        { id: 'dashboard', label: 'Etusivu', icon: <LayoutDashboard size={20} /> },
        { id: 'pipeline', label: 'Myyntiputki', icon: <KanbanSquare size={20} /> },
        { id: 'calendar', label: 'Kalenteri', icon: <Calendar size={20} /> },
        ...(isFactoryManager ? [{ id: 'production', label: 'Tuotannon seuranta', icon: <Factory size={20} /> }] : []),
        ...(isManager ? [{ id: 'users_management', label: 'Käyttäjähallinta', icon: <UserCog size={20} /> }] : []),
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
            <div className="pt-3 pl-4 border-l-2 border-slate-700 ml-5 mt-2 animate-in fade-in duration-300 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 truncate pr-2 px-2 py-1 bg-slate-900/30 rounded">
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
        className={`w-full flex items-center justify-between py-2.5 rounded-lg transition-all group mb-1 ${isSubItem ? 'px-3 text-sm' : 'px-3'} ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 border-l-2 border-blue-400' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:border-l-2 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}>
            {item.icon}
          </span>
          <span className={`font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
        </div>
        {isActive && !isSubItem && <ChevronRight size={14} className="text-white" />}
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
              Myynti ERP
            </span>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {menuSections.map(section => (
            <div key={section.title} className="mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">{section.title}</div>
              <div className="space-y-1">
                {section.items.map(item => renderMenuItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* User / Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 pb-8 md:pb-4">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-display text-lg
                    ${currentUser.role === 'toimitusjohtaja' ? 'bg-purple-500 text-white' :
                      currentUser.role === 'myyntipäällikkö' ? 'bg-blue-500 text-white' :
                      currentUser.role === 'tehtaanjohtaja' ? 'bg-green-500 text-white' :
                      'bg-hieta-sand text-hieta-black'}
                `}>
                  {getUserInitials(currentUser.name)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{currentUser.name}</div>
                  <div className="relative user-switcher-container">
                    <div 
                      className="text-xs text-slate-500 cursor-pointer hover:text-blue-400 flex items-center gap-1" 
                      onClick={() => users && users.length > 1 && setShowUserSwitcher(!showUserSwitcher)}
                    >
                      {getRoleDisplayName(currentUser.role)}
                      {users && users.length > 1 && <RefreshCw size={10} />}
                    </div>
                    {showUserSwitcher && users && users.length > 1 && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 overflow-hidden">
                        <div className="p-2">
                          <div className="text-xs font-semibold text-slate-400 uppercase px-2 py-1 mb-1">
                            Vaihda käyttäjää
                          </div>
                          {users.filter(u => u.active).map((user) => (
                            <button
                              key={user._id}
                              onClick={() => handleUserSwitch(user._id)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                                user._id === currentUserId
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                user.role === 'toimitusjohtaja' ? 'bg-purple-500 text-white' :
                                user.role === 'myyntipäällikkö' ? 'bg-blue-500 text-white' :
                                user.role === 'tehtaanjohtaja' ? 'bg-green-500 text-white' :
                                'bg-hieta-sand text-hieta-black'
                              }`}>
                                {getUserInitials(user.name)}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs opacity-75">{getRoleDisplayName(user.role)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white py-2 transition-colors">
                <LogOut size={14} /> Kirjaudu ulos
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold font-display text-lg bg-slate-700 text-slate-400">
                  --
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400">Ladataan...</div>
                  <div className="text-xs text-slate-600">Käyttäjätietoja</div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white py-2 transition-colors">
                <LogOut size={14} /> Kirjaudu ulos
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;