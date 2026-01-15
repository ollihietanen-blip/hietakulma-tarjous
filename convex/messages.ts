import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add message to quotation
export const addMessage = mutation({
  args: {
    quotationId: v.id("quotations"),
    author: v.string(),
    text: v.string(),
    type: v.union(v.literal("internal"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      quotationId: args.quotationId,
      timestamp: Date.now(),
      author: args.author,
      text: args.text,
      type: args.type,
    });
    
    return messageId;
  },
});

// Get messages for quotation
export const getMessages = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp", (q) => q.eq("quotationId", args.quotationId))
      .collect();
    
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});

// Delete message
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});
