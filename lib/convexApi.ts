// Wrapper for Convex API imports
// Handles cases where generated files don't exist (e.g., in build without Convex setup)

// Try to import Convex API, fallback to null if not available
let convexApi: any = null;

// Use a function to handle the import dynamically
async function loadConvexApi() {
  try {
    const apiModule = await import('../convex/_generated/api');
    return apiModule.api;
  } catch (e) {
    // Convex generated files not available
    return null;
  }
}

// For synchronous access, we'll use a getter pattern
// In practice, components should check if api exists before using it
export const getApi = () => convexApi;

// Initialize on module load (for build-time)
loadConvexApi().then(api => {
  convexApi = api;
});

// Export a proxy that handles missing API gracefully
export const api = new Proxy({} as any, {
  get(target, prop) {
    if (!convexApi) {
      return undefined;
    }
    return convexApi[prop];
  }
});
