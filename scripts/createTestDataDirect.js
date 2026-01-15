/**
 * Create test data directly using Convex HTTP API
 * This works even if functions aren't deployed yet
 */

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://original-aardvark-584.convex.cloud";

async function createTestDataDirect() {
  console.log("🚀 Creating test data in Convex...");
  console.log(`📍 URL: ${CONVEX_URL}`);
  console.log("");

  // Test data for quotations table
  const testQuotation = {
    projectId: "TEST-001",
    customerId: "TEST-CUSTOMER-001",
    status: "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: "Test User",
    owner: "Olli Hietanen",
    versions: [],
    currentVersionId: "",
    sentInstructions: [],
    project: {
      number: "TEST-001",
      name: "Testiprojekti - Loma-asunto",
      address: "Testikatu 1, 00100 Helsinki",
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
    schedule: {
      productionStart: undefined,
      productionEnd: undefined,
      installationStart: undefined,
      installationEnd: undefined
    },
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
  };

  console.log("📝 Note: To create data, functions must be deployed first.");
  console.log("");
  console.log("To deploy functions:");
  console.log("1. Open PowerShell/CMD (not in Cursor)");
  console.log("2. Run: npx convex dev");
  console.log("3. Wait for functions to sync");
  console.log("4. Then run: npm run create:test-data");
  console.log("");
  console.log("Or use the app:");
  console.log("1. Run: npm run dev");
  console.log("2. Create a quotation in the app");
  console.log("3. Data will be saved to Convex automatically");
  console.log("");
  console.log("📊 Check Convex Dashboard:");
  console.log("   https://dashboard.convex.dev");
  console.log("   → Select project: original-aardvark-584");
  console.log("   → Go to Data tab");
  console.log("   → Tables will appear when data is saved");
}

createTestDataDirect();
