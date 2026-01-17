import { ConvexReactClient } from "convex/react";

// Convex URL will be set via environment variable or Convex dashboard
// For development, it's typically set when running `npx convex dev`
const convexUrl = import.meta.env.VITE_CONVEX_URL || "";

export const isConvexConfigured = !!convexUrl;

// Create client - use dummy URL if not configured to prevent useQuery errors
// The hooks will check isConvexConfigured and return null if not configured
// Use a valid-looking URL format to prevent initialization errors
const dummyUrl = "https://placeholder.convex.cloud";
let convex: ConvexReactClient;

try {
  if (isConvexConfigured) {
    convex = new ConvexReactClient(convexUrl);
  } else {
    // Create a dummy client that won't cause errors when used
    convex = new ConvexReactClient(dummyUrl);
  }
} catch (error) {
  // If client creation fails, create a dummy client as fallback
  console.warn("Failed to create Convex client, using dummy client:", error);
  convex = new ConvexReactClient(dummyUrl);
}

export { convex };

if (!isConvexConfigured) {
  console.warn("VITE_CONVEX_URL is not set. Convex features will not work. App will use local state.");
}
