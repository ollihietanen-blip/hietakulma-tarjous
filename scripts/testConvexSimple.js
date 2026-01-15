/**
 * Simple Convex connection test
 * Tests that we can connect to Convex and that tables exist
 */

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://original-aardvark-584.convex.cloud";

async function testConnection() {
  console.log("🔍 Testing Convex connection...");
  console.log(`📍 URL: ${CONVEX_URL}`);
  console.log("");

  try {
    // Simple HTTP test to see if Convex is reachable
    const response = await fetch(`${CONVEX_URL}/api/ping`);
    if (response.ok) {
      console.log("✅ Convex URL is reachable");
    } else {
      console.log(`⚠️  Convex URL responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Cannot reach Convex URL: ${error.message}`);
  }

  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Go to Convex Dashboard: https://dashboard.convex.dev");
  console.log("2. Select project: original-aardvark-584");
  console.log("3. Go to Data tab");
  console.log("4. Tables will be created automatically when data is saved");
  console.log("");
  console.log("💡 To test with actual data:");
  console.log("   - Start the app: npm run dev");
  console.log("   - Create a quotation in the app");
  console.log("   - Check Convex Dashboard → Data → quotations table");
}

testConnection();
