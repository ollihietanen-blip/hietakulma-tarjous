import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Quotation, 
  PricingCalculation, 
  DEFAULT_CATEGORY_MARKUPS,
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
  TransportationDetails,
  QuotationStatus,
  CostEntry,
  Message,
  SentInstruction
} from '../types';

// Simple UUID generator for browsers that might not have crypto.randomUUID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Default Pricing State
const DEFAULT_PRICING: PricingCalculation = {
  categoryMarkups: { ...DEFAULT_CATEGORY_MARKUPS },
  commissionPercentage: 4.0,
  vatMode: 'standard',
  
  elementsCost: 0,
  trussesCost: 0,
  productsCost: 0,
  documentsCost: 0,
  installationCost: 0,
  transportationCost: 0,
  
  materialCostTotal: 0,
  sellingPriceExVat: 0,
  profitAmount: 0,
  profitPercent: 0,
  
  vatPercentage: 25.5,
  vatAmount: 0,
  totalWithVat: 0,

  breakdown: {
    elements: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
    trusses: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
    windowsDoors: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
    worksiteDeliveries: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
    installation: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
    transportation: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
    design: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 }
  }
};

// Helper to calculate pricing based on margins
const calculateDetailedPricing = (quotation: Quotation): PricingCalculation => {
  const settings = quotation.pricing;
  const commission = settings.commissionPercentage || 4.0;
  
  const allElementItems = quotation.elements.flatMap(section => section.items);
  const trussItems = allElementItems.filter(item => item.type.toLowerCase().includes('ristikko'));
  const nonTrussElementItems = allElementItems.filter(item => !item.type.toLowerCase().includes('ristikko'));
  
  // 1. TRUSSES (Ristikot)
  const trussesCost = trussItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const trussesMarkup = settings.categoryMarkups.trusses || 20.0;
  const trussesDivisor = 1 - (trussesMarkup / 100) - (commission / 100);
  const trussesSellingPrice = trussesCost / (trussesDivisor > 0 ? trussesDivisor : 0.01);

  // 2. ELEMENTS (Tehdastuotanto, excluding trusses)
  const elementsCost = nonTrussElementItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const elementsMarkup = settings.categoryMarkups.elements || 22.0;
  // Formula: Price = Cost / (1 - Margin% - Commission%)
  const elementsDivisor = 1 - (elementsMarkup / 100) - (commission / 100);
  const elementsSellingPrice = elementsCost / (elementsDivisor > 0 ? elementsDivisor : 0.01);

  // 3. WINDOWS & DOORS
  const windows = quotation.products.find(s => s.id === 'windows')?.items || [];
  const doors = quotation.products.find(s => s.id === 'doors')?.items || [];
  const windowsDoorsCost = [...windows, ...doors].reduce(
    (sum, item) => sum + (Number(item.totalPrice) || 0), 0
  );
  const windowsDoorsMarkup = settings.categoryMarkups.windowsDoors || 18.0;
  const wdDivisor = 1 - (windowsDoorsMarkup / 100) - (commission / 100);
  const windowsDoorsSellingPrice = windowsDoorsCost / (wdDivisor > 0 ? wdDivisor : 0.01);

  // 4. WORKSITE DELIVERIES (Irtotavara)
  const worksiteMaterials = quotation.products.filter(s => s.id !== 'windows' && s.id !== 'doors');
  const worksiteDeliveriesCost = worksiteMaterials.reduce((sum, section) => 
    sum + section.items.reduce((iSum, item) => iSum + (Number(item.totalPrice) || 0), 0), 0
  );
  const worksiteMarkup = settings.categoryMarkups.worksiteDeliveries || 15.0;
  const wsDivisor = 1 - (worksiteMarkup / 100) - (commission / 100);
  const worksiteSellingPrice = worksiteDeliveriesCost / (wsDivisor > 0 ? wsDivisor : 0.01);

  // 5. INSTALLATION (Calculated Estimate)
  // Calculate material base for installation estimate
  const materialBase = elementsCost + trussesCost + windowsDoorsCost + worksiteDeliveriesCost;
  const currentLevel = ASSEMBLY_LEVELS.find(l => l.id === quotation.delivery.assemblyLevelId) || ASSEMBLY_LEVELS[1];
  const baseMultiplier = Number(currentLevel.pricing.baseMultiplier) || 1.2;
  const installationCost = (materialBase * baseMultiplier) - materialBase;
  
  const installationMarkup = settings.categoryMarkups.installation || 28.0;
  const instDivisor = 1 - (installationMarkup / 100) - (commission / 100);
  const installationSellingPrice = installationCost / (instDivisor > 0 ? instDivisor : 0.01);

  // 6. TRANSPORTATION
  const t = quotation.delivery.transportation;
  const dist = Number(t?.distanceKm) || 0;
  const count = Number(t?.truckCount) || 1; 
  const rate = Number(t?.ratePerKm) || 2.20;
  const transportationCost = (dist * 2) * rate * count;

  const transportationMarkup = settings.categoryMarkups.transportation || 12.0;
  const transDivisor = 1 - (transportationMarkup / 100) - (commission / 100);
  const transportationSellingPrice = transportationCost / (transDivisor > 0 ? transDivisor : 0.01);

  // 7. DESIGN / DOCUMENTS
  const documentsCost = quotation.documents
    .filter(d => d.included)
    .reduce((sum, doc) => sum + (Number(doc.price) || 0), 0);
  const designMarkup = settings.categoryMarkups.design || 25.0;
  const designDivisor = 1 - (designMarkup / 100) - (commission / 100);
  const designSellingPrice = documentsCost / (designDivisor > 0 ? designDivisor : 0.01);


  // TOTALS
  const materialCostTotal = elementsCost + trussesCost + windowsDoorsCost + worksiteDeliveriesCost + installationCost + transportationCost + documentsCost;
  const sellingPriceExVat = elementsSellingPrice + trussesSellingPrice + windowsDoorsSellingPrice + worksiteSellingPrice + installationSellingPrice + transportationSellingPrice + designSellingPrice;
  
  const profitAmount = sellingPriceExVat - materialCostTotal;
  const profitPercent = (profitAmount / (sellingPriceExVat || 1)) * 100;

  // VAT
  const vatRate = settings.vatMode === 'standard' ? 25.5 : 0;
  const vatAmount = sellingPriceExVat * (vatRate / 100);
  const totalWithVat = sellingPriceExVat + vatAmount;

  return {
    ...settings,
    elementsCost,
    trussesCost,
    productsCost: windowsDoorsCost + worksiteDeliveriesCost,
    documentsCost,
    installationCost,
    transportationCost,
    
    materialCostTotal,
    sellingPriceExVat,
    profitAmount,
    profitPercent,
    
    vatPercentage: vatRate,
    vatAmount,
    totalWithVat,

    breakdown: {
      elements: { cost: elementsCost, markup: elementsMarkup, sellingPrice: elementsSellingPrice, profit: elementsSellingPrice - elementsCost },
      trusses: { cost: trussesCost, markup: trussesMarkup, sellingPrice: trussesSellingPrice, profit: trussesSellingPrice - trussesCost },
      windowsDoors: { cost: windowsDoorsCost, markup: windowsDoorsMarkup, sellingPrice: windowsDoorsSellingPrice, profit: windowsDoorsSellingPrice - windowsDoorsCost },
      worksiteDeliveries: { cost: worksiteDeliveriesCost, markup: worksiteMarkup, sellingPrice: worksiteSellingPrice, profit: worksiteSellingPrice - worksiteDeliveriesCost },
      installation: { cost: installationCost, markup: installationMarkup, sellingPrice: installationSellingPrice, profit: installationSellingPrice - installationCost },
      transportation: { cost: transportationCost, markup: transportationMarkup, sellingPrice: transportationSellingPrice, profit: transportationSellingPrice - transportationCost },
      design: { cost: documentsCost, markup: designMarkup, sellingPrice: designSellingPrice, profit: designSellingPrice - documentsCost }
    }
  };
};

// Helper to create fresh state
const getInitialState = (): Quotation => ({
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft',
    project: {
      number: '',
      name: 'Loma-asunto Levin Atrin Atmos',
      address: 'Atrinpolku 2, 99130 Kittilä',
      buildingType: 'loma-asunto',
      offerDate: new Date(),
      owner: 'Olli Hietanen'
    },
    customer: {
      name: 'Matti Meikäläinen',
      contactPerson: 'Matti Meikäläinen',
      email: 'matti.meikalainen@esimerkki.fi',
      phone: '040 123 4567',
      address: 'Esimerkkikatu 1, 00100 Helsinki',
      billingMethod: 'email',
      tags: [] // Initial empty tags
    },
    // Init Contract with some defaults
    contract: {
        contractNumber: generateId().substring(0,6).toUpperCase(),
        signingPlace: 'Kankaanpää'
    },
    // Post-Acceptance
    sentInstructions: [],
    // Init Post Calculation
    postCalculation: {
        entries: []
    },
    messages: [
        { id: generateId(), timestamp: new Date(Date.now() - 1000 * 60 * 5), author: 'Järjestelmä', text: 'Projekti luotu asiakkaalle Matti Meikäläinen.', type: 'internal' }
    ],
// FIX: Add missing 'files' property to the initial state to conform to the Quotation type.
    files: [],
    documents: STANDARD_DOCUMENTS.map(d => ({...d})), // Deep copy
    elements: [
        { id: 'section-ext-walls', title: 'Ulkoseinät', order: 1, items: [] },
        { id: 'section-roof', title: 'Kattorakenteet', order: 2, items: [] }
    ],
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
        distanceKm: 920,
        truckCount: 2,
        ratePerKm: 2.20 
      }
    },
    pricing: { ...DEFAULT_PRICING }
});

export type SaveStatus = 'idle' | 'saving' | 'saved';

interface QuotationContextType {
  quotation: Quotation;
  saveStatus: SaveStatus;
  saveQuotation: () => void;
  updateProject: (project: Partial<Quotation['project']>) => void;
  updateCustomer: (customer: Partial<Quotation['customer']>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  addElement: (sectionId: string, element: any) => void;
  removeElement: (sectionId: string, elementId: string) => void;
  updateElement: (sectionId: string, elementId: string, updates: any) => void;
  addProduct: (sectionId: string, product: any) => void;
  removeProduct: (sectionId: string, productId: string) => void;
  updateProduct: (sectionId: string, productId: string, updates: any) => void;
  updatePricingSettings: (settings: any) => void;
  updatePaymentMilestone: (id: string, updates: Partial<PaymentMilestone>) => void;
  setPaymentSchedule: (schedule: PaymentMilestone[]) => void;
  toggleLogistics: (id: string) => void;
  setAssemblyLevel: (levelId: AssemblyLevel['id']) => void;
  toggleInstallationItem: (itemText: string) => void;
  addCustomInstallationItem: (itemText: string) => void;
  removeCustomInstallationItem: (index: number) => void;
  updateTransportation: (details: Partial<TransportationDetails>) => void;
  updateContract: (contract: Partial<Quotation['contract']>) => void;
  resetQuotation: () => void; 
  pricing: PricingCalculation;
  // Cost Tracking Actions
  addCostEntry: (entry: Omit<CostEntry, 'id'>) => void;
  removeCostEntry: (id: string) => void;
  // Communication Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  // Post-Acceptance Actions
  markInstructionsSent: (instructions: string[]) => void;
  // Workflow Actions
  workflow: {
      submitForApproval: () => void;
      approveQuotation: (approverName: string) => void;
      returnToDraft: () => void;
      markSent: () => void;
      markAccepted: () => void;
      markRejected: (reason?: string) => void;
  }
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotation, setQuotation] = useState<Quotation>(getInitialState());
  const [pricing, setPricing] = useState<PricingCalculation>(DEFAULT_PRICING);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  // --- Auto-Save Effect ---
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    setSaveStatus('idle'); // Has unsaved changes
    const handler = setTimeout(() => {
      saveQuotation();
    }, 1500);
    return () => clearTimeout(handler);
  }, [quotation]);
  
  // Simulated save function
  const saveQuotation = () => {
    setSaveStatus('saving');
    setTimeout(() => {
        setSaveStatus('saved');
    }, 750);
  };

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

  const updatePricingSettings = (settings: any) => {
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

  const updateContract = (contractUpdates: Partial<Quotation['contract']>) => {
      setQuotation(prev => ({
          ...prev,
          contract: { ...prev.contract, ...contractUpdates }
      }));
  };

  // --- Cost Tracking ---

  const addCostEntry = (entry: Omit<CostEntry, 'id'>) => {
      setQuotation(prev => ({
          ...prev,
          postCalculation: {
              ...prev.postCalculation,
              entries: [...prev.postCalculation.entries, { ...entry, id: generateId() }]
          }
      }));
  };

  const removeCostEntry = (id: string) => {
      setQuotation(prev => ({
          ...prev,
          postCalculation: {
              ...prev.postCalculation,
              entries: prev.postCalculation.entries.filter(e => e.id !== id)
          }
      }));
  };

  // --- Communication ---
  
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
      const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date()
      };
      
      setQuotation(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
      }));

      // SIMULATE CUSTOMER REPLY
      if (message.type === 'customer' && message.author !== 'Asiakas') {
          setTimeout(() => {
              const reply: Message = {
                  id: generateId(),
                  timestamp: new Date(),
                  author: 'Asiakas',
                  text: 'Kiitos viestistä! Palaan tähän pian.',
                  type: 'customer'
              };
               setQuotation(prev => ({
                  ...prev,
                  messages: [...prev.messages, reply]
              }));
          }, 1500 + Math.random() * 1000);
      }
  };

  // --- Post-Acceptance ---

  const markInstructionsSent = (instructions: string[]) => {
      const newSentItems: SentInstruction[] = instructions.map(name => ({ name, sentAt: new Date() }));
      
      setQuotation(prev => ({
          ...prev,
          sentInstructions: [...prev.sentInstructions, ...newSentItems]
      }));

      // Log to messages
      addMessage({
          author: 'Järjestelmä',
          text: `Lähetetty ohjeet (${instructions.join(', ')}) asiakkaalle.`,
          type: 'internal'
      });
  };

  // --- Workflow Actions ---

  const workflow = {
      submitForApproval: () => {
          setQuotation(prev => ({
              ...prev,
              status: 'awaiting_approval',
              approval: {
                  requestedAt: new Date()
              }
          }));
      },
      approveQuotation: (approverName: string) => {
          setQuotation(prev => ({
              ...prev,
              status: 'approved',
              approval: {
                  ...prev.approval,
                  approvedAt: new Date(),
                  approverName
              }
          }));
      },
      returnToDraft: () => {
          setQuotation(prev => ({
              ...prev,
              status: 'draft',
              approval: undefined
          }));
      },
      markSent: () => {
          setQuotation(prev => ({
              ...prev,
              status: 'sent',
              sentAt: new Date()
          }));
      },
      markAccepted: () => {
          setQuotation(prev => ({
              ...prev,
              status: 'accepted',
              decisionAt: new Date(),
              contract: {
                  ...prev.contract,
                  signDate: new Date() // Auto-set sign date
              }
          }));
      },
      markRejected: (reason?: string) => {
           setQuotation(prev => ({
              ...prev,
              status: 'rejected',
              decisionAt: new Date(),
              decisionReason: reason
          }));
      }
  };

  // --- Pricing Effect ---
  
  useEffect(() => {
    const newPricing = calculateDetailedPricing(quotation);
    setPricing(newPricing);
  }, [
      quotation.elements, 
      quotation.products, 
      quotation.documents, 
      quotation.pricing.categoryMarkups,
      quotation.pricing.commissionPercentage,
      quotation.pricing.vatMode,
      quotation.delivery.assemblyLevelId,
      quotation.delivery.transportation,
      quotation.delivery.customItems
  ]);

  return (
    <QuotationContext.Provider value={{ 
      quotation: { ...quotation, pricing }, 
      saveStatus,
      saveQuotation,
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
      updateContract,
      resetQuotation,
      pricing,
      addCostEntry,
      removeCostEntry,
      addMessage,
      markInstructionsSent,
      workflow
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