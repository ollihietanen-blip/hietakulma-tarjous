import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create pricing template
export const createPricingTemplate = mutation({
  args: {
    name: v.string(),
    categoryMarkups: v.object({
      elements: v.number(),
      trusses: v.number(),
      windowsDoors: v.number(),
      worksiteDeliveries: v.number(),
      installation: v.number(),
      transportation: v.number(),
      design: v.number(),
    }),
    commissionPercentage: v.number(),
    vatMode: v.union(v.literal("standard"), v.literal("construction_service")),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // If this is set as default, unset all other defaults
    if (args.isDefault) {
      const existingDefaults = await ctx.db
        .query("pricingTemplates")
        .withIndex("by_default", (q) => q.eq("isDefault", true))
        .collect();
      
      for (const template of existingDefaults) {
        await ctx.db.patch(template._id, { isDefault: false });
      }
    }
    
    const now = Date.now();
    const templateId = await ctx.db.insert("pricingTemplates", {
      name: args.name,
      categoryMarkups: args.categoryMarkups,
      commissionPercentage: args.commissionPercentage,
      vatMode: args.vatMode,
      isDefault: args.isDefault || false,
      createdAt: now,
      updatedAt: now,
    });
    
    return templateId;
  },
});

// Update pricing template
export const updatePricingTemplate = mutation({
  args: {
    id: v.id("pricingTemplates"),
    updates: v.object({
      name: v.optional(v.string()),
      categoryMarkups: v.optional(v.object({
        elements: v.number(),
        trusses: v.number(),
        windowsDoors: v.number(),
        worksiteDeliveries: v.number(),
        installation: v.number(),
        transportation: v.number(),
        design: v.number(),
      })),
      commissionPercentage: v.optional(v.number()),
      vatMode: v.optional(v.union(v.literal("standard"), v.literal("construction_service"))),
      isDefault: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Template not found");
    }
    
    // If setting as default, unset others
    if (args.updates.isDefault) {
      const existingDefaults = await ctx.db
        .query("pricingTemplates")
        .withIndex("by_default", (q) => q.eq("isDefault", true))
        .collect();
      
      for (const template of existingDefaults) {
        if (template._id !== args.id) {
          await ctx.db.patch(template._id, { isDefault: false });
        }
      }
    }
    
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
});

// Get default pricing template
export const getDefaultTemplate = query({
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("pricingTemplates")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .collect();
    
    return templates[0] || null;
  },
});

// Get all pricing templates
export const listPricingTemplates = query({
  handler: async (ctx) => {
    return await ctx.db.query("pricingTemplates").collect();
  },
});

// Get single pricing template
export const getPricingTemplate = query({
  args: { id: v.id("pricingTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete pricing template
export const deletePricingTemplate = mutation({
  args: { id: v.id("pricingTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
