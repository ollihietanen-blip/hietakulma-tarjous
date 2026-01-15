import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create new quotation
export const createQuotation = mutation({
  args: {
    projectId: v.string(),
    customerId: v.string(),
    createdBy: v.string(),
    owner: v.string(),
    project: v.any(), // Project object
    customer: v.any(), // Customer object
    quotationData: v.any(), // Rest of quotation data
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const quotationId = await ctx.db.insert("quotations", {
      projectId: args.projectId,
      customerId: args.customerId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
      owner: args.owner,
      versions: [],
      currentVersionId: "",
      project: args.project,
      customer: args.customer,
      schedule: {
        productionStart: undefined,
        productionEnd: undefined,
        installationStart: undefined,
        installationEnd: undefined,
      },
      sentInstructions: [],
      pricing: args.quotationData.pricing || {
        categoryMarkups: {
          elements: 25,
          trusses: 25,
          windowsDoors: 20,
          worksiteDeliveries: 20,
          installation: 25,
          transportation: 15,
          design: 30,
        },
        commissionPercentage: 4.0,
        vatMode: "standard",
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
          design: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 },
        },
      },
      elements: args.quotationData.elements || [],
      products: args.quotationData.products || [],
      documents: args.quotationData.documents || [],
      delivery: args.quotationData.delivery || {},
      paymentSchedule: args.quotationData.paymentSchedule || [],
      aiAnalysisInstruction: args.quotationData.aiAnalysisInstruction,
    });
    
    return quotationId;
  },
});

// Update quotation
export const updateQuotation = mutation({
  args: {
    id: v.id("quotations"),
    updates: v.any(), // Partial Quotation updates
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Quotation not found");
    }
    
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
});

// Get single quotation
export const getQuotation = query({
  args: { id: v.id("quotations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List quotations with filters
export const listQuotations = query({
  args: {
    owner: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("awaiting_approval"),
      v.literal("approved"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected")
    )),
    projectId: v.optional(v.string()),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("quotations");
    
    if (args.owner) {
      query = query.withIndex("by_owner", (q) => q.eq("owner", args.owner));
    } else if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else if (args.projectId) {
      query = query.withIndex("by_project", (q) => q.eq("projectId", args.projectId));
    } else if (args.customerId) {
      query = query.withIndex("by_customer", (q) => q.eq("customerId", args.customerId));
    } else {
      query = query.withIndex("by_created");
    }
    
    const quotations = await query.collect();
    
    // Apply additional filters (if not already filtered by index)
    let filtered = quotations;
    if (args.status && args.owner) {
      filtered = filtered.filter(q => q.status === args.status);
    }
    if (args.projectId && !args.owner && !args.status) {
      filtered = filtered.filter(q => q.projectId === args.projectId);
    }
    if (args.customerId && !args.owner && !args.status && !args.projectId) {
      filtered = filtered.filter(q => q.customerId === args.customerId);
    }
    
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create quotation version
export const createQuotationVersion = mutation({
  args: {
    quotationId: v.id("quotations"),
    versionData: v.object({
      name: v.string(),
      createdBy: v.string(),
      notes: v.optional(v.string()),
      quotationSnapshot: v.any(), // Full quotation data at this version
    }),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    const versionNumber = quotation.versions.length + 1;
    const newVersion = {
      id: `${args.quotationId}-v${versionNumber}`,
      versionNumber,
      name: args.versionData.name,
      createdAt: Date.now(),
      createdBy: args.versionData.createdBy,
      status: quotation.status,
      isActive: false,
      isSent: false,
      notes: args.versionData.notes,
    };
    
    // Mark all previous versions as inactive
    const updatedVersions = quotation.versions.map(v => ({ ...v, isActive: false }));
    updatedVersions.push(newVersion);
    
    await ctx.db.patch(args.quotationId, {
      versions: updatedVersions,
      currentVersionId: newVersion.id,
      updatedAt: Date.now(),
    });
    
    return newVersion.id;
  },
});

// Switch quotation version
export const switchQuotationVersion = mutation({
  args: {
    quotationId: v.id("quotations"),
    versionId: v.string(),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    
    const version = quotation.versions.find(v => v.id === args.versionId);
    if (!version) {
      throw new Error("Version not found");
    }
    
    // Mark all versions as inactive, then activate selected
    const updatedVersions = quotation.versions.map(v => ({
      ...v,
      isActive: v.id === args.versionId,
    }));
    
    await ctx.db.patch(args.quotationId, {
      versions: updatedVersions,
      currentVersionId: args.versionId,
      updatedAt: Date.now(),
    });
    
    return args.versionId;
  },
});
