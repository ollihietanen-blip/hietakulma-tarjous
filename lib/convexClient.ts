import { ConvexReactClient } from "convex/react";

// Convex URL will be set via environment variable or Convex dashboard
// For development, it's typically set when running `npx convex dev`
const convexUrl = import.meta.env.VITE_CONVEX_URL || "";

export const isConvexConfigured = !!convexUrl;

// Create client - use dummy URL if not configured to prevent useQuery errors
// The hooks will check isConvexConfigured and return null if not configured
const dummyUrl = "https://dummy.convex.cloud";
export const convex = isConvexConfigured 
  ? new ConvexReactClient(convexUrl)
  : new ConvexReactClient(dummyUrl); // Dummy client prevents "ConvexProvider not found" errors

if (!isConvexConfigured) {
  console.warn("VITE_CONVEX_URL is not set. Convex features will not work. App will use local state.");
}
