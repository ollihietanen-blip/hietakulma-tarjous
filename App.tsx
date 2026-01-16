import React, { useState, useEffect } from 'react';
import { QuotationProvider } from './context/QuotationContext';
import Sidebar from './components/Layout/Sidebar';
import DashboardHome from './components/Views/DashboardHome';
import ElementCalculatorView from './components/Views/ElementCalculatorView';
import QuotationView from './components/Views/QuotationView';
import CustomersView from './components/Views/CustomersView';
import ProjectDashboardView from './components/Views/ProjectDashboardView';
import PipelineView from './components/Views/PipelineView';
import ProjectsListView from './components/Views/ProjectsListView';
import CostTrackingView from './components/Views/CostTrackingView';
import TrussCalculatorView from './components/Views/TrussCalculatorView';
import CalendarView from './components/Views/CalendarView';
import ContractView from './components/Views/ContractView';
import UsersManagementView from './components/Views/UsersManagementView';
import ProductionDashboardView from './components/Views/ProductionDashboardView';
import { Menu } from 'lucide-react';
import { api } from './convex/_generated/api.js';
import { isConvexConfigured } from './lib/convexClient';
import { useQuery } from './lib/convexHooks';
import { Id } from './convex/_generated/dataModel';

// Added 'messages'
export type TabType = 'documents' | 'elements' | 'products' | 'installation' | 'pricing' | 'delivery' | 'summary' | 'contract' | 'messages';
export type UserRole = 'sales' | 'manager';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get current user from database
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(() => {
    const stored = localStorage.getItem('currentUserId');
    return stored as Id<"users"> | null;
  });
  
  const users = useQuery(api?.users?.listUsers);
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
  
  // Listen for user changes from localStorage and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUserId' && e.newValue) {
        setCurrentUserId(e.newValue as Id<"users">);
      }
    };
    
    const handleCustomStorage = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUserId(customEvent.detail as Id<"users">);
      } else {
        const stored = localStorage.getItem('currentUserId');
        if (stored) {
          setCurrentUserId(stored as Id<"users">);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('currentUserIdChanged', handleCustomStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currentUserIdChanged', handleCustomStorage);
    };
  }, []);
  
  // Update userRole based on current user
  const userRole: UserRole = currentUser 
    ? (currentUser.role === 'toimitusjohtaja' || currentUser.role === 'myyntipäällikkö' ? 'manager' : 'sales')
    : 'sales';
  
  const isFactoryManager = currentUser?.role === 'tehtaanjohtaja';

  const projectViews = [
    'project_dashboard', 
    'element_calculator', 
    'truss_calculator', 
    'quotation', 
    'cost_tracking',
    'contract_view'
  ];
  const isProjectActive = projectViews.includes(currentView);

  return (
    <QuotationProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-hieta-black text-white z-50 flex items-center justify-between px-4 md:hidden shadow-lg border-b border-slate-800">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
                    aria-label="Avaa valikko"
                >
                    <Menu size={22} />
                </button>
                <img 
                    src="/images/Hietakulma_logo_cmyk_valk.png" 
                    alt="Hietakulma" 
                    className="h-6 w-auto"
                />
            </div>
            <div className="w-8 h-8 rounded-full bg-hieta-sand text-hieta-black flex items-center justify-center font-bold text-xs shadow-sm">
                OH
            </div>
        </div>

        {/* Sidebar (Responsive) */}
        <Sidebar 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            userRole={userRole}
            onToggleRole={() => {}} // Disabled - role comes from database
            isProjectActive={isProjectActive}
        />

        {/* Main Content Area - Responsive margin */}
        <div className="flex-1 w-full md:ml-64 min-h-screen flex flex-col pt-14 md:pt-0 transition-all duration-300">
           {currentView === 'dashboard' && (
               <div className="flex-1 bg-hieta-light">
                   <DashboardHome 
                        onNewQuote={() => setCurrentView('customers')} 
                        userRole={userRole}
                        currentUser={currentUser}
                   />
               </div>
           )}
           {currentView === 'pipeline' && (
               <div className="flex-1 bg-hieta-light">
                   <PipelineView />
               </div>
           )}
           {currentView === 'customers' && (
               <div className="flex-1 bg-hieta-light">
                   <CustomersView onSelectProject={() => setCurrentView('project_dashboard')} />
               </div>
           )}
           {currentView === 'projects' && (
               <div className="flex-1 bg-hieta-light">
                   <ProjectsListView onOpenProject={() => setCurrentView('project_dashboard')} />
               </div>
           )}
           {currentView === 'calendar' && (
               <div className="flex-1 bg-hieta-light">
                   <CalendarView />
               </div>
           )}
           {/* Active Project Workspaces */}
           {currentView === 'project_dashboard' && (
               <div className="flex-1 bg-hieta-light">
                   <ProjectDashboardView onNext={() => setCurrentView('quotation')} />
               </div>
           )}
           {currentView === 'element_calculator' && (
               <div className="flex-1 bg-hieta-light">
                   <ElementCalculatorView onComplete={() => setCurrentView('quotation')} />
               </div>
           )}
           {currentView === 'truss_calculator' && (
               <div className="flex-1 bg-hieta-light">
                   <TrussCalculatorView onComplete={() => setCurrentView('quotation')} />
               </div>
           )}
           {currentView === 'quotation' && (
               <div className="flex-1 h-screen">
                   <QuotationView />
               </div>
           )}
           {currentView === 'cost_tracking' && (
               <div className="flex-1 h-screen">
                   <CostTrackingView />
               </div>
           )}
           {currentView === 'contract_view' && (
               <div className="flex-1 bg-hieta-light">
                   <ContractView />
               </div>
           )}
           {currentView === 'users_management' && (
               <div className="flex-1 bg-hieta-light">
                   <UsersManagementView />
               </div>
           )}
           {currentView === 'production' && (
               <div className="flex-1 bg-hieta-light">
                   <ProductionDashboardView />
               </div>
           )}
        </div>
      </div>
    </QuotationProvider>
  );
}

export default App;