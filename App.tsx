import React, { useState } from 'react';
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
import { Menu } from 'lucide-react';

// Added 'messages'
export type TabType = 'documents' | 'elements' | 'products' | 'installation' | 'pricing' | 'delivery' | 'summary' | 'contract' | 'messages';
export type UserRole = 'sales' | 'manager';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('sales');

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
        <div className="fixed top-0 left-0 right-0 h-14 bg-hieta-black text-white z-50 flex items-center justify-between px-4 md:hidden shadow-md">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-1 text-slate-300 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
                <img 
                    src="/images/Hietakulma_logo_cmyk_valk.png" 
                    alt="Hietakulma" 
                    className="h-6 w-auto"
                />
            </div>
            <div className="w-8 h-8 rounded-full bg-hieta-sand text-hieta-black flex items-center justify-center font-bold text-xs">
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
            onToggleRole={() => setUserRole(prev => prev === 'sales' ? 'manager' : 'sales')}
            isProjectActive={isProjectActive}
        />

        {/* Main Content Area - Responsive margin */}
        <div className="flex-1 w-full md:ml-64 min-h-screen flex flex-col pt-14 md:pt-0 transition-all duration-300">
           {currentView === 'dashboard' && (
               <div className="flex-1 bg-hieta-light">
                   <DashboardHome 
                        onNewQuote={() => setCurrentView('customers')} 
                        userRole={userRole}
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
        </div>
      </div>
    </QuotationProvider>
  );
}

export default App;