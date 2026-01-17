import React, { useState, useMemo } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { useCustomers } from '../../hooks/useCustomers';
import { Users, Search, Plus, MapPin, Phone, Mail, User, Building2, ArrowRight, FolderOpen, History, Tag, X, AlertCircle, FileText, CheckCircle, XCircle, Loader2, RefreshCw, Edit3, ExternalLink, Star } from 'lucide-react';

interface CustomersViewProps {
  onSelectProject: () => void;
}

const CustomersView: React.FC<CustomersViewProps> = ({ onSelectProject }) => {
  const { quotation, updateCustomer } = useQuotation();
  
  // Fetch customers from Thing-service API
  const { customers: apiCustomers, loading: customersLoading, error: customersError, refetch } = useCustomers({
    filter: { active: true },
    enabled: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Map API customers to display format - include all available data
  const customers = useMemo(() => {
    return apiCustomers.map((c) => ({
      id: c.sysId,
      sysId: c.sysId,
      name: c.contactPerson || c.name,
      company: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      businessId: c.businessId,
      billingMethod: c.billingMethod,
      billingAddress: c.billingAddress,
      active: c.active,
      deleted: c.deleted,
      type: c.businessId ? 'business' as const : 'consumer' as const,
      projectCount: 0, // TODO: Fetch from projects API
      tags: c.tags || [],
      props: c.props, // Keep original props for reference
    }));
  }, [apiCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(c => 
      (c.name?.toLowerCase() || '').includes(term) || 
      (c.company?.toLowerCase() || '').includes(term) ||
      (c.email?.toLowerCase() || '').includes(term) ||
      (c.phone || '').includes(term) ||
      (c.businessId?.toLowerCase() || '').includes(term) ||
      (c.address?.toLowerCase() || '').includes(term) ||
      (c.tags || []).some(tag => (tag?.toLowerCase() || '').includes(term))
    );
  }, [customers, searchTerm]);

  const handleSelectCustomer = (c: any) => {
      setSelectedId(c.id);
      // Update Context with selected customer data from API
      updateCustomer({
          name: c.company || c.name,
          contactPerson: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          billingMethod: c.billingMethod || (c.type === 'business' ? 'e-invoice' : 'email'),
          tags: c.tags || []
      });
  };

  const handleStartProject = () => {
     // Trigger navigation to project settings to start/edit active project
     onSelectProject();
  };

  const handleAddTag = () => {
      const currentTags = quotation.customer.tags || [];
      if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
          updateCustomer({
              tags: [...currentTags, tagInput.trim()]
          });
          setTagInput('');
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      const currentTags = quotation.customer.tags || [];
      updateCustomer({
          tags: currentTags.filter(t => t !== tagToRemove)
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleAddTag();
      }
  };

  const selectedCustomer = selectedId ? customers.find(c => c.id === selectedId) : null;

  // Debug: Log props object to see available data
  React.useEffect(() => {
    if (selectedCustomer?.props) {
      console.log('Customer props available:', selectedCustomer.props);
    }
  }, [selectedCustomer]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Left List - Enhanced */}
      <div className="w-96 border-r border-slate-200/80 bg-white/80 backdrop-blur-sm flex flex-col shadow-sm">
          {/* Header Section */}
          <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur">
              <div className="flex items-center justify-between mb-5">
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-hieta-blue/10">
                          <Users className="text-hieta-blue" size={20} />
                      </div>
                      Asiakkaat
                  </h1>
                  {filteredCustomers.length > 0 && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {filteredCustomers.length}
                      </span>
                  )}
              </div>
              
              {/* Enhanced Search */}
              <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Hae nimiä, sähköposteja, Y-tunnuksia..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hieta-blue/30 focus:border-hieta-blue/50 transition-all placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                      <button 
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                      >
                          <X size={16} />
                      </button>
                  )}
              </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {/* Loading State */}
              {customersLoading && (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                      <Loader2 className="text-hieta-blue animate-spin mb-4" size={32} />
                      <p className="text-sm font-medium text-slate-600">Haetaan asiakkaita...</p>
                      <p className="text-xs text-slate-400 mt-1">Tämä voi kestää hetken</p>
                  </div>
              )}

              {/* Error State */}
              {customersError && !customersLoading && (
                  <div className="m-4 p-5 bg-red-50/80 border border-red-200/80 rounded-xl shadow-sm">
                      <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                              <AlertCircle className="text-red-600" size={20} />
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-semibold text-red-900 mb-1">Virhe asiakkaiden haussa</p>
                              <p className="text-xs text-red-700 mb-3 leading-relaxed">{customersError.message}</p>
                              <button 
                                  onClick={() => refetch()} 
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-900 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                              >
                                  <RefreshCw size={14} /> Yritä uudelleen
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* Empty State */}
              {!customersLoading && !customersError && filteredCustomers.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                          <Search className="text-slate-400" size={28} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                          {searchTerm ? 'Hakutuloksia ei löytynyt' : 'Asiakkaita ei löytynyt'}
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs">
                          {searchTerm 
                              ? 'Kokeile muuttaa hakuehtoja tai poistaa hakusanaa'
                              : 'Asiakkaita haetaan Thing-service -järjestelmästä'}
                      </p>
                  </div>
              )}

              {/* Customer Cards */}
              {!customersLoading && !customersError && filteredCustomers.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className={`group p-4 border-b border-slate-100/80 cursor-pointer transition-all duration-200 ${
                      selectedId === c.id 
                        ? 'bg-gradient-to-r from-hieta-blue/10 via-hieta-blue/5 to-transparent border-l-4 border-l-hieta-blue' 
                        : 'hover:bg-slate-50/80 hover:border-l-4 hover:border-l-slate-200'
                    }`}
                  >
                      {/* Header Row */}
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-base truncate mb-0.5 transition-colors ${
                                  selectedId === c.id ? 'text-hieta-blue' : 'text-slate-900 group-hover:text-hieta-blue'
                              }`}>
                                  {c.company || c.name}
                              </h3>
                              {c.contactPerson && c.contactPerson !== c.company && (
                                  <p className="text-xs text-slate-500 truncate">{c.contactPerson}</p>
                              )}
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              {c.active !== false ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200/50 text-[10px] font-semibold">
                                      <CheckCircle size={10} className="fill-current" /> Aktiivinen
                                  </span>
                              ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                                      Päättynyt
                                  </span>
                              )}
                          </div>
                      </div>

                      {/* Tags */}
                      {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2.5">
                              {c.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md bg-hieta-blue/10 text-hieta-blue border border-hieta-blue/20 text-[10px] font-medium">
                                      {tag}
                                  </span>
                              ))}
                              {c.tags.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                                      +{c.tags.length - 2}
                                  </span>
                              )}
                          </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-1.5">
                          {c.address && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                                  <span className="truncate">{c.address}</span>
                              </div>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                              {c.email && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                      <Mail size={11} className="text-slate-400" />
                                      <span className="truncate max-w-[140px]">{c.email}</span>
                                  </div>
                              )}
                              {c.businessId && (
                                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                                      <Building2 size={11} className="text-slate-400" />
                                      <span>{c.businessId}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur">
              <button className="w-full flex items-center justify-center gap-2 bg-hieta-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Plus size={18} /> Uusi Asiakas
              </button>
          </div>
      </div>

      {/* Right Details Panel - Enhanced */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-white overflow-y-auto">
          {selectedCustomer ? (
              <div className="max-w-5xl mx-auto p-8 space-y-6 animate-in fade-in slide-in-from-right-4">
                  
                  {/* Customer Header Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
                          <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                  <div className={`p-3 rounded-2xl shadow-sm ${
                                      selectedCustomer.type === 'business' 
                                          ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600' 
                                          : 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600'
                                  }`}>
                                      {selectedCustomer.type === 'business' ? <Building2 size={28} /> : <User size={28} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <h2 className="text-3xl font-bold text-slate-900 mb-1">
                                          {selectedCustomer.company || selectedCustomer.name}
                                      </h2>
                                      {selectedCustomer.contactPerson && selectedCustomer.contactPerson !== selectedCustomer.company && (
                                          <p className="text-lg text-slate-600 font-medium">{selectedCustomer.contactPerson}</p>
                                      )}
                                      
                                      {/* Status & Meta */}
                                      <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                                          {selectedCustomer.active !== false ? (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold">
                                                  <CheckCircle size={14} className="fill-current" /> Aktiivinen asiakas
                                              </span>
                                          ) : (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold">
                                                  <XCircle size={14} /> Päättynyt asiakkuus
                                              </span>
                                          )}
                                          {selectedCustomer.businessId && (
                                              <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-xs font-mono font-semibold">
                                                  {selectedCustomer.businessId}
                                              </span>
                                          )}
                                          {selectedCustomer.sysId && (
                                              <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 text-xs font-mono">
                                                  ID: {selectedCustomer.sysId}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-hieta-blue bg-hieta-blue/10 hover:bg-hieta-blue/20 rounded-xl border border-hieta-blue/20 transition-all duration-200">
                                  <Edit3 size={16} /> Muokkaa
                              </button>
                          </div>
                      </div>

                      {/* Detailed Information Sections */}
                      <div className="p-6 space-y-6">
                          {/* PERUSTIEDOT Section */}
                          <div>
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                                  PERUSTIEDOT
                                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                      <ArrowRight size={14} className="rotate-90" />
                                  </button>
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                      <span className="text-sm text-slate-500">Tyyppi</span>
                                      <span className="text-sm font-semibold text-slate-900">
                                          {selectedCustomer.type === 'business' ? 'Yritys' : 'Kuluttaja'}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                      <span className="text-sm text-slate-500">Yrityksen nimi</span>
                                      <span className="text-sm font-semibold text-slate-900">{selectedCustomer.company || selectedCustomer.name}</span>
                                  </div>
                                  {selectedCustomer.businessId && (
                                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-sm text-slate-500">Y-tunnus</span>
                                          <span className="text-sm font-semibold text-slate-900 font-mono">{selectedCustomer.businessId}</span>
                                      </div>
                                  )}
                                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                      <span className="text-sm text-slate-500">Tila</span>
                                      <span className="text-sm font-semibold text-slate-900">
                                          {selectedCustomer.active !== false ? 'Asiakas' : 'Päättynyt'}
                                      </span>
                                  </div>
                                  {(selectedCustomer.props?.rating || selectedCustomer.props?.arvosana) && (
                                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-sm text-slate-500">Arvosana</span>
                                          <div className="flex items-center gap-1">
                                              {Array.from({ length: 5 }).map((_, i) => {
                                                  const rating = selectedCustomer.props?.rating || selectedCustomer.props?.arvosana || 0;
                                                  return (
                                                      <Star
                                                          key={i}
                                                          size={16}
                                                          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                                                      />
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Osoite Section */}
                          {(selectedCustomer.address || selectedCustomer.props?.streetAddress || selectedCustomer.props?.street || selectedCustomer.props?.postalCode || selectedCustomer.props?.city) && (
                              <div>
                                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Osoite</h3>
                                  <div className="space-y-2">
                                      {/* Katuosoite - prioritize props fields */}
                                      {(selectedCustomer.props?.streetAddress || selectedCustomer.props?.street || selectedCustomer.address) && (
                                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                              <span className="text-sm text-slate-500">Katuosoite</span>
                                              <span className="text-sm font-semibold text-slate-900 text-right">
                                                  {selectedCustomer.props?.streetAddress || selectedCustomer.props?.street || (selectedCustomer.address ? selectedCustomer.address.split(',')[0]?.trim() : '')}
                                              </span>
                                          </div>
                                      )}
                                      {/* Postinumero */}
                                      {(selectedCustomer.props?.postalCode || (selectedCustomer.address && selectedCustomer.address.match(/\d{5}/)?.[0])) && (
                                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                              <span className="text-sm text-slate-500">Postinumero</span>
                                              <span className="text-sm font-semibold text-slate-900">
                                                  {selectedCustomer.props?.postalCode || (selectedCustomer.address ? selectedCustomer.address.match(/\d{5}/)?.[0] : '')}
                                              </span>
                                          </div>
                                      )}
                                      {/* Kaupunki */}
                                      {(selectedCustomer.props?.city || selectedCustomer.props?.postalCity || (selectedCustomer.address && selectedCustomer.address.split(',').pop()?.trim())) && (
                                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                              <span className="text-sm text-slate-500">Kaupunki</span>
                                              <span className="text-sm font-semibold text-slate-900">
                                                  {selectedCustomer.props?.city || selectedCustomer.props?.postalCity || (selectedCustomer.address ? selectedCustomer.address.split(',').pop()?.trim() : '')}
                                              </span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {/* Yhteyshenkilö Section */}
                          <div>
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Yhteyshenkilö</h3>
                              <div className="space-y-2">
                                  {(() => {
                                      // Try to get firstName and lastName from props first, then fall back to splitting contactPerson
                                      const firstName = selectedCustomer.props?.firstName || selectedCustomer.props?.etunimi || 
                                          (selectedCustomer.contactPerson ? selectedCustomer.contactPerson.trim().split(/\s+/)[0] : '');
                                      const lastName = selectedCustomer.props?.lastName || selectedCustomer.props?.sukunimi || 
                                          (selectedCustomer.contactPerson ? selectedCustomer.contactPerson.trim().split(/\s+/).slice(1).join(' ') : '');
                                      
                                      return (
                                          <>
                                              {firstName && (
                                                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                      <span className="text-sm text-slate-500">Etunimi</span>
                                                      <span className="text-sm font-semibold text-slate-900">{firstName}</span>
                                                  </div>
                                              )}
                                              {lastName && (
                                                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                      <span className="text-sm text-slate-500">Sukunimi</span>
                                                      <span className="text-sm font-semibold text-slate-900">{lastName}</span>
                                                  </div>
                                              )}
                                          </>
                                      );
                                  })()}
                                  {selectedCustomer.phone && (
                                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-sm text-slate-500">Puhelin</span>
                                          <a href={`tel:${selectedCustomer.phone.replace(/\s/g, '')}`} className="text-sm font-semibold text-hieta-blue hover:underline">
                                              {selectedCustomer.phone}
                                          </a>
                                      </div>
                                  )}
                                  {selectedCustomer.email && (
                                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-sm text-slate-500">Sähköposti</span>
                                          <a href={`mailto:${selectedCustomer.email}`} className="text-sm font-semibold text-hieta-blue hover:underline">
                                              {selectedCustomer.email}
                                          </a>
                                      </div>
                                  )}
                                  {(selectedCustomer.props?.notes || selectedCustomer.props?.additionalInfo || selectedCustomer.props?.lisatiedot) && (
                                      <div className="flex justify-between items-start py-2 border-b border-slate-100">
                                          <span className="text-sm text-slate-500">Lisätiedot</span>
                                          <span className="text-sm font-semibold text-slate-900 text-right max-w-md">
                                              {selectedCustomer.props?.notes || selectedCustomer.props?.additionalInfo || selectedCustomer.props?.lisatiedot}
                                          </span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Tags Card */}
                  {(quotation.customer.tags && quotation.customer.tags.length > 0) || true ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                          <div className="flex items-center gap-2 mb-4">
                              <div className="p-1.5 rounded-lg bg-purple-100">
                                  <Tag className="text-purple-600" size={18} />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900">Tunnisteet</h3>
                          </div>
                          
                          {quotation.customer.tags && quotation.customer.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-4">
                                  {quotation.customer.tags.map(tag => (
                                      <span key={tag} className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-200/50 hover:border-purple-300 transition-colors">
                                          {tag}
                                          <button 
                                              onClick={() => handleRemoveTag(tag)} 
                                              className="p-0.5 rounded hover:bg-purple-100 transition-colors"
                                              aria-label={`Poista tunniste ${tag}`}
                                          >
                                              <X size={14} />
                                          </button>
                                      </span>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-sm text-slate-500 mb-4">Ei tunnisteita. Lisää tunnisteita asiakkaan luokittelua varten.</p>
                          )}

                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Kirjoita tunniste..."
                                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                              />
                              <button 
                                  onClick={handleAddTag}
                                  disabled={!tagInput.trim()}
                                  className="px-5 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                              >
                                  Lisää
                              </button>
                          </div>
                      </div>
                  ) : null}

                  {/* Projects Section */}
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-blue-100">
                                  <FolderOpen className="text-blue-600" size={18} />
                              </div>
                              <h3 className="text-xl font-bold text-slate-900">Projektit</h3>
                          </div>
                          <button 
                              onClick={handleStartProject}
                              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                          >
                              <Plus size={16} /> Uusi projekti
                          </button>
                      </div>
                      
                      <div className="space-y-3">
                          {/* Active Project */}
                          <div 
                              className="bg-white rounded-xl border-2 border-blue-200/80 shadow-sm p-5 relative group hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                              onClick={handleStartProject}
                          >
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-l-xl"></div>
                              <div className="flex justify-between items-start pl-4">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wide">
                                              Työn alla
                                          </span>
                                          <h4 className="font-bold text-lg text-slate-900 truncate">
                                              {quotation.project.name || 'Uusi nimetön projekti'}
                                          </h4>
                                      </div>
                                      <p className="text-sm text-slate-500 truncate">
                                          {quotation.project.address || 'Ei määritettyä osoitetta'} • Omistaja: {quotation.project.owner}
                                      </p>
                                  </div>
                                  <div className="text-right ml-4 flex-shrink-0">
                                      <div className="text-xl font-bold text-slate-900">
                                          {quotation.pricing.totalWithVat.toLocaleString('fi-FI', {maximumFractionDigits:0})} €
                                      </div>
                                      <div className="text-xs text-slate-400 mt-1">Muokattu tänään</div>
                                  </div>
                              </div>
                          </div>

                          {/* Historical Projects */}
                          <div className="bg-white rounded-xl border border-slate-200/80 p-5 opacity-75 hover:opacity-100 hover:shadow-sm transition-all">
                              <div className="flex justify-between items-center">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] uppercase font-bold tracking-wide">
                                              Valmis
                                          </span>
                                          <h4 className="font-bold text-lg text-slate-700 truncate">Autotalli ja Varasto</h4>
                                      </div>
                                      <p className="text-sm text-slate-500 truncate">Mökkitie 8 B, Levi • Omistaja: Olli Hietanen</p>
                                  </div>
                                  <div className="text-right ml-4 flex-shrink-0">
                                      <div className="text-lg font-bold text-slate-600">12 450 €</div>
                                      <div className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1">
                                          <History size={12}/> 24.10.2023
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          {selectedCustomer.type === 'business' && (
                              <div className="bg-white rounded-xl border border-slate-200/80 p-5 opacity-75 hover:opacity-100 hover:shadow-sm transition-all">
                                  <div className="flex justify-between items-center">
                                      <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-2">
                                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wide">
                                                  Hävinnyt
                                              </span>
                                              <h4 className="font-bold text-lg text-slate-700 truncate">Rivitaloyhtiö As Oy Metsä</h4>
                                          </div>
                                          <p className="text-sm text-slate-500 truncate">Kantakatu 44, Tampere • Omistaja: Matti Myyjä</p>
                                      </div>
                                      <div className="text-right ml-4 flex-shrink-0">
                                          <div className="text-lg font-bold text-slate-600">89 200 €</div>
                                          <div className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1">
                                              <History size={12}/> 15.08.2023
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

              </div>
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                      <Users size={48} className="text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-600 mb-2">Valitse asiakas</h2>
                  <p className="text-sm max-w-md text-center text-slate-500 leading-relaxed">
                      Valitse asiakas vasemmanpuoleisesta listasta tarkastellaksesi yksityiskohtaisia tietoja, tunnisteita ja projekteja.
                  </p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CustomersView;
