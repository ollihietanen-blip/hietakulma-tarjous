import React from 'react';
import { useQuotation } from '../../context/QuotationContext';

const ProjectInfoTab: React.FC = () => {
  const { quotation, updateProject, updateCustomer } = useQuotation();
  const { project, customer } = quotation;

  // High-Visibility Input Styles: White background, clear border
  const inputClasses = "w-full px-3 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-sm font-medium hover:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none transition-all duration-200 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 ml-0.5";
  const cardClasses = "bg-white rounded-xl shadow-sm border border-slate-200 p-6";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Projektin tiedot</h1>
        <p className="text-slate-500">Määritä projektin perustiedot ja asiakkaan yhteystiedot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Details */}
        <div className={cardClasses}>
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">Kohde</h2>
          <div className="space-y-5">
            <div>
              <label className={labelClasses}>Projektinumero</label>
              <input
                type="text"
                value={project.number}
                onChange={(e) => updateProject({ number: e.target.value })}
                className={inputClasses}
                placeholder="esim. 11391-1"
              />
            </div>
            
            <div>
              <label className={labelClasses}>Kohteen nimi</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => updateProject({ name: e.target.value })}
                className={inputClasses}
                placeholder="esim. Loma-asunto Levin Atrin Atmos"
              />
            </div>

            <div>
              <label className={labelClasses}>Rakennuspaikka</label>
              <input
                type="text"
                value={project.address}
                onChange={(e) => updateProject({ address: e.target.value })}
                className={inputClasses}
                placeholder="Katuosoite, Postinumero ja Postitoimipaikka"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Rakennustyyppi</label>
                <div className="relative">
                  <select
                    value={project.buildingType}
                    onChange={(e) => updateProject({ buildingType: e.target.value as any })}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="omakotitalo">Omakotitalo</option>
                    <option value="loma-asunto">Loma-asunto</option>
                    <option value="varastohalli">Varastohalli</option>
                    <option value="sauna">Sauna</option>
                    <option value="rivitalo">Rivitalo</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className={labelClasses}>Toimitusviikko</label>
                <input
                  type="text"
                  value={project.deliveryWeek || ''}
                  onChange={(e) => updateProject({ deliveryWeek: e.target.value })}
                  className={inputClasses}
                  placeholder="esim. vko 45"
                />
              </div>
            </div>
            
             <div>
              <label className={labelClasses}>Tarjouksen päiväys</label>
              <input
                type="date"
                value={project.offerDate ? new Date(project.offerDate).toISOString().split('T')[0] : ''}
                onChange={(e) => updateProject({ offerDate: new Date(e.target.value) })}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className={cardClasses}>
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">Asiakas</h2>
          <div className="space-y-5">
            <div>
              <label className={labelClasses}>Asiakkaan / Yrityksen nimi</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => updateCustomer({ name: e.target.value })}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className={labelClasses}>Y-tunnus (valinnainen)</label>
              <input
                type="text"
                value={customer.businessId || ''}
                onChange={(e) => updateCustomer({ businessId: e.target.value })}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Yhteyshenkilö</label>
              <input
                type="text"
                value={customer.contactPerson}
                onChange={(e) => updateCustomer({ contactPerson: e.target.value })}
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Sähköposti</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => updateCustomer({ email: e.target.value })}
                  className={inputClasses}
                />
              </div>
              
              <div>
                <label className={labelClasses}>Puhelin</label>
                <input
                  type="text"
                  value={customer.phone}
                  onChange={(e) => updateCustomer({ phone: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Osoite</label>
              <textarea
                value={customer.address}
                onChange={(e) => updateCustomer({ address: e.target.value })}
                rows={2}
                className={inputClasses}
              />
            </div>
            
            <div>
              <label className={labelClasses}>Laskutustapa</label>
              <div className="relative">
                <select
                  value={customer.billingMethod}
                  onChange={(e) => updateCustomer({ billingMethod: e.target.value as any })}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="email">Sähköposti</option>
                  <option value="e-invoice">Verkkolasku</option>
                  <option value="mail">Posti</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoTab;