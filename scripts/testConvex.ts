/**
 * Test Convex connection and create test data
 * Run with: npx tsx scripts/testConvex.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://original-aardvark-584.convex.cloud";

async function testConvex() {
  console.log("🔍 Testing Convex connection...");
  console.log(`📍 URL: ${CONVEX_URL}`);
  console.log("");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Test 1: Try to list quotations (should work even if empty)
    console.log("1️⃣ Testing quotations table...");
    try {
      const quotations = await client.query(api.quotations.listQuotations, {});
      console.log(`   ✅ Quotations table accessible (${quotations.length} items)`);
    } catch (error: any) {
      console.log(`   ⚠️  Quotations query failed: ${error.message}`);
    }

    // Test 2: Try to create a test quotation
    console.log("2️⃣ Creating test quotation...");
    try {
      const testQuotationId = await client.mutation(api.quotations.createQuotation, {
        projectId: "TEST-001",
        customerId: "TEST-CUSTOMER",
        createdBy: "Test User",
        owner: "Test User",
        project: {
          number: "TEST-001",
          name: "Testiprojekti",
          address: "Testikatu 1",
          buildingType: "loma-asunto",
          offerDate: Date.now(),
          owner: "Test User"
        },
        customer: {
          name: "Testi Asiakas",
          contactPerson: "Testi Henkilö",
          email: "testi@example.com",
          phone: "040 123 4567",
          address: "Asiakaskatu 1",
          billingMethod: "email",
          tags: []
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
              design: { cost: 0, markup: 0, sellingPrice: 0, profit: 0 }
            }
          },
          elements: [],
          products: [],
          documents: [],
          delivery: {},
          paymentSchedule: []
        }
      });
      console.log(`   ✅ Test quotation created: ${testQuotationId}`);
      
      // Test 3: Try to get the quotation back
      console.log("3️⃣ Retrieving test quotation...");
      const retrieved = await client.query(api.quotations.getQuotation, { id: testQuotationId });
      console.log(`   ✅ Quotation retrieved: ${retrieved?.project.name || "N/A"}`);
      
    } catch (error: any) {
      console.log(`   ❌ Failed to create test quotation: ${error.message}`);
    }

    // Test 4: Test messages
    console.log("4️⃣ Testing messages table...");
    try {
      const messages = await client.query(api.messages.getMessages, { 
        quotationId: "test-id" as any 
      });
      console.log(`   ✅ Messages table accessible`);
    } catch (error: any) {
      console.log(`   ⚠️  Messages query failed (expected if no quotation): ${error.message}`);
    }

    // Test 5: Test pricing templates
    console.log("5️⃣ Testing pricing templates...");
    try {
      const templates = await client.query(api.pricingTemplates.listPricingTemplates, {});
      console.log(`   ✅ Pricing templates accessible (${templates.length} items)`);
    } catch (error: any) {
      console.log(`   ⚠️  Pricing templates query failed: ${error.message}`);
    }

    console.log("");
    console.log("✅ Convex connection test completed!");
    console.log("");
    console.log("📊 Check Convex Dashboard:");
    console.log(`   https://dashboard.convex.dev`);
    console.log("   → Select project: original-aardvark-584");
    console.log("   → Go to Data tab to see tables");

  } catch (error: any) {
    console.error("❌ Convex connection failed:", error.message);
    console.error("");
    console.error("Troubleshooting:");
    console.error("1. Check that VITE_CONVEX_URL is correct in .env.local");
    console.error("2. Check that deployment key is correct");
    console.error("3. Verify project exists in Convex Dashboard");
  }
}

testConvex();
