import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add cost entry
export const addCostEntry = mutation({
  args: {
    quotationId: v.id("quotations"),
    date: v.number(),
    category: v.union(
      v.literal("elements"),
      v.literal("products"),
      v.literal("trusses"),
      v.literal("installation"),
      v.literal("logistics"),
      v.literal("design"),
      v.literal("other")
    ),
    description: v.string(),
    amount: v.number(),
    supplier: v.optional(v.string()),
    costType: v.union(v.literal("material"), v.literal("labor")),
    laborHours: v.optional(v.number()),
    laborRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entryId = await ctx.db.insert("costEntries", {
      quotationId: args.quotationId,
      date: args.date,
      category: args.category,
      description: args.description,
      amount: args.amount,
      supplier: args.supplier,
      costType: args.costType,
      laborHours: args.laborHours,
      laborRate: args.laborRate,
    });
    
    return entryId;
  },
});

// Update cost entry
export const updateCostEntry = mutation({
  args: {
    entryId: v.id("costEntries"),
    updates: v.object({
      date: v.optional(v.number()),
      category: v.optional(v.union(
        v.literal("elements"),
        v.literal("products"),
        v.literal("trusses"),
        v.literal("installation"),
        v.literal("logistics"),
        v.literal("design"),
        v.literal("other")
      )),
      description: v.optional(v.string()),
      amount: v.optional(v.number()),
      supplier: v.optional(v.string()),
      costType: v.optional(v.union(v.literal("material"), v.literal("labor"))),
      laborHours: v.optional(v.number()),
      laborRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.entryId);
    if (!existing) {
      throw new Error("Cost entry not found");
    }
    
    await ctx.db.patch(args.entryId, args.updates);
    return args.entryId;
  },
});

// Delete cost entry
export const deleteCostEntry = mutation({
  args: { entryId: v.id("costEntries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.entryId);
  },
});

// Get cost entries for quotation
export const getCostEntries = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("costEntries")
      .withIndex("by_quotation", (q) => q.eq("quotationId", args.quotationId))
      .collect();
    
    return entries.sort((a, b) => b.date - a.date);
  },
});
