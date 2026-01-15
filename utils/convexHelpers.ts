import { Quotation, Message, CommunicationTask, CostEntry, ProjectFile, Schedule } from '../types';
import { Id } from '../convex/_generated/dataModel';

// Convert Quotation from Convex format to app format
export function convexToQuotation(convexQuotation: any): Quotation {
  return {
    id: convexQuotation._id,
    createdAt: new Date(convexQuotation.createdAt),
    updatedAt: new Date(convexQuotation.updatedAt),
    status: convexQuotation.status,
    versions: convexQuotation.versions.map((v: any) => ({
      ...v,
      createdAt: new Date(v.createdAt),
      sentAt: v.sentAt ? new Date(v.sentAt) : undefined,
    })),
    currentVersionId: convexQuotation.currentVersionId,
    approval: convexQuotation.approval ? {
      requestedAt: convexQuotation.approval.requestedAt ? new Date(convexQuotation.approval.requestedAt) : undefined,
      approvedAt: convexQuotation.approval.approvedAt ? new Date(convexQuotation.approval.approvedAt) : undefined,
      approverName: convexQuotation.approval.approverName,
      feedback: convexQuotation.approval.feedback,
    } : undefined,
    sentAt: convexQuotation.sentAt ? new Date(convexQuotation.sentAt) : undefined,
    decisionAt: convexQuotation.decisionAt ? new Date(convexQuotation.decisionAt) : undefined,
    decisionReason: convexQuotation.decisionReason,
    contract: convexQuotation.contract ? {
      ...convexQuotation.contract,
      signDate: convexQuotation.contract.signDate ? new Date(convexQuotation.contract.signDate) : undefined,
    } : undefined,
    sentInstructions: convexQuotation.sentInstructions.map((si: any) => ({
      ...si,
      sentAt: new Date(si.sentAt),
    })),
    postCalculation: {
      entries: [], // Will be loaded separately from costEntries
    },
    messages: [], // Will be loaded separately
    communicationTasks: [], // Will be loaded separately
    files: [], // Will be loaded separately
    project: {
      ...convexQuotation.project,
      offerDate: new Date(convexQuotation.project.offerDate),
    },
    schedule: {
      productionStart: convexQuotation.schedule.productionStart ? new Date(convexQuotation.schedule.productionStart) : undefined,
      productionEnd: convexQuotation.schedule.productionEnd ? new Date(convexQuotation.schedule.productionEnd) : undefined,
      installationStart: convexQuotation.schedule.installationStart ? new Date(convexQuotation.schedule.installationStart) : undefined,
      installationEnd: convexQuotation.schedule.installationEnd ? new Date(convexQuotation.schedule.installationEnd) : undefined,
    },
    customer: convexQuotation.customer,
    documents: convexQuotation.documents || [],
    elements: convexQuotation.elements || [],
    products: convexQuotation.products || [],
    pricing: convexQuotation.pricing,
    paymentSchedule: convexQuotation.paymentSchedule || [],
    delivery: convexQuotation.delivery || {},
    aiAnalysisInstruction: convexQuotation.aiAnalysisInstruction ? {
      ...convexQuotation.aiAnalysisInstruction,
      lastUpdated: new Date(convexQuotation.aiAnalysisInstruction.lastUpdated),
    } : undefined,
  };
}

// Convert Quotation from app format to Convex format
export function quotationToConvex(quotation: Quotation): any {
  return {
    projectId: quotation.project.number || '',
    customerId: quotation.customer.name || '',
    status: quotation.status,
    createdAt: quotation.createdAt.getTime(),
    updatedAt: quotation.updatedAt.getTime(),
    createdBy: quotation.project.owner || 'Olli Hietanen',
    owner: quotation.project.owner || 'Olli Hietanen',
    versions: quotation.versions.map(v => ({
      ...v,
      createdAt: v.createdAt.getTime(),
      sentAt: v.sentAt?.getTime(),
    })),
    currentVersionId: quotation.currentVersionId,
    approval: quotation.approval ? {
      requestedAt: quotation.approval.requestedAt?.getTime(),
      approvedAt: quotation.approval.approvedAt?.getTime(),
      approverName: quotation.approval.approverName,
      feedback: quotation.approval.feedback,
    } : undefined,
    sentAt: quotation.sentAt?.getTime(),
    decisionAt: quotation.decisionAt?.getTime(),
    decisionReason: quotation.decisionReason,
    contract: quotation.contract ? {
      ...quotation.contract,
      signDate: quotation.contract.signDate?.getTime(),
    } : undefined,
    sentInstructions: quotation.sentInstructions.map(si => ({
      ...si,
      sentAt: si.sentAt.getTime(),
    })),
    project: {
      ...quotation.project,
      offerDate: quotation.project.offerDate.getTime(),
    },
    schedule: {
      productionStart: quotation.schedule.productionStart?.getTime(),
      productionEnd: quotation.schedule.productionEnd?.getTime(),
      installationStart: quotation.schedule.installationStart?.getTime(),
      installationEnd: quotation.schedule.installationEnd?.getTime(),
    },
    customer: quotation.customer,
    documents: quotation.documents,
    elements: quotation.elements,
    products: quotation.products,
    pricing: quotation.pricing,
    paymentSchedule: quotation.paymentSchedule,
    delivery: quotation.delivery,
    aiAnalysisInstruction: quotation.aiAnalysisInstruction ? {
      ...quotation.aiAnalysisInstruction,
      lastUpdated: quotation.aiAnalysisInstruction.lastUpdated.getTime(),
    } : undefined,
  };
}

// Convert Message from Convex format
export function convexToMessage(convexMessage: any): Message {
  return {
    id: convexMessage._id,
    timestamp: new Date(convexMessage.timestamp),
    author: convexMessage.author,
    text: convexMessage.text,
    type: convexMessage.type,
  };
}

// Convert CommunicationTask from Convex format
export function convexToCommunicationTask(convexTask: any): CommunicationTask {
  return {
    id: convexTask._id,
    type: convexTask.type,
    title: convexTask.title,
    description: convexTask.description,
    dueDate: convexTask.dueDate ? new Date(convexTask.dueDate) : undefined,
    completed: convexTask.completed,
    completedAt: convexTask.completedAt ? new Date(convexTask.completedAt) : undefined,
    assignedTo: convexTask.assignedTo,
    createdAt: new Date(convexTask.createdAt),
    notes: convexTask.notes,
  };
}

// Convert CostEntry from Convex format
export function convexToCostEntry(convexEntry: any): CostEntry {
  return {
    id: convexEntry._id,
    date: new Date(convexEntry.date),
    category: convexEntry.category,
    description: convexEntry.description,
    amount: convexEntry.amount,
    supplier: convexEntry.supplier,
    costType: convexEntry.costType,
    laborHours: convexEntry.laborHours,
    laborRate: convexEntry.laborRate,
  };
}

// Convert ProjectFile from Convex format
export function convexToProjectFile(convexFile: any): ProjectFile {
  return {
    id: convexFile._id,
    name: convexFile.name,
    size: convexFile.size,
    category: convexFile.category,
    uploadedAt: new Date(convexFile.uploadedAt),
    uploader: convexFile.uploader,
  };
}
