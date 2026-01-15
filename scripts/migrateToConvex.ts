/**
 * Migration script to transfer existing quotation data to Convex
 * 
 * This script should be run once to migrate existing local data to Convex.
 * It reads from localStorage or a JSON file and creates Convex records.
 * 
 * Usage:
 * - Run this in the browser console or as a Node script
 * - Ensure Convex is set up and VITE_CONVEX_URL is configured
 */

import { convexToQuotation, quotationToConvex } from '../utils/convexHelpers';
import { Quotation } from '../types';

// Example migration function
export async function migrateQuotationToConvex(
  quotation: Quotation,
  createQuotation: (data: any) => Promise<string>
): Promise<string> {
  const convexData = quotationToConvex(quotation);
  
  const quotationId = await createQuotation({
    projectId: quotation.project.number,
    customerId: quotation.customer.name,
    createdBy: quotation.project.owner || 'Olli Hietanen',
    owner: quotation.project.owner || 'Olli Hietanen',
    project: convexData.project,
    customer: convexData.customer,
    quotationData: {
      pricing: convexData.pricing,
      elements: convexData.elements,
      products: convexData.products,
      documents: convexData.documents,
      delivery: convexData.delivery,
      paymentSchedule: convexData.paymentSchedule,
      aiAnalysisInstruction: convexData.aiAnalysisInstruction,
    },
  });

  return quotationId;
}

// Migrate from localStorage (if data exists there)
export async function migrateFromLocalStorage(
  createQuotation: (data: any) => Promise<string>,
  addMessage: (quotationId: string, data: any) => Promise<string>,
  addCostEntry: (quotationId: string, data: any) => Promise<string>
) {
  try {
    const stored = localStorage.getItem('quotations');
    if (!stored) {
      console.log('No quotations found in localStorage');
      return;
    }

    const quotations: Quotation[] = JSON.parse(stored);
    console.log(`Found ${quotations.length} quotations to migrate`);

    for (const quotation of quotations) {
      try {
        // Convert dates from strings to Date objects
        const migratedQuotation: Quotation = {
          ...quotation,
          createdAt: new Date(quotation.createdAt),
          updatedAt: new Date(quotation.updatedAt),
          project: {
            ...quotation.project,
            offerDate: new Date(quotation.project.offerDate),
          },
          schedule: {
            productionStart: quotation.schedule.productionStart ? new Date(quotation.schedule.productionStart) : undefined,
            productionEnd: quotation.schedule.productionEnd ? new Date(quotation.schedule.productionEnd) : undefined,
            installationStart: quotation.schedule.installationStart ? new Date(quotation.schedule.installationStart) : undefined,
            installationEnd: quotation.schedule.installationEnd ? new Date(quotation.schedule.installationEnd) : undefined,
          },
          messages: quotation.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
          communicationTasks: quotation.communicationTasks.map(t => ({
            ...t,
            createdAt: new Date(t.createdAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          })),
          postCalculation: {
            entries: quotation.postCalculation.entries.map(e => ({
              ...e,
              date: new Date(e.date),
            })),
          },
          files: quotation.files.map(f => ({
            ...f,
            uploadedAt: new Date(f.uploadedAt),
          })),
          sentInstructions: quotation.sentInstructions.map(si => ({
            ...si,
            sentAt: new Date(si.sentAt),
          })),
          versions: quotation.versions.map(v => ({
            ...v,
            createdAt: new Date(v.createdAt),
            sentAt: v.sentAt ? new Date(v.sentAt) : undefined,
          })),
        };

        const quotationId = await migrateQuotationToConvex(migratedQuotation, createQuotation);
        console.log(`Migrated quotation ${quotation.id} -> ${quotationId}`);

        // Migrate messages
        for (const message of quotation.messages) {
          await addMessage(quotationId, {
            author: message.author,
            text: message.text,
            type: message.type,
          });
        }

        // Migrate cost entries
        for (const entry of quotation.postCalculation.entries) {
          await addCostEntry(quotationId, {
            date: entry.date.getTime(),
            category: entry.category,
            description: entry.description,
            amount: entry.amount,
            supplier: entry.supplier,
            costType: entry.costType,
            laborHours: entry.laborHours,
            laborRate: entry.laborRate,
          });
        }

      } catch (error) {
        console.error(`Failed to migrate quotation ${quotation.id}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
