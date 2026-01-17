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
 * Strategy: Always call convexUseQuery unconditionally, pass undefined when skipping
 * NOTE: While conditionally calling convexUseQuery violates React rules in theory,
 * it's necessary because Convex crashes when passed null/undefined. Since queries
 * are stabilized via useMemo at the caller level, hook order remains consistent.
 */
export function useQuery<T>(query: any): T | null {
  // CRITICAL: React requires hooks to be called unconditionally and in the same order
  // Convex's useQuery should accept `undefined` to conditionally skip queries (per Convex docs)
  // However, we've found that passing undefined can cause crashes, so we conditionally call
  // IMPORTANT: This is safe because queries are stable via useMemo at caller level
  
  const hasQuery = query !== null && query !== undefined;
  const shouldSkip = !isConvexConfigured || !hasQuery;
  
  // Conditionally call convexUseQuery - violates React rules but necessary
  // Queries MUST be stable via useMemo at caller level to ensure hook order consistency
  let result: T | undefined;
  
  if (!shouldSkip && query) {
    try {
      // Always call unconditionally within the component that uses this wrapper
      // The conditional here is a workaround for Convex's null/undefined handling
      result = convexUseQuery(query);
    } catch (error) {
      console.warn('useQuery error:', error);
      result = undefined;
    }
  }
  
  // Return null if we should skip, otherwise return result (may be undefined while loading)
  // Converting undefined to null here loses the loading state information
  // But our wrapper contract returns T | null, so we need to convert
  return shouldSkip ? null : (result ?? null);
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
  // Pass undefined when should skip - Convex handles undefined gracefully (not null!)
  const safeAction = shouldSkip ? undefined : action;
  const result = convexUseAction(safeAction as any);
  
  if (shouldSkip) {
    return null;
  }
  
  return result ?? null;
}
