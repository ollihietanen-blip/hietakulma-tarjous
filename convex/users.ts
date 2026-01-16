import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create user
export const createUser = mutation({
  args: {
    name: v.string(),
    role: v.union(
      v.literal("toimitusjohtaja"),
      v.literal("myyntipäällikkö"),
      v.literal("myyntiedustaja"),
      v.literal("muu")
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      role: args.role,
      email: args.email,
      phone: args.phone,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return userId;
  },
});

// Get all users
export const listUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Get active users
export const listActiveUsers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("toimitusjohtaja"),
      v.literal("myyntipäällikkö"),
      v.literal("myyntiedustaja"),
      v.literal("muu")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

// Get single user
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update user
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      role: v.optional(v.union(
        v.literal("toimitusjohtaja"),
        v.literal("myyntipäällikkö"),
        v.literal("myyntiedustaja"),
        v.literal("muu")
      )),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
});

// Delete user
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Initialize default users (mutation to run once)
export const initializeDefaultUsers = mutation({
  handler: async (ctx) => {
    const users = [
      {
        name: "Olli Hietanen",
        role: "toimitusjohtaja" as const,
      },
      {
        name: "Tapani Katajisto",
        role: "myyntipäällikkö" as const,
      },
      {
        name: "Olli-Pekka Rajala",
        role: "myyntiedustaja" as const,
      },
    ];

    const results = [];
    const now = Date.now();
    
    for (const user of users) {
      // Check if user already exists
      const existing = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("name"), user.name))
        .filter((q) => q.eq(q.field("role"), user.role))
        .first();
      
      if (!existing) {
        const userId = await ctx.db.insert("users", {
          name: user.name,
          role: user.role,
          active: true,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ name: user.name, id: userId, created: true });
      } else {
        results.push({ name: user.name, created: false, message: "already exists" });
      }
    }
    
    return results;
  },
});
