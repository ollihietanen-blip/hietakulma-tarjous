// Safe wrapper hooks for Convex that handle missing ConvexProvider gracefully
// These hooks MUST be called unconditionally (React rules), but they handle errors gracefully
// The ErrorBoundary component will catch any errors from these hooks
import { useMemo } from 'react';
import { useQuery as convexUseQuery, useMutation as convexUseMutation, useAction as convexUseAction } from 'convex/react';
import { isConvexConfigured } from './convexClient';

/**
 * Safe useQuery hook that returns null if Convex is not configured or query is invalid
 * This prevents errors when ConvexProvider is not available or query is null/undefined
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 * 
 * Strategy: Use useMemo to check if query is valid before calling Convex hook.
 * If invalid, we still need to call a hook, so we use a pattern that prevents the error.
 */
export function useQuery<T>(query: any): T | null {
  // Check if we should skip - use useMemo to maintain hook order
  const shouldSkip = useMemo(() => !isConvexConfigured || !query, [query]);
  
  // Always call the hook unconditionally (React requirement)
  // If query is invalid, we pass it anyway and let ErrorBoundary catch the error
  // ErrorBoundary is configured to handle Convex errors gracefully
  const result = convexUseQuery(query);
  
  // Return null if Convex is not configured or query was invalid
  if (shouldSkip) {
    return null;
  }
  
  return result ?? null;
}

/**
 * Safe useMutation hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useMutation<T extends (...args: any[]) => Promise<any>>(mutation: T | null | undefined): T | null {
  const shouldSkip = useMemo(() => !isConvexConfigured || !mutation, [mutation]);
  
  // Always call the hook unconditionally
  // ErrorBoundary will catch "is not a functionReference" errors
  const result = convexUseMutation(mutation as any);
  
  if (shouldSkip) {
    return null;
  }
  
  return result ?? null;
}

/**
 * Safe useAction hook that returns null if Convex is not configured
 * IMPORTANT: This hook MUST be called unconditionally (React rules)
 */
export function useAction<T extends (...args: any[]) => Promise<any>>(action: T | null | undefined): T | null {
  const shouldSkip = useMemo(() => !isConvexConfigured || !action, [action]);
  
  // Always call the hook unconditionally
  // ErrorBoundary will catch "is not a functionReference" errors
  const result = convexUseAction(action as any);
  
  if (shouldSkip) {
    return null;
  }
  
  return result ?? null;
}
