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
  AssemblyLevel
} from '../types';

// Simple UUID generator for browsers that might not have crypto.randomUUID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

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
  pricing: PricingCalculation;
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotation, setQuotation] = useState<Quotation>({
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
    documents: STANDARD_DOCUMENTS,
    elements: [],
    products: [
       { id: 'windows', title: 'Ikkunat', items: [] },
       { id: 'doors', title: 'Ovet', items: [] },
       ...DEFAULT_WORKSITE_SECTIONS.map(section => ({
         ...section,
         items: section.items.map(item => ({
            ...item,
            id: generateId(),
            rivinro: 1, 
            accessories: [],
            totalPrice: 0,
            manufacturer: undefined,
            width: 0,
            height: 0,
            uValue: 0,
            glassType: '',
            glassCode: '',
            frameInnerColor: '',
            frameOuterColor: ''
         } as unknown as ProductItem))
       }))
    ],
    pricing: calculatePricing(0, 0, 0, 0),
    paymentSchedule: [],
    delivery: {
      assemblyLevelId: 'shell-and-roof', // Default to Level 2
      unselectedItems: [],
      customItems: [],
      logistics: STANDARD_LOGISTICS,
      exclusions: STANDARD_EXCLUSIONS
    }
  });

  // Automatically recalculate pricing when elements, products, documents or assembly level change
  useEffect(() => {
    const elementsTotal = quotation.elements.reduce((sum, section) =>
      sum + section.items.reduce((s, item) => s + item.totalPrice, 0), 0
    );
    
    const productsTotal = quotation.products.reduce((sum, section) =>
      sum + section.items.reduce((s, item) => s + item.totalPrice, 0), 0
    );

    const documentsTotal = quotation.documents
      .filter(d => d.included)
      .reduce((sum, doc) => sum + (doc.price || 0), 0);
    
    // Calculate Installation Cost
    // Logic: Base Price = Elements + Products. Installation is the percentage added on top.
    // e.g., Multiplier 1.2 means installation is 0.2 * Base.
    const baseMaterialPrice = elementsTotal + productsTotal;
    const currentLevel = ASSEMBLY_LEVELS.find(l => l.id === quotation.delivery.assemblyLevelId);
    const multiplier = currentLevel ? currentLevel.pricing.baseMultiplier : 1.0;
    
    // Ensure installation isn't negative (1.0 - 1.0 = 0)
    const installationTotal = Math.max(0, baseMaterialPrice * (multiplier - 1.0));

    // Only update if totals actually changed
    if (
      elementsTotal !== quotation.pricing.elementsTotal || 
      productsTotal !== quotation.pricing.productsTotal ||
      documentsTotal !== quotation.pricing.documentsTotal ||
      Math.abs(installationTotal - quotation.pricing.installationTotal) > 0.01
    ) {
      const newPricing = calculatePricing(
        elementsTotal,
        productsTotal,
        documentsTotal,
        installationTotal,
        quotation.pricing.markupPercentage,
        quotation.pricing.commissionPercentage,
        quotation.pricing.vatMode
      );
      
      setQuotation(prev => ({
        ...prev,
        pricing: newPricing,
        updatedAt: new Date()
      }));
    }
  }, [
      quotation.elements, 
      quotation.products, 
      quotation.documents, 
      quotation.delivery.assemblyLevelId, // Watch for level changes
      quotation.pricing.markupPercentage, 
      quotation.pricing.commissionPercentage, 
      quotation.pricing.vatMode
  ]);

  // Automatically update payment milestones amounts when total price changes
  useEffect(() => {
    if (quotation.paymentSchedule.length > 0) {
      const updatedMilestones = quotation.paymentSchedule.map(milestone => ({
        ...milestone,
        amount: quotation.pricing.totalWithVat * (milestone.percentage / 100)
      }));
      
      const hasChanged = updatedMilestones.some((m, i) => m.amount !== quotation.paymentSchedule[i].amount);
      
      if (hasChanged) {
        setQuotation(prev => ({
          ...prev,
          paymentSchedule: updatedMilestones
        }));
      }
    }
  }, [quotation.pricing.totalWithVat, quotation.paymentSchedule.length]);

  const updateProject = (updates: Partial<Quotation['project']>) => {
    setQuotation(prev => ({
      ...prev,
      project: { ...prev.project, ...updates },
      updatedAt: new Date()
    }));
  };

  const updateCustomer = (updates: Partial<Quotation['customer']>) => {
    setQuotation(prev => ({
      ...prev,
      customer: { ...prev.customer, ...updates },
      updatedAt: new Date()
    }));
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setQuotation(prev => ({
      ...prev,
      documents: prev.documents.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
      updatedAt: new Date()
    }));
  };

  const calculateElementTotalPrice = (element: any) => {
    const basePrice = (element.quantity || 0) * (element.unitPrice || 0);
    const windowInstallCost = element.hasWindowInstall 
        ? (element.windowCount || 0) * (element.windowInstallPrice || 0) 
        : 0;
    return basePrice + windowInstallCost;
  };

  const addElement = (sectionId: string, element: Partial<ElementItem>) => {
    const newElement = {
      ...element,
      id: generateId(),
      hasWindowInstall: false,
      windowCount: 0,
      windowInstallPrice: 45, 
      netArea: 0,
    } as ElementItem;

    newElement.totalPrice = calculateElementTotalPrice(newElement);

    setQuotation(prev => {
      const sectionExists = prev.elements.some(s => s.id === sectionId);
      let newElements;
      
      if (!sectionExists) {
        newElements = [
          ...prev.elements,
          {
            id: sectionId,
            order: prev.elements.length + 1,
            title: element.type || 'Uusi osio',
            items: [newElement]
          }
        ];
      } else {
        newElements = prev.elements.map(s =>
          s.id === sectionId
            ? { ...s, items: [...s.items, newElement] }
            : s
        );
      }
      return { ...prev, elements: newElements, updatedAt: new Date() };
    });
  };

  const removeElement = (sectionId: string, elementId: string) => {
    setQuotation(prev => ({
      ...prev,
      elements: prev.elements.map(s =>
        s.id === sectionId
          ? { ...s, items: s.items.filter(item => item.id !== elementId) }
          : s
      ).filter(s => s.items.length > 0),
      updatedAt: new Date()
    }));
  };

  const updateElement = (sectionId: string, elementId: string, updates: any) => {
    setQuotation(prev => ({
      ...prev,
      elements: prev.elements.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(item => {
                if (item.id !== elementId) return item;
                const updatedItem = { ...item, ...updates };
                const totalPrice = calculateElementTotalPrice(updatedItem);
                return { ...updatedItem, totalPrice };
              })
            }
          : s
      ),
      updatedAt: new Date()
    }));
  };

  const addProduct = (sectionId: string, product: Partial<ProductItem>) => {
     const newProduct = {
      ...product,
      id: generateId(),
      totalPrice: (product.quantity || 0) * (product.unitPrice || 0),
      accessories: product.accessories || []
    } as ProductItem;

    setQuotation(prev => {
      const sectionExists = prev.products.some(s => s.id === sectionId);
      let newProducts;

      if (!sectionExists) {
        newProducts = [
          ...prev.products,
          {
            id: sectionId,
            title: product.type === 'window' ? 'Ikkunat' : product.type === 'door' ? 'Ovet' : 'Muu',
            items: [newProduct]
          }
        ];
      } else {
        newProducts = prev.products.map(s =>
          s.id === sectionId
            ? { ...s, items: [...s.items, newProduct] }
            : s
        );
      }
      return { ...prev, products: newProducts, updatedAt: new Date() };
    });
  };

  const removeProduct = (sectionId: string, productId: string) => {
    setQuotation(prev => ({
      ...prev,
      products: prev.products.map(s =>
        s.id === sectionId
          ? { ...s, items: s.items.filter(item => item.id !== productId) }
          : s
      ).filter(s => s.items.length > 0 || (s.id !== 'windows' && s.id !== 'doors')),
      updatedAt: new Date()
    }));
  };

  const updateProduct = (sectionId: string, productId: string, updates: any) => {
    setQuotation(prev => ({
      ...prev,
      products: prev.products.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(item =>
                item.id === productId
                  ? {
                      ...item,
                      ...updates,
                      totalPrice: (updates.quantity ?? item.quantity) * (updates.unitPrice ?? item.unitPrice)
                    }
                  : item
              )
            }
          : s
      ),
      updatedAt: new Date()
    }));
  };

  const updatePricingSettings = (settings: Partial<Pick<PricingCalculation, 'markupPercentage' | 'commissionPercentage' | 'vatMode'>>) => {
    setQuotation(prev => {
      const newPricing = calculatePricing(
        prev.pricing.elementsTotal,
        prev.pricing.productsTotal,
        prev.pricing.documentsTotal,
        prev.pricing.installationTotal,
        settings.markupPercentage ?? prev.pricing.markupPercentage,
        settings.commissionPercentage ?? prev.pricing.commissionPercentage,
        settings.vatMode ?? prev.pricing.vatMode
      );
      
      return {
        ...prev,
        pricing: newPricing,
        updatedAt: new Date()
      };
    });
  };

  const updatePaymentMilestone = (id: string, updates: Partial<PaymentMilestone>) => {
    setQuotation(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.map(milestone =>
        milestone.id === id
          ? {
              ...milestone,
              ...updates,
              amount: updates.percentage !== undefined 
                ? prev.pricing.totalWithVat * (updates.percentage / 100) 
                : milestone.amount
            }
          : milestone
      ),
      updatedAt: new Date()
    }));
  };
  
  const setPaymentSchedule = (schedule: PaymentMilestone[]) => {
    setQuotation(prev => ({
        ...prev,
        paymentSchedule: schedule,
        updatedAt: new Date()
    }));
  };

  const toggleLogistics = (id: string) => {
    setQuotation(prev => ({
        ...prev,
        delivery: {
            ...prev.delivery,
            logistics: prev.delivery.logistics.map(l => l.id === id ? {...l, included: !l.included} : l)
        }
    }));
  };

  // Update assembly level and clear custom items to reset state for new level
  const setAssemblyLevel = (levelId: AssemblyLevel['id']) => {
    setQuotation(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        assemblyLevelId: levelId,
        unselectedItems: [], // Reset custom selections when level changes
        customItems: []      // Reset custom items when level changes
      }
    }));
  };

  // Toggle a standard item (remove from scope / add back to scope)
  const toggleInstallationItem = (itemText: string) => {
    setQuotation(prev => {
        const isCurrentlyUnselected = prev.delivery.unselectedItems.includes(itemText);
        let newUnselected;

        if (isCurrentlyUnselected) {
            // Put it back (remove from unselected list)
            newUnselected = prev.delivery.unselectedItems.filter(i => i !== itemText);
        } else {
            // Remove it (add to unselected list)
            newUnselected = [...prev.delivery.unselectedItems, itemText];
        }

        return {
            ...prev,
            delivery: {
                ...prev.delivery,
                unselectedItems: newUnselected
            }
        };
    });
  };

  const addCustomInstallationItem = (itemText: string) => {
    if (!itemText.trim()) return;
    setQuotation(prev => ({
        ...prev,
        delivery: {
            ...prev.delivery,
            customItems: [...prev.delivery.customItems, itemText]
        }
    }));
  };

  const removeCustomInstallationItem = (index: number) => {
    setQuotation(prev => ({
        ...prev,
        delivery: {
            ...prev.delivery,
            customItems: prev.delivery.customItems.filter((_, i) => i !== index)
        }
    }));
  };

  const value = {
    quotation,
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
    pricing: quotation.pricing
  };

  return (
    <QuotationContext.Provider value={value}>
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within QuotationProvider');
  }
  return context;
};
