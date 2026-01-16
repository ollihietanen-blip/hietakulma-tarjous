/**
 * Create test data in Convex
 * This script creates sample data to test all tables
 * 
 * Run this with: npx tsx scripts/createTestData.ts
 * Or: node --loader ts-node/esm scripts/createTestData.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://original-aardvark-584.convex.cloud";

// Sample quotations data with more content
const sampleQuotations = [
  {
    projectId: "PROJ-001",
    customerId: "CUST-001",
    projectName: "Loma-asunto Levin Atrin Atmos",
    customerName: "Matti Meikäläinen",
    status: "draft" as const,
    elements: [
      {
        id: "section-ext-walls",
        order: 1,
        title: "Ulkoseinät",
        items: [
          {
            id: "elem-1",
            type: "Ulkoseinä US-198",
            description: "Ulkoseinäelementti 2610mm",
            quantity: 15,
            unit: "kpl",
            unitPrice: 850,
            totalPrice: 12750,
            specifications: { height: "2610mm", uValue: "0.17 W/m²K", frame: "42x198" }
          }
        ]
      },
      {
        id: "section-int-walls",
        order: 2,
        title: "Väliseinät",
        items: [
          {
            id: "elem-2",
            type: "Väliseinä VS-198",
            description: "Väliseinäelementti",
            quantity: 8,
            unit: "kpl",
            unitPrice: 420,
            totalPrice: 3360
          }
        ]
      }
    ],
    products: [
      {
        id: "windows",
        title: "Ikkunat",
        items: [
          {
            id: "window-1",
            name: "Ikkuna 1200x1200",
            quantity: 4,
            unit: "kpl",
            unitPrice: 450,
            totalPrice: 1800
          }
        ]
      },
      {
        id: "doors",
        title: "Ovet",
        items: [
          {
            id: "door-1",
            name: "Ulko-ovi",
            quantity: 1,
            unit: "kpl",
            unitPrice: 1200,
            totalPrice: 1200
          }
        ]
      }
    ]
  },
  {
    projectId: "PROJ-002",
    customerId: "CUST-002",
    projectName: "Omakotitalo Espoossa",
    customerName: "Testi Asiakas Oy",
    status: "sent" as const,
    elements: [
      {
        id: "section-ext-walls",
        order: 1,
        title: "Ulkoseinät",
        items: [
          {
            id: "elem-3",
            type: "Ulkoseinä US-240",
            description: "Ulkoseinäelementti 2610mm",
            quantity: 25,
            unit: "kpl",
            unitPrice: 950,
            totalPrice: 23750
          }
        ]
      }
    ],
    products: [
      {
        id: "windows",
        title: "Ikkunat",
        items: [
          {
            id: "window-2",
            name: "Ikkuna 1500x1500",
            quantity: 8,
            unit: "kpl",
            unitPrice: 550,
            totalPrice: 4400
          }
        ]
      }
    ]
  }
];

async function createTestData() {
  console.log("🚀 Creating test data in Convex...");
  console.log(`📍 URL: ${CONVEX_URL}`);
  console.log("");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    const quotationIds: string[] = [];

    // Create multiple quotations
    for (let i = 0; i < sampleQuotations.length; i++) {
      const sample = sampleQuotations[i];
      console.log(`\n${i + 1}️⃣ Creating quotation: ${sample.projectName}...`);
      
      const quotationId = await client.mutation(api.quotations.createQuotation, {
        projectId: sample.projectId,
        customerId: sample.customerId,
        createdBy: "Olli Hietanen",
        owner: "Olli Hietanen",
        project: {
          number: sample.projectId,
          name: sample.projectName,
          address: i === 0 ? "Atrinpolku 2, 99130 Kittilä" : "Testikatu 10, 02600 Espoo",
          postalCode: i === 0 ? "99130" : "02600",
          city: i === 0 ? "Kittilä" : "Espoo",
          buildingType: i === 0 ? "loma-asunto" : "omakotitalo",
          offerDate: Date.now() - (i * 86400000), // Different dates
          owner: "Olli Hietanen"
        },
        customer: {
          name: sample.customerName,
          contactPerson: sample.customerName,
          email: i === 0 ? "matti.meikalainen@example.com" : "asiakas@example.com",
          phone: "040 123 4567",
          address: "Esimerkkikatu 1, 00100 Helsinki",
          billingMethod: "email",
          tags: i === 0 ? [] : ["asiakas"]
        },
        quotationData: {
          pricing: {
            categoryMarkups: {
              elements: 25,
              trusses: 25,
              windowsDoors: 20,
              worksiteDeliveries: 20,
              installation: 25,
              transportation: 15,
              design: 30
            },
            commissionPercentage: 4.0,
            vatMode: "standard",
            elementsCost: 16110,
            trussesCost: 0,
            productsCost: 3000,
            documentsCost: 0,
            installationCost: 8000,
            transportationCost: 1500,
            materialCostTotal: 28610,
            sellingPriceExVat: 40000,
            profitAmount: 11390,
            profitPercent: 28.48,
            vatPercentage: 25.5,
            vatAmount: 10200,
            totalWithVat: 50200,
            breakdown: {
              elements: { cost: 16110, markup: 25, sellingPrice: 21480, profit: 5370 },
              trusses: { cost: 0, markup: 25, sellingPrice: 0, profit: 0 },
              windowsDoors: { cost: 3000, markup: 20, sellingPrice: 3750, profit: 750 },
              worksiteDeliveries: { cost: 0, markup: 20, sellingPrice: 0, profit: 0 },
              installation: { cost: 8000, markup: 25, sellingPrice: 10667, profit: 2667 },
              transportation: { cost: 1500, markup: 15, sellingPrice: 1765, profit: 265 },
              design: { cost: 0, markup: 30, sellingPrice: 0, profit: 0 }
            }
          },
          elements: sample.elements,
          products: sample.products,
          documents: [],
          delivery: {
            assemblyLevelId: "shell-and-roof",
            unselectedItems: [],
            customItems: [],
            logistics: [],
            exclusions: [],
            transportation: {
              distanceKm: i === 0 ? 920 : 150,
              truckCount: 2,
              ratePerKm: 2.20
            }
          },
          paymentSchedule: [
            {
              id: `payment-${i}-1`,
              description: "Ennakkomaksu",
              percentage: 30,
              amount: 15060
            }
          ]
        }
      });

      quotationIds.push(quotationId);
      console.log(`   ✅ Quotation created: ${quotationId}`);
      
      // Update status if not draft
      if (sample.status !== "draft") {
        await client.mutation(api.quotations.updateQuotation, {
          id: quotationId as any,
          updates: {
            status: sample.status,
            sentAt: Date.now() - (i * 86400000 * 2)
          }
        });
      }

      // Add messages for each quotation
      console.log(`   📨 Adding messages...`);
      try {
        await client.mutation(api.messages.addMessage, {
          quotationId: quotationId as any,
          author: "Järjestelmä",
          text: `Projekti ${sample.projectName} luotu asiakkaalle ${sample.customerName}.`,
          type: "internal"
        });
        await client.mutation(api.messages.addMessage, {
          quotationId: quotationId as any,
          author: "Olli Hietanen",
          text: `Tarjouslaskenta aloitettu. Projektin status: ${sample.status}.`,
          type: "internal"
        });
        if (sample.status === "sent") {
          await client.mutation(api.messages.addMessage, {
            quotationId: quotationId as any,
            author: "Olli Hietanen",
            text: "Tarjous lähetetty asiakkaalle.",
            type: "customer"
          });
        }
        console.log(`   ✅ Messages added`);
      } catch (error: any) {
        console.log(`   ⚠️  Message creation failed: ${error.message}`);
      }

      // Create communication tasks
      console.log(`   📋 Creating communication tasks...`);
      try {
        await client.mutation(api.communicationTasks.createTask, {
          quotationId: quotationId as any,
          type: "call",
          title: "Soita asiakkaalle",
          description: "Keskustele tarjouksesta ja vastaa mahdollisiin kysymyksiin",
          dueDate: Date.now() + 86400000, // Tomorrow
          assignedTo: "Olli Hietanen"
        });
        if (sample.status === "sent") {
          await client.mutation(api.communicationTasks.createTask, {
            quotationId: quotationId as any,
            type: "email",
            title: "Seuraa tarjouksen tilausta",
            description: "Muistuta asiakasta jos ei ole vastannut viikossa",
            dueDate: Date.now() + 7 * 86400000, // In 7 days
            assignedTo: "Olli Hietanen"
          });
        }
        console.log(`   ✅ Tasks created`);
      } catch (error: any) {
        console.log(`   ⚠️  Task creation failed: ${error.message}`);
      }

      // Create cost entries for first quotation
      if (i === 0) {
        console.log(`   💰 Creating cost entries...`);
        try {
          await client.mutation(api.costEntries.addCostEntry, {
            quotationId: quotationId as any,
            date: Date.now() - 86400000,
            category: "elements",
            description: "Ulkoseinäelementit - ensimmäinen erä",
            amount: 8500,
            costType: "material",
            supplier: "Hietakulma Tehdas"
          });
          await client.mutation(api.costEntries.addCostEntry, {
            quotationId: quotationId as any,
            date: Date.now() - 3600000,
            category: "installation",
            description: "Asennustyöt - ensimmäinen päivä",
            amount: 1200,
            costType: "labor",
            supplier: "Oma tiimi",
            laborHours: 8,
            laborRate: 150
          });
          console.log(`   ✅ Cost entries created`);
        } catch (error: any) {
          console.log(`   ⚠️  Cost entry creation failed: ${error.message}`);
        }
      }
    }

    // 5. Create a default pricing template
    console.log("5️⃣ Creating default pricing template...");
    try {
      const templateId = await client.mutation(api.pricingTemplates.createPricingTemplate, {
        name: "Oletusmallipohja",
        categoryMarkups: {
          elements: 25,
          trusses: 25,
          windowsDoors: 20,
          worksiteDeliveries: 20,
          installation: 25,
          transportation: 15,
          design: 30
        },
        commissionPercentage: 4.0,
        vatMode: "standard",
        isDefault: true
      });
      console.log(`   ✅ Pricing template created: ${templateId}`);
    } catch (error: any) {
      console.log(`   ⚠️  Template creation failed: ${error.message}`);
    }

    console.log("");
    console.log("✅ Test data creation completed!");
    console.log("");
    console.log(`📊 Created ${quotationIds.length} quotations with:`);
    console.log(`   - Messages: ${quotationIds.length * 2 - 1} messages`);
    console.log(`   - Communication tasks: ${quotationIds.length + 1} tasks`);
    console.log(`   - Cost entries: 2 entries (for first quotation)`);
    console.log(`   - Pricing templates: 1 template`);
    console.log("");
    console.log("📊 Check Convex Dashboard:");
    console.log(`   https://dashboard.convex.dev`);
    console.log("   → Select project: original-aardvark-584");
    console.log("   → Go to Data tab");
    console.log("   → You should see:");
    console.log(`     - quotations table (${quotationIds.length} items)`);
    console.log(`     - messages table (${quotationIds.length * 2 - 1} items)`);
    console.log(`     - communicationTasks table (${quotationIds.length + 1} items)`);
    console.log("     - costEntries table (2 items)");
    console.log("     - pricingTemplates table (1 item)");

  } catch (error: any) {
    console.error("❌ Failed to create test data:", error.message);
    console.error("");
    console.error("Troubleshooting:");
    console.error("1. Check that VITE_CONVEX_URL is correct");
    console.error("2. Check that deployment key is correct");
    console.error("3. Verify project exists in Convex Dashboard");
    console.error("4. Make sure functions are deployed (run 'npx convex dev' in another terminal)");
  }
}

createTestData();
