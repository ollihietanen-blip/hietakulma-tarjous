import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Quotation, 
  PricingCalculation, 
  calculatePricing, 
  STANDARD_DOCUMENTS, 
  STANDARD_LOGISTICS, 
  STANDARD_EXCLUSIONS,
  DEFAULT_WORKSITE_SECTIONS,
  ElementItem,
  ProductItem,
  PaymentMilestone,
  DocumentItem,
  ASSEMBLY_LEVELS,
  AssemblyLevel,
  TransportationDetails
} from '../types';

// Simple UUID generator for browsers that might not have crypto.randomUUID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Default Pricing State
const DEFAULT_PRICING: PricingCalculation = {
  costPrice: 0,
  markupPercentage: 25,
  markupAmount: 0,
  commissionPercentage: 0,
  commissionAmount: 0,
  subtotal: 0,
  vatMode: 'standard',
  vatPercentage: 25.5,
  vatAmount: 0,
  totalWithVat: 0,
  elementsTotal: 0,
  productsTotal: 0,
  documentsTotal: 0,
  installationTotal: 0,
  transportationTotal: 0
};

// Helper to create fresh state
const getInitialState = (): Quotation => ({
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft',
    project: {
      number: '',
      name: '',
      address: '',
      buildingType: 'omakotitalo',
      offerDate: new Date()
    },
    customer: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      billingMethod: 'email'
    },
    documents: STANDARD_DOCUMENTS.map(d => ({...d})), // Deep copy
    elements: [],
    products: [
       { id: 'windows', title: 'Ikkunat', items: [] },
       { id: 'doors', title: 'Ovet', items: [] },
       ...DEFAULT_WORKSITE_SECTIONS.map(section => ({
         ...section,
         items: section.items.map(item => ({
            ...item,
            id: generateId(),
            totalPrice: (item.unitPrice || 0) * (item.quantity || 0) // Ensure totalPrice is initialized
         }))
       }))
    ],
    paymentSchedule: [],
    delivery: {
      assemblyLevelId: 'shell-and-roof',
      unselectedItems: [],
      customItems: [],
      logistics: STANDARD_LOGISTICS.map(l => ({...l})), // Deep copy
      exclusions: [...STANDARD_EXCLUSIONS],
      transportation: {
        distanceKm: 0,
        truckCount: 1,
        ratePerKm: 2.20 
      }
    },
    pricing: { ...DEFAULT_PRICING }
});

interface QuotationContextType {
  quotation: Quotation;
  updateProject: (project: Partial<Quotation['project']>) => void;
  updateCustomer: (customer: Partial<Quotation['customer']>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  addElement: (sectionId: string, element: any) => void;
  removeElement: (sectionId: string, elementId: string) => void;
  updateElement: (sectionId: string, elementId: string, updates: any) => void;
  addProduct: (sectionId: string, product: any) => void;
  removeProduct: (sectionId: string, productId: string) => void;
  updateProduct: (sectionId: string, productId: string, updates: any) => void;
  updatePricingSettings: (settings: Partial<Pick<PricingCalculation, 'markupPercentage' | 'commissionPercentage' | 'vatMode'>>) => void;
  updatePaymentMilestone: (id: string, updates: Partial<PaymentMilestone>) => void;
  setPaymentSchedule: (schedule: PaymentMilestone[]) => void;
  toggleLogistics: (id: string) => void;
  setAssemblyLevel: (levelId: AssemblyLevel['id']) => void;
  toggleInstallationItem: (itemText: string) => void;
  addCustomInstallationItem: (itemText: string) => void;
  removeCustomInstallationItem: (index: number) => void;
  updateTransportation: (details: Partial<TransportationDetails>) => void;
  resetQuotation: () => void; // New debug function
  pricing: PricingCalculation;
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotation, setQuotation] = useState<Quotation>(getInitialState());

  const [pricing, setPricing] = useState<PricingCalculation>(quotation.pricing);

  // --- Actions ---

  const resetQuotation = () => {
    setQuotation(getInitialState());
  };

  const updateProject = (project: Partial<Quotation['project']>) => {
    setQuotation(prev => ({ ...prev, project: { ...prev.project, ...project } }));
  };

  const updateCustomer = (customer: Partial<Quotation['customer']>) => {
    setQuotation(prev => ({ ...prev, customer: { ...prev.customer, ...customer } }));
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setQuotation(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const addElement = (sectionId: string, elementTemplate: any) => {
    const newElement: ElementItem = {
      ...elementTemplate,
      id: generateId(),
      totalPrice: (elementTemplate.unitPrice || 0) * (elementTemplate.quantity || 1)
    };
    
    setQuotation(prev => {
      const sectionExists = prev.elements.some(s => s.id === sectionId);
      if (!sectionExists) {
        return {
          ...prev,
          elements: [...prev.elements, { id: sectionId, title: 'Uusi osio', order: 99, items: [newElement] }]
        };
      }
      return {
        ...prev,
        elements: prev.elements.map(s => 
          s.id === sectionId ? { ...s, items: [...s.items, newElement] } : s
        )
      };
    });
  };

  const removeElement = (sectionId: string, elementId: string) => {
    setQuotation(prev => ({
      ...prev,
      elements: prev.elements.map(s => 
        s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== elementId) } : s
      )
    }));
  };

  const updateElement = (sectionId: string, elementId: string, updates: any) => {
    setQuotation(prev => ({
      ...prev,
      elements: prev.elements.map(s => 
        s.id === sectionId ? {
          ...s,
          items: s.items.map(i => {
             if (i.id !== elementId) return i;
             const updated = { ...i, ...updates };
             // Recalculate total price safely
             let basePrice = (Number(updated.unitPrice) || 0) * (Number(updated.quantity) || 0);
             
             // Add window installation price if active
             if (updated.hasWindowInstall && updated.windowCount && updated.windowInstallPrice) {
                 basePrice += ((Number(updated.windowCount) || 0) * (Number(updated.windowInstallPrice) || 0));
             }
             
             updated.totalPrice = basePrice;
             return updated;
          })
        } : s
      )
    }));
  };

  const addProduct = (sectionId: string, productTemplate: any) => {
      const newProduct: ProductItem = {
          ...productTemplate,
          id: generateId(),
          totalPrice: (productTemplate.unitPrice || 0) * (productTemplate.quantity || 1)
      };
      
      setQuotation(prev => {
          return {
              ...prev,
              products: prev.products.map(s => 
                  s.id === sectionId ? { ...s, items: [...s.items, newProduct] } : s
              )
          };
      });
  };

  const removeProduct = (sectionId: string, productId: string) => {
      setQuotation(prev => ({
          ...prev,
          products: prev.products.map(s => 
              s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== productId) } : s
          )
      }));
  };

  const updateProduct = (sectionId: string, productId: string, updates: any) => {
      setQuotation(prev => ({
          ...prev,
          products: prev.products.map(s => 
              s.id === sectionId ? {
                  ...s,
                  items: s.items.map(i => {
                      if (i.id !== productId) return i;
                      const updated = { ...i, ...updates };
                      updated.totalPrice = (Number(updated.unitPrice) || 0) * (Number(updated.quantity) || 0);
                      return updated;
                  })
              } : s
          )
      }));
  };

  const updatePricingSettings = (settings: Partial<Pick<PricingCalculation, 'markupPercentage' | 'commissionPercentage' | 'vatMode'>>) => {
      setQuotation(prev => ({
          ...prev,
          pricing: { ...prev.pricing, ...settings }
      }));
  };

  const updatePaymentMilestone = (id: string, updates: Partial<PaymentMilestone>) => {
      setQuotation(prev => ({
          ...prev,
          paymentSchedule: prev.paymentSchedule.map(m => m.id === id ? { ...m, ...updates } : m)
      }));
  };
  
  const setPaymentSchedule = (schedule: PaymentMilestone[]) => {
      setQuotation(prev => ({ ...prev, paymentSchedule: schedule }));
  };

  const toggleLogistics = (id: string) => {
      setQuotation(prev => ({
          ...prev,
          delivery: {
              ...prev.delivery,
              logistics: prev.delivery.logistics.map(l => l.id === id ? { ...l, included: !l.included } : l)
          }
      }));
  };

  const setAssemblyLevel = (levelId: AssemblyLevel['id']) => {
      setQuotation(prev => ({
          ...prev,
          delivery: { ...prev.delivery, assemblyLevelId: levelId }
      }));
  };

  const toggleInstallationItem = (itemText: string) => {
      setQuotation(prev => {
          const currentUnselected = prev.delivery.unselectedItems;
          const isUnselected = currentUnselected.includes(itemText);
          
          let newUnselected;
          if (isUnselected) {
              newUnselected = currentUnselected.filter(i => i !== itemText);
          } else {
              newUnselected = [...currentUnselected, itemText];
          }
          
          return {
              ...prev,
              delivery: { ...prev.delivery, unselectedItems: newUnselected }
          };
      });
  };

  const addCustomInstallationItem = (itemText: string) => {
      setQuotation(prev => ({
          ...prev,
          delivery: { ...prev.delivery, customItems: [...prev.delivery.customItems, itemText] }
      }));
  };

  const removeCustomInstallationItem = (index: number) => {
      setQuotation(prev => ({
          ...prev,
          delivery: { ...prev.delivery, customItems: prev.delivery.customItems.filter((_, i) => i !== index) }
      }));
  };

  const updateTransportation = (details: Partial<TransportationDetails>) => {
    setQuotation(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        transportation: { ...prev.delivery.transportation, ...details }
      }
    }));
  };

  // --- Pricing Effect ---
  
  useEffect(() => {
    // 1. Calculate Elements Total
    const elementsTotal = quotation.elements.reduce((sum, section) => 
        sum + section.items.reduce((iSum, item) => iSum + (Number(item.totalPrice) || 0), 0), 0
    );

    // 2. Calculate Products Total
    const productsTotal = quotation.products.reduce((sum, section) => 
        sum + section.items.reduce((iSum, item) => iSum + (Number(item.totalPrice) || 0), 0), 0
    );

    // 3. Calculate Documents Total
    const documentsTotal = quotation.documents
        .filter(d => d.included)
        .reduce((sum, doc) => sum + (Number(doc.price) || 0), 0);

    // 4. Calculate Installation Total
    const materialCost = elementsTotal + productsTotal;
    const currentLevel = ASSEMBLY_LEVELS.find(l => l.id === quotation.delivery.assemblyLevelId) || ASSEMBLY_LEVELS[1];
    
    const baseMultiplier = Number(currentLevel.pricing.baseMultiplier) || 1.2;
    const totalWithInstallation = materialCost * baseMultiplier;
    const installationTotal = totalWithInstallation - materialCost;

    // 5. Calculate Transportation Total
    // Use fallbacks to ensure valid numbers (prevents NaN)
    const t = quotation.delivery.transportation;
    const dist = Number(t?.distanceKm) || 0;
    const count = Number(t?.truckCount) || 1; 
    const rate = Number(t?.ratePerKm) || 2.20;
    
    // Formula: (Distance * 2 for round trip) * Truck Count * Rate
    const transportationTotal = (dist * 2) * rate * count;

    // 6. Settings
    const markupPct = Number(quotation.pricing.markupPercentage) || 0;
    const commPct = Number(quotation.pricing.commissionPercentage) || 0;

    const newPricing = calculatePricing(
        elementsTotal,
        productsTotal,
        documentsTotal,
        installationTotal,
        transportationTotal,
        markupPct,
        commPct,
        quotation.pricing.vatMode
    );

    setPricing(newPricing);
  }, [
      quotation.elements, 
      quotation.products, 
      quotation.documents, 
      quotation.pricing.markupPercentage,
      quotation.pricing.commissionPercentage,
      quotation.pricing.vatMode,
      quotation.delivery.assemblyLevelId,
      quotation.delivery.transportation 
  ]);

  return (
    <QuotationContext.Provider value={{ 
      quotation: { ...quotation, pricing }, 
      updateProject,
      updateCustomer,
      updateDocument,
      addElement,
      removeElement,
      updateElement,
      addProduct,
      removeProduct,
      updateProduct,
      updatePricingSettings,
      updatePaymentMilestone,
      setPaymentSchedule,
      toggleLogistics,
      setAssemblyLevel,
      toggleInstallationItem,
      addCustomInstallationItem,
      removeCustomInstallationItem,
      updateTransportation,
      resetQuotation,
      pricing
    }}>
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (context === undefined) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};