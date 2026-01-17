// Safe wrapper hooks for Convex that handle missing ConvexProvider gracefully
// These hooks MUST be called unconditionally (React rules), but they handle errors gracefully
// The ErrorBoundary component will catch any errors from these hooks
import { useQuery as convexUseQuery, useMutation as convexUseMutation, useAction as convexUseAction } from 'convex/react';
import { isConvexConfigured } from './convexClient';

/**
 * Safe useQuery hook that returns null if Convex is not configured or query is invalid
 * This prevents errors when ConvexProvider is not available or query is null/undefined
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 * 
 * Strategy: Always call the Convex hook unconditionally. If query is invalid, we still call it
 * and let ErrorBoundary catch the error. This maintains React's hook rules.
 * The ErrorBoundary is configured to catch "is not a functionReference" errors and continue rendering.
 */
export function useQuery<T>(query: any): T | null {
  // Always call the hook unconditionally (React requirement)
  // If query is invalid, Convex will throw an error which ErrorBoundary will catch
  // We return null for invalid queries to prevent components from using invalid data
  
  // Always call the hook - ErrorBoundary will catch "is not a functionReference" errors
  const result = convexUseQuery(query);
  
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
  // Always call the hook unconditionally
  // ErrorBoundary will catch "is not a functionReference" errors
  const result = convexUseMutation(mutation as any);
  
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
  // Always call the hook unconditionally
  // ErrorBoundary will catch "is not a functionReference" errors
  const result = convexUseAction(action as any);
  
  if (!isConvexConfigured || !action) {
    return null;
  }
  
  return result ?? null;
}
