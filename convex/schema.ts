import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tarjouslaskennat
  quotations: defineTable({
    projectId: v.string(), // Viittaus eri järjestelmän projektiin
    customerId: v.string(), // Viittaus eri järjestelmän asiakkaaseen
    status: v.union(
      v.literal("draft"),
      v.literal("awaiting_approval"),
      v.literal("approved"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
    owner: v.string(),
    
    // Versiointi
    versions: v.array(v.object({
      id: v.string(),
      versionNumber: v.number(),
      name: v.string(),
      createdAt: v.number(),
      createdBy: v.string(),
      status: v.union(
        v.literal("draft"),
        v.literal("awaiting_approval"),
        v.literal("approved"),
        v.literal("sent"),
        v.literal("accepted"),
        v.literal("rejected")
      ),
      sentAt: v.optional(v.number()),
      isActive: v.boolean(),
      isSent: v.boolean(),
      notes: v.optional(v.string()),
    })),
    currentVersionId: v.string(),
    
    // Workflow
    approval: v.optional(v.object({
      requestedAt: v.optional(v.number()),
      approvedAt: v.optional(v.number()),
      approverName: v.optional(v.string()),
      feedback: v.optional(v.string()),
    })),
    sentAt: v.optional(v.number()),
    decisionAt: v.optional(v.number()),
    decisionReason: v.optional(v.string()),
    
    // Contract
    contract: v.optional(v.object({
      contractNumber: v.string(),
      signDate: v.optional(v.number()),
      signingPlace: v.optional(v.string()),
      additionalTerms: v.optional(v.string()),
    })),
    
    // Sent Instructions
    sentInstructions: v.array(v.object({
      name: v.string(),
      sentAt: v.number(),
    })),
    
    // Project data (embedded, haetaan eri järjestelmästä)
    project: v.object({
      number: v.string(),
      name: v.string(),
      address: v.string(),
      postalCode: v.optional(v.string()),
      city: v.optional(v.string()),
      buildingType: v.union(
        v.literal("loma-asunto"),
        v.literal("omakotitalo"),
        v.literal("varastohalli"),
        v.literal("sauna"),
        v.literal("rivitalo"),
        v.literal("paritalo")
      ),
      deliveryWeek: v.optional(v.string()),
      offerDate: v.number(),
      owner: v.string(),
    }),
    
    // Customer data (embedded, haetaan eri järjestelmästä)
    customer: v.object({
      name: v.string(),
      businessId: v.optional(v.string()),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      billingMethod: v.union(v.literal("email"), v.literal("e-invoice"), v.literal("mail")),
      billingAddress: v.optional(v.string()),
      tags: v.array(v.string()),
    }),
    
    // Schedule
    schedule: v.object({
      productionStart: v.optional(v.number()),
      productionEnd: v.optional(v.number()),
      installationStart: v.optional(v.number()),
      installationEnd: v.optional(v.number()),
    }),
    
    // Pricing
    pricing: v.object({
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
      elementsCost: v.number(),
      trussesCost: v.number(),
      productsCost: v.number(),
      documentsCost: v.number(),
      installationCost: v.number(),
      transportationCost: v.number(),
      materialCostTotal: v.number(),
      sellingPriceExVat: v.number(),
      profitAmount: v.number(),
      profitPercent: v.number(),
      vatPercentage: v.number(),
      vatAmount: v.number(),
      totalWithVat: v.number(),
      breakdown: v.object({
        elements: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
        trusses: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
        windowsDoors: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
        worksiteDeliveries: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
        installation: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
        transportation: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
        design: v.object({ cost: v.number(), markup: v.number(), sellingPrice: v.number(), profit: v.number() }),
      }),
    }),
    
    // Elements, Products, Documents, Delivery, PaymentSchedule stored as JSON
    elements: v.any(), // ElementSection[]
    products: v.any(), // ProductSection[]
    documents: v.any(), // DocumentItem[]
    delivery: v.any(), // DeliveryScope
    paymentSchedule: v.any(), // PaymentMilestone[]
    
    // AI Analysis Instruction
    aiAnalysisInstruction: v.optional(v.object({
      version: v.number(),
      lastUpdated: v.number(),
      instructionText: v.string(),
      examples: v.array(v.object({
        input: v.string(),
        output: v.string(),
        success: v.boolean(),
      })),
    })),
  })
    .index("by_project", ["projectId"])
    .index("by_customer", ["customerId"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Viestit
  messages: defineTable({
    quotationId: v.id("quotations"),
    timestamp: v.number(),
    author: v.string(),
    text: v.string(),
    type: v.union(v.literal("internal"), v.literal("customer")),
  })
    .index("by_quotation", ["quotationId"])
    .index("by_timestamp", ["quotationId", "timestamp"]),

  // Kommunikointitehtävät
  communicationTasks: defineTable({
    quotationId: v.id("quotations"),
    type: v.union(v.literal("call"), v.literal("email"), v.literal("meeting"), v.literal("other")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    assignedTo: v.string(),
    createdAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_quotation", ["quotationId"])
    .index("by_completed", ["quotationId", "completed"])
    .index("by_due_date", ["quotationId", "dueDate"]),

  // Jälkilaskenta (Cost Entries)
  costEntries: defineTable({
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
  })
    .index("by_quotation", ["quotationId"])
    .index("by_date", ["quotationId", "date"])
    .index("by_category", ["quotationId", "category"]),

  // Projektitiedostot
  files: defineTable({
    quotationId: v.id("quotations"),
    name: v.string(),
    size: v.number(),
    category: v.union(
      v.literal("Pääpiirustus"),
      v.literal("Rakennesuunnitelma"),
      v.literal("Sopimus"),
      v.literal("Asiakkaan Tiedosto"),
      v.literal("Muu Tiedosto")
    ),
    uploadedAt: v.number(),
    uploader: v.string(),
    storageId: v.optional(v.id("_storage")), // Convex Storage reference
  })
    .index("by_quotation", ["quotationId"])
    .index("by_category", ["quotationId", "category"]),

  // Hinnoittelupohjat
  pricingTemplates: defineTable({
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
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_default", ["isDefault"]),

  // Käyttäjät
  users: defineTable({
    name: v.string(),
    role: v.union(
      v.literal("toimitusjohtaja"),
      v.literal("myyntipäällikkö"),
      v.literal("myyntiedustaja"),
      v.literal("muu")
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_role", ["role"])
    .index("by_active", ["active"]),
});
