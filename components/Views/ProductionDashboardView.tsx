import React, { useState, useEffect, useMemo } from 'react';
import { Factory, Package, Calendar, MapPin, Clock, TrendingUp, Search, Filter, ArrowUpRight, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { externalApi } from '../../services/externalApi';
import { api } from '../../convex/_generated/api';
import { useQuery } from '../../lib/convexHooks';
import { Doc } from '../../convex/_generated/dataModel';

interface ProductionProject {
  number: string;
  name: string;
  address: string;
  city?: string;
  buildingType: string;
  deliveryWeek?: string;
  status: 'active' | 'planned' | 'completed';
  productionStart?: Date;
  productionEnd?: Date;
  hours?: number;
  location?: string;
}

interface SalesProject {
  _id: string;
  projectId: string;
  project: {
    number: string;
    name: string;
    address: string;
    city?: string;
    deliveryWeek?: string;
  };
  customer: {
    name: string;
  };
  status: string;
  pricing: {
    totalWithVat: number;
  };
  schedule?: {
    productionStart?: number;
    productionEnd?: number;
    installationStart?: number;
    installationEnd?: number;
  };
  owner: string;
}

const ProductionDashboardView: React.FC = () => {
  const [productionProjects, setProductionProjects] = useState<ProductionProject[]>([]);
  const [loadingProduction, setLoadingProduction] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'planned'>('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'production' | 'sales' | 'all'>('all');

  // Fetch production projects from API
  useEffect(() => {
    const fetchProductionProjects = async () => {
      try {
        setLoadingProduction(true);
        const projects = await externalApi.listProductionProjects();
        setProductionProjects(projects);
      } catch (error) {
        console.error('Error fetching production projects:', error);
      } finally {
        setLoadingProduction(false);
      }
    };

    fetchProductionProjects();
  }, []);

  // Fetch sales projects from Convex (accepted quotations) - safely check api structure
  // IMPORTANT: Query must be stable to ensure consistent hook order in useQuery wrapper
  const salesProjectsQuery = useMemo(() => 
    (api && api.quotations && api.quotations.listQuotations) ? api.quotations.listQuotations : null,
    [api?.quotations?.listQuotations]
  );
  const salesProjects = useQuery(salesProjectsQuery) as Doc<"quotations">[] | undefined;
  
  // Filter accepted quotations
  const acceptedSalesProjects = salesProjects?.filter(q => q.status === 'accepted') || [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'planned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'Tuotannossa';
      case 'planned': return 'Suunniteltu';
      case 'completed': return 'Valmis';
      default: return status;
    }
  };

  const getBuildingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'loma-asunto': 'Loma-asunto',
      'omakotitalo': 'Omakotitalo',
      'rivitalo': 'Rivitalo',
      'paritalo': 'Paritalo',
      'varastohalli': 'Varastohalli',
      'sauna': 'Sauna',
    };
    return types[type] || type;
  };

  // Format date
  const formatDate = (date?: Date | number) => {
    if (!date) return '-';
    const d = typeof date === 'number' ? new Date(date) : date;
    return d.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Combine and filter projects
  const allProductionProjects = productionProjects.map(p => ({
    ...p,
    source: 'production' as const,
    projectId: p.number,
  }));

  const allSalesProjects: Array<ProductionProject & { source: 'sales'; salesData?: SalesProject }> = acceptedSalesProjects.map(q => ({
    number: q.project.number,
    name: q.project.name,
    address: q.project.address,
    city: q.project.city,
    buildingType: q.project.buildingType || 'rivitalo', // Use actual building type from project
    deliveryWeek: q.project.deliveryWeek,
    status: 'planned' as const, // Sales projects are typically planned
    location: q.project.city,
    hours: undefined,
    productionStart: q.schedule?.productionStart ? new Date(q.schedule.productionStart) : undefined,
    productionEnd: q.schedule?.productionEnd ? new Date(q.schedule.productionEnd) : undefined,
    source: 'sales' as const,
    salesData: q,
  }));

  const combinedProjects = [...allProductionProjects, ...allSalesProjects];

  const filteredProjects = combinedProjects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.number.toLowerCase().includes(search.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesTab = activeTab === 'all' || (activeTab === 'production' && p.source === 'production') || (activeTab === 'sales' && p.source === 'sales');
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const activeCount = combinedProjects.filter(p => p.status === 'active').length;
  const plannedCount = combinedProjects.filter(p => p.status === 'planned').length;
  const productionCount = combinedProjects.filter(p => p.source === 'production').length;
  const salesCount = combinedProjects.filter(p => p.source === 'sales').length;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Factory className="text-hieta-blue" /> Tuotannon seuranta
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Seuraa tuotannossa olevia ja suunniteltuja projekteja</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-hieta-blue text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kaikki ({combinedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'production'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tuotannossa ({productionCount})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Myynnistä ({salesCount})
          </button>
        </div>

        {/* Stats and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Kaikki
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filter === 'active'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Aktiiviset ({activeCount})
            </button>
            <button
              onClick={() => setFilter('planned')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filter === 'planned'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Suunnitellut ({plannedCount})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Hae projektia, nro:ta tai paikkakuntaa..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-hieta-blue/20 focus:border-hieta-blue"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {loadingProduction ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Ladataan tuotantoprojekteja...</div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Package className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">Ei projekteja hakuehdoilla.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project) => {
                  const isProduction = project.source === 'production';
                  const salesProject = !isProduction && 'salesData' in project ? project.salesData : null;
                  
                  return (
                    <div
                      key={`${project.source}-${project.number}`}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all hover:border-hieta-blue group"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isProduction ? (
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Factory size={18} className="text-green-600" />
                              </div>
                            ) : (
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Package size={18} className="text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-lg">{project.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono text-slate-500">#{project.number}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">{getBuildingTypeLabel(project.buildingType)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>

                      {/* Location and Customer */}
                      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-slate-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-slate-500 uppercase font-bold mb-0.5">Paikkakunta</div>
                            <div className="text-sm font-medium text-slate-900">{project.location || project.city || '-'}</div>
                          </div>
                        </div>
                        {!isProduction && salesProject && (
                          <div className="flex items-start gap-2">
                            <Users size={16} className="text-slate-400 mt-0.5" />
                            <div>
                              <div className="text-xs text-slate-500 uppercase font-bold mb-0.5">Asiakas</div>
                              <div className="text-sm font-medium text-slate-900">{salesProject.customer.name}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3 mb-4">
                        {project.productionStart && (
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar size={14} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-slate-500 uppercase font-bold">Tuotannon alku</div>
                              <div className="text-sm font-medium text-slate-900">{formatDate(project.productionStart)}</div>
                            </div>
                          </div>
                        )}
                        {project.productionEnd && (
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle size={14} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-slate-500 uppercase font-bold">Tuotannon loppu</div>
                              <div className="text-sm font-medium text-slate-900">{formatDate(project.productionEnd)}</div>
                            </div>
                          </div>
                        )}
                        {project.deliveryWeek && (
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Package size={14} className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-slate-500 uppercase font-bold">Toimitusviikko</div>
                              <div className="text-sm font-medium text-slate-900">Vko {project.deliveryWeek}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          {project.hours && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-sm font-medium text-slate-600">{project.hours} h</span>
                            </div>
                          )}
                          {!isProduction && salesProject && salesProject.pricing && (
                            <div className="flex items-center gap-2">
                              <TrendingUp size={14} className="text-slate-400" />
                              <span className="text-sm font-medium text-slate-600">
                                {salesProject.pricing.totalWithVat.toLocaleString('fi-FI', { maximumFractionDigits: 0 })} €
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={18} className="text-slate-300 group-hover:text-hieta-blue transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboardView;
