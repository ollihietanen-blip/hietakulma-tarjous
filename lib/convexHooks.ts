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
 * Note: When query is undefined/null, we still call the hook to satisfy React's rules,
 * but the ErrorBoundary will catch any errors that occur.
 */
export function useQuery<T>(query: any): T | null {
  // Always call the hook unconditionally (React requirement)
  // If query is invalid or Convex is not configured, the hook may throw an error
  // which ErrorBoundary will catch, or it may return undefined/null which we handle here
  
  // Check if we should skip the query
  if (!isConvexConfigured || !query) {
    // We still need to call the hook, but we'll let ErrorBoundary handle any errors
    // For now, we'll attempt to call it and return null if it fails
    // The ErrorBoundary is configured to catch Convex-related errors and continue rendering
    let result: T | undefined;
    try {
      // Call with the query (even if undefined) - ErrorBoundary will catch if it throws
      result = convexUseQuery(query);
    } catch {
      // ErrorBoundary will handle this
      return null;
    }
    return result ?? null;
  }
  
  // Normal case: Convex is configured and query is valid
  return convexUseQuery(query) ?? null;
}

/**
 * Safe useMutation hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useMutation<T extends (...args: any[]) => Promise<any>>(mutation: T | null | undefined): T | null {
  if (!isConvexConfigured || !mutation) {
    let result: T | undefined;
    try {
      result = convexUseMutation(mutation);
    } catch {
      return null;
    }
    return result ?? null;
  }
  
  return convexUseMutation(mutation) ?? null;
}

/**
 * Safe useAction hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useAction<T extends (...args: any[]) => Promise<any>>(action: T | null | undefined): T | null {
  if (!isConvexConfigured || !action) {
    let result: T | undefined;
    try {
      result = convexUseAction(action);
    } catch {
      return null;
    }
    return result ?? null;
  }
  
  return convexUseAction(action) ?? null;
}
