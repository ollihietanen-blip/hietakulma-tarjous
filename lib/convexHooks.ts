// Safe wrapper hooks for Convex that handle missing ConvexProvider gracefully
// These hooks MUST be called unconditionally (React rules), but they handle errors gracefully
// The ErrorBoundary component will catch any errors from these hooks
import { useQuery as convexUseQuery, useMutation as convexUseMutation, useAction as convexUseAction } from 'convex/react';
import { isConvexConfigured } from './convexClient';

// Create a safe dummy object that can be passed to Convex hooks when query is undefined
// This prevents "Cannot read properties of null" errors
const createSafeDummy = () => {
  const dummy = {};
  // Add a Symbol property to make it look like a Convex function reference
  // This prevents the internal Convex code from throwing when it tries to access Symbol(functionName)
  Object.defineProperty(dummy, Symbol('functionName'), {
    value: 'dummy',
    writable: false,
    enumerable: false,
    configurable: false
  });
  return dummy;
};

const safeDummyQuery = createSafeDummy();
const safeDummyMutation = createSafeDummy();
const safeDummyAction = createSafeDummy();

/**
 * Safe useQuery hook that returns null if Convex is not configured or query is invalid
 * This prevents errors when ConvexProvider is not available or query is null/undefined
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 * 
 * Strategy: Always call the Convex hook, but use a safe dummy object when query is undefined.
 * The ErrorBoundary will catch any errors, and we return null for invalid queries.
 */
export function useQuery<T>(query: any): T | null {
  // Always call the hook unconditionally (React requirement)
  // Use a safe dummy when query is invalid to prevent "Cannot read properties of null" errors
  const safeQuery = (isConvexConfigured && query) ? query : safeDummyQuery;
  
  // Call the hook - ErrorBoundary will catch any errors
  const result = convexUseQuery(safeQuery);
  
  // Return null if Convex is not configured or query was invalid
  if (!isConvexConfigured || !query) {
    return null;
  }
  
  return result ?? null;
}

/**
 * Safe useMutation hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useMutation<T extends (...args: any[]) => Promise<any>>(mutation: T | null | undefined): T | null {
  const safeMutation = (isConvexConfigured && mutation) ? mutation : safeDummyMutation;
  const result = convexUseMutation(safeMutation);
  
  if (!isConvexConfigured || !mutation) {
    return null;
  }
  
  return result ?? null;
}

/**
 * Safe useAction hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useAction<T extends (...args: any[]) => Promise<any>>(action: T | null | undefined): T | null {
  const safeAction = (isConvexConfigured && action) ? action : safeDummyAction;
  const result = convexUseAction(safeAction);
  
  if (!isConvexConfigured || !action) {
    return null;
  }
  
  return result ?? null;
}
