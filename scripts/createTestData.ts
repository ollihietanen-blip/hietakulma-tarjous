/**
 * Create test data in Convex
 * This script creates sample data to test all tables
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://original-aardvark-584.convex.cloud";

async function createTestData() {
  console.log("🚀 Creating test data in Convex...");
  console.log(`📍 URL: ${CONVEX_URL}`);
  console.log("");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // 1. Create a test quotation
    console.log("1️⃣ Creating test quotation...");
    const quotationId = await client.mutation(api.quotations.createQuotation, {
      projectId: "TEST-001",
      customerId: "TEST-CUSTOMER-001",
      createdBy: "Test User",
      owner: "Olli Hietanen",
      project: {
        number: "TEST-001",
        name: "Testiprojekti - Loma-asunto",
        address: "Testikatu 1, 00100 Helsinki",
        postalCode: "00100",
        city: "Helsinki",
        buildingType: "loma-asunto",
        offerDate: Date.now(),
        owner: "Olli Hietanen"
      },
      customer: {
        name: "Testi Asiakas Oy",
        contactPerson: "Matti Testaaja",
        email: "matti.testaaja@example.com",
        phone: "040 123 4567",
        address: "Asiakaskatu 1, 00100 Helsinki",
        billingMethod: "email",
        tags: ["test", "demo"]
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
          elementsCost: 10000,
          trussesCost: 5000,
          productsCost: 3000,
          documentsCost: 2000,
          installationCost: 8000,
          transportationCost: 1500,
          materialCostTotal: 29500,
          sellingPriceExVat: 40000,
          profitAmount: 10500,
          profitPercent: 26.25,
          vatPercentage: 25.5,
          vatAmount: 10200,
          totalWithVat: 50200,
          breakdown: {
            elements: { cost: 10000, markup: 25, sellingPrice: 13333, profit: 3333 },
            trusses: { cost: 5000, markup: 25, sellingPrice: 6667, profit: 1667 },
            windowsDoors: { cost: 3000, markup: 20, sellingPrice: 3750, profit: 750 },
            worksiteDeliveries: { cost: 0, markup: 20, sellingPrice: 0, profit: 0 },
            installation: { cost: 8000, markup: 25, sellingPrice: 10667, profit: 2667 },
            transportation: { cost: 1500, markup: 15, sellingPrice: 1765, profit: 265 },
            design: { cost: 2000, markup: 30, sellingPrice: 2857, profit: 857 }
          }
        },
        elements: [
          {
            id: "section-1",
            order: 1,
            title: "Ulkoseinät",
            items: [
              {
                id: "elem-1",
                type: "Ulkoseinä US-198",
                description: "Testi ulkoseinäelementti",
                quantity: 10,
                unit: "kpl",
                unitPrice: 1000,
                totalPrice: 10000,
                specifications: {
                  height: "2610mm",
                  uValue: "0.17 W/m²K",
                  frame: "42x198"
                }
              }
            ]
          }
        ],
        products: [
          {
            id: "windows",
            title: "Ikkunat",
            items: []
          }
        ],
        documents: [],
        delivery: {
          assemblyLevelId: "shell-and-roof",
          unselectedItems: [],
          customItems: [],
          logistics: [],
          exclusions: [],
          transportation: {
            distanceKm: 100,
            truckCount: 1,
            ratePerKm: 2.20
          }
        },
        paymentSchedule: [
          {
            id: "payment-1",
            description: "Ennakkomaksu",
            percentage: 30,
            amount: 15060
          }
        ]
      }
    });

    console.log(`   ✅ Quotation created: ${quotationId}`);

    // 2. Add a test message
    console.log("2️⃣ Adding test message...");
    try {
      const messageId = await client.mutation(api.messages.addMessage, {
        quotationId: quotationId,
        author: "Olli Hietanen",
        text: "Tämä on testiviesti Convex-tietokantaan.",
        type: "internal"
      });
      console.log(`   ✅ Message added: ${messageId}`);
    } catch (error: any) {
      console.log(`   ⚠️  Message creation failed: ${error.message}`);
    }

    // 3. Create a test communication task
    console.log("3️⃣ Creating test communication task...");
    try {
      const taskId = await client.mutation(api.communicationTasks.createTask, {
        quotationId: quotationId,
        type: "call",
        title: "Soita asiakkaalle",
        description: "Keskustele tarjouksesta",
        dueDate: Date.now() + 86400000, // Tomorrow
        assignedTo: "Olli Hietanen"
      });
      console.log(`   ✅ Task created: ${taskId}`);
    } catch (error: any) {
      console.log(`   ⚠️  Task creation failed: ${error.message}`);
    }

    // 4. Create a test cost entry
    console.log("4️⃣ Creating test cost entry...");
    try {
      const costId = await client.mutation(api.costEntries.addCostEntry, {
        quotationId: quotationId,
        date: Date.now(),
        category: "elements",
        description: "Testi kustannusmerkintä",
        amount: 5000,
        costType: "material",
        supplier: "Testi Toimittaja"
      });
      console.log(`   ✅ Cost entry created: ${costId}`);
    } catch (error: any) {
      console.log(`   ⚠️  Cost entry creation failed: ${error.message}`);
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
    console.log("📊 Check Convex Dashboard:");
    console.log(`   https://dashboard.convex.dev`);
    console.log("   → Select project: original-aardvark-584");
    console.log("   → Go to Data tab");
    console.log("   → You should see:");
    console.log("     - quotations table (1 item)");
    console.log("     - messages table (1 item)");
    console.log("     - communicationTasks table (1 item)");
    console.log("     - costEntries table (1 item)");
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
