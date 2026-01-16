import { ConvexReactClient } from "convex/react";

// Convex URL will be set via environment variable or Convex dashboard
// For development, it's typically set when running `npx convex dev`
const convexUrl = import.meta.env.VITE_CONVEX_URL || "";

export const isConvexConfigured = !!convexUrl;

// Only create client if URL is configured
// This prevents errors when Convex is not set up
export const convex = isConvexConfigured 
  ? new ConvexReactClient(convexUrl)
  : null as any; // Type assertion needed for TypeScript, but won't be used if not configured

if (!isConvexConfigured) {
  console.warn("VITE_CONVEX_URL is not set. Convex features will not work. App will use local state.");
}
