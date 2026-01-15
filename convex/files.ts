import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Upload file to Convex Storage
export const uploadFile = mutation({
  args: {
    quotationId: v.id("quotations"),
    name: v.string(),
    storageId: v.id("_storage"),
    category: v.union(
      v.literal("Pääpiirustus"),
      v.literal("Rakennesuunnitelma"),
      v.literal("Sopimus"),
      v.literal("Asiakkaan Tiedosto"),
      v.literal("Muu Tiedosto")
    ),
    uploader: v.string(),
  },
  handler: async (ctx, args) => {
    // Get file size from storage
    const fileMetadata = await ctx.storage.getMetadata(args.storageId);
    const size = fileMetadata?.size || 0;
    
    const fileId = await ctx.db.insert("files", {
      quotationId: args.quotationId,
      name: args.name,
      size: size,
      category: args.category,
      uploadedAt: Date.now(),
      uploader: args.uploader,
      storageId: args.storageId,
    });
    
    return fileId;
  },
});

// Get file download URL
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get files for quotation
export const getFiles = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_quotation", (q) => q.eq("quotationId", args.quotationId))
      .collect();
    
    return files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  },
});

// Delete file
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Delete from storage if exists
    if (file.storageId) {
      await ctx.storage.delete(file.storageId);
    }
    
    // Delete from database
    await ctx.db.delete(args.fileId);
  },
});

// Generate upload URL for client-side upload
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
