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
  SentInstruction,
  Schedule,
  AIAnalysisInstruction,
  QuotationVersion,
  CommunicationTask
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

// Helper to improve AI analysis instruction based on completed quotations
const improveAnalysisInstruction = (quotation: Quotation): AIAnalysisInstruction => {
  const current = quotation.aiAnalysisInstruction || {
    version: 1,
    lastUpdated: new Date(),
    instructionText: `Analysoi rakennussuunnitelmat (pohjapiirustus, julkisivupiirustus, leikkauspiirustus) ja anna suositukset puuelementeistä ja ristikoista.

Tarkista piirustuksista:
- Rakennuksen mitat (leveys, pituus, korkeus, kerrokset)
- Seinärakenteet ja niiden tyypit
- Kattorakenteet ja ristikot
- Aukot (ikkunat, ovet)
- Erikoisrakenteet

Palauta JSON-muodossa suositukset elementeistä ja ristikoista.`,
    examples: []
  };

  // Kerää dataa valmiista tarjouslaskennoista
  const elementCount = quotation.elements.reduce((sum, section) => sum + section.items.length, 0);
  const productCount = quotation.products.reduce((sum, section) => sum + section.items.length, 0);
  const totalValue = quotation.pricing.totalWithVat;

  // Lisää esimerkki jos tarjouslaskenta on valmis ja onnistunut
  if (quotation.status === 'sent' || quotation.status === 'accepted') {
    const example = {
      input: `Projekti: ${quotation.project.name}, ${quotation.project.buildingType}`,
      output: `Löydetty ${elementCount} elementtiä, ${productCount} tuotetta. Kokonaisarvio: ${totalValue.toFixed(0)}€`,
      success: quotation.status === 'accepted'
    };

    const newExamples = [...(current.examples || []), example].slice(-10); // Säilytä max 10 esimerkkiä

    return {
      version: current.version + 1,
      lastUpdated: new Date(),
      instructionText: current.instructionText + `\n\nHuomio: Edellisistä projekteista on opittu että ${quotation.project.buildingType}-tyyppisissä projekteissa tarvitaan keskimäärin ${elementCount} elementtiä.`,
      examples: newExamples
    };
  }

  return current;
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
const getInitialState = (): Quotation => {
  const firstVersionId = generateId();
  return {
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
    schedule: {
      productionStart: undefined,
      productionEnd: undefined,
      installationStart: undefined,
      installationEnd: undefined
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
    communicationTasks: [], // Tehtävälista kommunikointiin
    files: [],
    documents: STANDARD_DOCUMENTS.map(d => ({...d})), // Deep copy
    elements: [
        { id: 'section-ext-walls', title: 'Ulkoseinät', order: 1, items: [] },
        { id: 'section-int-walls', title: 'Väliseinät', order: 2, items: [] },
        { id: 'section-floor', title: 'Vaakarakenteet', order: 3, items: [] },
        { id: 'section-roof', title: 'Kattorakenteet', order: 4, items: [] }
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
    pricing: { ...DEFAULT_PRICING },
    // AI Analysis Instruction (parantuu koko ajan)
    aiAnalysisInstruction: {
      version: 1,
      lastUpdated: new Date(),
      instructionText: `Analysoi rakennussuunnitelmat (pohjapiirustus, julkisivupiirustus, leikkauspiirustus) ja anna suositukset puuelementeistä ja ristikoista.

Tarkista piirustuksista:
- Rakennuksen mitat (leveys, pituus, korkeus, kerrokset)
- Seinärakenteet ja niiden tyypit
- Kattorakenteet ja ristikot
- Aukot (ikkunat, ovet)
- Erikoisrakenteet

Palauta JSON-muodossa suositukset elementeistä ja ristikoista.`,
      examples: []
    },
    // Versiointi - luo ensimmäinen versio
    versions: [],
    currentVersionId: firstVersionId // Ensimmäinen versio luodaan automaattisesti
  };
};

export type SaveStatus = 'idle' | 'saving' | 'saved';

interface QuotationContextType {
  quotation: Quotation;
  saveStatus: SaveStatus;
  saveQuotation: () => void;
  updateProject: (project: Partial<Quotation['project']>) => void;
  updateCustomer: (customer: Partial<Quotation['customer']>) => void;
  updateSchedule: (schedule: Partial<Schedule>) => void;
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
  // Communication Tasks
  addCommunicationTask: (task: Omit<CommunicationTask, 'id' | 'createdAt' | 'completed'>) => void;
  updateCommunicationTask: (id: string, updates: Partial<CommunicationTask>) => void;
  completeCommunicationTask: (id: string, notes?: string) => void;
  removeCommunicationTask: (id: string) => void;
  // Post-Acceptance Actions
  markInstructionsSent: (instructions: string[]) => void;
  sendQuotationToCustomer: (message: string) => void;
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

  // Luodaan ensimmäinen versio automaattisesti kun tarjouslaskenta luodaan
  useEffect(() => {
    if (quotation.versions.length === 0 && quotation.currentVersionId) {
      const firstVersion: QuotationVersion = {
        id: quotation.currentVersionId,
        versionNumber: 1,
        name: 'Versio 1',
        createdAt: quotation.createdAt,
        createdBy: 'Olli Hietanen',
        status: quotation.status,
        sentAt: quotation.sentAt,
        isActive: true,
        isSent: quotation.status === 'sent' || quotation.status === 'accepted',
        notes: undefined,
        quotation: {
          ...quotation,
          versions: [],
          currentVersionId: ''
        }
      };
      setQuotation(prev => ({
        ...prev,
        versions: [firstVersion]
      }));
    }
  }, []); // Suoritetaan vain kerran komponentin mountissa

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

  const updateSchedule = (scheduleUpdates: Partial<Schedule>) => {
    setQuotation(prev => ({ ...prev, schedule: { ...prev.schedule, ...scheduleUpdates } }));
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
        // This case is less likely now with predefined sections, but good fallback.
        const newTitle = sectionId.replace('section-', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return {
          ...prev,
          elements: [...prev.elements, { id: sectionId, title: newTitle, order: 99, items: [newElement] }]
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
      // Jos työkustannus, laske summa työtunteista ja tuntihinnasta
      let finalAmount = entry.amount;
      if (entry.costType === 'labor' && entry.laborHours && entry.laborRate) {
          finalAmount = entry.laborHours * entry.laborRate;
      }
      
      setQuotation(prev => ({
          ...prev,
          postCalculation: {
              ...prev.postCalculation,
              entries: [...prev.postCalculation.entries, { 
                  ...entry, 
                  id: generateId(),
                  amount: finalAmount
              }]
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

  // --- Communication Tasks ---

  const addCommunicationTask = (task: Omit<CommunicationTask, 'id' | 'createdAt' | 'completed'>) => {
      const newTask: CommunicationTask = {
          ...task,
          id: generateId(),
          createdAt: new Date(),
          completed: false
      };
      
      setQuotation(prev => ({
          ...prev,
          communicationTasks: [...prev.communicationTasks, newTask]
      }));
  };

  const updateCommunicationTask = (id: string, updates: Partial<CommunicationTask>) => {
      setQuotation(prev => ({
          ...prev,
          communicationTasks: prev.communicationTasks.map(task =>
              task.id === id ? { ...task, ...updates } : task
          )
      }));
  };

  const completeCommunicationTask = (id: string, notes?: string) => {
      setQuotation(prev => {
          const task = prev.communicationTasks.find(t => t.id === id);
          if (!task) return prev;

          // Lisää muistiinpano viestinnän osioon
          if (notes) {
              addMessage({
                  author: 'Järjestelmä',
                  text: `Tehtävä suoritettu: ${task.title}${notes ? '\n\nMuistiinpanot:\n' + notes : ''}`,
                  type: 'internal'
              });
          }

          return {
              ...prev,
              communicationTasks: prev.communicationTasks.map(t =>
                  t.id === id 
                      ? { ...t, completed: true, completedAt: new Date(), notes: notes || t.notes }
                      : t
              )
          };
      });
  };

  const removeCommunicationTask = (id: string) => {
      setQuotation(prev => ({
          ...prev,
          communicationTasks: prev.communicationTasks.filter(t => t.id !== id)
      }));
  };

  // --- Version Management ---

  const createNewVersion = (name?: string, notes?: string) => {
    setQuotation(prev => {
      // Laske seuraava versionumero automaattisesti
      const maxVersionNumber = prev.versions.length > 0 
        ? Math.max(...prev.versions.map(v => v.versionNumber))
        : 0;
      const nextVersionNumber = maxVersionNumber + 1;

      // Tallenna nykyinen versio jos se on olemassa
      let updatedVersions = [...prev.versions];
      
      if (prev.currentVersionId) {
        const existingVersion = updatedVersions.find(v => v.id === prev.currentVersionId);
        if (existingVersion) {
          // Päivitä olemassa oleva versio
          updatedVersions = updatedVersions.map(v => 
            v.id === prev.currentVersionId
              ? {
                  ...v,
                  isActive: false,
                  quotation: {
                    ...prev,
                    versions: [],
                    currentVersionId: ''
                  }
                }
              : v
          );
        } else {
          // Tallenna nykyinen versio ensimmäistä kertaa
          const currentVersion: QuotationVersion = {
            id: prev.currentVersionId,
            versionNumber: nextVersionNumber - 1,
            name: `Versio ${nextVersionNumber - 1}`,
            createdAt: prev.createdAt,
            createdBy: 'Olli Hietanen',
            status: prev.status,
            sentAt: prev.sentAt,
            isActive: false,
            isSent: prev.status === 'sent' || prev.status === 'accepted',
            notes: undefined,
            quotation: {
              ...prev,
              versions: [],
              currentVersionId: ''
            }
          };
          updatedVersions.push(currentVersion);
        }
      } else if (updatedVersions.length === 0) {
        // Jos ei ole versioita ollenkaan, luo ensimmäinen versio automaattisesti
        const firstVersion: QuotationVersion = {
          id: prev.currentVersionId || generateId(),
          versionNumber: 1,
          name: 'Versio 1',
          createdAt: prev.createdAt,
          createdBy: 'Olli Hietanen',
          status: prev.status,
          sentAt: prev.sentAt,
          isActive: false,
          isSent: prev.status === 'sent' || prev.status === 'accepted',
          notes: undefined,
          quotation: {
            ...prev,
            versions: [],
            currentVersionId: ''
          }
        };
        updatedVersions.push(firstVersion);
      }

      // Luodaan uusi versio nykyisestä tilasta
      const newVersionId = generateId();
      const versionName = name || `Versio ${nextVersionNumber}`;
      
      const newVersion: QuotationVersion = {
        id: newVersionId,
        versionNumber: nextVersionNumber,
        name: versionName,
        createdAt: new Date(),
        createdBy: 'Olli Hietanen',
        status: 'draft',
        isActive: true,
        isSent: false,
        notes,
        quotation: {
          ...prev,
          versions: [],
          currentVersionId: '',
          status: 'draft',
          sentAt: undefined
        }
      };

      updatedVersions.push(newVersion);

      return {
        ...prev,
        versions: updatedVersions,
        currentVersionId: newVersionId,
        status: 'draft',
        sentAt: undefined
      };
    });
  };

  const switchToVersion = (versionId: string) => {
    setQuotation(prev => {
      const version = prev.versions.find(v => v.id === versionId);
      if (!version) return prev;

      // Tallenna nykyinen versio jos se on muuttunut
      const currentVersion = prev.versions.find(v => v.id === prev.currentVersionId);
      if (currentVersion && prev.currentVersionId !== versionId) {
        const updatedVersions = prev.versions.map(v => 
          v.id === prev.currentVersionId 
            ? { ...v, isActive: false, quotation: { ...prev, versions: [], currentVersionId: '' } }
            : v
        );
        
        return {
          ...version.quotation,
          versions: updatedVersions.map(v => 
            v.id === versionId ? { ...v, isActive: true } : v
          ),
          currentVersionId: versionId
        };
      }

      return {
        ...version.quotation,
        versions: prev.versions.map(v => 
          v.id === versionId ? { ...v, isActive: true } : { ...v, isActive: false }
        ),
        currentVersionId: versionId
      };
    });
  };

  const sendVersion = (versionId: string) => {
    setQuotation(prev => {
      const version = prev.versions.find(v => v.id === versionId);
      if (!version) return prev;

      // Merkitse versio lähetetyksi
      const updatedVersions = prev.versions.map(v => 
        v.id === versionId 
          ? { ...v, isSent: true, sentAt: new Date(), status: 'sent' as QuotationStatus }
          : v
      );

      // Jos tämä on aktiivinen versio, päivitä myös pääobjekti
      if (prev.currentVersionId === versionId) {
        return {
          ...prev,
          versions: updatedVersions,
          status: 'sent',
          sentAt: new Date()
        };
      }

      return {
        ...prev,
        versions: updatedVersions
      };
    });
  };

  const sendQuotationToCustomer = (message: string) => {
    setQuotation(prev => {
      // Paranna ohjetiedostoa kun tarjouslaskenta valmistuu
      const improvedInstruction = improveAnalysisInstruction(prev);
      
      // Lisää viesti asiakkaan viesteihin
      const customerMessage: Message = {
        id: generateId(),
        timestamp: new Date(),
        author: prev.project.owner || 'Olli Hietanen',
        text: message,
        type: 'customer'
      };

      // Merkitse versio lähetetyksi
      const updatedVersions = prev.versions.map(v => 
        v.id === prev.currentVersionId 
          ? { ...v, isSent: true, sentAt: new Date(), status: 'sent' as QuotationStatus }
          : v
      );

      return {
        ...prev,
        status: 'sent',
        sentAt: new Date(),
        versions: updatedVersions,
        messages: [...prev.messages, customerMessage],
        aiAnalysisInstruction: improvedInstruction
      };
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
          setQuotation(prev => {
              // Paranna ohjetiedostoa kun tarjouslaskenta valmistuu
              const improvedInstruction = improveAnalysisInstruction(prev);
              return {
                  ...prev,
                  status: 'sent',
                  sentAt: new Date(),
                  aiAnalysisInstruction: improvedInstruction
              };
          });
      },
      markAccepted: () => {
          setQuotation(prev => {
              // Paranna ohjetiedostoa kun tarjouslaskenta hyväksytään
              const improvedInstruction = improveAnalysisInstruction(prev);
              return {
                  ...prev,
                  status: 'accepted',
                  decisionAt: new Date(),
                  contract: {
                      ...prev.contract,
                      signDate: new Date() // Auto-set sign date
                  },
                  aiAnalysisInstruction: improvedInstruction
              };
          });
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
      updateSchedule,
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
      addCommunicationTask,
      updateCommunicationTask,
      completeCommunicationTask,
      removeCommunicationTask,
      markInstructionsSent,
      createNewVersion,
      switchToVersion,
      sendVersion,
      sendQuotationToCustomer,
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
