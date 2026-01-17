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
 * Strategy: Pass null query when not configured, which Convex handles gracefully
 */
export function useQuery<T>(query: any): T | null {
  // Check if we should skip - use useMemo to maintain hook order
  const shouldSkip = useMemo(() => !isConvexConfigured || !query, [query]);
  
  // Always call the hook unconditionally (React requirement)
  // Pass null when should skip - Convex will return null/undefined gracefully
  const safeQuery = shouldSkip ? null : query;
  const result = convexUseQuery(safeQuery);
  
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
  // Pass null when should skip - Convex will return null/undefined gracefully
  const safeMutation = shouldSkip ? null : mutation;
  const result = convexUseMutation(safeMutation as any);
  
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
  // Pass null when should skip - Convex will return null/undefined gracefully
  const safeAction = shouldSkip ? null : action;
  const result = convexUseAction(safeAction as any);
  
  if (shouldSkip) {
    return null;
  }
  
  return result ?? null;
}
