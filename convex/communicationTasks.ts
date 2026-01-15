import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create communication task
export const createTask = mutation({
  args: {
    quotationId: v.id("quotations"),
    type: v.union(v.literal("call"), v.literal("email"), v.literal("meeting"), v.literal("other")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    assignedTo: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("communicationTasks", {
      quotationId: args.quotationId,
      type: args.type,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      completed: false,
      assignedTo: args.assignedTo,
      createdAt: Date.now(),
      notes: args.notes,
    });
    
    return taskId;
  },
});

// Update task
export const updateTask = mutation({
  args: {
    taskId: v.id("communicationTasks"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      assignedTo: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.taskId);
    if (!existing) {
      throw new Error("Task not found");
    }
    
    await ctx.db.patch(args.taskId, args.updates);
    return args.taskId;
  },
});

// Complete task
export const completeTask = mutation({
  args: {
    taskId: v.id("communicationTasks"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.taskId);
    if (!existing) {
      throw new Error("Task not found");
    }
    
    await ctx.db.patch(args.taskId, {
      completed: true,
      completedAt: Date.now(),
    });
    
    return args.taskId;
  },
});

// Get tasks for quotation
export const getTasks = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("communicationTasks")
      .withIndex("by_quotation", (q) => q.eq("quotationId", args.quotationId))
      .collect();
    
    return tasks.sort((a, b) => {
      // Incomplete first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate;
      }
      return a.createdAt - b.createdAt;
    });
  },
});

// Delete task
export const deleteTask = mutation({
  args: { taskId: v.id("communicationTasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
